import { useState, useEffect } from 'react';
import { FaClock, FaMapMarkerAlt, FaLock, FaWhatsapp, FaCode, FaTrophy, FaUsers } from 'react-icons/fa';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';
import { generateRegistrationId } from '../utils/helpers';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { LoginPopup } from './LoginPopup';
import { RegistrationSuccessPopup } from './RegistrationSuccessPopup';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageSlider } from './ImageSlider';
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
        areasOfAssistance: [],
    });
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [currentRegistrationId, setCurrentRegistrationId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    // Handle intro animation timing
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const [touched, setTouched] = useState({
        institution: false,
        level: false,
        areasOfAssistance: false
    });


    const getFieldError = (field: keyof typeof touched) => {
        if (touched[field] && !formData[field]) {
            return 'This field is required';
        }
        return '';
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const regId = generateRegistrationId();
            const registrationData = {
                ...formData,
                registrationId: regId,
                verified: false,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, 'registrations'), registrationData);

            if (formData.message) {
                await addDoc(collection(db, 'messages'), {
                    studentName: formData.fullName,
                    studentEmail: formData.email,
                    message: formData.message,
                    registrationId: regId,
                    read: false,
                    timestamp: serverTimestamp()
                });
            }

            setCurrentRegistrationId(regId);
            setIsSuccessOpen(true);
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
                areasOfAssistance: [],
            });
            toast.success('Registration successful!');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };



    // Add this array of slider images
    const sliderImages = [
        '/bg1.jpeg',
        '/bg2.jpeg',
        '/bg3.jpeg',
        '/bg4.jpeg',
        '/bg5.jpeg'
    ];

    // Add this for the QR code

    return (
        <>
            {/* Intro Animation */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: 2.7 }}
                    >
                        <div className="h-full w-full relative overflow-hidden">
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-green-900 opacity-90"></div>
                                <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-20"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    {/* Bells University Logo First */}
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.7 }}
                                        className="mb-4"
                                    >
                                        <img src="/bells-logo.png" alt="Bells University Logo" className="w-32 h-32" />
                                    </motion.div>

                                    {/* NACOS Logo */}
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 1.0, duration: 0.7 }}
                                        className="mb-6"
                                    >
                                        <img src="/nacos-logo.png" alt="NACOS Logo" className="w-28 h-28" />
                                    </motion.div>

                                    <motion.h1
                                        className="text-4xl md:text-6xl font-bold text-white text-center mb-4"
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 1.5, duration: 0.7 }}
                                    >
                                        GET READY FOR
                                    </motion.h1>

                                    <motion.div
                                        className="text-5xl md:text-7xl font-extrabold text-green-400 text-center"
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 2.0, duration: 0.7 }}
                                    >
                                        NACOS HACKATHON
                                    </motion.div>

                                    <motion.div
                                        className="mt-8 flex gap-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2.3, duration: 0.7 }}
                                    >
                                        {['CODE', 'INNOVATE', 'TRANSFORM'].map((word, index) => (
                                            <motion.div
                                                key={word}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md font-bold"
                                                initial={{ x: -50 * (index + 1), opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 2.5 + (index * 0.2), duration: 0.5 }}
                                            >
                                                {word}
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="min-h-screen bg-black bg-[url('/circuit-pattern.svg')] bg-fixed bg-opacity-10">
                <div className="container mx-auto px-4 py-8 sm:py-12">
                    {/* Header */}
                    <motion.div
                        className="flex justify-between items-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: showIntro ? 3.2 : 0, duration: 0.5 }}
                    >
                        <div className="flex items-start gap-4">
                            <div className=" text-white flex md:flex-row  flex-col gap-3 pl-2 pr-4 items-center  bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 ">
                                <img src="/bells-logo.png" alt="Bells University Logo" className=" object-cover size-[4rem]" />
                                <h1>X</h1>
                                <img src="/nacos-logo.png" alt="Bells University Logo" className=" object-cover size-[2rem]" />

                            </div>
                            <div>
                                <h1 className="text-5xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                                    NACOS Hackathon 2025
                                </h1>
                                <p className="text-base sm:text-lg text-white/90 font-medium mb-2">Code. Innovate. Transform.</p>
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 mt-4 border border-white/10">
                                    <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                                        Join the largest student hackathon for computing students across Nigeria. Build innovative solutions and win amazing prizes!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsLoginOpen(true)}
                            className="hidden sm:flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                        >
                            <FaLock className="text-sm" />
                            <span className="font-medium">Admin</span>
                        </button>
                    </motion.div>

                    {/* Featured Slider - Full Width */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: showIntro ? 3.3 : 0.1, duration: 0.5 }}
                        className="mb-10"
                    >
                        <ImageSlider
                            images={sliderImages}
                            className="h-64 sm:h-80 md:h-96 shadow-2xl border border-white/10"
                        />
                    </motion.div> */}

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Info */}
                        <motion.div
                            className="lg:col-span-1"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: showIntro ? 3.4 : 0.2, duration: 0.5 }}
                        >
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-white/10">
                                <h2 className="text-xl sm:text-2xl font-bold mb-6 border-b border-white/20 pb-3">Event Details</h2>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaClock className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Date & Time</h3>
                                            <p className="text-white/80 text-sm">Coming Soon...</p>
                                            {/* <p className="text-white/80 text-sm">November 10-12, 2025</p> */}
                                            {/* <p className="text-white/80 text-sm">9:00 AM - 5:00 PM</p> */}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaMapMarkerAlt className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Venue</h3>
                                            <p className="text-white/80 text-sm">Bells University of Technology</p>
                                            <p className="text-white/80 text-sm">Ota, Ogun-state, Nigeria.</p>
                                        </div>
                                    </div>

                                    {/* Featured Image Space */}


                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaCode className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Themes</h3>
                                            <p className="text-white/80 text-sm">FinTech Solutions</p>
                                            <p className="text-white/80 text-sm">HealthTech Innovations</p>
                                            <p className="text-white/80 text-sm">EdTech Platforms</p>
                                            <p className="text-white/80 text-sm">Sustainable Development</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaTrophy className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Prizes</h3>
                                            <p className="text-white/80 text-sm">1st Place: ₦500,000</p>
                                            <p className="text-white/80 text-sm">2nd Place: ₦300,000</p>
                                            <p className="text-white/80 text-sm">3rd Place: ₦150,000</p>
                                            <p className="text-white/80 text-sm">+ Internship Opportunities</p>
                                        </div>
                                    </div>

                                    {/* Featured Image Space */}


                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaUsers className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Eligibility</h3>
                                            <p className="text-white/80 text-sm">All Levels (100-500)
                                                <br /> from any Departments</p>
                                            <p className="text-white/80 text-sm">Teams of 1-4 students</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/20">
                                    <h3 className="font-semibold text-lg mb-3">Contact Us</h3>
                                    <p className="text-white/80 text-sm mb-2">Email: nacos.hackathon@example.com</p>
                                    <p className="text-white/80 text-sm">Phone: +234 800 NACOS HACK</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Registration Form */}
                        <motion.div
                            className="lg:col-span-2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: showIntro ? 3.6 : 0.4, duration: 0.5 }}
                        >
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/10">
                                {/* Replace the static image with the slider */}
                                <div className="mb-6 h-48 relative">
                                    <ImageSlider
                                        images={sliderImages}
                                        interval={4000}
                                        className="h-full shadow-lg border border-white/10"
                                    />
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-b border-white/20 pb-3">Registration Form</h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Full Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Email <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="johndoe@example.com"
                                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Phone Number <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                placeholder="+234 800 123 4567"
                                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Institution <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.institution}
                                                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                                onBlur={() => setTouched({ ...touched, institution: true })}
                                                placeholder="Bells university of Technology"
                                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                                required
                                            />
                                            {getFieldError('institution') && (
                                                <p className="text-red-400 text-xs">{getFieldError('institution')}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Level <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={formData.level}
                                                onChange={(e) => setFormData({ ...formData, level: e.target.value as '100' | '200' | '' })}
                                                onBlur={() => setTouched({ ...touched, level: true })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-green-500 focus:ring-green-500/20 transition-all"
                                                required
                                            >
                                                <option value="" className="bg-black">Select your level</option>
                                                <option value="100" className="bg-black">100 Level</option>
                                                <option value="200" className="bg-black">200 Level</option>
                                            </select>
                                            {getFieldError('level') && (
                                                <p className="text-red-400 text-xs">{getFieldError('level')}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Team Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.teamName}
                                                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                                placeholder="Code Ninjas"
                                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white">
                                            Team Size <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            value={formData.teamSize}
                                            onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-green-500 focus:ring-green-500/20 transition-all"
                                            required
                                        >
                                            <option value="1" className="bg-black">Individual (1 person)</option>
                                            <option value="2" className="bg-black">2 members</option>
                                            <option value="3" className="bg-black">3 members</option>
                                            <option value="4" className="bg-black">4 members</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white">
                                            Project Idea <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={formData.projectIdea}
                                            onChange={(e) => setFormData({ ...formData, projectIdea: e.target.value })}
                                            placeholder="Briefly describe your project idea"
                                            className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all min-h-[100px]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white">
                                            Skills <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={formData.skills.join(', ')}
                                            onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                                            placeholder="Enter your skills separated by commas (e.g., React, Node.js, UI/UX Design)"
                                            className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all min-h-[100px]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white">
                                            Additional Message
                                        </label>
                                        <textarea
                                            value={formData.message || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="Any questions or special requests? Let us know!"
                                            className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all min-h-[100px]"
                                        />
                                    </div>

                                    <div className="bg-green-900/30 p-4 rounded-xl text-xs sm:text-sm text-green-300 mb-6 border border-green-500/30">
                                        <p className="flex items-start gap-2">
                                            <span className="text-green-400">ℹ️</span>
                                            <span>
                                                After registration, join our WhatsApp group for updates and important announcements.
                                                Each team member should register individually with the same team name.
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold text-base sm:text-lg mt-6 sm:mt-8 shadow-lg shadow-green-900/50 hover:shadow-xl hover:shadow-green-900/70 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                                    </button>
                                </form>

                                {/* QR Code Section */}
                                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center">
                                    <h3 className="text-white text-lg font-semibold mb-4">Scan to Register</h3>
                                    <div className="bg-white p-3 rounded-xl">
                                        <img
                                            src="/qr-code.png"
                                            alt="Registration QR Code"
                                            className="w-[150px] h-[150px]"
                                        />
                                    </div>
                                    <p className="text-green-300 text-sm mt-4 text-center">
                                        Share this QR code with your friends to join the hackathon!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    {/*  */}

                    {/* Footer with QR Code */}
                    <div className="mt-16 pt-8 border-t border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            <div className="md:col-span-2">
                                <h3 className="text-white text-xl font-bold mb-4">Join the NACOS Hackathon Community</h3>
                                <p className="text-white/70 mb-4">
                                    Scan the QR code to register or share with your friends. Be part of Nigeria's largest student hackathon and showcase your innovation skills!
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <a href="#" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-white">
                                        <FaWhatsapp />
                                        <span>Join WhatsApp</span>
                                    </a>
                                    <a href="#" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-white">
                                        <FaCode />
                                        <span>View Past Projects</span>
                                    </a>
                                </div>
                            </div>
                            <div className="flex justify-center md:justify-end">
                                <div className="bg-white p-4 rounded-xl">
                                    <img
                                        src="/qr-code.png"
                                        alt="Registration QR Code"
                                        className="w-[180px] h-[180px]"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/10 text-center">
                            <p className="text-white/50 text-sm">
                                © {new Date().getFullYear()} NACOS Bells University Chapter. All rights reserved.
                            </p>
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
        </>
    );
} 