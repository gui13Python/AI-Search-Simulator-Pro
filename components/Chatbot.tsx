
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToChat } from '../services/geminiService';
import type { ChatMessage, Language } from '../types';
import Icon from './Icon';
import ReactMarkdown from 'react-markdown';

const GREETINGS: Record<Language, string> = {
    pt: 'Olá! Sou seu assistente de SEO. Como posso ajudar a otimizar sua estratégia de busca hoje?',
    en: 'Hello! I am your SEO assistant. How can I help you optimize your search strategy today?',
    es: '¡Hola! Soy tu asistente de SEO. ¿Cómo puedo ayudarte a optimizar tu estrategia de búsqueda hoy?'
};

const LANGUAGE_OPTIONS: { id: Language, label: string }[] = [
    { id: 'pt', label: 'Português' },
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Español' },
];

interface ChatbotProps {
    t: (key: string) => string;
}

const Chatbot: React.FC<ChatbotProps> = ({ t }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: GREETINGS.pt }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setMessages([{ role: 'model', content: GREETINGS[language] }]);
    setInput('');
  }, [language]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMessage];
      const modelResponse = await sendMessageToChat(input, history, language);
      setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro.';
      setMessages(prev => [...prev, { role: 'model', content: `Desculpe, algo deu errado: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-center">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {LANGUAGE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setLanguage(opt.id)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                  language === opt.id 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'
                }`}>
                 <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 rounded-bl-none">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce ml-1" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('chatbot.placeholder')}
            disabled={loading}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800">
            {t('chatbot.sendButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;