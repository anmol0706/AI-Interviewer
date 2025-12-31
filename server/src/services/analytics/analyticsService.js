import config from '../../config/index.js';
import logger from '../../utils/logger.js';

class AnalyticsService {
    constructor() {
        this.weights = config.scoring.weights;
        this.thresholds = config.scoring.thresholds;
    }

    /**
     * Calculate overall score from individual components
     */
    calculateOverallScore(scores) {
        const { correctness, reasoning, communication, confidence, structure } = scores;

        const weightedScore =
            (correctness * this.weights.correctness) +
            (reasoning * this.weights.reasoning) +
            (communication * this.weights.communication) +
            (confidence * this.weights.confidence) +
            (structure * this.weights.structure);

        return Math.round(weightedScore);
    }

    /**
     * Calculate score for a single response
     */
    calculateResponseScore(aiEvaluation, voiceAnalysis = null) {
        const scores = {
            correctness: {
                score: aiEvaluation.scores?.correctness?.score || 0,
                maxScore: 100,
                feedback: aiEvaluation.scores?.correctness?.feedback || ''
            },
            reasoning: {
                score: aiEvaluation.scores?.reasoning?.score || 0,
                maxScore: 100,
                feedback: aiEvaluation.scores?.reasoning?.feedback || ''
            },
            communication: {
                score: this.calculateCommunicationScore(aiEvaluation, voiceAnalysis),
                maxScore: 100,
                feedback: this.generateCommunicationFeedback(aiEvaluation, voiceAnalysis)
            },
            structure: {
                score: aiEvaluation.scores?.structure?.score || 0,
                maxScore: 100,
                feedback: aiEvaluation.scores?.structure?.feedback || ''
            },
            confidence: {
                score: this.calculateConfidenceScore(aiEvaluation, voiceAnalysis),
                maxScore: 100,
                feedback: this.generateConfidenceFeedback(voiceAnalysis)
            }
        };

        scores.overall = this.calculateOverallScore({
            correctness: scores.correctness.score,
            reasoning: scores.reasoning.score,
            communication: scores.communication.score,
            confidence: scores.confidence.score,
            structure: scores.structure.score
        });

        return scores;
    }

    /**
     * Calculate communication score combining AI and voice analysis
     */
    calculateCommunicationScore(aiEvaluation, voiceAnalysis) {
        // Start with AI evaluation score
        let score = aiEvaluation.scores?.communication?.score || 70;

        if (voiceAnalysis) {
            // Blend AI score with clarity score from voice analysis
            const clarityScore = voiceAnalysis.clarityScore || 70;
            score = Math.round((score * 0.6) + (clarityScore * 0.4));

            // Adjust based on speaking rate
            const wpm = voiceAnalysis.wordsPerMinute || 140;
            if (wpm >= 120 && wpm <= 160) {
                score = Math.min(100, score + 5); // Optimal range
            } else if (wpm < 100 || wpm > 180) {
                score = Math.max(0, score - 10); // Too slow or too fast
            }
        }

        return Math.round(score);
    }

    /**
     * Calculate confidence score from voice analysis
     */
    calculateConfidenceScore(aiEvaluation, voiceAnalysis) {
        // Start with AI's confidence assessment if available
        let score = aiEvaluation.scores?.confidence?.score || 70;

        if (voiceAnalysis) {
            // Voice-based confidence indicators
            const voiceConfidence = voiceAnalysis.confidence || 70;

            // Hesitation impact
            const hesitationPenalty = Math.min(30, voiceAnalysis.hesitationCount * 3);

            // Filler words impact
            const totalFillers = voiceAnalysis.fillerWords?.reduce((sum, f) => sum + f.count, 0) || 0;
            const fillerPenalty = Math.min(20, totalFillers * 2);

            // Long pauses impact
            const longPauses = voiceAnalysis.pauseDurations?.filter(p => p.duration > 2).length || 0;
            const pausePenalty = Math.min(15, longPauses * 5);

            // Calculate voice-based confidence
            const voiceBasedScore = Math.max(0, voiceConfidence - hesitationPenalty - fillerPenalty - pausePenalty);

            // Blend AI assessment with voice-based confidence
            score = Math.round((score * 0.4) + (voiceBasedScore * 0.6));
        }

        return Math.round(score);
    }

    /**
     * Generate communication feedback
     */
    generateCommunicationFeedback(aiEvaluation, voiceAnalysis) {
        const feedback = [];

        // AI-generated feedback
        if (aiEvaluation.scores?.communication?.feedback) {
            feedback.push(aiEvaluation.scores.communication.feedback);
        }

        // Voice-based feedback
        if (voiceAnalysis) {
            const wpm = voiceAnalysis.wordsPerMinute || 0;

            if (wpm > 180) {
                feedback.push('Consider slowing down your pace for better clarity.');
            } else if (wpm < 100 && wpm > 0) {
                feedback.push('Try to maintain a slightly faster speaking pace.');
            } else if (wpm >= 120 && wpm <= 160) {
                feedback.push('Good speaking pace maintained.');
            }

            const totalFillers = voiceAnalysis.fillerWords?.reduce((sum, f) => sum + f.count, 0) || 0;
            if (totalFillers > 5) {
                const topFillers = voiceAnalysis.fillerWords.slice(0, 3).map(f => f.word).join(', ');
                feedback.push(`Reduce filler words like: ${topFillers}`);
            }
        }

        return feedback.join(' ');
    }

    /**
     * Generate confidence feedback
     */
    generateConfidenceFeedback(voiceAnalysis) {
        if (!voiceAnalysis) {
            return 'Voice analysis not available for detailed feedback.';
        }

        const feedback = [];

        if (voiceAnalysis.hesitationCount > 5) {
            feedback.push('Noticeable hesitation detected. Practice can help build confidence.');
        } else if (voiceAnalysis.hesitationCount <= 2) {
            feedback.push('Demonstrated good confidence with minimal hesitation.');
        }

        const patterns = voiceAnalysis.speechPatterns || {};

        if (patterns.energy === 'low') {
            feedback.push('Try to inject more energy into your responses.');
        } else if (patterns.energy === 'high') {
            feedback.push('Good energy level throughout the response.');
        }

        if (patterns.consistency === 'variable') {
            feedback.push('Work on maintaining a more consistent delivery.');
        }

        return feedback.join(' ') || 'Good overall confidence demonstrated.';
    }

    /**
     * Determine performance level based on score
     */
    getPerformanceLevel(score) {
        if (score >= this.thresholds.excellent) return 'excellent';
        if (score >= this.thresholds.good) return 'good';
        if (score >= this.thresholds.average) return 'average';
        if (score >= this.thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Calculate session-wide analytics
     */
    calculateSessionAnalytics(session) {
        const responses = session.responses || [];

        if (responses.length === 0) {
            return this.getEmptyAnalytics();
        }

        // Calculate average scores
        const avgScores = this.calculateAverageScores(responses);

        // Calculate difficulty progression
        const difficultyProgression = this.analyzeDifficultyProgression(responses);

        // Identify strengths and weaknesses
        const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(responses, avgScores);

        // Calculate performance trend
        const performanceTrend = this.calculatePerformanceTrend(responses);

        // Calculate total duration
        const totalDuration = responses.reduce((sum, r) => {
            if (r.startedAt && r.completedAt) {
                return sum + (new Date(r.completedAt) - new Date(r.startedAt)) / 1000;
            }
            return sum + (r.answer?.duration || 0);
        }, 0);

        // Calculate average response time
        const averageResponseTime = responses.length > 0
            ? Math.round(totalDuration / responses.length)
            : 0;

        return {
            totalDuration: Math.round(totalDuration),
            averageResponseTime,
            difficultyProgression,
            strengthAreas: strengths,
            weaknessAreas: weaknesses,
            performanceTrend,
            overallScores: avgScores,
            questionBreakdown: this.getQuestionBreakdown(responses),
            categoryPerformance: this.getCategoryPerformance(responses)
        };
    }

    /**
     * Calculate average scores across all responses
     */
    calculateAverageScores(responses) {
        const totals = {
            correctness: 0,
            reasoning: 0,
            communication: 0,
            structure: 0,
            confidence: 0,
            overall: 0
        };

        responses.forEach(r => {
            totals.correctness += r.scores?.correctness?.score || 0;
            totals.reasoning += r.scores?.reasoning?.score || 0;
            totals.communication += r.scores?.communication?.score || 0;
            totals.structure += r.scores?.structure?.score || 0;
            totals.confidence += r.scores?.confidence?.score || 0;
            totals.overall += r.scores?.overall || 0;
        });

        const count = responses.length;

        return {
            correctness: Math.round(totals.correctness / count),
            reasoning: Math.round(totals.reasoning / count),
            communication: Math.round(totals.communication / count),
            structure: Math.round(totals.structure / count),
            confidence: Math.round(totals.confidence / count),
            overall: Math.round(totals.overall / count)
        };
    }

    /**
     * Analyze difficulty progression throughout the interview
     */
    analyzeDifficultyProgression(responses) {
        return responses.map((r, index) => ({
            questionIndex: index,
            difficulty: r.question?.difficulty || 'medium',
            score: r.scores?.overall || 0
        }));
    }

    /**
     * Identify candidate's strengths and weaknesses
     */
    identifyStrengthsWeaknesses(responses, avgScores) {
        const strengths = [];
        const weaknesses = [];

        // Analyze score categories
        const categories = ['correctness', 'reasoning', 'communication', 'structure', 'confidence'];

        categories.forEach(category => {
            const score = avgScores[category];
            if (score >= 80) {
                strengths.push(this.getCategoryStrengthLabel(category, score));
            } else if (score < 60) {
                weaknesses.push(this.getCategoryWeaknessLabel(category, score));
            }
        });

        // Analyze topics covered and missed
        const allStrengths = new Set();
        const allWeaknesses = new Set();

        responses.forEach(r => {
            r.aiAnalysis?.strengths?.forEach(s => allStrengths.add(s));
            r.aiAnalysis?.weaknesses?.forEach(w => allWeaknesses.add(w));
        });

        // Add topic-level strengths/weaknesses
        strengths.push(...Array.from(allStrengths).slice(0, 3));
        weaknesses.push(...Array.from(allWeaknesses).slice(0, 3));

        return {
            strengths: [...new Set(strengths)].slice(0, 5),
            weaknesses: [...new Set(weaknesses)].slice(0, 5)
        };
    }

    /**
     * Get strength label for a category
     */
    getCategoryStrengthLabel(category, score) {
        const labels = {
            correctness: 'Strong technical accuracy',
            reasoning: 'Excellent logical thinking',
            communication: 'Clear and articulate communication',
            structure: 'Well-organized responses',
            confidence: 'Confident delivery'
        };
        return labels[category] || `Strong ${category}`;
    }

    /**
     * Get weakness label for a category
     */
    getCategoryWeaknessLabel(category, score) {
        const labels = {
            correctness: 'Technical accuracy needs improvement',
            reasoning: 'Logical reasoning could be stronger',
            communication: 'Communication clarity needs work',
            structure: 'Response organization needs improvement',
            confidence: 'Confidence building needed'
        };
        return labels[category] || `${category} needs improvement`;
    }

    /**
     * Calculate performance trend across the interview
     */
    calculatePerformanceTrend(responses) {
        if (responses.length < 3) {
            return 'not-enough-data';
        }

        const scores = responses.map(r => r.scores?.overall || 0);

        // Compare first half to second half
        const midpoint = Math.floor(scores.length / 2);
        const firstHalf = scores.slice(0, midpoint);
        const secondHalf = scores.slice(midpoint);

        const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const difference = secondHalfAvg - firstHalfAvg;

        if (difference > 10) return 'improving';
        if (difference < -10) return 'declining';
        return 'stable';
    }

    /**
     * Get question-by-question breakdown
     */
    getQuestionBreakdown(responses) {
        return responses.map((r, index) => ({
            questionIndex: index + 1,
            question: r.question?.questionText?.substring(0, 100) + '...',
            difficulty: r.question?.difficulty,
            score: r.scores?.overall || 0,
            strengths: r.aiAnalysis?.strengths?.slice(0, 2) || [],
            weaknesses: r.aiAnalysis?.weaknesses?.slice(0, 2) || [],
            timeSpent: r.answer?.duration || 0
        }));
    }

    /**
     * Get performance by category (technical areas)
     */
    getCategoryPerformance(responses) {
        const categoryScores = {};

        responses.forEach(r => {
            const category = r.question?.subCategory || r.question?.category || 'general';
            if (!categoryScores[category]) {
                categoryScores[category] = { total: 0, count: 0 };
            }
            categoryScores[category].total += r.scores?.overall || 0;
            categoryScores[category].count++;
        });

        return Object.entries(categoryScores).map(([category, data]) => ({
            category,
            averageScore: Math.round(data.total / data.count),
            questionCount: data.count
        })).sort((a, b) => b.averageScore - a.averageScore);
    }

    /**
     * Determine if difficulty should be adjusted
     */
    shouldAdjustDifficulty(recentScores, currentDifficulty) {
        if (recentScores.length < 2) {
            return { adjust: false, direction: null };
        }

        const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const difficulties = ['easy', 'medium', 'hard', 'expert'];
        const currentIndex = difficulties.indexOf(currentDifficulty);

        // Increase difficulty if doing well
        if (avgScore >= 85 && currentIndex < difficulties.length - 1) {
            return { adjust: true, direction: 'increase', reason: 'Excellent performance, increasing challenge' };
        }

        // Decrease difficulty if struggling
        if (avgScore < 50 && currentIndex > 0) {
            return { adjust: true, direction: 'decrease', reason: 'Providing more accessible questions' };
        }

        return { adjust: false, direction: null };
    }

    /**
     * Generate practice recommendations based on weaknesses
     */
    generatePracticeRecommendations(weaknesses, interviewType) {
        const recommendations = [];

        weaknesses.forEach(weakness => {
            const lowerWeakness = weakness.toLowerCase();

            if (lowerWeakness.includes('reasoning') || lowerWeakness.includes('logic')) {
                recommendations.push({
                    topic: 'Logical Reasoning',
                    priority: 'high',
                    suggestedQuestions: [
                        'Walk me through your approach to solving a complex problem',
                        'How do you break down a large task into manageable pieces?',
                        'Explain the trade-offs between different approaches to a problem'
                    ]
                });
            }

            if (lowerWeakness.includes('communication') || lowerWeakness.includes('clarity')) {
                recommendations.push({
                    topic: 'Communication Skills',
                    priority: 'high',
                    suggestedQuestions: [
                        'Explain a technical concept to a non-technical person',
                        'Walk me through a project you worked on',
                        'Describe how you would present a proposal to stakeholders'
                    ]
                });
            }

            if (lowerWeakness.includes('confidence')) {
                recommendations.push({
                    topic: 'Building Confidence',
                    priority: 'medium',
                    suggestedQuestions: [
                        'Practice answering questions without hesitation',
                        'Record yourself and review for filler words',
                        'Practice with a timer to build comfort with time pressure'
                    ]
                });
            }

            if (lowerWeakness.includes('technical') || lowerWeakness.includes('accuracy')) {
                recommendations.push({
                    topic: 'Technical Fundamentals',
                    priority: 'high',
                    suggestedQuestions: this.getTechnicalPracticeQuestions(interviewType)
                });
            }

            if (lowerWeakness.includes('structure') || lowerWeakness.includes('organiz')) {
                recommendations.push({
                    topic: 'Response Structure',
                    priority: 'medium',
                    suggestedQuestions: [
                        'Use the STAR method for behavioral questions',
                        'Practice outlining your answer before speaking',
                        'Structure technical answers with problem → approach → solution'
                    ]
                });
            }
        });

        // Remove duplicates and limit
        const uniqueRecommendations = recommendations.filter((rec, index, self) =>
            index === self.findIndex(r => r.topic === rec.topic)
        );

        return uniqueRecommendations.slice(0, 5);
    }

    /**
     * Get technical practice questions based on interview type
     */
    getTechnicalPracticeQuestions(interviewType) {
        const questions = {
            technical: [
                'Explain the difference between an array and a linked list',
                'What is the time complexity of common sorting algorithms?',
                'How would you optimize a slow database query?'
            ],
            'system-design': [
                'Design a simple rate limiter',
                'How would you design a cache system?',
                'Explain how you would scale a web application'
            ],
            behavioral: [
                'Tell me about a challenging project you completed',
                'Describe a time when you had to learn something quickly',
                'How do you handle disagreements with teammates?'
            ],
            hr: [
                'Why are you interested in this role?',
                'Where do you see yourself in 5 years?',
                'What are your salary expectations?'
            ]
        };

        return questions[interviewType] || questions.technical;
    }

    /**
     * Get empty analytics structure
     */
    getEmptyAnalytics() {
        return {
            totalDuration: 0,
            averageResponseTime: 0,
            difficultyProgression: [],
            strengthAreas: [],
            weaknessAreas: [],
            performanceTrend: 'not-enough-data',
            overallScores: {
                correctness: 0,
                reasoning: 0,
                communication: 0,
                structure: 0,
                confidence: 0,
                overall: 0
            },
            questionBreakdown: [],
            categoryPerformance: []
        };
    }
}

// Singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
