import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

interface Message {
  type: 'user' | 'fixora' | 'loading';
  text: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('يا باشا، مفتاح الـ API مش موجود! لازم تحطه عشان فيكسورا يشتغل.');
      setMessages([{ type: 'fixora', text: 'يا باشا، فيه مشكلة في مفتاح الـ API. مش قادر أشتغل دلوقتي.' }]);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction:
            'أنت فيكسورا، صنايعي محترف وذو خبرة في صيانة الكهرباء والسباكة والتكييفات والنجارة والصيانة المنزلية العامة. تتحدث بلهجة مصرية واضحة وبسيطة. مهمتك هي تقديم نصائح عملية وحلول سهلة للمستخدمين. إذا كانت المشكلة تتطلب فنيًا متخصصًا أو بها خطورة، يجب أن تحذر المستخدم وتوصيه بالاستعانة بفني. ردودك يجب أن تكون قصيرة ومفيدة وخطواتها واضحة.',
        },
      });
      setMessages([{ type: 'fixora', text: 'أهلاً بيك يا معلم! أنا فيكسورا، قول لي إيه المشكلة اللي عندك؟' }]);
    } catch (error) {
      console.error('يا باشا، فيه مشكلة في بدء الشات مع فيكسورا:', error);
      setMessages([{ type: 'fixora', text: 'يا صنايعي، فيه عطل في الورشة! مش قادر أبدأ الشات دلوقتي. جرب تاني كمان شوية.' }]);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    setMessages((prev) => [...prev, { type: 'loading', text: 'فيكسورا بيفكر...' }]);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: userMessage });
      let fullResponse = '';
      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading'));

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullResponse += c.text;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0 && updated[updated.length - 1].type === 'fixora') {
              updated[updated.length - 1].text = fullResponse;
            } else {
              updated.push({ type: 'fixora', text: fullResponse });
            }
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('يا باشا، فيكسورا تعطل وهو بيرد:', error);
      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading'));
      setMessages((prev) => [
        ...prev,
        { type: 'fixora', text: 'معلش يا صنايعي، حصل عطل وأنا برد عليك. ممكن تعيد كلامك تاني؟' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>فيكسورا</h1>
        <p>صنايعي الخبرة لكل مشاكل البيت</p>
      </header>
      <main className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.type}`}>
            {msg.type === 'loading' ? <span className="loading-dots">...</span> : <p>{msg.text}</p>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك..."
          disabled={isLoading}
          aria-label="اكتب رسالة جديدة"
        />
        <button type="submit" disabled={isLoading} aria-label="إرسال الرسالة">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
