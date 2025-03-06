import { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FaTimes, FaLock, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LoginPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Logged in successfully!');
            onClose();
            navigate('/admin/analytics');
        } catch (error) {
            toast.error('Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black/80 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <FaLock className="text-2xl text-green-500" />
                        <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                        disabled={isLoading}
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-green-500 focus:ring-0"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-green-500 focus:ring-0"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-600 transition-colors duration-300 font-semibold flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
} 