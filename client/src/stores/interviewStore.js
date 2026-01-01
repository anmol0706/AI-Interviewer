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

    // Audio recording
    mediaRecorder: null,
    audioChunks: [],

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
                currentAnswer: ''
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

    // Start audio recording
    startRecording: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);

                    // Stream audio chunk to server
                    const { socket, session } = get();
                    if (socket && session) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result.split(',')[1];
                            socket.emit('audio-stream', {
                                sessionId: session.sessionId,
                                audioChunk: base64
                            });
                        };
                        reader.readAsDataURL(event.data);
                    }
                }
            };

            mediaRecorder.start(1000); // Capture in 1-second chunks

            set({
                mediaRecorder,
                audioChunks,
                isRecording: true
            });
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    },

    // Stop audio recording
    stopRecording: async () => {
        const { mediaRecorder, socket, session } = get();

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();

            // Stop all tracks
            mediaRecorder.stream.getTracks().forEach(track => track.stop());

            // Notify server that audio is complete
            if (socket && session) {
                socket.emit('audio-complete', { sessionId: session.sessionId });
            }
        }

        set({
            mediaRecorder: null,
            audioChunks: [],
            isRecording: false
        });
    },

    // Set current answer
    setCurrentAnswer: (answer) => {
        set({ currentAnswer: answer });
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
            voiceAnalysis: null
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
