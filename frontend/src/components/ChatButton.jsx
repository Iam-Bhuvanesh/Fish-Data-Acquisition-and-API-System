import React from 'react';
import { MessageCircle } from 'lucide-react';
import './Chatbot.css';

const ChatButton = ({ onClick }) => {
    return (
        <button className="zoro-bubble" onClick={onClick}>
            <MessageCircle size={32} />
        </button>
    );
};

export default ChatButton;
