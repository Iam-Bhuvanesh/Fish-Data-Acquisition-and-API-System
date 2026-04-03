import React from 'react';
import { Bot, User } from 'lucide-react';
import './Chatbot.css';

const MessageBubble = ({ role, text }) => {
    const isBot = role === 'ai';

    return (
        <div className={`zoro-msg ${isBot ? 'zoro-msg-ai' : 'zoro-msg-user'}`}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ 
                    marginTop: '2px', 
                    color: isBot ? '#0ca5e9' : 'rgba(255,255,255,0.8)',
                    background: isBot ? 'rgba(12, 165, 233, 0.1)' : 'rgba(255,255,255,0.2)',
                    padding: '4px',
                    borderRadius: '8px',
                    display: 'flex'
                }}>
                    {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>
                        {text}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
