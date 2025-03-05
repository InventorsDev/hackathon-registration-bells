import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaEnvelope, FaCheck, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Message {
    id: string;
    studentName: string;
    studentEmail: string;
    message: string;
    timestamp: any;
    read: boolean;
    registrationId: string;
}

export function Messages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messageData: Message[] = [];
            querySnapshot.forEach((doc) => {
                messageData.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(messageData);
        });

        return () => unsubscribe();
    }, []);

    const markAsRead = async (messageId: string) => {
        try {
            await updateDoc(doc(db, 'messages', messageId), {
                read: true
            });
            toast.success('Message marked as read');
        } catch (error) {
            toast.error('Failed to update message status');
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            await deleteDoc(doc(db, 'messages', messageId));
            setMessageToDelete(null);
            setSelectedMessage(null);
            toast.success('Message deleted successfully');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl xs:text-2xl font-bold text-gray-800">Messages</h1>
                    <p className="text-xs xs:text-sm text-gray-600">Student inquiries and messages</p>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-lg">
                    <span className="text-sm text-purple-600 font-medium">
                        {messages.filter(m => !m.read).length} Unread Messages
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                onClick={() => setSelectedMessage(message)}
                                className={`group p-4 cursor-pointer hover:bg-gray-50 transition-colors relative
                                    ${!message.read ? 'bg-purple-50' : ''} 
                                    ${selectedMessage?.id === message.id ? 'border-l-4 border-purple-500' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm text-gray-900">{message.studentName}</span>
                                    <div className="flex items-center gap-2">
                                        {!message.read && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                New
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMessageToDelete(messageToDelete === message.id ? null : message.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                                        >
                                            <FaEllipsisV className="text-xs text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{message.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {message.timestamp?.toDate().toLocaleDateString()}
                                </p>

                                {/* Delete Popup */}
                                {messageToDelete === message.id && (
                                    <div
                                        className="absolute top-12 right-4 bg-white shadow-lg rounded-lg py-1 z-10"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => deleteMessage(message.id)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full"
                                        >
                                            <FaTrash className="text-xs" />
                                            <span className="text-sm whitespace-nowrap">Delete Message</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2">
                    {selectedMessage ? (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">{selectedMessage.studentName}</h2>
                                    <p className="text-sm text-gray-600">{selectedMessage.studentEmail}</p>
                                    <p className="text-xs text-gray-500">Registration ID: {selectedMessage.registrationId}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!selectedMessage.read && (
                                        <button
                                            onClick={() => markAsRead(selectedMessage.id)}
                                            className="flex items-center gap-2 bg-purple-100 text-purple-600 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                                        >
                                            <FaCheck className="text-xs" />
                                            <span>Mark as Read</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteMessage(selectedMessage.id)}
                                        className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-200 transition-colors"
                                    >
                                        <FaTrash className="text-xs" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>
                            <div className="mt-6 text-sm text-gray-500">
                                Sent on {selectedMessage.timestamp?.toDate().toLocaleString()}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                            <FaEnvelope className="text-4xl text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Select a message to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 