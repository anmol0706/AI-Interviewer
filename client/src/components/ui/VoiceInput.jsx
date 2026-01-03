/**
 * Voice Input Component
 * Enhanced voice recording with visual feedback and waveform display
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const MicIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const MicOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
);

const StopIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
);

// Voice waveform visualizer
function VoiceWaveform({ isActive, audioLevel = 0 }) {
    const bars = 20;

    return (
        <div className="flex items-center justify-center gap-0.5 h-12">
            {Array.from({ length: bars }).map((_, i) => {
                const delay = i * 0.05;
                const baseHeight = 4;
                const maxHeight = 40;
                const height = isActive
                    ? baseHeight + (Math.sin(Date.now() / 100 + i) * 0.5 + 0.5) * (maxHeight - baseHeight) * (audioLevel / 100)
                    : baseHeight;

                return (
                    <motion.div
                        key={i}
                        animate={{
                            height: isActive ? [baseHeight, Math.random() * maxHeight, baseHeight] : baseHeight,
                            opacity: isActive ? 1 : 0.3
                        }}
                        transition={{
                            duration: 0.3,
                            delay: delay,
                            repeat: isActive ? Infinity : 0,
                            repeatType: 'reverse'
                        }}
                        className={`w-1 rounded-full ${isActive ? 'bg-primary-500' : 'bg-dark-600'}`}
                        style={{ minHeight: baseHeight }}
                    />
                );
            })}
        </div>
    );
}

// Circular recording indicator
function RecordingIndicator({ isRecording, duration }) {
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3">
            <motion.div
                animate={isRecording ? {
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1]
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${isRecording ? 'bg-error-500' : 'bg-dark-600'}`}
            />
            <span className={`font-mono text-sm ${isRecording ? 'text-white' : 'text-dark-500'}`}>
                {formatDuration(duration)}
            </span>
        </div>
    );
}

// Main Voice Input Component
export function VoiceInput({
    onTranscript,
    onStart,
    onStop,
    onError,
    disabled = false,
    placeholder = "Click to speak...",
    showWaveform = true,
    showTranscript = true,
    className = ''
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [duration, setDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState(null);
    const [isBrowserSupported, setIsBrowserSupported] = useState(true);

    const recognitionRef = useRef(null);
    const durationIntervalRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsBrowserSupported(false);
            setError('Speech recognition not supported in this browser');
        }
    }, []);

    // Initialize speech recognition
    const initRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPart = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcriptPart;
                } else {
                    interim += transcriptPart;
                }
            }

            if (final) {
                setTranscript((prev) => prev + final);
                onTranscript?.(transcript + final);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            let errorMessage = 'Voice input error';
            switch (event.error) {
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please enable microphone permissions.';
                    break;
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'network':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone found. Please connect a microphone.';
                    break;
                default:
                    errorMessage = `Voice input error: ${event.error}`;
            }

            setError(errorMessage);
            onError?.(errorMessage);
            stopRecording();
        };

        recognition.onend = () => {
            setIsListening(false);
            if (isRecording) {
                // Restart if still supposed to be recording
                try {
                    recognition.start();
                } catch (e) {
                    // Ignore restart errors
                }
            }
        };

        return recognition;
    }, [isRecording, onTranscript, onError, transcript]);

    // Audio level analyzer for waveform
    const startAudioAnalyzer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const updateLevel = () => {
                if (!analyserRef.current) return;

                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);

                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(Math.min(100, average * 1.5));

                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };

            updateLevel();
        } catch (error) {
            console.error('Audio analyzer error:', error);
        }
    };

    const stopAudioAnalyzer = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setAudioLevel(0);
    };

    // Start recording
    const startRecording = async () => {
        if (disabled || !isBrowserSupported) return;

        setError(null);
        setTranscript('');
        setInterimTranscript('');
        setDuration(0);

        recognitionRef.current = initRecognition();

        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
                onStart?.();

                // Start duration counter
                durationIntervalRef.current = setInterval(() => {
                    setDuration((prev) => prev + 1);
                }, 1000);

                // Start audio analyzer
                if (showWaveform) {
                    await startAudioAnalyzer();
                }
            } catch (error) {
                console.error('Failed to start recording:', error);
                setError('Failed to start voice input');
                onError?.('Failed to start voice input');
            }
        }
    };

    // Stop recording
    const stopRecording = useCallback(() => {
        setIsRecording(false);
        setIsListening(false);

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }

        stopAudioAnalyzer();

        const finalTranscript = transcript + interimTranscript;
        if (finalTranscript) {
            onTranscript?.(finalTranscript);
        }
        onStop?.(finalTranscript);
        setInterimTranscript('');
    }, [transcript, interimTranscript, onTranscript, onStop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, [stopRecording]);

    // Toggle recording
    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    if (!isBrowserSupported) {
        return (
            <div className={`p-4 bg-warning-500/10 border border-warning-500/30 rounded-xl text-center ${className}`}>
                <MicOffIcon />
                <p className="text-warning-400 text-sm mt-2">
                    Voice input is not supported in this browser.
                </p>
                <p className="text-dark-500 text-xs mt-1">
                    Please use Chrome, Edge, or Safari.
                </p>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-3 p-3 bg-error-500/10 border border-error-500/30 rounded-lg text-error-400 text-sm"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main voice input area */}
            <div className={`p-4 rounded-xl border transition-all ${isRecording
                    ? 'bg-primary-500/10 border-primary-500/30'
                    : 'bg-dark-800/50 border-dark-700'
                }`}>
                {/* Waveform */}
                {showWaveform && (
                    <div className="mb-4">
                        <VoiceWaveform isActive={isRecording} audioLevel={audioLevel} />
                    </div>
                )}

                {/* Recording controls */}
                <div className="flex items-center justify-between">
                    <RecordingIndicator isRecording={isRecording} duration={duration} />

                    <button
                        onClick={toggleRecording}
                        disabled={disabled}
                        className={`p-4 rounded-full transition-all ${isRecording
                                ? 'bg-error-500 text-white hover:bg-error-600 animate-pulse'
                                : 'bg-primary-500 text-white hover:bg-primary-600'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isRecording ? <StopIcon /> : <MicIcon />}
                    </button>

                    <div className="text-xs text-dark-500 w-16 text-right">
                        {isRecording ? 'Recording' : 'Tap to speak'}
                    </div>
                </div>

                {/* Transcript preview */}
                {showTranscript && (transcript || interimTranscript) && (
                    <div className="mt-4 p-3 bg-dark-900/50 rounded-lg">
                        <p className="text-xs text-dark-500 mb-1">Transcript:</p>
                        <p className="text-sm text-white">
                            {transcript}
                            <span className="text-dark-400 italic">{interimTranscript}</span>
                        </p>
                    </div>
                )}

                {/* Placeholder */}
                {!isRecording && !transcript && !interimTranscript && (
                    <p className="text-center text-dark-500 text-sm mt-3">
                        {placeholder}
                    </p>
                )}
            </div>
        </div>
    );
}

// Compact voice button for inline use
export function VoiceButton({
    onTranscript,
    onStart,
    onStop,
    onError,
    disabled = false,
    size = 'md',
    className = ''
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    const sizes = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const toggle = async () => {
        if (!isSupported || disabled) return;

        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
            onStop?.();
        } else {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            let fullTranscript = '';

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                fullTranscript = transcript;
                onTranscript?.(transcript);
            };

            recognition.onerror = (event) => {
                onError?.(event.error);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
                onStop?.(fullTranscript);
            };

            try {
                recognition.start();
                recognitionRef.current = recognition;
                setIsRecording(true);
                onStart?.();
            } catch (error) {
                onError?.(error.message);
            }
        }
    };

    if (!isSupported) {
        return (
            <button
                disabled
                className={`${sizes[size]} rounded-lg bg-dark-800/50 text-dark-600 cursor-not-allowed ${className}`}
                title="Voice input not supported"
            >
                <MicOffIcon />
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            disabled={disabled}
            className={`${sizes[size]} rounded-lg transition-all ${isRecording
                    ? 'bg-error-500 text-white animate-pulse'
                    : 'bg-dark-800/50 text-dark-400 hover:bg-dark-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
        >
            {isRecording ? (
                <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            ) : (
                <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            )}
        </button>
    );
}

export default VoiceInput;
