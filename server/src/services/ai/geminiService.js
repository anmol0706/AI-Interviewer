import { GoogleGenAI } from '@google/genai';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { interviewPrompts } from './prompts.js';

class GeminiService {
    constructor() {
        this.ai = null;
        this.modelName = 'gemini-2.5-flash';
        this.chatSessions = new Map(); // Store conversation history per session
        this.initialize();
    }

    initialize() {
        try {
            if (!config.google.geminiApiKey) {
                logger.warn('Gemini API key not configured. AI features will be limited.');
                return;
            }

            this.ai = new GoogleGenAI({ apiKey: config.google.geminiApiKey });

            logger.info('✅ Gemini AI service initialized with gemini-2.5-flash');
        } catch (error) {
            logger.error('Failed to initialize Gemini:', error);
        }
    }

    /**
     * Create or get an interview chat session (stores conversation history)
     */
    getOrCreateSession(sessionId, context) {
        if (this.chatSessions.has(sessionId)) {
            return this.chatSessions.get(sessionId);
        }

        const systemPrompt = this.buildSystemPrompt(context);

        // Initialize session with system prompt in history
        const session = {
            context,
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand my role as an AI interviewer. I am ready to conduct the interview based on the specified parameters. I will adapt my questions based on the candidate\'s responses and provide constructive feedback.' }]
                }
            ]
        };

        this.chatSessions.set(sessionId, session);
        return session;
    }

    /**
     * Send a message in an existing chat session with retry logic
     */
    async sendChatMessage(sessionId, message, retryCount = 0) {
        const maxRetries = 3;
        const baseDelay = 2000; // 2 seconds

        let session = this.chatSessions.get(sessionId);

        // Auto-create session if it doesn't exist (e.g., after server restart)
        if (!session) {
            logger.warn(`Session ${sessionId} not found, creating temporary session`);
            session = {
                sessionId,
                history: [],
                context: {},
                createdAt: new Date()
            };
            this.chatSessions.set(sessionId, session);
        }

        // Add user message to history
        session.history.push({
            role: 'user',
            parts: [{ text: message }]
        });

        try {
            // Make API call with full history
            const response = await this.ai.models.generateContent({
                model: this.modelName,
                contents: session.history,
            });

            const responseText = response.text;

            // Add model response to history
            session.history.push({
                role: 'model',
                parts: [{ text: responseText }]
            });

            return responseText;
        } catch (error) {
            // Remove the failed message from history
            session.history.pop();

            // Check if it's a rate limit error (429)
            if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
                if (retryCount < maxRetries) {
                    const delay = baseDelay * Math.pow(2, retryCount);
                    logger.warn(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.sendChatMessage(sessionId, message, retryCount + 1);
                }
                throw new Error('API rate limit exceeded. Please try again in a few minutes.');
            }
            throw error;
        }
    }

    /**
     * Build system prompt based on interview context
     */
    buildSystemPrompt(context) {
        const { interviewType, personality, difficulty, targetCompany, targetRole, userProfile } = context;

        const basePrompt = interviewPrompts.system[personality] || interviewPrompts.system.professional;
        const typePrompt = interviewPrompts.types[interviewType] || interviewPrompts.types.technical;

        return `${basePrompt}

INTERVIEW CONFIGURATION:
- Type: ${interviewType.toUpperCase()} Interview
- Difficulty Level: ${difficulty}
- Target Company: ${targetCompany || 'General'}
- Target Role: ${targetRole || 'Software Engineer'}
- Candidate Experience: ${userProfile?.experience || 0} years
- Candidate Skills: ${userProfile?.skills?.join(', ') || 'Not specified'}

${typePrompt}

IMPORTANT GUIDELINES:
1. Dynamically adjust question difficulty based on candidate performance
2. If the candidate answers well, increase complexity
3. If the candidate struggles, provide hints or simplify
4. Generate relevant follow-up questions based on their answers
5. Be ${personality === 'strict' ? 'rigorous and challenging' : personality === 'friendly' ? 'supportive and encouraging' : 'professional and balanced'}
6. Evaluate answers for: correctness, reasoning depth, logical structure, and communication clarity
7. Track topics covered and identify gaps

RESPONSE FORMAT:
Always respond in valid JSON format with the following structure:
{
  "type": "question|feedback|follow_up|summary",
  "content": "Your response text",
  "difficulty": "easy|medium|hard|expert",
  "expectedTopics": ["topic1", "topic2"],
  "hints": ["hint1", "hint2"] (optional),
  "adjustDifficulty": "increase|decrease|maintain" (optional)
}`;
    }

    /**
     * Generate the next interview question
     */
    async generateQuestion(sessionId, context, previousResponses = []) {
        if (!this.ai) {
            throw new Error('Gemini AI not initialized. Please check your API key.');
        }

        this.getOrCreateSession(sessionId, context);

        let prompt = `Generate the next interview question.

Current State:
- Questions asked: ${previousResponses.length}
- Current difficulty: ${context.difficulty}
- Topics covered: ${this.extractTopics(previousResponses)}

${previousResponses.length > 0 ? `
Previous Performance:
${this.summarizePreviousResponses(previousResponses)}
` : 'This is the first question. Start with an appropriate opening question.'}

Generate a ${context.difficulty} difficulty question for a ${context.interviewType} interview.
Focus on topics not yet covered.
Respond in JSON format.`;

        const text = await this.sendChatMessage(sessionId, prompt);
        return this.parseAIResponse(text);
    }

    /**
     * Evaluate a candidate's answer
     */
    async evaluateAnswer(sessionId, question, answer, voiceAnalysis = null) {
        if (!this.ai) {
            throw new Error('Gemini AI not initialized. Please check your API key.');
        }

        const evaluationPrompt = `Evaluate this interview response:

QUESTION: ${question.questionText || question}
DIFFICULTY: ${question.difficulty || 'medium'}
EXPECTED TOPICS: ${question.expectedTopics?.join(', ') || 'General understanding'}

CANDIDATE'S ANSWER: ${answer}

${voiceAnalysis ? `
VOICE ANALYSIS:
- Confidence Score: ${voiceAnalysis.confidence}%
- Hesitation Count: ${voiceAnalysis.hesitationCount}
- Filler Words: ${voiceAnalysis.fillerWords?.map(f => `${f.word}(${f.count})`).join(', ') || 'None'}
- Clarity Score: ${voiceAnalysis.clarityScore}%
- Words per Minute: ${voiceAnalysis.wordsPerMinute}
` : ''}

Provide a comprehensive evaluation in JSON format:
{
  "scores": {
    "correctness": { "score": 0-100, "feedback": "explanation" },
    "reasoning": { "score": 0-100, "feedback": "explanation" },
    "communication": { "score": 0-100, "feedback": "explanation" },
    "structure": { "score": 0-100, "feedback": "explanation" },
    "confidence": { "score": 0-100, "feedback": "explanation" }
  },
  "overall": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "keyTopicsCovered": ["topic1"],
  "keyTopicsMissed": ["topic2"],
  "shouldGenerateFollowUp": true|false,
  "followUpQuestion": "optional follow-up question",
  "adjustDifficulty": "increase|decrease|maintain"
}`;

        let text;
        // Try to use existing session for context, or make direct call
        if (this.chatSessions.has(sessionId)) {
            text = await this.sendChatMessage(sessionId, evaluationPrompt);
        } else {
            // No session - make a direct call to the model with proper format
            const response = await this.ai.models.generateContent({
                model: this.modelName,
                contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
            });
            text = response.text;
        }

        return this.parseAIResponse(text);
    }

    /**
     * Generate a follow-up question based on the answer
     */
    async generateFollowUp(sessionId, previousQuestion, answer, evaluation) {
        try {
            if (!this.ai) {
                return null;
            }

            const followUpPrompt = `Based on the candidate's answer, generate a relevant follow-up question.

PREVIOUS QUESTION: ${previousQuestion}
ANSWER: ${answer}
EVALUATION SUMMARY: Overall score ${evaluation.overall || 70}%
TOPICS MISSED: ${evaluation.keyTopicsMissed?.join(', ') || 'None'}

Generate a follow-up that:
1. Probes deeper into the topic if the answer was good
2. Clarifies misunderstandings if there were gaps
3. Explores related concepts
4. Maintains appropriate difficulty

Respond in JSON format with a "question" field.`;

            let text;
            // Try to use existing session, or make direct call
            if (this.chatSessions.has(sessionId)) {
                text = await this.sendChatMessage(sessionId, followUpPrompt);
            } else {
                const response = await this.ai.models.generateContent({
                    model: this.modelName,
                    contents: [{ role: 'user', parts: [{ text: followUpPrompt }] }],
                });
                text = response.text;
            }

            return this.parseAIResponse(text);
        } catch (error) {
            logger.error('Error generating follow-up:', error);
            return null;
        }
    }

    /**
     * Generate comprehensive interview summary and improvement plan
     */
    async generateInterviewSummary(sessionId, interviewData) {
        if (!this.ai) {
            throw new Error('Gemini AI not initialized. Please check your API key.');
        }

        const summaryPrompt = `Generate a comprehensive interview summary and improvement plan.

INTERVIEW DATA:
- Type: ${interviewData.interviewType}
- Total Questions: ${interviewData.totalQuestions}
- Duration: ${interviewData.duration} minutes
- Overall Score: ${interviewData.overallScores?.overall || 0}%

SCORE BREAKDOWN:
- Correctness: ${interviewData.overallScores?.correctness || 0}%
- Reasoning: ${interviewData.overallScores?.reasoning || 0}%
- Communication: ${interviewData.overallScores?.communication || 0}%
- Structure: ${interviewData.overallScores?.structure || 0}%
- Confidence: ${interviewData.overallScores?.confidence || 0}%

DIFFICULTY PROGRESSION:
${interviewData.difficultyProgression?.map(d => `Q${d.questionIndex + 1}: ${d.difficulty} (${d.score}%)`).join('\n') || 'Not available'}

RESPONSES SUMMARY:
${interviewData.responses?.map((r, i) => `
Q${i + 1}: ${r.question?.questionText?.substring(0, 100)}...
Score: ${r.scores?.overall || 0}% | Strengths: ${r.aiAnalysis?.strengths?.join(', ') || 'N/A'}
`).join('\n') || 'No responses available'}

Generate a detailed summary in JSON format:
{
  "overallAssessment": "2-3 sentence summary of the candidate's performance",
  "performanceLevel": "excellent|good|average|needs-improvement",
  "strengthAreas": ["area1", "area2", "area3"],
  "weaknessAreas": ["area1", "area2", "area3"],
  "detailedFeedback": {
    "technicalSkills": "feedback",
    "problemSolving": "feedback",
    "communication": "feedback",
    "confidence": "feedback"
  },
  "improvementPlan": {
    "summary": "personalized improvement summary",
    "focusAreas": ["area1", "area2"],
    "shortTermGoals": ["goal1", "goal2"],
    "longTermGoals": ["goal1", "goal2"],
    "recommendedPractice": [
      {
        "topic": "topic name",
        "priority": "high|medium|low",
        "suggestedQuestions": ["question1", "question2", "question3"],
        "estimatedTime": "X hours"
      }
    ],
    "resources": [
      {
        "title": "resource name",
        "type": "book|video|course|article",
        "description": "why this resource helps"
      }
    ]
  },
  "readinessScore": 0-100,
  "recommendedNextSteps": ["step1", "step2", "step3"]
}`;

        let text;
        // Try to use existing session, or make direct call
        if (this.chatSessions.has(sessionId)) {
            text = await this.sendChatMessage(sessionId, summaryPrompt);
        } else {
            const response = await this.ai.models.generateContent({
                model: this.modelName,
                contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
            });
            text = response.text;
        }

        // Clean up session after summary
        this.chatSessions.delete(sessionId);

        return this.parseAIResponse(text);
    }

    /**
     * Get temperature based on interviewer personality
     */
    getTemperatureForPersonality(personality) {
        const temperatures = {
            strict: 0.5,      // More focused, less creative
            friendly: 0.8,    // More varied, encouraging
            professional: 0.7 // Balanced
        };
        return temperatures[personality] || 0.7;
    }

    /**
     * Extract topics from previous responses
     */
    extractTopics(responses) {
        const topics = new Set();
        responses.forEach(r => {
            r.aiAnalysis?.keyTopicsCovered?.forEach(t => topics.add(t));
        });
        return Array.from(topics).join(', ') || 'None yet';
    }

    /**
     * Summarize previous responses for context
     */
    summarizePreviousResponses(responses) {
        return responses.slice(-3).map((r, i) => {
            return `Q${i + 1}: Score ${r.scores?.overall || 0}% - ${r.scores?.correctness?.feedback?.substring(0, 100) || 'No feedback'}`;
        }).join('\n');
    }

    /**
     * Parse AI response, handling JSON in markdown blocks
     */
    parseAIResponse(text) {
        try {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1].trim());
            }

            // Try to parse as direct JSON
            const cleanText = text.trim();
            if (cleanText.startsWith('{') || cleanText.startsWith('[')) {
                return JSON.parse(cleanText);
            }

            // Return as content if not JSON
            return { content: text, type: 'text' };
        } catch (error) {
            logger.warn('Failed to parse AI response as JSON:', error.message);
            return { content: text, type: 'text' };
        }
    }

    /**
     * Clear a specific session
     */
    clearSession(sessionId) {
        this.chatSessions.delete(sessionId);
    }

    /**
     * Clear all sessions (for cleanup)
     */
    clearAllSessions() {
        this.chatSessions.clear();
    }
}

// Singleton instance
const geminiService = new GeminiService();

export default geminiService;
