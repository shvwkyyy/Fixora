import React, { useState, useEffect } from 'react';
import styles from './Messages.module.css';
import { useLocation } from 'react-router-dom';
import { messageAPI } from '../../utils/api';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState(null); // Represents the other user's ID
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const location = useLocation();

  // Get current user ID
  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.id || user?._id;
    } catch {
      return null;
    }
  };

  // Parse query string
  function getQueryParam(param) {
    const params = new URLSearchParams(location.search);
    return params.get(param);
  }

  // Load conversations from backend
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const response = await messageAPI.getConversations();
        if (response.success && response.conversations) {
          setConversations(response.conversations);
        }
      } catch (err) {
        console.error('Load conversations error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Handle userId/workerId from URL
  useEffect(() => {
    const userId = getQueryParam('userId');
    const workerId = getQueryParam('workerId');
    const userName = getQueryParam('userName');
    const workerName = getQueryParam('workerName');
    
    const targetUserId = userId || workerId;
    const targetUserName = userName || workerName;

    if (targetUserId) {
      // Check if conversation exists
      const existingConv = conversations.find(
        c => c.otherUser?.id === targetUserId || c.otherUser?._id === targetUserId
      );
      
      if (existingConv) {
        setActiveChat(existingConv.otherUser?.id || existingConv.otherUser?._id);
        setActiveChatUser(existingConv.otherUser);
      } else if (targetUserName) {
        // Create new conversation entry (will be saved when first message is sent)
        setActiveChat(targetUserId);
        setActiveChatUser({
          id: targetUserId,
          firstName: targetUserName.split(' ')[0],
          lastName: targetUserName.split(' ').slice(1).join(' ') || '',
        });
      }
    }
  }, [location.search, conversations]);

  // Load messages for active chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) {
        setMessages([]);
        return;
      }

      try {
        const response = await messageAPI.getMessages(activeChat);
        if (response.success && response.messages) {
          const currentUserId = getCurrentUserId();
          const formattedMessages = response.messages.map(msg => ({
            id: msg._id,
            text: msg.contentText || '',
            image: msg.contentImage,
            sender: msg.senderId?._id === currentUserId || msg.senderId?.id === currentUserId ? 'me' : 'other',
            senderName: msg.senderId?.firstName + ' ' + msg.senderId?.lastName,
            createdAt: msg.createdAt,
          }));
          setMessages(formattedMessages);
          
          // Update active chat user info if not set
          if (!activeChatUser && formattedMessages.length > 0) {
            const otherUser = formattedMessages.find(m => m.sender !== 'me');
            if (otherUser) {
              const conv = conversations.find(c => 
                c.otherUser?.id === activeChat || c.otherUser?._id === activeChat
              );
              if (conv) setActiveChatUser(conv.otherUser);
            }
          }
        }
      } catch (err) {
        console.error('Load messages error:', err);
        setMessages([]);
      }
    };

    loadMessages();
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat || sending) return;

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    setSending(true);
    const messageText = input.trim();
    setInput('');

    // Optimistically add message
    const tempMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'me',
      senderName: 'أنا',
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Send to backend
      const response = await messageAPI.sendMessage(activeChat, messageText);
      
      if (response.success && response.message) {
        // Replace temp message with real one
        setMessages((prev) => {
          const filtered = prev.filter(m => m.id !== tempMessage.id);
          return [...filtered, {
            id: response.message._id,
            text: response.message.contentText,
            sender: 'me',
            senderName: 'أنا',
            createdAt: response.message.createdAt,
          }];
        });

        // Refresh conversations to update last message
        const convResponse = await messageAPI.getConversations();
        if (convResponse.success && convResponse.conversations) {
          setConversations(convResponse.conversations);
        }
      } else {
        // Remove temp message on error
        setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
        alert('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessages((prev) => prev.filter(m => m.id !== tempMessage.id));
      alert('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    const otherUserId = conversation.otherUser?.id || conversation.otherUser?._id;
    setActiveChat(otherUserId);
    setActiveChatUser(conversation.otherUser);
  };

  const getParticipantName = (conv) => {
    if (conv.otherUser) {
      return `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim() || conv.otherUser.email || 'مستخدم';
    }
    return 'مستخدم';
  };

  const getLastMessageText = (conv) => {
    if (conv.lastMessage?.contentText) {
      return conv.lastMessage.contentText;
    }
    if (conv.lastMessage?.contentImage) {
      return 'صورة';
    }
    return 'لا توجد رسائل';
  };

  if (loading) {
    return (
      <div className={styles['messages-container']}>
        <div className={styles['conversations-list']}>
          <h2>محادثاتي</h2>
          <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>جاري التحميل...</p>
        </div>
        <div className={styles['chat-window']}>
          <div className={styles['no-chat-selected']}>جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['messages-container']}>
      <div className={styles['conversations-list']}>
        <h2>محادثاتي</h2>
        {conversations.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            لا توجد محادثات بعد
          </p>
        ) : (
          conversations.map((conv) => {
            const otherUserId = conv.otherUser?.id || conv.otherUser?._id;
            const isActive = activeChat === otherUserId;
            return (
              <div
                key={conv.conversationId || otherUserId}
                className={`${styles['conversation-item']} ${isActive ? styles.active : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <h3>{getParticipantName(conv)}</h3>
                <p>{getLastMessageText(conv)}</p>
                {conv.unreadCount > 0 && (
                  <span className={styles['unread-badge']}>{conv.unreadCount}</span>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className={styles['chat-window']}>
        {activeChat ? (
          <>
            <div className={styles['chat-header']}>
              <h3>
                {activeChatUser 
                  ? `${activeChatUser.firstName || ''} ${activeChatUser.lastName || ''}`.trim() || activeChatUser.email || 'مستخدم'
                  : 'مستخدم'}
              </h3>
            </div>
            <div className={styles['chat-messages']}>
              {messages.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  لا توجد رسائل بعد. ابدأ المحادثة الآن!
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles['message-bubble']} ${msg.sender === 'me' ? styles.me : styles.other}`}
                  >
                    {msg.image ? (
                      <img src={msg.image} alt="Message" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                    ) : (
                      <p>{msg.text}</p>
                    )}
                    {msg.createdAt && (
                      <span className={styles['message-time']}>
                        {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
            <form className={styles['chat-input-form']} onSubmit={handleSendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك..."
                disabled={sending}
              />
              <button type="submit" disabled={sending || !input.trim()}>
                {sending ? 'جاري الإرسال...' : 'إرسال'}
              </button>
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
