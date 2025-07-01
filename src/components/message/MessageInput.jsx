import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../common/Button';

const MessageInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

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

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex space-x-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="2"
          disabled={isLoading}
        />
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
  );
};

export default MessageInput;