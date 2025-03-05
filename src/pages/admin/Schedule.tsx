import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaCalendarPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Session {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    eventName: string;
    description: string;
    venue: string;
    type: 'workshop' | 'coding' | 'presentation' | 'networking';
}

export function Schedule() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isAddingSession, setIsAddingSession] = useState(false);
    const [editingSession, setEditingSession] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<Session, 'id'>>({
        date: '',
        startTime: '',
        endTime: '',
        eventName: '',
        description: '',
        venue: 'Main Hall',
        type: 'workshop'
    });

    useEffect(() => {
        const q = query(collection(db, 'sessions'), orderBy('date', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const sessionData: Session[] = [];
            querySnapshot.forEach((doc) => {
                sessionData.push({ id: doc.id, ...doc.data() } as Session);
            });
            setSessions(sessionData);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSession) {
                await updateDoc(doc(db, 'sessions', editingSession), formData);
                toast.success('Session updated successfully!');
                setEditingSession(null);
            } else {
                await addDoc(collection(db, 'sessions'), formData);
                toast.success('Session added successfully!');
                setIsAddingSession(false);
            }
            setFormData({
                date: '',
                startTime: '',
                endTime: '',
                eventName: '',
                description: '',
                venue: 'Main Hall',
                type: 'workshop'
            });
        } catch (error) {
            toast.error('Failed to save session');
            console.error('Error saving session:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await deleteDoc(doc(db, 'sessions', id));
                toast.success('Session deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete session');
                console.error('Error deleting session:', error);
            }
        }
    };

    const handleEdit = (session: Session) => {
        setEditingSession(session.id);
        setFormData({
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            eventName: session.eventName,
            description: session.description,
            venue: session.venue,
            type: session.type
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Content */}
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-xl xs:text-2xl font-bold text-gray-800">Schedule</h1>
                        <p className="text-xs xs:text-sm text-gray-600">Manage tutorial sessions</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAddingSession(true);
                            setEditingSession(null);
                            setFormData({
                                date: '',
                                startTime: '',
                                endTime: '',
                                eventName: '',
                                description: '',
                                venue: 'Main Hall',
                                type: 'workshop'
                            });
                        }}
                        className="w-full xs:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                    >
                        <FaCalendarPlus className="text-sm" />
                        <span>Add Session</span>
                    </button>
                </div>

                {/* Add/Edit Session Form */}
                {(isAddingSession || editingSession) && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingSession ? 'Edit Session' : 'Add New Session'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                <input
                                    type="text"
                                    value={formData.eventName}
                                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                                    placeholder="e.g., Opening Ceremony"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                    required
                                >
                                    <option value="workshop">Workshop</option>
                                    <option value="coding">Coding Session</option>
                                    <option value="presentation">Presentation</option>
                                    <option value="networking">Networking</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter description"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <FaSave />
                                    <span>{editingSession ? 'Update Session' : 'Save Session'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingSession(false);
                                        setEditingSession(null);
                                        setFormData({
                                            date: '',
                                            startTime: '',
                                            endTime: '',
                                            eventName: '',
                                            description: '',
                                            venue: 'Main Hall',
                                            type: 'workshop'
                                        });
                                    }}
                                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <FaTimes />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Sessions List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{session.date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {session.startTime} - {session.endTime}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{session.eventName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{session.type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{session.description}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{session.venue}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(session)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(session.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
} 