import React, { useState } from 'react';
import { Send, Mic, X } from 'lucide-react';
import Button from '../common/Button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import VoiceChatModal from './VoiceChatModal';

const MessageInput = ({ onSendMessage, isLoading, onVoiceChat }) => {
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
      {/* Voice Chat Modal (full page) */}
      {onVoiceChat && (
        <VoiceChatModal isOpen={listeningModal} onClose={() => setListeningModal(false)} onSendToBackend={onVoiceChat} />
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
            onClick={() => setListeningModal(true)}
            disabled={isLoading}
            aria-label="Voice input"
          >
            <Mic className={`h-5 w-5 ${listeningModal ? 'animate-mic-glow' : ''}`} />
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
      `}</style>
    </>
  );
};

export default MessageInput;