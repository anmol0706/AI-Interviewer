import speech from '@google-cloud/speech';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

class SpeechService {
    constructor() {
        this.client = null;
        this.fillerWords = [
            'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically',
            'actually', 'literally', 'so', 'well', 'I mean', 'kind of',
            'sort of', 'right', 'okay', 'hmm', 'mmm'
        ];
        this.initialize();
    }

    initialize() {
        try {
            if (config.google.credentials) {
                this.client = new speech.SpeechClient({
                    keyFilename: config.google.credentials
                });
                logger.info('✅ Speech-to-Text service initialized');
            } else {
                logger.warn('Speech-to-Text credentials not configured. Voice analysis will be limited.');
            }
        } catch (error) {
            logger.error('Failed to initialize Speech-to-Text:', error);
        }
    }

    /**
     * Transcribe audio and analyze speech patterns
     */
    async transcribeAndAnalyze(audioBuffer, options = {}) {
        const {
            sampleRateHertz = 16000,
            languageCode = 'en-US',
            encoding = 'LINEAR16'
        } = options;

        try {
            // If no real client, use mock analysis for development
            if (!this.client) {
                logger.warn('Using mock speech analysis (no credentials)');
                return this.getMockAnalysis();
            }

            const request = {
                audio: {
                    content: audioBuffer.toString('base64')
                },
                config: {
                    encoding,
                    sampleRateHertz,
                    languageCode,
                    enableAutomaticPunctuation: true,
                    enableWordTimeOffsets: true,
                    enableWordConfidence: true,
                    model: 'latest_long',
                    useEnhanced: true
                }
            };

            const [response] = await this.client.recognize(request);

            if (!response.results || response.results.length === 0) {
                return this.getEmptyAnalysis();
            }

            return this.analyzeTranscription(response);
        } catch (error) {
            logger.error('Speech transcription error:', error);
            return this.getEmptyAnalysis();
        }
    }

    /**
     * Transcribe long audio using streaming
     */
    async transcribeLongAudio(audioStream, options = {}) {
        const {
            sampleRateHertz = 16000,
            languageCode = 'en-US',
            encoding = 'LINEAR16'
        } = options;

        if (!this.client) {
            return this.getMockAnalysis();
        }

        return new Promise((resolve, reject) => {
            const chunks = [];
            let fullTranscription = '';
            const wordTimings = [];

            const recognizeStream = this.client.streamingRecognize({
                config: {
                    encoding,
                    sampleRateHertz,
                    languageCode,
                    enableAutomaticPunctuation: true,
                    enableWordTimeOffsets: true,
                    enableWordConfidence: true,
                    interimResults: false
                }
            })
                .on('data', (data) => {
                    if (data.results[0]?.alternatives[0]) {
                        const result = data.results[0].alternatives[0];
                        chunks.push(result);
                        fullTranscription += result.transcript + ' ';

                        if (result.words) {
                            wordTimings.push(...result.words);
                        }
                    }
                })
                .on('error', (error) => {
                    logger.error('Streaming recognition error:', error);
                    reject(error);
                })
                .on('end', () => {
                    const analysis = this.analyzeWordTimings(wordTimings, fullTranscription);
                    resolve(analysis);
                });

            audioStream.pipe(recognizeStream);
        });
    }

    /**
     * Analyze transcription results
     */
    analyzeTranscription(response) {
        const results = response.results;
        let fullTranscription = '';
        const wordTimings = [];
        let totalConfidence = 0;
        let confidenceCount = 0;

        results.forEach(result => {
            if (result.alternatives && result.alternatives[0]) {
                const alternative = result.alternatives[0];
                fullTranscription += alternative.transcript + ' ';

                if (alternative.words) {
                    wordTimings.push(...alternative.words);
                }

                if (alternative.confidence) {
                    totalConfidence += alternative.confidence;
                    confidenceCount++;
                }
            }
        });

        const baseConfidence = confidenceCount > 0
            ? Math.round((totalConfidence / confidenceCount) * 100)
            : 70;

        return this.analyzeWordTimings(wordTimings, fullTranscription.trim(), baseConfidence);
    }

    /**
     * Analyze word timings for speech patterns
     */
    analyzeWordTimings(wordTimings, transcription, baseConfidence = 70) {
        const analysis = {
            transcription,
            confidence: baseConfidence,
            hesitationCount: 0,
            fillerWords: [],
            pauseDurations: [],
            averagePauseDuration: 0,
            wordsPerMinute: 0,
            clarityScore: 0,
            speechPatterns: {
                speakingRate: 'normal',
                consistency: 'consistent',
                energy: 'moderate'
            }
        };

        if (wordTimings.length === 0) {
            return analysis;
        }

        // Calculate duration
        const firstWordTime = this.parseGoogleTime(wordTimings[0].startTime);
        const lastWordTime = this.parseGoogleTime(wordTimings[wordTimings.length - 1].endTime);
        const totalDurationSeconds = lastWordTime - firstWordTime;

        // Words per minute
        if (totalDurationSeconds > 0) {
            analysis.wordsPerMinute = Math.round((wordTimings.length / totalDurationSeconds) * 60);
        }

        // Analyze pauses and hesitations
        const fillerWordCounts = {};

        for (let i = 0; i < wordTimings.length; i++) {
            const word = wordTimings[i];
            const wordText = word.word?.toLowerCase() || '';

            // Check for filler words
            if (this.isFillerWord(wordText)) {
                if (!fillerWordCounts[wordText]) {
                    fillerWordCounts[wordText] = { word: wordText, count: 0, timestamps: [] };
                }
                fillerWordCounts[wordText].count++;
                fillerWordCounts[wordText].timestamps.push(this.parseGoogleTime(word.startTime));
                analysis.hesitationCount++;
            }

            // Check for pauses between words
            if (i > 0) {
                const prevEndTime = this.parseGoogleTime(wordTimings[i - 1].endTime);
                const currentStartTime = this.parseGoogleTime(word.startTime);
                const pauseDuration = currentStartTime - prevEndTime;

                // Consider pauses longer than 0.5 seconds as significant
                if (pauseDuration > 0.5) {
                    analysis.pauseDurations.push({
                        startTime: prevEndTime,
                        endTime: currentStartTime,
                        duration: pauseDuration
                    });
                }

                // Pauses longer than 2 seconds indicate hesitation
                if (pauseDuration > 2) {
                    analysis.hesitationCount++;
                }
            }
        }

        // Convert filler word counts to array
        analysis.fillerWords = Object.values(fillerWordCounts)
            .sort((a, b) => b.count - a.count);

        // Calculate average pause duration
        if (analysis.pauseDurations.length > 0) {
            const totalPauseDuration = analysis.pauseDurations.reduce((sum, p) => sum + p.duration, 0);
            analysis.averagePauseDuration = totalPauseDuration / analysis.pauseDurations.length;
        }

        // Calculate clarity score
        analysis.clarityScore = this.calculateClarityScore(analysis);

        // Determine speech patterns
        analysis.speechPatterns = this.determineSpeechPatterns(analysis);

        // Adjust confidence based on analysis
        analysis.confidence = this.calculateOverallConfidence(analysis, baseConfidence);

        return analysis;
    }

    /**
     * Check if a word is a filler word
     */
    isFillerWord(word) {
        const normalizedWord = word.toLowerCase().trim();
        return this.fillerWords.some(filler =>
            normalizedWord === filler || normalizedWord.includes(filler)
        );
    }

    /**
     * Parse Google's time format
     */
    parseGoogleTime(time) {
        if (!time) return 0;

        // Handle both string and object formats
        if (typeof time === 'object') {
            const seconds = parseInt(time.seconds || 0, 10);
            const nanos = parseInt(time.nanos || 0, 10);
            return seconds + nanos / 1e9;
        }

        // String format: "1.500s"
        return parseFloat(time.replace('s', ''));
    }

    /**
     * Calculate clarity score based on speech patterns
     */
    calculateClarityScore(analysis) {
        let score = 100;

        // Deduct for excessive filler words
        const totalFillers = analysis.fillerWords.reduce((sum, f) => sum + f.count, 0);
        score -= Math.min(30, totalFillers * 3);

        // Deduct for long pauses
        const longPauses = analysis.pauseDurations.filter(p => p.duration > 2).length;
        score -= Math.min(20, longPauses * 5);

        // Deduct for speaking too fast or too slow
        if (analysis.wordsPerMinute > 180) {
            score -= 10; // Too fast
        } else if (analysis.wordsPerMinute < 100 && analysis.wordsPerMinute > 0) {
            score -= 10; // Too slow
        }

        // Deduct for excessive hesitations
        score -= Math.min(20, analysis.hesitationCount * 2);

        return Math.max(0, Math.round(score));
    }

    /**
     * Determine speech patterns from analysis
     */
    determineSpeechPatterns(analysis) {
        const patterns = {
            speakingRate: 'normal',
            consistency: 'consistent',
            energy: 'moderate'
        };

        // Speaking rate
        if (analysis.wordsPerMinute > 160) {
            patterns.speakingRate = 'fast';
        } else if (analysis.wordsPerMinute < 120 && analysis.wordsPerMinute > 0) {
            patterns.speakingRate = 'slow';
        }

        // Consistency based on pause patterns
        if (analysis.pauseDurations.length > 0) {
            const pauseVariance = this.calculateVariance(analysis.pauseDurations.map(p => p.duration));
            if (pauseVariance > 1) {
                patterns.consistency = 'variable';
            } else if (pauseVariance > 0.5) {
                patterns.consistency = 'somewhat variable';
            }
        }

        // Energy level based on pace and pauses
        const fillerRatio = analysis.hesitationCount / Math.max(1, analysis.wordsPerMinute);
        if (fillerRatio > 0.1) {
            patterns.energy = 'low';
        } else if (analysis.wordsPerMinute > 150 && analysis.hesitationCount < 3) {
            patterns.energy = 'high';
        }

        return patterns;
    }

    /**
     * Calculate variance for an array of numbers
     */
    calculateVariance(numbers) {
        if (numbers.length === 0) return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    }

    /**
     * Calculate overall confidence score
     */
    calculateOverallConfidence(analysis, baseConfidence) {
        let confidence = baseConfidence;

        // Adjust based on clarity
        if (analysis.clarityScore >= 80) {
            confidence = Math.min(100, confidence + 10);
        } else if (analysis.clarityScore < 50) {
            confidence = Math.max(0, confidence - 15);
        }

        // Adjust based on speaking rate
        if (analysis.speechPatterns.speakingRate === 'normal') {
            confidence = Math.min(100, confidence + 5);
        }

        // Adjust based on consistency
        if (analysis.speechPatterns.consistency === 'consistent') {
            confidence = Math.min(100, confidence + 5);
        } else if (analysis.speechPatterns.consistency === 'variable') {
            confidence = Math.max(0, confidence - 10);
        }

        return Math.round(confidence);
    }

    /**
     * Get empty analysis for error cases
     */
    getEmptyAnalysis() {
        return {
            transcription: '',
            confidence: 0,
            hesitationCount: 0,
            fillerWords: [],
            pauseDurations: [],
            averagePauseDuration: 0,
            wordsPerMinute: 0,
            clarityScore: 0,
            speechPatterns: {
                speakingRate: 'unknown',
                consistency: 'unknown',
                energy: 'unknown'
            }
        };
    }

    /**
     * Get mock analysis for development/testing
     */
    getMockAnalysis() {
        return {
            transcription: 'This is a mock transcription for development purposes.',
            confidence: 85,
            hesitationCount: 2,
            fillerWords: [
                { word: 'um', count: 1, timestamps: [2.5] },
                { word: 'like', count: 1, timestamps: [5.2] }
            ],
            pauseDurations: [
                { startTime: 3.0, endTime: 3.8, duration: 0.8 }
            ],
            averagePauseDuration: 0.8,
            wordsPerMinute: 145,
            clarityScore: 78,
            speechPatterns: {
                speakingRate: 'normal',
                consistency: 'somewhat variable',
                energy: 'moderate'
            }
        };
    }
}

// Singleton instance
const speechService = new SpeechService();

export default speechService;
