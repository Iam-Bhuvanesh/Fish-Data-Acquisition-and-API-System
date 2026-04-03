import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Zap } from 'lucide-react';
import ChatButton from './ChatButton';
import MessageBubble from './MessageBubble';
import './Chatbot.css';

const ZoroChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hello! I'm Zoro, your smart fish farming assistant. How can I help you today? 🐟" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const quickActions = [
        { label: "Growth Analysis", query: "growth" },
        { label: "Water Quality", query: "water quality" },
        { label: "Fish Diseases", query: "disease" },
        { label: "Feed Tips", query: "feed" }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const getResponse = (query) => {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('growth')) {
            return "Fish growth depends on temperature, feed, and water quality. Optimal conditions lead to faster maturation 📊";
        }
        if (lowerQuery.includes('temp') || lowerQuery.includes('water quality')) {
            return "Optimal water temperature is between 25°C and 30°C. Steady parameters are key! 🌡️💧";
        }
        if (lowerQuery.includes('ph')) {
            return "Maintain pH between 6.5 and 8 for healthy fish. High or low pH can be stressful for aquatic life 🧪";
        }
        if (lowerQuery.includes('disease') || lowerQuery.includes('sick')) {
            return "Check oxygen levels and water quality to prevent disease. Look for signs like lethargy or spots 🩺🐟";
        }
        if (lowerQuery.includes('feed') || lowerQuery.includes('food')) {
            return "Feed optimization involves tracking survival rates and water temperature. High protein feed is best for growth stages 🍖";
        }
        
        return "I'm Zoro! Ask me anything about fish farming, water quality, or feed optimization 🐟📊💧";
    };

    const handleSend = (e) => {
        if (e) e.preventDefault();
        const userText = input.trim();
        if (!userText || isTyping) return;

        processMessage(userText);
        setInput('');
    };

    const processMessage = (text) => {
        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsTyping(true);

        // Simulate AI thinking time
        setTimeout(() => {
            const botResponse = getResponse(text);
            setMessages(prev => [...prev, { role: 'ai', text: botResponse }]);
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="zoro-container">
            {isOpen ? (
                <div className="zoro-window">
                    {/* Header */}
                    <div className="zoro-header">
                        <div className="zoro-header-info">
                            <h3><Sparkles size={20} fill="white" /> Zoro 🐟</h3>
                            <p>Your Fish Farming Assistant</p>
                        </div>
                        <button className="zoro-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="zoro-messages">
                        {messages.map((msg, i) => (
                            <MessageBubble key={i} {...msg} />
                        ))}
                        {isTyping && (
                            <div className="zoro-msg zoro-msg-ai">
                                <div className="zoro-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="zoro-quick-actions">
                        {quickActions.map((action, i) => (
                            <button 
                                key={i} 
                                className="quick-btn"
                                onClick={() => processMessage(action.label)}
                                disabled={isTyping}
                            >
                                <Zap size={14} fill="currentColor" />
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form className="zoro-input-container" onSubmit={handleSend}>
                        <div className="zoro-input-wrapper">
                            <input
                                type="text"
                                placeholder="Ask Zoro about your pond..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isTyping}
                            />
                            <button type="submit" className="zoro-send" disabled={isTyping || !input.trim()}>
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <ChatButton onClick={() => setIsOpen(true)} />
            )}
        </div>
    );
};

export default ZoroChatbot;
