
import React, { useState, useEffect } from 'react';
import { sendMessage, onMessage, offMessage } from '../socket';

const Chat2 = () => {
    const [messages, setMessages] = useState(() => {
        const storedMessages = localStorage.getItem('chatMessages');
        return storedMessages ? JSON.parse(storedMessages) : [];
      });
      const [messageText, setMessageText] = useState('');
      const [darkMode, setDarkMode] = useState(false);
    
    
      //data save on local storage
      useEffect(() => {
        const handleMessage = (message) => {
          const newMessages = [...messages, message];
          setMessages(newMessages);
          localStorage.setItem('chatMessages', JSON.stringify(newMessages));
        };
    
        onMessage(handleMessage);
    
        return () => {
          offMessage();
        };
      }, [messages]);
    
      //sending message 
      const handleSendMessage = () => {
        if (messageText.trim()) {
          sendMessage({ text: messageText });
          setMessageText('');
        }
      };
      //send message on enter press 
      const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleSendMessage();
        }
      };
  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto border border-gray-300 shadow-md rounded-lg overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
    <header className="bg-blue-600 text-white p-4 text-center text-xl font-semibold flex justify-between items-center">
      <span>Real-Time Chat App</span>
    </header>
    <div className="flex-1 overflow-auto p-4 bg-gray-100">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.username === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs ${message.username === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
              <p className="font-semibold">{message.username}</p>
              <p className='break-words'>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-gray-100 p-4 border-t border-gray-200 flex items-center space-x-2">
      <input
        type="text"
        value={messageText}
        onKeyDown={handleKeyDown}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border border-gray-300 rounded-md"
      />
      <button
        onClick={handleSendMessage}
        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  </div>
  )
}

export default Chat2