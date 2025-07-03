import React, { useState } from 'react';
import { Send, Mic, X } from 'lucide-react';
import Button from '../common/Button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const MessageInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [listeningModal, setListeningModal] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    onSendMessage({
      content: message.trim(),
      sender_id: 'user',
      message_type: 'text',
    });
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    setListeningModal(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
    setListeningModal(false);
    if (transcript) setMessage(transcript);
  };

  return (
    <>
      {/* Voice Listening Modal */}
      {listeningModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          <div className="mb-24 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center animate-fade-in pointer-events-auto border-2 border-blue-200">
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="relative mb-2">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse shadow-lg border-4 border-blue-300">
                  <Mic className="h-8 w-8 text-blue-600 animate-mic-glow" />
                </div>
                <button
                  className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100 transition"
                  onClick={handleStopListening}
                  aria-label="Stop listening"
                  type="button"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <span className="text-blue-700 font-semibold text-lg mb-2">Listening...</span>
              <div className="w-full min-h-[2.5rem] bg-blue-50 rounded-lg px-4 py-2 text-blue-900 text-lg font-medium text-center shadow-inner animate-fade-in">
                {transcript || <span className="text-blue-300">Say something...</span>}
              </div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={handleStopListening}
                type="button"
              >
                Use This
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex space-x-2 items-end">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            disabled={isLoading}
          />
          <button
            type="button"
            className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full p-2 flex items-center justify-center shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleMicClick}
            disabled={isLoading}
            aria-label="Voice input"
          >
            <Mic className={`h-5 w-5 ${listening ? 'animate-mic-glow' : ''}`} />
          </button>
          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
            loading={isLoading}
            className="px-3 py-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
      <style>{`
        @keyframes mic-glow {
          0% { filter: drop-shadow(0 0 0px #3b82f6); }
          50% { filter: drop-shadow(0 0 12px #3b82f6); }
          100% { filter: drop-shadow(0 0 0px #3b82f6); }
        }
        .animate-mic-glow { animation: mic-glow 1.2s infinite; }
        .animate-fade-in { animation: fadeIn 0.4s; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default MessageInput;