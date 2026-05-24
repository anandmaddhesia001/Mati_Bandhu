import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatResponse } from '../../slices/chatbot';
import { FaPaperPlane } from 'react-icons/fa';

function AI() {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const loading = useSelector((state) => state.chat.loading);
  const error = useSelector((state) => state.chat.error);

  const [userInput, setUserInput] = useState('');
  const messageEndRef = useRef(null);

  const handleSendClick = () => {
    if (!userInput.trim() || loading) return;

    dispatch(fetchChatResponse(userInput));
    setUserInput('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="max-w-3xl mx-auto p-6 mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-white">🤖 AI ChatBot</h2>
        <p className="text-sm text-gray-400">Powered by Gemini AI</p>
      </div>

      {/* Chat Box */}
      <div className="h-[400px] overflow-y-auto bg-white rounded-xl p-4 shadow-inner space-y-3">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow-md whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-green-100'
                  : 'bg-blue-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-sm text-gray-500 italic">
            AI is typing...
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 text-sm font-semibold">
            {error}
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me something..."
          disabled={loading}
          rows={1}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />

        <button
          onClick={handleSendClick}
          disabled={loading}
          className={`p-3 rounded-xl text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default AI;