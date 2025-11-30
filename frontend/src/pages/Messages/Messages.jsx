import React, { useState, useEffect } from 'react';
import styles from './Messages.module.css';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState(null); // Represents the active conversation ID

  const dummyConversations = [
    { id: 'chat1', participant: 'أحمد سباكة', lastMessage: 'تمام، هجيلك بكرة.' },
    { id: 'chat2', participant: 'فاطمة تنظيف', lastMessage: 'أنا خلصت شغل البيت.' },
    { id: 'chat3', participant: 'محمد كهربائي', lastMessage: 'المشكلة اتحلت يا فندم.' },
  ];

  const dummyChatMessages = {
    'chat1': [
      { id: 1, sender: 'me', text: 'مساء الخير، محتاج سباكة.' },
      { id: 2, sender: 'أحمد سباكة', text: 'تمام، إيه المشكلة بالضبط؟' },
      { id: 3, sender: 'me', text: 'فيه تسريب في الحمام.' },
      { id: 4, sender: 'أحمد سباكة', text: 'تمام، هجيلك بكرة الساعة 10 الصبح.' },
    ],
    'chat2': [
      { id: 1, sender: 'me', text: 'صباح الخير، عايز خدمة تنظيف.' },
      { id: 2, sender: 'فاطمة تنظيف', text: 'تحت أمرك، متى يناسبك؟' },
      { id: 3, sender: 'me', text: 'الجمعة الجاية.' },
      { id: 4, sender: 'فاطمة تنظيف', text: 'تمام، أنا خلصت شغل البيت.' },
    ],
  };

  useEffect(() => {
    if (activeChat && dummyChatMessages[activeChat]) {
      setMessages(dummyChatMessages[activeChat]);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && activeChat) {
      const newMessage = { id: messages.length + 1, sender: 'me', text: input.trim() };
      setMessages((prev) => [...prev, newMessage]);
      // Simulate sending message to the other participant
      setTimeout(() => {
        const botResponse = { id: messages.length + 2, sender: dummyConversations.find(c => c.id === activeChat)?.participant || 'Bot', text: 'تم استلام رسالتك.' };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);
      setInput('');
    }
  };

  return (
    <div className={styles['messages-container']}>
      <div className={styles['conversations-list']}>
        <h2>محادثاتي</h2>
        {dummyConversations.map((conv) => (
          <div
            key={conv.id}
            className={`${styles['conversation-item']} ${activeChat === conv.id ? styles.active : ''}`}
            onClick={() => setActiveChat(conv.id)}
          >
            <h3>{conv.participant}</h3>
            <p>{conv.lastMessage}</p>
          </div>
        ))}
      </div>
      <div className={styles['chat-window']}>
        {activeChat ? (
          <>
            <div className={styles['chat-header']}>
              <h3>{dummyConversations.find(c => c.id === activeChat)?.participant}</h3>
            </div>
            <div className={styles['chat-messages']}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles['message-bubble']} ${msg.sender === 'me' ? styles.me : styles.other}`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <form className={styles['chat-input-form']} onSubmit={handleSendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك..."
              />
              <button type="submit">إرسال</button>
            </form>
          </>
        ) : (
          <div className={styles['no-chat-selected']}>اختر محادثة للبدء</div>
        )}
      </div>
    </div>
  );
}

export default Messages;
