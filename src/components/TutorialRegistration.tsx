import { useState } from 'react';
import { FaClock, FaMapMarkerAlt, FaLaptopCode, FaUserGraduate, FaLock, FaWhatsapp } from 'react-icons/fa';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';
import { generateRegistrationId } from '../utils/helpers';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { LoginPopup } from './LoginPopup';
import { RegistrationSuccessPopup } from './RegistrationSuccessPopup';
// import { ChatBot } from './ChatBot';

interface RegistrationFormData {
    fullName: string;
    email: string;
    phoneNumber: string;
    institution: string;
    level: '100' | '200' | '';
    teamName: string;
    teamSize: string;
    projectIdea: string;
    skills: string[];
    dietaryRestrictions: string;
    tshirtSize: string;
    registrationId?: string;
    verified?: boolean;
    areasOfAssistance: {
        courseCode: string;
        topics: string;
    }[];
    message?: string;
}

export function HackathonRegistration() {
    const [formData, setFormData] = useState<RegistrationFormData>({
        fullName: '',
        email: '',
        phoneNumber: '',
        institution: '',
        level: '',
        teamName: '',
        teamSize: '1',
        projectIdea: '',
        skills: [],
        dietaryRestrictions: '',
        tshirtSize: 'M',
        areasOfAssistance: [],
    });
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [currentRegistrationId, setCurrentRegistrationId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [touched, setTouched] = useState({
        institution: false,
        level: false,
        areasOfAssistance: false
    });

    const [courseInput, setCourseInput] = useState({ courseCode: '', topics: '' });

    const getFieldError = (field: keyof typeof touched) => {
        if (touched[field] && !formData[field]) {
            return 'This field is required';
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (formData.areasOfAssistance.length === 0) {
            setTouched(prev => ({ ...prev, areasOfAssistance: true }));
            toast.error('Please add at least one course and its topics');
            return;
        }

        try {
            setIsSubmitting(true);

            const registrationId = generateRegistrationId();
            const registrationData = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                phoneNumber: formData.phoneNumber.trim(),
                institution: formData.institution,
                level: formData.level,
                teamName: formData.teamName,
                teamSize: formData.teamSize,
                projectIdea: formData.projectIdea,
                skills: formData.skills,
                dietaryRestrictions: formData.dietaryRestrictions,
                tshirtSize: formData.tshirtSize,
                registrationId,
                verified: false,
                timestamp: serverTimestamp(),
                status: 'pending',
            };

            await addDoc(collection(db, 'registrations'), registrationData);

            // If there's a message, create a message document
            if (formData.message?.trim()) {
                await addDoc(collection(db, 'messages'), {
                    studentName: formData.fullName.trim(),
                    studentEmail: formData.email.trim().toLowerCase(),
                    message: formData.message.trim(),
                    registrationId,
                    timestamp: serverTimestamp(),
                    read: false
                });
            }

            // Show success popup with registration ID
            setCurrentRegistrationId(registrationId);
            setIsSuccessOpen(true);

            // Reset form including message
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                institution: '',
                level: '',
                teamName: '',
                teamSize: '1',
                projectIdea: '',
                skills: [],
                dietaryRestrictions: '',
                tshirtSize: 'M',
                areasOfAssistance: [],
                message: '' // Clear the message as well
            });
            setCourseInput({ courseCode: '', topics: '' });

            // Reset touched state
            setTouched({
                institution: false,
                level: false,
                areasOfAssistance: false
            });

            toast.success('Registration successful!');

        } catch (error) {
            console.error('Error submitting registration:', error);
            toast.error('Failed to submit registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInstitutionChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            institution: value
        }));
        setTouched(prev => ({ ...prev, institution: true }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-600/2g0 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
                    {/* Left Section - Class Details */}
                    <div className="w-full lg:w-5/12">
                        <div className="sticky top-8 rounded-3xl overflow-hidden bg-white shadow-2xl">
                            <div
                                className="relative h-full"
                                style={{
                                    backgroundImage: "url('/bg.jpg')",
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/500 via-purple-900/70 to-indigo-400/95"></div>

                                {/* Content */}
                                <div className="relative p-6 sm:p-8">
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <div className="inline-block p-3 bg-white backdrop-blur-xl rounded-2xl mb-6">
                                            <img src="/logo.png" alt="logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
                                            NACOS Hackathon 2025
                                        </h1>
                                        <div className="w-20 h-1 bg-purple-300 mx-auto mb-4 rounded-full"></div>
                                        <p className="text-base sm:text-lg text-white/90 font-medium mb-2">Code. Innovate. Transform.</p>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mt-4">
                                            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                                                Join the largest student hackathon for computing students across Nigeria. Build innovative solutions and win amazing prizes!
                                            </p>
                                        </div>
                                    </div>

                                    {/* Why Join Our Classes? */}
                                    {/* <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 mb-6">
                                        <h3 className="text-white font-semibold mb-3">Why Join Our Classes? 🎯</h3>
                                        <ul className="space-y-3 text-white/90 text-sm">
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold text-purple-200">📚</span>
                                                <span><strong>Tech-Focused Learning:</strong> Practical tutorials on programming, algorithms, and core CS/IT concepts</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold text-purple-200">🎯</span>
                                                <span><strong>Exam Excellence:</strong> Strategic preparation for tests, assignments, and examinations</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold text-purple-200">👥</span>
                                                <span><strong>Community Support:</strong> Join a network of like-minded students for collaborative learning</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold text-purple-200">🚀</span>
                                                <span><strong>Success Path:</strong> Structured guidance to improve your academic performance</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="font-bold text-purple-200">💡</span>
                                                <span><strong>Beyond Academics:</strong> Practical insights into tech industry trends and career paths</span>
                                            </li>
                                        </ul>
                                    </div> */}

                                    {/* Info Cards */}
                                    <div className="space-y-4">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                                            <div className="flex flex-col space-y-6">
                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-purple-500/20 p-2 sm:p-3 rounded-xl">
                                                        <FaClock className="text-lg sm:text-xl text-purple-200" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h3 className="font-semibold text-sm sm:text-base text-white">Schedule & Timing</h3>
                                                            <div className="space-y-2 mt-1">
                                                                <div className="bg-green-500/20  rounded-lg p-3">
                                                                    <p className="text-white text-xs sm:text-sm">
                                                                        <span className="font-medium text-purple-100">Days:</span> Weekends (Saturday/Sunday)
                                                                    </p>
                                                                    <p className="text-white text-xs sm:text-sm">
                                                                        <span className="font-medium text-purple-100">Duration:</span> 2 hours per session
                                                                    </p>
                                                                    <p className="text-white text-xs sm:text-sm">
                                                                        <span className="font-medium text-purple-100">Start Date:</span> February 2025
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <p className="text-white/80 text-xs">
                                                                Exact timing will be scheduled based on students' availability through our WhatsApp group.
                                                            </p>
                                                            <div className="flex flex-col xs:flex-row gap-2">
                                                                <a
                                                                    href="https://chat.whatsapp.com/GkTgPG4z5f4BcTd9lY3VcE"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center justify-center gap-1.5 bg-green-500/20 text-white/90 text-xs px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                                                                >
                                                                    <FaWhatsapp className="text-sm" />
                                                                    Join WhatsApp Group
                                                                </a>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-purple-500/20 p-3 rounded-xl">
                                                        <FaLaptopCode className="text-xl text-purple-200" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white">For 100 & 200 Level Students</h3>
                                                        <p className="text-white/80 text-sm">Computer Science & Information Technology</p>
                                                        <p className="text-white/70 text-xs mt-1">
                                                            Tailored for current 100 & 200-level students
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start space-x-4">
                                                    <div className="bg-purple-500/20 p-3 rounded-xl">
                                                        <FaMapMarkerAlt className="text-xl text-purple-200" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white">Venue</h3>
                                                        <p className="text-white/80 text-sm">Lecture Theatre 1 (LT1), Bells University</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Instructor Card */}
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src="/speaker.jpg"
                                                    alt="speaker"
                                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-purple-300/30"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base text-white">Lead Instructor</h3>
                                                    <p className="text-sm sm:text-base text-white/90">Enaikele Omoh Kelvin</p>
                                                    <p className="text-xs sm:text-sm text-white/70">Community Director General</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Registration Form */}
                    <div className="w-full lg:w-7/12">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl">
                            <div className="flex justify-between items-start mb-6 sm:mb-8">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="bg-purple-100 p-2 sm:p-3 rounded-xl">
                                        <FaUserGraduate className="text-xl sm:text-2xl text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Register Now</h2>
                                        <p className="text-sm sm:text-base text-gray-600">Complete the form to join our classes</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsLoginOpen(true)}
                                    className="text-xs sm:text-sm text-gray-500 hover:text-purple-600 flex items-center space-x-2 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg transition-all hover:shadow-md"
                                >
                                    <FaLock className="text-xs" />
                                    <span>Admin</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Institution <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {['computer_science', 'it'].map((dept) => (
                                            <label
                                                key={dept}
                                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.institution === dept
                                                    ? 'border-purple-500 bg-purple-50/50'
                                                    : touched.institution && !formData.institution
                                                        ? 'border-red-300 hover:border-red-400'
                                                        : 'border-gray-100 hover:border-purple-500/50 hover:bg-purple-50/30'
                                                    }`}
                                                onClick={() => handleInstitutionChange(dept)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="institution"
                                                    value={dept}
                                                    checked={formData.institution === dept}
                                                    onChange={(e) => handleInstitutionChange(e.target.value)}
                                                    className="text-purple-600 focus:ring-purple-500"
                                                    required
                                                />
                                                <span className="ml-3 font-medium text-gray-700">
                                                    {dept === 'computer_science' ? 'Computer Science' : 'Information Technology'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {getFieldError('institution') && (
                                        <p className="text-sm text-red-500 mt-1">{getFieldError('institution')}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Level Selection <span className="text-red-500">*</span>
                                    </label>
                                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl text-xs sm:text-sm text-yellow-800 mb-3">
                                        ⚠️ These tutorial classes are exclusively for 100 & 200-level students.
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer">
                                            <input
                                                type="radio"
                                                name="level"
                                                value="100"
                                                checked={formData.level === '100'}
                                                onChange={(e) => setFormData({ ...formData, level: e.target.value as '100' | '200' })}
                                                className="text-purple-600 focus:ring-purple-500"
                                                required
                                            />
                                            <span className="ml-3 text-gray-700">
                                                I am a 100-level student
                                            </span>
                                        </label>
                                        <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer">
                                            <input
                                                type="radio"
                                                name="level"
                                                value="200"
                                                checked={formData.level === '200'}
                                                onChange={(e) => setFormData({ ...formData, level: e.target.value as '100' | '200' })}
                                                className="text-purple-600 focus:ring-purple-500"
                                                required
                                            />
                                            <span className="ml-3 text-gray-700">
                                                I am a 200-level student
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Team Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.teamName}
                                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                                        placeholder="Enter your team name"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Team Size <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.teamSize}
                                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                                        placeholder="Enter your team size"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Project Idea <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.projectIdea}
                                        onChange={(e) => setFormData({ ...formData, projectIdea: e.target.value })}
                                        placeholder="Enter your project idea"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all min-h-[100px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Skills <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.skills.join(', ')}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                        placeholder="Enter your skills separated by commas"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all min-h-[100px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Dietary Restrictions <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.dietaryRestrictions}
                                        onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                                        placeholder="Enter your dietary restrictions"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all min-h-[100px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        T-shirt Size <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {['S', 'M', 'L', 'XL'].map((size) => (
                                            <label
                                                key={size}
                                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.tshirtSize === size
                                                    ? 'border-purple-500 bg-purple-50/50'
                                                    : 'border-gray-100 hover:border-purple-500/50 hover:bg-purple-50/30'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="tshirtSize"
                                                    value={size}
                                                    checked={formData.tshirtSize === size}
                                                    onChange={(e) => setFormData({ ...formData, tshirtSize: e.target.value })}
                                                    className="text-purple-600 focus:ring-purple-500"
                                                    required
                                                />
                                                <span className="ml-3 font-medium text-gray-700">
                                                    {size}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Courses and Topics You Need Help With <span className="text-red-500">*</span>
                                    </label>

                                    <div className="space-y-4">
                                        <div className="grid gap-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={courseInput.courseCode}
                                                    onChange={(e) => setCourseInput(prev => ({
                                                        ...prev,
                                                        courseCode: e.target.value.toUpperCase()
                                                    }))}
                                                    placeholder="Course Code (e.g. CSC101, CSC205...etc)"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all text-sm"
                                                />
                                            </div>
                                            <div>
                                                <textarea
                                                    value={courseInput.topics}
                                                    onChange={(e) => setCourseInput(prev => ({
                                                        ...prev,
                                                        topics: e.target.value
                                                    }))}
                                                    placeholder="List the specific topics  you need help with (e.g., Arrays, Functions, Object-Oriented Programming)"
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all min-h-[80px] text-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (courseInput.courseCode && courseInput.topics) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            areasOfAssistance: [...prev.areasOfAssistance, courseInput]
                                                        }));
                                                        setCourseInput({ courseCode: '', topics: '' });
                                                    }
                                                }}
                                                className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                                            >
                                                Add Course
                                            </button>
                                        </div>

                                        {formData.areasOfAssistance.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-sm font-medium text-gray-600">Added Courses:</p>
                                                <div className="space-y-2">
                                                    {formData.areasOfAssistance.map((course, index) => (
                                                        <div key={index} className="bg-gray-50 p-4 rounded-xl space-y-1">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-medium text-sm text-gray-800">{course.courseCode}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            areasOfAssistance: prev.areasOfAssistance.filter((_, i) => i !== index)
                                                                        }));
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-gray-600">{course.topics}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-xl space-y-2">
                                        <p className="text-xs sm:text-sm text-yellow-800">
                                            <span className="font-medium">Guide:</span>
                                        </p>
                                        <ul className="text-xs text-yellow-800 list-disc pl-4 space-y-1">
                                            <li>Enter each course code and its specific computer science topics you need help with</li>
                                            <li>Course codes should be in capital letters (e.g., CSC101, CSC201)</li>
                                            <li>Be specific about the Computer Science Topics you're struggling with</li>
                                            {formData.level === '100' && (
                                                <>
                                                    <li>Example: CSC101 - Introduction to Programming, Basic Algorithms, Python Basics</li>
                                                    <li>Example: CSC102 - Data Types, Control Structures, Functions</li>
                                                </>
                                            )}
                                            {formData.level === '200' && (
                                                <>
                                                    <li>Example: CSC201 - Object-Oriented Programming, Classes & Objects, Inheritance</li>
                                                    <li>Example: CSC202 - Data Structures, Sorting Algorithms, Linked Lists</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    {touched.areasOfAssistance && formData.areasOfAssistance.length === 0 && (
                                        <p className="text-sm text-red-500">Please add at least one course and its topics</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Message to Admin (Optional)
                                    </label>
                                    <textarea
                                        value={formData.message || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        placeholder="Any questions or special requests? Let us know!"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-all min-h-[100px]"
                                    />
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl text-xs sm:text-sm text-blue-800 mb-6">
                                    <p className="flex items-start gap-2">
                                        <span className="text-blue-500">ℹ️</span>
                                        <span>
                                            Select the courses you need assistance with. After registration, join our WhatsApp group
                                            for schedule updates and important announcements. The tutorial schedule will be decided
                                            based on group members' availability and selected courses.
                                        </span>
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl hover:bg-purple-700 transition-all duration-300 font-semibold text-base sm:text-lg mt-6 sm:mt-8 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-200/50 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* <ChatBot onSendMessage={handleMessage} /> */}

            <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
            <RegistrationSuccessPopup
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                registrationId={currentRegistrationId}
            />
        </div>
    );
} 