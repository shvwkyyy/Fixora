import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import styles from './Chatbot.module.css';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  const handleSendMessage = async (e) => {
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
        if (chunk.text) {
          fullResponse += chunk.text;
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
    <>
      {/* Floating Button */}
      <button
        className={`${styles['chat-toggle-button']} ${isOpen ? styles['hidden'] : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="فتح الشات"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28px" height="28px">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
      </button>

      {/* Chat Popup */}
      <div className={`${styles['chat-wrapper']} ${isOpen ? styles['open'] : ''}`}>
        <div className={styles['chat-container']}>
          <header className={styles['chat-header']}>
            <div className={styles['chat-header-content']}>
              <h1>فيكسورا</h1>
              <p>صنايعي الخبرة لكل مشاكل البيت</p>
            </div>
            <button
              className={styles['close-button']}
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق الشات"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </header>
          <main className={styles['chat-messages']}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles['message-bubble']} ${styles[msg.type]}`}>
                {msg.type === 'loading' ? (
                  <span className={styles['loading-dots']}>...</span>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </main>
          <form className={styles['chat-input-form']} onSubmit={handleSendMessage}>
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
      </div>
    </>
  );
}

export default Chatbot;

