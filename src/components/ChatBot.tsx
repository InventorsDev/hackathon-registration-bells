import { useState, useEffect, useRef } from 'react';
import { FaComment, FaTimes, FaPaperPlane, FaTrash, FaEllipsisV } from 'react-icons/fa';

interface ChatBotProps {
    onSendMessage: (message: string) => void;
}

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function ChatBot({ onSendMessage }: ChatBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Initial greeting
            addBotMessage("👋 Hi there! I'm your tutorial registration assistant. How can I help you today?");
        }
        scrollToBottom();
    }, [isOpen, messages]);

    const addBotMessage = (text: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender: 'bot',
            timestamp: new Date()
        }]);
    };

    const getBotResponse = (userMessage: string) => {
        const lowerMessage = userMessage.toLowerCase();

        // Hackathon-related responses
        if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('join')) {
            return "To register for the NACOS Hackathon, please fill out the registration form with your details, specify if you're joining as a team or individual, and provide your project idea. Make sure to provide accurate information!";
        }

        // Team-related responses
        if (lowerMessage.includes('team') || lowerMessage.includes('group')) {
            return "You can participate in the hackathon as an individual or as part of a team. Teams can have up to 4 members. Each team member should register individually and mention the same team name.";
        }

        // Project-related responses
        if (lowerMessage.includes('project') || lowerMessage.includes('idea') || lowerMessage.includes('solution')) {
            return "Your project should address one of our hackathon themes: Education Technology, FinTech, HealthTech, or Sustainability. You'll have 48 hours to build a working prototype.";
        }

        // Schedule-related responses
        if (lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
            return "The hackathon will take place from November 10-12, 2025. Check-in starts at 9 AM on Friday, and the event concludes with presentations and awards on Sunday afternoon.";
        }

        // Prize-related responses
        if (lowerMessage.includes('prize') || lowerMessage.includes('win') || lowerMessage.includes('award')) {
            return "The winning team will receive ₦500,000, mentorship opportunities, and internship placements. Runner-up teams will also receive cash prizes and various sponsor gifts.";
        }

        // Venue-related responses
        if (lowerMessage.includes('venue') || lowerMessage.includes('location') || lowerMessage.includes('where')) {
            return "The hackathon will be held at the ICT Complex, Bells university of Technology. Accommodation will be provided for participants from outside Lagos.";
        }

        // Requirements-related responses
        if (lowerMessage.includes('bring') || lowerMessage.includes('need') || lowerMessage.includes('require')) {
            return "Please bring your laptop, charger, and student ID. We'll provide meals, snacks, and a workspace. Don't forget to bring any specific hardware if your project requires it!";
        }

        // Contact-related responses
        if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('admin')) {
            return "You can send messages to the admin through this chat. For urgent inquiries, please contact the organizing committee at nacos.hackathon@example.com or call 080-NACOS-HACK.";
        }

        // Default response
        return "I'm here to help with information about the NACOS Hackathon. Could you please be more specific about what you'd like to know?";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message
        const userMessage = message.trim();
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: userMessage,
            sender: 'user',
            timestamp: new Date()
        }]);
        setMessage('');

        // Simulate bot typing
        setIsTyping(true);

        // Send to admin if it's not a common query
        onSendMessage(userMessage);

        // Get bot response after a delay
        setTimeout(() => {
            const botResponse = getBotResponse(userMessage);
            addBotMessage(botResponse);
            setIsTyping(false);
        }, 1000);
    };

    // Add delete message function
    const deleteMessage = (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        setSelectedMessage(null);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'hidden' : 'flex'
                    } items-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors`}
            >
                <FaComment />
                <span className="text-sm">Need Help?</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-[320px] sm:w-[380px]">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-purple-600 text-white p-4 rounded-t-2xl">
                        <div>
                            <h3 className="font-semibold">Tutorial Assistant</h3>
                            <p className="text-xs text-purple-100">Ask me anything!</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-purple-100 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Updated Chat Content */}
                    <div className="p-4 bg-gray-50 h-[300px] overflow-y-auto">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`group mb-3 ${msg.sender === 'user' ? 'text-right' : ''}`}
                            >
                                <div className="relative inline-block">
                                    <div
                                        className={`p-3 rounded-lg text-sm ${msg.sender === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white text-gray-800 shadow-sm'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Message Actions */}
                                    <button
                                        onClick={() => setSelectedMessage(selectedMessage === msg.id ? null : msg.id)}
                                        className={`absolute top-1 ${msg.sender === 'user' ? 'left-0' : 'right-0'} 
                                            -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity p-1
                                            hover:bg-gray-100 rounded-full`}
                                    >
                                        <FaEllipsisV className="text-xs text-gray-500" />
                                    </button>

                                    {/* Delete Popup */}
                                    {selectedMessage === msg.id && (
                                        <div
                                            className={`absolute top-0 ${msg.sender === 'user' ? 'left-0' : 'right-0'} 
                                                -translate-x-16 bg-white shadow-lg rounded-lg py-1`}
                                        >
                                            <button
                                                onClick={() => deleteMessage(msg.id)}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 w-full"
                                            >
                                                <FaTrash className="text-xs" />
                                                <span className="text-sm">Delete</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="text-[10px] text-gray-400 mt-1">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:border-purple-500 focus:ring-purple-500/20"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                <FaPaperPlane className="text-sm" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
} 