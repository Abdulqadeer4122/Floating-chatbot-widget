'use client'

import React, { useState, useEffect, useRef } from 'react';

interface QuickPrompt {
  title: string;
  query: string;
}

interface PreChatFormField {
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface PreChatForm {
  isEnabled: boolean;
  fields: Record<string, PreChatFormField>;
  preChatMessage: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface FloatingChatbotProps {
  chatbotId?: number;
  botName?: string;
  primaryColor?: string;
  logoUrl?: string;
  welcomeTagline?: string;
  loaderText?: string;
  quickPrompts?: QuickPrompt[];
  agentEscalationEnabled?: boolean;
  preChatForm?: PreChatForm;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ 
  chatbotId = 1,
  botName = "Assistant",
  primaryColor = "#4F46E5",
  logoUrl = "/api/placeholder/48/48",
  welcomeTagline = "Hello! How can I assist you today?",
  loaderText = "Thinking...",
  quickPrompts = [
    { title: "Help", query: "How can I help you?" },
    { title: "Services", query: "Tell me more about your services" },
    { title: "Pricing", query: "I need pricing information" },
    { title: "Agent", query: "Can I speak to a human agent?" }
  ],
  agentEscalationEnabled = true,
  preChatForm = {
    isEnabled: false,
    fields: {},
    preChatMessage: "Please fill out this form before we start the conversation."
  }
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isEscalated, setIsEscalated] = useState<boolean>(false);
  const [showPreChatForm, setShowPreChatForm] = useState<boolean>(false);
  const [preChatData, setPreChatData] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 1, text: welcomeTagline, sender: 'bot', timestamp: new Date() }
      ]);
      
      if (preChatForm.isEnabled && !formSubmitted) {
        setShowPreChatForm(true);
      }
    }
  }, [isOpen, welcomeTagline, messages.length, preChatForm, formSubmitted]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleFormInputChange = (field: string, value: string) => {
    setPreChatData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPreChatForm = () => {
    setShowPreChatForm(false);
    setFormSubmitted(true);
    
    setMessages(prevMessages => [
      ...prevMessages,
      { 
        id: messages.length + 1, 
        text: "Thank you for providing your information!", 
        sender: 'bot', 
        timestamp: new Date() 
      }
    ]);
  };

  const sendMessageToAPI = async (message: string) => {
    try {
      setIsTyping(true);
      
      const response = await fetch('http://localhost:3000/api/chatbot/chat', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message, 
          chatbotId,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      console.log("data ---------------", data);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: messages.length + 2,
          text: data.answer || "Sorry, there was an issue processing your request.",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: messages.length + 2,
          text: "Sorry, there was an error connecting to the service. Please try again later.",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    const messageToSend = inputValue;
    setInputValue('');
    
    sendMessageToAPI(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: prompt.query,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    sendMessageToAPI(prompt.query);
  };

  const handleEscalateToAgent = () => {
    setIsEscalated(true);
    
    setMessages(prevMessages => [
      ...prevMessages, 
      { 
        id: messages.length + 1, 
        text: "Chat escalated to human agent. An agent will respond to you shortly.", 
        sender: 'bot', 
        timestamp: new Date() 
      }
    ]);
    
    sendMessageToAPI("I'd like to speak with a human agent.");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderPreChatForm = () => {
    if (!showPreChatForm) return null;
    
    return (
      <div className="p-4 bg-white flex flex-col">
        <h3 className="text-lg font-medium text-black mb-3">{preChatForm.preChatMessage}</h3>
        
        {Object.entries(preChatForm.fields).map(([field, config]) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              {config.label || field}{config.required ? ' *' : ''}
            </label>
            
            {config.type === 'select' ? (
              <select
                value={preChatData[field] || ''}
                onChange={(e) => handleFormInputChange(field, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required={config.required}
              >
                <option value="">Select an option</option>
                {config.options && config.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={config.type || 'text'}
                value={preChatData[field] || ''}
                onChange={(e) => handleFormInputChange(field, e.target.value)}
                placeholder={config.placeholder || ''}
                className="w-full p-2 border border-gray-300 rounded-md"
                required={config.required}
              />
            )}
          </div>
        ))}
        
        <button
          onClick={handleSubmitPreChatForm}
          className="mt-2 px-4 py-2 text-white rounded-md"
          style={{ backgroundColor: primaryColor }}
        >
          Start Chat
        </button>
      </div>
    );
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end z-50">
      {isOpen && (
        <div 
          className="mb-4 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" 
          style={{ 
            width: '350px', 
            height: isMinimized ? '64px' : '500px',
            transition: 'height 0.3s ease'
          }}
        >
          <div 
            className="flex justify-between items-center p-4" 
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center">
              <img 
                src={logoUrl} 
                alt="Bot Logo" 
                className="w-8 h-8 rounded-full mr-2"
              />
              <h3 className="text-white font-medium">{botName}</h3>
            </div>
            <div className="flex space-x-2">
              {agentEscalationEnabled && !isEscalated && (
                <button 
                  onClick={handleEscalateToAgent}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
                  title="Escalate to agent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </button>
              )}
              <button 
                onClick={toggleMinimize}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </button>
              <button 
                onClick={toggleChat}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {showPreChatForm ? (
                renderPreChatForm()
              ) : (
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-black rounded-br-none'
                            : 'bg-white border border-gray-200 rounded-bl-none'
                        }`}
                        style={{
                          backgroundColor: message.sender === 'user' ? primaryColor : 'white'
                        }}
                      >
                        <p className="text-sm text-black">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white' : 'text-black'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-200 p-3 rounded-lg rounded-bl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <p className="text-xs mt-1 text-gray-500">{loaderText}</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {quickPrompts.length > 0 && messages.length <= 2 && !showPreChatForm && (
                <div className="p-2 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="text-xs py-1 px-3 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors"
                      >
                        {prompt.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!showPreChatForm && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      style={{ 
                        boxShadow: 'none',

                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="ml-2 rounded-full p-2 focus:outline-none transition-colors"
                      style={{ backgroundColor: primaryColor }}
                      disabled={inputValue.trim() === ''}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <button
        onClick={toggleChat}
        className="rounded-full shadow-lg flex justify-center items-center focus:outline-none transition-all duration-300 hover:shadow-xl"
        style={{ 
          backgroundColor: primaryColor,
          width: '60px',
          height: '60px',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
};