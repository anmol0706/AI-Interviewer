import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useAuthStore } from './authStore';

export const useInterviewStore = create((set, get) => ({
    // Session state
    session: null,
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    isInterviewActive: false,
    isPaused: false,
    isLoading: false,
    sessionCompleted: false,

    // Response state
    responses: [],
    currentAnswer: '',
    isRecording: false,
    isProcessing: false,

    // Evaluation state
    lastEvaluation: null,
    voiceAnalysis: null,

    // Socket connection
    socket: null,
    isConnected: false,
    sessionError: null,

    // Audio recording (Web Speech API)
    speechRecognition: null,

    // Initialize socket connection
    initSocket: () => {
        const { accessToken } = useAuthStore.getState();

        if (!accessToken || get().socket) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false });
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            // Set error state so components can handle it
            set({
                sessionError: error.message || 'An error occurred',
                isProcessing: false
            });
        });

        // Interview events
        socket.on('interview-joined', (data) => {
            set({
                session: data,
                currentQuestion: data.currentQuestion,
                questionIndex: data.progress.current - 1,
                totalQuestions: data.progress.total,
                isInterviewActive: true
            });
        });

        socket.on('next-question', (data) => {
            set({
                currentQuestion: {
                    question: data.question,
                    type: data.type,
                    difficulty: data.difficulty,
                    expectedTopics: data.expectedTopics
                },
                questionIndex: data.index,
                totalQuestions: data.progress.total,
                isProcessing: false,
                currentAnswer: '',
                voiceAnalysis: null,
                lastEvaluation: null
            });
        });

        socket.on('answer-processing', ({ status }) => {
            set({ isProcessing: true });
        });

        socket.on('answer-evaluated', (data) => {
            set({
                lastEvaluation: data,
                isProcessing: false
            });
        });

        socket.on('transcription-complete', (data) => {
            set({
                voiceAnalysis: data,
                currentAnswer: data.transcription
            });
        });

        socket.on('difficulty-adjusted', (data) => {
            console.log('Difficulty adjusted:', data);
        });

        socket.on('interview-complete', (data) => {
            set({
                isInterviewActive: false,
                session: { ...get().session, ...data }
            });
        });

        socket.on('interview-paused', () => {
            set({ isPaused: true });
        });

        socket.on('interview-resumed', (data) => {
            set({
                isPaused: false,
                currentQuestion: data.currentQuestion
            });
        });

        // Handle case where user tries to rejoin a completed interview
        socket.on('interview-already-complete', (data) => {
            console.log('Interview already complete:', data);
            set({
                session: data,
                isInterviewActive: false,
                sessionCompleted: true
            });
        });

        set({ socket });
    },

    // Disconnect socket
    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    },

    // Join interview session
    joinInterview: (sessionId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('join-interview', { sessionId });
        }
    },

    // Leave interview session
    leaveInterview: (sessionId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('leave-interview', { sessionId });
        }
        set({
            session: null,
            currentQuestion: null,
            isInterviewActive: false,
            responses: [],
            currentAnswer: ''
        });
    },

    // Submit answer via socket
    submitAnswerSocket: (answer) => {
        const { socket, session } = get();
        if (socket && session) {
            socket.emit('submit-answer', {
                sessionId: session.sessionId,
                answer
            });
            set({ isProcessing: true });
        }
    },

    // Speech recognition instance
    speechRecognition: null,

    // Start audio recording with Web Speech API
    startRecording: async () => {
        try {
            // Check for Web Speech API support
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported in this browser');
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            let finalTranscript = '';
            let interimTranscript = '';
            const startTime = Date.now();

            recognition.onresult = (event) => {
                interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript = transcript;
                    }
                }

                // Update the current answer with the transcription
                const fullTranscript = (finalTranscript + interimTranscript).trim();
                set({
                    currentAnswer: fullTranscript,
                    voiceAnalysis: {
                        transcription: fullTranscript,
                        confidence: 85,
                        isInterim: interimTranscript.length > 0
                    }
                });
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    // User didn't speak, just ignore
                    return;
                }
                set({ isRecording: false, speechRecognition: null });
            };

            recognition.onend = () => {
                const { isRecording } = get();
                // Only restart if we're still supposed to be recording
                if (isRecording && get().speechRecognition === recognition) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // Already started or stopped, ignore
                    }
                }
            };

            recognition.start();

            set({
                speechRecognition: recognition,
                isRecording: true,
                currentAnswer: '',
                voiceAnalysis: null
            });
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    },

    // Stop audio recording
    stopRecording: async () => {
        const { speechRecognition, currentAnswer, socket, session } = get();

        if (speechRecognition) {
            speechRecognition.stop();
        }

        // Calculate voice analysis metrics based on the transcription
        const words = currentAnswer.trim().split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        // Detect filler words
        const fillerWordsList = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'well', 'i mean', 'kind of', 'sort of', 'right', 'okay'];
        const fillerWords = [];
        fillerWordsList.forEach(filler => {
            const regex = new RegExp(`\\b${filler}\\b`, 'gi');
            const matches = currentAnswer.toLowerCase().match(regex);
            if (matches && matches.length > 0) {
                fillerWords.push({ word: filler, count: matches.length });
            }
        });

        const hesitationCount = fillerWords.reduce((sum, f) => sum + f.count, 0);
        const clarityScore = Math.max(50, 100 - (hesitationCount * 5));
        const wordsPerMinute = 140; // Estimated average

        // Create voice analysis object
        const voiceAnalysis = {
            transcription: currentAnswer,
            confidence: Math.min(95, 70 + Math.min(25, wordCount / 2)),
            hesitationCount,
            fillerWords,
            clarityScore,
            wordsPerMinute,
            speechPatterns: {
                speakingRate: 'normal',
                consistency: 'consistent',
                energy: 'moderate'
            }
        };

        // Emit transcription to server for storage
        if (socket && session && currentAnswer.trim()) {
            socket.emit('transcription-complete-client', {
                sessionId: session.sessionId,
                voiceAnalysis
            });
        }

        set({
            speechRecognition: null,
            isRecording: false,
            voiceAnalysis
        });
    },

    // Set current answer
    setCurrentAnswer: (answer) => {
        set({ currentAnswer: answer });
    },

    // Set/clear voice analysis
    setVoiceAnalysis: (voiceAnalysis) => {
        set({ voiceAnalysis });
    },

    // Set session data
    setSession: (session) => {
        set({
            session,
            currentQuestion: session.currentQuestion,
            questionIndex: 0,
            totalQuestions: session.totalQuestions,
            isInterviewActive: true
        });
    },

    // Clear interview state
    clearInterview: () => {
        const { speechRecognition } = get();
        if (speechRecognition) {
            speechRecognition.stop();
        }
        set({
            session: null,
            currentQuestion: null,
            questionIndex: 0,
            totalQuestions: 0,
            isInterviewActive: false,
            isPaused: false,
            sessionCompleted: false,
            sessionError: null,
            responses: [],
            currentAnswer: '',
            lastEvaluation: null,
            voiceAnalysis: null,
            speechRecognition: null,
            isRecording: false
        });
    },

    // Pause interview
    pauseInterview: () => {
        const { socket, session } = get();
        if (socket && session) {
            socket.emit('pause-interview', { sessionId: session.sessionId });
        }
    },

    // Resume interview
    resumeInterview: () => {
        const { socket, session } = get();
        if (socket && session) {
            socket.emit('resume-interview', { sessionId: session.sessionId });
        }
    }
}));

export default useInterviewStore;
