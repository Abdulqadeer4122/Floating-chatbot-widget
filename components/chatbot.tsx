'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from 'uuid';


// Define TypeScript Interfaces
interface QuickPrompt {
  title: string;
  query: string;
}

interface PreChatFormField {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  required: boolean;
  placeholder: string;
}

interface PreChatForm {
  id: number;
  isEnabled: boolean;
  fields: PreChatFormField[];
  preChatMessage: string;
  chatbotId: number;
}

interface ChatbotConfig {
  id: string;
  title: string;
  welcomeHeading: string;
  welcomeTagline: string;
  widgetColor: string;
  userId: string;
  preChatForm: PreChatForm;
  quickPrompts: QuickPrompt[];
  loaderText?: string;
  logoUrl?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function FloatingChatbot() {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
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
  const params = useParams();
  const token = params.token as string;

  const [isBrowser, setIsBrowser] = useState(false);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
  }, []);

  // Audio recording logic
  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl: string) => {
      if (isBrowser) {
        setMediaBlobUrl(blobUrl); // Store the blob URL for transcription
      }
    },
  });

  useEffect(() => {
    if (mediaBlobUrl && isBrowser) {
      const sendAudioForTranscription = async () => {
        try {
          // Convert blob URL to file
          const response = await fetch(mediaBlobUrl);
          const blob = await response.blob();
          const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

          // Send file to backend API
          const formData = new FormData();
          formData.append('audio', file);

          const transcriptionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-widget/transcribe`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!transcriptionResponse.ok) {
            throw new Error('Failed to transcribe audio');
          }

          const transcriptionData = await transcriptionResponse.json();
          const transcribedText = transcriptionData.text;

          // Add transcribed text to messages
          const newUserMessage: Message = {
            id: uuidv4(),
            text: transcribedText,
            sender: 'user',
            timestamp: new Date(),
          };

          setMessages((prevMessages) => [...prevMessages, newUserMessage]);
          sendMessageToAPI(transcribedText);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: uuidv4(),
              text: 'Sorry, there was an error transcribing your audio.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        } finally {
          clearBlobUrl(); // Clear the recorded audio URL
          setMediaBlobUrl(null); // Reset the blob URL
        }
      };

      sendAudioForTranscription();
    }
  }, [mediaBlobUrl, isBrowser]);

  // Fetch Chatbot Configuration
  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-widget/token-validity?token=${encodeURIComponent(token)}`
        );
        if (!res.ok) {
          throw new Error('Failed to fetch chatbot config');
        }
        const data = await res.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching chatbot config:', error);
       
      } 
    };

    fetchConfig();
  }, [token]);

 

  // Initialize Chatbot on Open
  useEffect(() => {
    if (isOpen && messages.length === 0 && config) {
      setMessages([
        {  id: uuidv4(), text: config.welcomeTagline, sender: 'bot', timestamp: new Date() },
      ]);
      console.log("prechatform",config)
      if (config?.preChatForm?.isEnabled && !formSubmitted) {
        setShowPreChatForm(true);
      }
    }
  }, [isOpen, config, messages.length, formSubmitted]);

  // Scroll to Bottom on New Message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const deleteSessionToken = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-widget/deleteSessionToken`, {
          method: 'POST',
          credentials: 'include', // Include cookies in the request
        });
    
        if (!response.ok) {
          throw new Error('Failed to delete session token');
        }
    
        const data = await response.json();
        console.log(data.message); // "Session token deleted successfully"
      } catch (error) {
        console.error('Error deleting session token:', error);
      }
    };

    const handleBeforeUnload = () => {
      console.log('Tab is closing or page is reloading...');
      deleteSessionToken();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);


    return () => {
      console.log('Component unmounting (page reload)...');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      deleteSessionToken();
    };
  }, []);
  useEffect(() => {
    const deleteSessionToken = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-widget/deleteSessionToken`, {
          method: 'POST',
          credentials: 'include', // Include cookies in the request
        });
    
        if (!response.ok) {
          throw new Error('Failed to delete session token');
        }
    
        const data = await response.json();
        console.log(data.message); // "Session token deleted successfully"
      } catch (error) {
        console.error('Error deleting session token:', error);
      }
    };
  
    // Delete the cookie when the component unmounts (page reload)
    return () => {
      deleteSessionToken();
    };
  }, []);
  useEffect(() => {
    const deleteSessionToken = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot-widget/deleteSessionToken`, {
          method: 'POST',
          credentials: 'include', // Include cookies in the request
        });
    
        if (!response.ok) {
          throw new Error('Failed to delete session token');
        }
    
        const data = await response.json();
        console.log(data.message); // "Session token deleted successfully"
      } catch (error) {
        console.error('Error deleting session token:', error);
      }
    };
    const sessionTimeout = setTimeout(() => {
      setMessages([]);
      deleteSessionToken();
    }, 30 * 60 * 1000);

    return () => clearTimeout(sessionTimeout);
  }, []);

  // Send Message to API
  const sendMessageToAPI = async (message: string) => {
    try {
      setIsTyping(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          chatbotId: config?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          text: data.answer || 'Sorry, there was an issue processing your request.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          text: 'Sorry, there was an error connecting to the service. Please try again later.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Escalation to Agent
  const handleEscalateToAgent = async () => {
    try {
      setIsTyping(true);
      setIsEscalated(true);

      const response = await fetch('http://localhost:3000/api/chatbot/escalate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbotId: config?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to escalate to agent');
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          text: data.message || 'Your request has been escalated to a human agent.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error escalating to agent:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          text: 'Sorry, there was an error escalating your request. Please try again later.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: uuidv4(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    sendMessageToAPI(inputValue);
  };

  // Handle Quick Prompt
  const handleQuickPrompt = (prompt: QuickPrompt) => {
    const newUserMessage: Message = {
      id: uuidv4(),
      text: prompt.query,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    sendMessageToAPI(prompt.query);
  };
  const validatePreChatForm = (fields : PreChatFormField []) => {
    for (const field of fields) {
      if (field.required && !preChatData[field.id]) {
        return false; 
      }
    }
    return true; 
  };
  
  
  const handleSubmitPreChatForm = () => {
    if(config?.preChatForm.isEnabled)
      if (!validatePreChatForm(config?.preChatForm.fields)) {
        alert("Please fill out all required fields before proceeding.");
        return; // Stop the function if validation fails
      }
      setShowPreChatForm(false);
      setFormSubmitted(true);
    
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          text: 'Thank you for providing your information!',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
  };

  // Render Pre-Chat Form
  const renderPreChatForm = () => {
    if (!config || !showPreChatForm) return null;

    return (
      <div className="p-4 bg-white flex flex-col">
        <h3 className="text-lg font-medium text-black mb-3">{config.preChatForm.preChatMessage}</h3>
        {config.preChatForm.fields.map((field) => (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              {field.name}
              {field.required && ' *'}
            </label>
            <input
              type={field.type}
              value={preChatData[field.id] || ''}
              onChange={(e) => setPreChatData({ ...preChatData, [field.id]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full p-2 border border-gray-300 rounded-md"
              required={field.required}
            />
          </div>
        ))}
        <button
          onClick={handleSubmitPreChatForm}
          className="mt-2 px-4 py-2 text-white rounded-md"
          style={{ backgroundColor: config.widgetColor }}
        >
          Start Chat
        </button>
      </div>
    );
  };

  // Render Chatbot Widget
  if (!config) return null;

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end z-50">
      {isOpen && (
        <div
          className="mb-4 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
          style={{
            width: '400px',
            height: isMinimized ? '64px' : '600px',
            transition: 'height 0.3s ease',
          }}
        >
          <div
            className="flex justify-between items-center p-4"
            style={{ backgroundColor: config.widgetColor }}
          >
            <div className="flex items-center">
              <img
                src={config.logoUrl ? encodeURI(config.logoUrl):'/images/placeholder.png'}
                alt="Bot Logo"
                className="w-8 h-8 rounded-full mr-2"
              />
              <h3 className="text-white font-medium">{config.title}</h3>
            </div>
            <div className="flex space-x-2">
              {!isEscalated && (
                <button
                  onClick={handleEscalateToAgent}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
                  title="Talk to Agent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
                title={isMinimized ? 'Expand' : 'Minimize'}
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
                onClick={() => setIsOpen(false)}
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
                          backgroundColor: message.sender === 'user' ? config.widgetColor : 'white',
                        }}
                      >
                         <div className="react-markdown-generated-tags">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white' : 'text-black'}`}>
                          {message.timestamp.toLocaleTimeString()}
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
                        <p className="text-xs mt-1 text-gray-500">{config.loaderText || 'Thinking...'}</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {config.quickPrompts.length > 0 && messages.length <= 2 && !showPreChatForm && (
                <div className="p-2 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {config.quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="text-xs py-1 px-3 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-700 transition-colors"
                      >
                        {prompt.query}
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
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    <button
                      onClick={status === 'recording' ? stopRecording : startRecording}
                      className="ml-2 rounded-full p-2 focus:outline-none transition-colors"
                      style={{ backgroundColor: config.widgetColor }}
                    >
                      {status === 'recording' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <rect x="6" y="6" width="12" height="12"></rect>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="ml-2 rounded-full p-2 focus:outline-none transition-colors"
                      style={{ backgroundColor: config.widgetColor }}
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
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-lg flex justify-center items-center focus:outline-none transition-all duration-300 hover:shadow-xl"
        style={{
          backgroundColor: config.widgetColor,
          width: '60px',
          height: '60px',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
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
}