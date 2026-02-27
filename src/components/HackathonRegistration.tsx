import { useState, useEffect } from 'react';
import { FaClock, FaMapMarkerAlt, FaLock, FaWhatsapp, FaCode, FaTrophy, FaUsers, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { db } from '../services/firebase';
import { toast } from 'react-hot-toast';
import { generateRegistrationId, currentYear } from '../utils/helpers';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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
    college: string;
    otherCollege?: string;
    department: string;
    matricNumber: string;
    level: '100' | '200' | '300' | '400' | '500' | '';
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
        institution: 'Bells University of Technology',
        college: '',
        otherCollege: '',
        department: '',
        matricNumber: '',
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

    // Add settings state
    const [settings, setSettings] = useState({
        eventDate: 'Coming Soon...',
        eventTime: '',
        venue: 'Bells University of Technology',
        venueAddress: 'Ota, Ogun-state, Nigeria.',
        themes: ['FinTech Solutions', 'HealthTech Innovations', 'EdTech Platforms', 'Sustainable Development'],
        prizes: ['1st Place: ₦500,000', '2nd Place: ₦300,000', '3rd Place: ₦150,000', '+ Internship Opportunities'],
        contactEmail: 'nacos.hackathon@example.com',
        contactPhone: '+234 800 NACOS HACK',
        registrationEnabled: true,
        whatsappLink: '#',
        socialLinks: {
            twitter: '#',
            instagram: '#',
            linkedin: '#',
            github: '#'
        }
    });

    // Handle intro animation timing
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    // Fetch settings from Firebase
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsDoc = await getDoc(doc(db, 'settings', 'hackathon'));
                if (settingsDoc.exists()) {
                    setSettings(prevSettings => ({
                        ...prevSettings,
                        ...settingsDoc.data()
                    }));
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchSettings();
    }, []);

    // Check if Web Share API is supported
    useEffect(() => {
        // We'll directly check in the handleShare function instead
    }, []);

    const [touched, setTouched] = useState({
        college: false,
        department: false,
        matricNumber: false,
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

            // If "Others" is selected, use the otherCollege value
            const finalFormData = {
                ...formData,
                college: formData.college === 'Others' ? formData.otherCollege : formData.college,
                registrationId: regId,
                verified: false,
                timestamp: serverTimestamp()
            };

            await addDoc(collection(db, 'registrations'), finalFormData);

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
                institution: 'Bells University of Technology',
                college: '',
                otherCollege: '',
                department: '',
                matricNumber: '',
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
        '/bg5.jpeg',
        '/bg6.jpeg',
        '/bg7.jpeg',

    ];

    // Handle share functionality
    const handleShare = async () => {
        try {
            if (navigator && navigator.share) {
                await navigator.share({
                    title: `NACOS Hackathon ${currentYear}`,
                    text: `Join the NACOS Hackathon ${currentYear}! Code. Innovate. Transform.`,
                    url: window.location.href,
                });
                toast.success('Thanks for sharing!');
            } else {
                // Fallback for browsers that don't support sharing
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                } else {
                    toast.error('Sharing not supported on this browser.');
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // User probably canceled the share
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Could not share, try copying the link instead.');
            }
        }
    };

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
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="text-white flex items-center justify-center bg-none md:bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-2 shadow-lg">
                                <div className="flex md:flex-row flex-col items-center gap-2">
                                    {/* <img src="/bot.png" alt="Bot Logo" className="bg-white rounded-full p-1 shadow-md object-contain w-auto md:w-[7rem]" />
                                    <span className="font-bold text-lg">×</span> */}
                                    <img src="/nacos-logo.png" alt="NACOS Logo" className="object-cover w-8 h-8" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                                    NACOS Hackathon {currentYear}
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
                            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
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
                                            <p className="text-white/80 text-sm">{settings.eventDate}</p>
                                            {settings.eventTime && <p className="text-white/80 text-sm">{settings.eventTime}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaMapMarkerAlt className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Venue</h3>
                                            <p className="text-white/80 text-sm">{settings.venue}</p>
                                            <p className="text-white/80 text-sm">{settings.venueAddress}</p>
                                        </div>
                                    </div>

                                    {/* Featured Image Space */}


                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaCode className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Themes</h3>
                                            {settings.themes.map((theme, index) => (
                                                <p key={index} className="text-white/80 text-sm">{theme}</p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-500/20 p-3 rounded-lg">
                                            <FaTrophy className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Prizes</h3>
                                            {settings.prizes.map((prize, index) => (
                                                <p key={index} className="text-white/80 text-sm">{prize}</p>
                                            ))}
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
                                    <p className="text-white/80 text-sm mb-2">Email: {settings.contactEmail}</p>
                                    <p className="text-white/80 text-sm">Phone: {settings.contactPhone}</p>
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
                                                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all cursor-not-allowed opacity-80"
                                                disabled
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Matric Number <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.matricNumber}
                                                onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
                                                onBlur={() => setTouched({ ...touched, matricNumber: true })}
                                                placeholder="e.g. BHT/20/04/09/0001"
                                                className={`w-full px-4 py-3 rounded-xl bg-white/10 border-2 ${getFieldError('matricNumber') ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all`}
                                                required
                                            />
                                            {getFieldError('matricNumber') && (
                                                <p className="text-red-400 text-xs">{getFieldError('matricNumber')}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                College <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={formData.college}
                                                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                                onBlur={() => setTouched({ ...touched, college: true })}
                                                className={`w-full px-4 py-3 rounded-xl bg-white/10 border-2 ${getFieldError('college') ? 'border-red-500' : 'border-white/20'} text-white focus:border-green-500 focus:ring-green-500/20 transition-all`}
                                                required
                                            >
                                                <option value="" className="bg-black">Select your college</option>
                                                <option value="College of Natural and Applied Sciences" className="bg-black">College of Natural and Applied Sciences</option>
                                                <option value="College of Management and Social Sciences" className="bg-black">College of Management and Social Sciences</option>
                                                <option value="College of Engineering" className="bg-black">College of Engineering</option>
                                                <option value="College of Environmental Sciences" className="bg-black">College of Environmental Sciences</option>
                                                <option value="Others" className="bg-black">Others</option>
                                            </select>
                                            {getFieldError('college') && (
                                                <p className="text-red-400 text-xs">{getFieldError('college')}</p>
                                            )}
                                        </div>
                                        {formData.college === 'Others' && (
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-white">
                                                    Specify College <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.otherCollege || ''}
                                                    onChange={(e) => setFormData({ ...formData, otherCollege: e.target.value })}
                                                    placeholder="Enter your college"
                                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                                    required={formData.college === 'Others'}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Department <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                onBlur={() => setTouched({ ...touched, department: true })}
                                                placeholder="e.g. Computer Science"
                                                className={`w-full px-4 py-3 rounded-xl bg-white/10 border-2 ${getFieldError('department') ? 'border-red-500' : 'border-white/20'} text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20 transition-all`}
                                                required
                                            />
                                            {getFieldError('department') && (
                                                <p className="text-red-400 text-xs">{getFieldError('department')}</p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-white">
                                                Level <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={formData.level}
                                                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                                                onBlur={() => setTouched({ ...touched, level: true })}
                                                className={`w-full px-4 py-3 rounded-xl bg-white/10 border-2 ${getFieldError('level') ? 'border-red-500' : 'border-white/20'} text-white focus:border-green-500 focus:ring-green-500/20 transition-all`}
                                                required
                                            >
                                                <option value="" className="bg-black">Select your level</option>
                                                <option value="100" className="bg-black">100 Level</option>
                                                <option value="200" className="bg-black">200 Level</option>
                                                <option value="300" className="bg-black">300 Level</option>
                                                <option value="400" className="bg-black">400 Level</option>
                                                <option value="500" className="bg-black">500 Level</option>
                                            </select>
                                            {getFieldError('level') && (
                                                <p className="text-red-500 text-xs mt-1">{getFieldError('level')}</p>
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
                                            <p className="text-xs text-green-300 italic">
                                                All team members must use the exact same team name when registering.
                                            </p>
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
                                        <p className="text-xs text-green-300 italic">
                                            All team members should select the same team size.
                                        </p>
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

                                    {/* Team Registration Instructions */}
                                    <div className="bg-green-900/30 p-4 rounded-xl text-xs sm:text-sm text-green-300 mb-6 border border-green-500/30">
                                        <p className="flex items-start gap-2 mb-2">
                                            <span className="text-green-400">ℹ️</span>
                                            <span className="font-semibold">Team Registration Instructions:</span>
                                        </p>
                                        <ul className="list-disc pl-8 space-y-1">
                                            <li>Every team member (including the team captain) must register individually.</li>
                                            <li>All team members must use the exact same team name in their registration.</li>
                                            <li>Team size should be consistent across all team member registrations.</li>
                                            <li>Each team member should specify their own skills and information.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-green-900/30 p-4 rounded-xl text-xs sm:text-sm text-green-300 mb-6 border border-green-500/30">
                                        <p className="flex items-start gap-2">
                                            <span className="text-green-400">⚠️</span>
                                            <span>
                                                <strong>Important:</strong> After registration, join our WhatsApp group for updates and important announcements.
                                                Remember that each team member must register individually with the same team name.
                                                Inconsistent team information may affect your registration status.
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !settings.registrationEnabled}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 font-semibold text-base sm:text-lg mt-6 sm:mt-8 shadow-lg shadow-green-900/50 hover:shadow-xl hover:shadow-green-900/70 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Submitting...' : settings.registrationEnabled ? 'Complete Registration' : 'Registration Closed'}
                                    </button>
                                </form>


                            </div>
                        </motion.div>
                    </div>
                    {/*  */}

                    {/* Footer with Glassmorphism Effect */}
                    <motion.div
                        className="mt-16 pt-8 border-t border-white/20 backdrop-blur-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: showIntro ? 3.8 : 0.6, duration: 0.5 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6 backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="text-white text-2xl font-bold">Join the NACOS Hackathon Community</h3>
                                <p className="text-white/70">
                                    Be part of Nigeria's largest student hackathon and showcase your innovation skills! Connect with like-minded students, mentors, and industry professionals.
                                </p>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <a href={settings.whatsappLink} className="flex items-center gap-2 bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-600 hover:to-green-700 transition-all px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-green-500/20 backdrop-blur-sm">
                                        <FaWhatsapp className="text-white" />
                                        <span>Join WhatsApp Group</span>
                                    </a>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={handleShare}
                                    className="group bg-gradient-to-br from-white/20 to-white/5 p-5 rounded-xl shadow-xl border border-white/20 backdrop-blur-md hover:from-green-500/30 hover:to-green-600/20 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="bg-white p-2 rounded-lg group-hover:shadow-lg transition-all duration-300">
                                        <img
                                            src="/qrcode.png"
                                            alt="Registration QR Code"
                                            className="w-[180px] h-[180px]"
                                        />
                                    </div>
                                </button>
                                <p className="text-green-300 text-sm mt-4 text-center font-medium flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Tap to share with your friends
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 my-6 backdrop-blur-sm bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
                            <h3 className="text-white text-2xl font-bold">Join the Inventors Community, Bells university</h3>
                            <p className="text-white/70">
                                The Inventors Community is a vibrant family of like-minded tech enthusiasts — <span className="font-bold px-2">writers, developers, designers, and innovators</span> 
                                — united by a passion for growth and impact. We provide weekly mentorship, hands-on training, and valuable industry insights to help members sharpen their skills.
                                It’s a platform to build, collaborate, and confidently communicate tech ideas.
                                Together, we learn, build, and grow into world-class professionals. 🚀
                            </p>
                            <div className="flex flex-wrap gap-3 mt-4">
                                <a 
                                    href={"https://chat.whatsapp.com/GkTgPG4z5f4BcTd9lY3VcE"} 
                                    className="flex items-center gap-2 bg-gradient-to-r from-green-500/90 to-green-600/90 hover:from-green-600 hover:to-green-700 transition-all px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-green-500/20 backdrop-blur-sm"
                                >
                                    <FaWhatsapp className="text-white" />
                                    <span>Join WhatsApp Group</span>
                                </a>
                                <a 
                                    href={'https://www.linkedin.com/company/inventors-community/'} 
                                    rel='noopener noreferrer'
                                    target="_blank"
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-600 hover:to-blue-700 transition-all px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-blue-500/20 backdrop-blur-sm"
                                >
                                    <FaLinkedin className="text-white" />
                                    <span>Follow on LinkedIn</span>
                                </a>
                                <a 
                                    href={'https://x.com/D_INVENTORS'} 
                                    rel='noopener noreferrer'
                                    target="_blank"
                                    className="flex items-center gap-2 bg-gradient-to-r from-neutral-500/90 to-neutral-600/90 hover:from-neutral-600 hover:to-neutral-700 transition-all px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-neutral-500/20 backdrop-blur-sm"
                                >
                                    <FaTwitter className="text-white" />
                                    <span>Follow on X</span>
                                </a>
                            </div>
                        </div>

                        <div className="mt-12 py-8 bg-black/40 backdrop-blur-lg border-t border-white/10 rounded-t-3xl flex flex-col md:flex-row justify-between items-center px-6">
                            <div className="flex items-center gap-4 mb-6 md:mb-0">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">NACOS Hackathon</span>
                                    <span className="text-white/50 text-sm">© {currentYear} All rights reserved</span>
                                </div>
                            </div>

                            <div className="flex gap-6 mb-6 md:mb-0">
                                <a href={settings.socialLinks.twitter} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                                    <FaTwitter size={18} />
                                </a>
                                <a href={settings.socialLinks.instagram} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                                    <FaInstagram size={18} />
                                </a>
                                <a href={settings.socialLinks.linkedin} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                                    <FaLinkedin size={18} />
                                </a>
                                <a href={settings.socialLinks.github} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                                    <FaGithub size={18} />
                                </a>
                            </div>

                            <div className="flex flex-wrap items-center justify-center bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm w-full md:w-auto mt-6 md:mt-0">
                                <div className="flex items-center">
                                    <img
                                        src="/logo.png"
                                        alt="Inventors Logo"
                                        className="w-6 h-6 md:w-8 md:h-8 mr-2 object-contain"
                                    />
                                    <span className="text-white/70 text-xs md:text-sm mr-1">Made with</span>
                                    <span className="text-red-500">❤️</span>
                                </div>
                                <div className="flex items-center mx-1 md:mx-0">
                                    <span className="text-white/70 text-xs md:text-sm mx-1">by the</span>
                                    <a
                                        href="https://www.linkedin.com/company/inventors-community/"
                                        className="text-green-400 hover:text-green-300 transition-colors text-xs md:text-sm font-medium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        INVENTORS COMMUNITY
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
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