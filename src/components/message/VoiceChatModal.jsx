import React, { useState, useRef, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, X, Loader2, AlertTriangle } from 'lucide-react';

// Example avatar SVGs (replace with your own or use a library)
const UserAvatar = () => (
    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-400 to-blue-200 flex items-center justify-center shadow-lg border-4 border-blue-300">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#60A5FA" /><ellipse cx="24" cy="20" rx="10" ry="8" fill="#fff" /><ellipse cx="24" cy="38" rx="14" ry="8" fill="#dbeafe" /></svg>
    </div>
);
const BotAvatar = () => (
    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-200 flex items-center justify-center shadow-lg border-4 border-purple-300">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#a78bfa" /><rect x="14" y="18" width="20" height="12" rx="6" fill="#fff" /><circle cx="18" cy="24" r="2" fill="#a78bfa" /><circle cx="30" cy="24" r="2" fill="#a78bfa" /></svg>
    </div>
);

// Props: isOpen, onClose, onSendToBackend (async), botReply (string), isBotSpeaking (bool)
const VoiceChatModal = ({ isOpen, onClose, onSendToBackend }) => {
    const [stage, setStage] = useState('user'); // 'user' | 'waiting' | 'bot'
    const [userText, setUserText] = useState('');
    const [botText, setBotText] = useState('');
    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [botError, setBotError] = useState(null);
    const synthRef = useRef(window.speechSynthesis);
    const listeningRef = useRef(false);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition({
        onEnd: async () => {
            console.log('[VoiceChatModal] onEnd triggered. Stage:', stage, 'Transcript:', transcript);
            listeningRef.current = false;
            if (stage === 'user') {
                setUserText(transcript);
                setStage('waiting');
                setBotError(null);
                if (transcript.trim()) {
                    try {
                        console.log('[VoiceChatModal] Sending transcript to backend:', transcript.trim());
                        const botReply = await onSendToBackend(transcript.trim());
                        console.log('[VoiceChatModal] Bot reply from backend:', botReply);
                        if (!botReply || botReply.toLowerCase().includes('sorry')) {
                            setBotError(botReply || 'No reply from bot.');
                            setBotText('');
                            setStage('bot');
                            setIsBotSpeaking(false);
                        } else {
                            setBotText(botReply);
                            setStage('bot');
                            speakBot(botReply);
                        }
                    } catch (e) {
                        console.error('[VoiceChatModal] Error getting bot reply:', e);
                        setBotError('Failed to get bot reply.');
                        setBotText('');
                        setStage('bot');
                        setIsBotSpeaking(false);
                    }
                } else {
                    setStage('user');
                    startListening();
                }
            }
        }
    });

    // Start user voice input
    const startListening = () => {
        console.log('[VoiceChatModal] startListening called');
        resetTranscript();
        setUserText('');
        setStage('user');
        setError(null);
        try {
            SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
            listeningRef.current = true;
        } catch (e) {
            setError('Microphone access denied or unavailable.');
            console.error('[VoiceChatModal] Error starting listening:', e);
        }
    };

    // Speak bot reply
    const speakBot = (text) => {
        if (!text) return;
        setIsBotSpeaking(true);
        console.log('[VoiceChatModal] Speaking bot reply:', text);
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.onend = () => {
            console.log('[VoiceChatModal] SpeechSynthesisUtterance ended');
            setIsBotSpeaking(false);
            setStage('user');
            // Only start listening if modal is still open and not already listening
            // Prevent infinite loop: do NOT start listening if already listening or if stage is not 'user'
            if (isOpen && !listeningRef.current && stage === 'user') {
                startListening();
            }
        };
        synthRef.current.speak(utter);
    };

    // Close modal and cleanup
    const handleClose = () => {
        console.log('[VoiceChatModal] handleClose called');
        SpeechRecognition.stopListening();
        synthRef.current.cancel();
        setStage('user');
        setUserText('');
        setBotText('');
        setIsBotSpeaking(false);
        setError(null);
        setBotError(null);
        onClose();
    };

    // Start listening when modal opens
    useEffect(() => {
        if (isOpen && browserSupportsSpeechRecognition) {
            console.log('[VoiceChatModal] Modal opened, starting listening');
            startListening();
        }
        return () => {
            console.log('[VoiceChatModal] Modal closed, cleaning up');
            SpeechRecognition.stopListening();
            synthRef.current.cancel();
        };
    }, [isOpen]);

    // Add effect to log transcript changes
    useEffect(() => {
        console.log('[VoiceChatModal] Transcript updated:', transcript);
    }, [transcript]);

    // Add effect to log when botText is set
    useEffect(() => {
        if (botText) {
            console.log('[VoiceChatModal] botText set:', botText);
        }
    }, [botText]);

    // Add effect to log when isBotSpeaking changes
    useEffect(() => {
        console.log('[VoiceChatModal] isBotSpeaking:', isBotSpeaking);
    }, [isBotSpeaking]);

    // Add effect to log errors
    useEffect(() => {
        if (error) {
            console.error('[VoiceChatModal] error:', error);
        }
        if (botError) {
            console.error('[VoiceChatModal] botError:', botError);
        }
    }, [error, botError]);

    // Track if we've already prompted the user once for empty transcript
    const [emptyPrompted, setEmptyPrompted] = useState(false);
    // Track if we should show manual input after two failures
    const [showManualInput, setShowManualInput] = useState(false);
    // Track number of empty transcript prompts
    const [emptyPromptCount, setEmptyPromptCount] = useState(0);

    // Reset emptyPromptCount when modal opens or user starts speaking
    useEffect(() => {
        if (isOpen) setEmptyPromptCount(0);
    }, [isOpen]);
    useEffect(() => {
        if (listening) setEmptyPromptCount(0);
    }, [listening]);

    // Native onend fallback for Linux/buggy browsers
    useEffect(() => {
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return;
        const recognition = SpeechRecognition.browserSupportsSpeechRecognition
            ? SpeechRecognition.getRecognition() : null;
        if (!recognition) return;
        let lastTranscript = '';
        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                interim += event.results[i][0].transcript;
            }
            lastTranscript = interim;
            // Update transcript and userText directly for Linux compatibility
            setUserText(interim);
            if (interim && interim.trim()) {
                setStage('waiting');
                setBotError(null);
                setEmptyPromptCount(0);
                onSendToBackend(interim.trim()).then(botReply => {
                    if (!botReply || botReply.toLowerCase().includes('sorry')) {
                        setBotError(botReply || 'No reply from bot.');
                        setBotText('');
                        setStage('bot');
                        setIsBotSpeaking(false);
                    } else {
                        setBotText(botReply);
                        setStage('bot');
                        speakBot(botReply);
                    }
                }).catch(e => {
                    setBotError('Failed to get bot reply.');
                    setBotText('');
                    setStage('bot');
                    setIsBotSpeaking(false);
                });
            }
        };
        const nativeOnEnd = async (event) => {
            if (stage === 'user') {
                // Only trigger empty prompt if both transcript and lastTranscript are empty
                if ((!lastTranscript || !lastTranscript.trim()) && (!transcript || !transcript.trim())) {
                    if (emptyPromptCount === 0) {
                        setEmptyPromptCount(1);
                        setUserText('');
                        setStage('user');
                        setTimeout(() => startListening(), 500);
                    } else if (emptyPromptCount === 1) {
                        setEmptyPromptCount(2);
                        setUserText('');
                        setStage('user');
                        setBotError('No speech detected. Please try again.');
                    }
                }
            }
        };
        recognition.addEventListener('end', nativeOnEnd);
        return () => {
            recognition.removeEventListener('end', nativeOnEnd);
            recognition.onresult = null;
        };
    }, [stage, onSendToBackend, emptyPromptCount, transcript]);

    // Always show the latest transcript or userText in the subtitle area
    const displaySubtitle = transcript || userText || <span className="text-blue-300">Say something...</span>;

    // Add all event listeners for debugging
    useEffect(() => {
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return;
        const recognition = SpeechRecognition.browserSupportsSpeechRecognition
            ? SpeechRecognition.getRecognition() : null;
        if (!recognition) return;
        recognition.onresult = (event) => {
            console.log('[VoiceChatModal] recognition.onresult', event);
        };
        recognition.onend = (event) => {
            console.log('[VoiceChatModal] recognition.onend', event);
        };
        recognition.onerror = (event) => {
            console.error('[VoiceChatModal] recognition.onerror', event);
        };
        recognition.onaudioend = (event) => {
            console.log('[VoiceChatModal] recognition.onaudioend', event);
        };
        recognition.onspeechend = (event) => {
            console.log('[VoiceChatModal] recognition.onspeechend', event);
        };
        recognition.onsoundend = (event) => {
            console.log('[VoiceChatModal] recognition.onsoundend', event);
        };
        return () => {
            recognition.onresult = null;
            recognition.onend = null;
            recognition.onerror = null;
            recognition.onaudioend = null;
            recognition.onspeechend = null;
            recognition.onsoundend = null;
        };
    }, []);

    // TEMP: Manual send button for debugging if onEnd is not firing
    const handleManualSend = async () => {
        if (!transcript.trim()) return;
        setUserText(transcript);
        setStage('waiting');
        setBotError(null);
        try {
            console.log('[VoiceChatModal] [Manual] Sending transcript to backend:', transcript.trim());
            const botReply = await onSendToBackend(transcript.trim());
            console.log('[VoiceChatModal] [Manual] Bot reply from backend:', botReply);
            if (!botReply || botReply.toLowerCase().includes('sorry')) {
                setBotError(botReply || 'No reply from bot.');
                setBotText('');
                setStage('bot');
                setIsBotSpeaking(false);
            } else {
                setBotText(botReply);
                setStage('bot');
                speakBot(botReply);
            }
        } catch (e) {
            console.error('[VoiceChatModal] [Manual] Error getting bot reply:', e);
            setBotError('Failed to get bot reply.');
            setBotText('');
            setStage('bot');
            setIsBotSpeaking(false);
        }
    };

    // Manual input fallback if transcript is always empty
    const [manualInput, setManualInput] = useState('');
    const handleManualInputSend = async () => {
        if (!manualInput.trim()) return;
        setUserText(manualInput);
        setStage('waiting');
        setBotError(null);
        setEmptyPrompted(false);
        try {
            console.log('[VoiceChatModal] [ManualInput] Sending manual input to backend:', manualInput.trim());
            const botReply = await onSendToBackend(manualInput.trim());
            console.log('[VoiceChatModal] [ManualInput] Bot reply from backend:', botReply);
            if (!botReply || botReply.toLowerCase().includes('sorry')) {
                setBotError(botReply || 'No reply from bot.');
                setBotText('');
                setStage('bot');
                setIsBotSpeaking(false);
            } else {
                setBotText(botReply);
                setStage('bot');
                speakBot(botReply);
            }
        } catch (e) {
            console.error('[VoiceChatModal] [ManualInput] Error getting bot reply:', e);
            setBotError('Failed to get bot reply.');
            setBotText('');
            setStage('bot');
            setIsBotSpeaking(false);
        }
        setManualInput('');
    };

    if (!isOpen) return null;

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto p-8 flex flex-col items-center relative animate-fade-in">
                    <button
                        className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                    <div className="flex flex-col items-center mt-12">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                        <span className="text-lg font-semibold text-yellow-700">Voice input is not supported in this browser.</span>
                        <span className="text-gray-500 mt-2">Try Chrome or Edge for best experience.</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-auto flex flex-col items-stretch relative animate-fade-in overflow-hidden" style={{ height: '80vh', minHeight: 400 }}>
                <button
                    className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-10"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
                {/* Top: User speaking */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 bg-gradient-to-b from-blue-50 to-white relative">
                    <div className="flex flex-col items-center w-full">
                        <UserAvatar />
                        <span className="text-blue-700 font-semibold text-lg mt-3">
                            {listening ? 'Listening...' : (stage === 'waiting' ? 'Processing...' : 'Speak to start')}
                        </span>
                        {/* Subtitles: only hide if error/manual input is showing */}
                        {emptyPromptCount < 2 && !(botError && stage === 'user' && emptyPromptCount === 1) && (
                            <div className="w-full min-h-[2.5rem] bg-blue-50 rounded-lg px-4 py-2 text-blue-900 text-lg font-medium text-center shadow-inner animate-fade-in mt-4">
                                {displaySubtitle}
                            </div>
                        )}
                        {/* Error and Try Again for no speech detected (first failure) */}
                        {botError && stage === 'user' && emptyPromptCount === 1 && (
                            <>
                                <div className="mt-2 text-red-600 text-sm">{botError}</div>
                                <button
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                                    onClick={() => {
                                        setBotError(null);
                                        setUserText('');
                                        setTimeout(() => startListening(), 200);
                                    }}
                                    type="button"
                                >
                                    Try Again
                                </button>
                            </>
                        )}
                        {/* Manual input fallback after two failures */}
                        {botError && stage === 'user' && emptyPromptCount === 2 && (
                            <>
                                <div className="mt-2 text-red-600 text-sm">{botError}</div>
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <input
                                        type="text"
                                        className="w-full max-w-xs px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Type your message..."
                                        value={manualInput}
                                        onChange={e => setManualInput(e.target.value)}
                                    />
                                    <button
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                                        onClick={handleManualInputSend}
                                        type="button"
                                    >
                                        Send
                                    </button>
                                </div>
                            </>
                        )}
                        {/* TEMP: Manual send button for debugging */}
                        {stage === 'user' && transcript && (
                            <button
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                                onClick={handleManualSend}
                                type="button"
                            >
                                Send (Debug)
                            </button>
                        )}
                        {error && (
                            <div className="mt-4 text-red-600 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error}</div>
                        )}
                        {stage === 'waiting' && (
                            <div className="flex flex-col items-center gap-4 mt-8">
                                <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                                <span className="text-blue-700 font-semibold text-lg">Bot is thinking...</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Bottom: Bot reply */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 bg-gradient-to-t from-purple-50 to-white border-t border-blue-100 relative">
                    <div className="flex flex-col items-center w-full">
                        <BotAvatar />
                        <span className="text-purple-700 font-semibold text-lg mt-3">
                            {isBotSpeaking ? 'Bot speaking...' : (botText ? 'Bot reply' : botError ? 'Bot error' : 'Waiting for reply...')}
                        </span>
                        <div className="w-full min-h-[2.5rem] bg-purple-50 rounded-lg px-4 py-2 text-purple-900 text-lg font-medium text-center shadow-inner animate-fade-in mt-4">
                            {botError ? <span className="text-red-500">{botError}</span> : (botText || <span className="text-purple-300">...</span>)}
                        </div>
                        {/* Only show loader if bot is speaking and no text yet */}
                        {stage === 'bot' && isBotSpeaking && !botText && !botError && (
                            <div className="flex flex-col items-center gap-4 mt-8">
                                <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
                <style>{`
          @keyframes mic-glow {
            0% { filter: drop-shadow(0 0 0px #3b82f6); }
            50% { filter: drop-shadow(0 0 16px #3b82f6); }
            100% { filter: drop-shadow(0 0 0px #3b82f6); }
          }
          .animate-mic-glow { animation: mic-glow 1.2s infinite; }
          .animate-fade-in { animation: fadeIn 0.4s; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
            </div>
        </div>
    );
};

export default VoiceChatModal;
