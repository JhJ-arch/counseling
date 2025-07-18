
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, CounselorType } from '../types';
import { createChatSession } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { Chat } from '@google/genai';
import { SendHorizonal, Bot, User, LogOut } from 'lucide-react';

interface ChatViewProps {
  studentName: string;
  initialWorry: string;
  counselorType: CounselorType;
  onFinish: (messages: ChatMessage[]) => void;
  isFinishing: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ studentName, initialWorry, counselorType, onFinish, isFinishing }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatAreaRef.current?.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = useCallback(async () => {
    setIsLoading(true);
    const session = createChatSession();
    setChatSession(session);

    setMessages([{ role: 'user', content: initialWorry }]);
    
    try {
      const responseStream = await session.sendMessageStream({ message: initialWorry });
      let streamedResponse = "";
      setMessages(prev => [...prev, { role: 'model', content: '' }]); // Placeholder for model response
      for await (const chunk of responseStream) {
        streamedResponse += chunk.text;
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = { role: 'model', content: streamedResponse };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      setMessages(prev => [...prev, { role: 'model', content: '죄송해요, 지금은 연결이 불안정해요. 잠시 후 다시 시도해주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWorry]);

  useEffect(() => {
    startChat();
  }, [startChat]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatSession) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
        const responseStream = await chatSession.sendMessageStream({ message: userInput });
        let streamedResponse = "";
        setMessages(prev => [...prev, { role: 'model', content: '' }]); // Placeholder
        for await (const chunk of responseStream) {
            streamedResponse += chunk.text;
            setMessages(prev => {
                const updatedMessages = [...prev];
                updatedMessages[updatedMessages.length - 1] = { role: 'model', content: streamedResponse };
                return updatedMessages;
            });
        }
    } catch (error) {
        console.error("Failed to send message:", error);
        setMessages(prev => [...prev.slice(0, -1), { role: 'model', content: '메시지 전송에 실패했어요.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (isFinishing) return;
    onFinish(messages);
  }

  return (
    <div className="w-full max-w-3xl mx-auto h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
      <header className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">톡톡이와 대화하기</h2>
        <button
          onClick={handleFinish}
          disabled={isFinishing}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:bg-blue-300"
        >
          {isFinishing ? <LoadingSpinner className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
          상담 종료하기
        </button>
      </header>

      <div ref={chatAreaRef} className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><Bot className="w-6 h-6 text-slate-600"/></div>}
            <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
             {msg.role === 'user' && <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><User className="w-6 h-6 text-blue-600"/></div>}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 justify-start">
             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><Bot className="w-6 h-6 text-slate-600"/></div>
             <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-slate-100 text-slate-800 rounded-bl-none flex items-center">
                <LoadingSpinner className="w-5 h-5 text-slate-500" />
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
        <div className="relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="w-full px-4 py-3 pr-12 bg-white text-slate-900 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isLoading || isFinishing}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors">
            <SendHorizonal className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatView;
