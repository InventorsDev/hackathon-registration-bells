import { useState } from 'react';
import { Student } from '../types';
import { FaUser, FaEnvelope, FaBook, FaUserPlus } from 'react-icons/fa';

export function StudentRegistration({ onSubmit }: { onSubmit: (student: Omit<Student, 'id'>) => void }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        course: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            enrollmentDate: new Date().toISOString(),
        });
        setFormData({ firstName: '', lastName: '', email: '', course: '' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="border-l-4 border-red-600 pl-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900">New Registration</h2>
                    <p className="text-gray-600 mt-1">Enter student information below</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FaUser className="inline mr-2" />
                            First Name
                        </label>
                        <input
                            type="text"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-0 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FaUser className="inline mr-2" />
                            Last Name
                        </label>
                        <input
                            type="text"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-0 transition-colors"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FaEnvelope className="inline mr-2" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-0 transition-colors"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FaBook className="inline mr-2" />
                            Course
                        </label>
                        <input
                            type="text"
                            placeholder="Computer Science"
                            value={formData.course}
                            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-0 transition-colors"
                            required
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-red-600 transition-colors duration-300 font-bold text-lg flex items-center justify-center"
                    >
                        <FaUserPlus className="mr-2" />
                        Complete Registration
                    </button>
                </div>
            </form>
        </div>
    );
} 