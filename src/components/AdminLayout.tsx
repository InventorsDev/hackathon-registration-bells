import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaUsers, FaCalendarAlt, FaCog, FaBars, FaTimes, FaEnvelope } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface MenuItem {
    name: string;
    icon: React.ReactNode;
    path: string;
}

const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <FaChartBar />, path: '/admin' },
    { name: 'Participants', icon: <FaUsers />, path: '/admin/participants' },
    { name: 'Schedule', icon: <FaCalendarAlt />, path: '/admin/schedule' },
    { name: 'Messages', icon: <FaEnvelope />, path: '/admin/messages' },
    { name: 'Settings', icon: <FaCog />, path: '/admin/settings' },
];

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const q = query(collection(db, 'messages'), where('read', '==', false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setUnreadCount(snapshot.size);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile Menu Button - Moved to top-right */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Mobile & Desktop */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
                transform transition-transform duration-200 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
            `}>
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="/logo.png" alt="logo" className="w-8 h-8" />
                        <h1 className="font-bold text-gray-800">NACOS Hackathon Admin</h1>
                    </div>
                    <nav className="space-y-1 flex-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                    ? 'bg-purple-50 text-purple-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span>{item.name}</span>
                                </div>
                                {item.name === 'Messages' && unreadCount > 0 && (
                                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-1 h-screen overflow-y-auto bg-gray-50/50 pt-16 lg:pt-0">
                {children}
            </div>
        </div>
    );
} 