import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaSave, FaWhatsapp, FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../../components/AdminLayout';
import { FaCog, FaCalendarAlt, FaCode, FaEnvelope, FaPhone, FaLink } from 'react-icons/fa';

interface HackathonSettings {
    eventDate: string;
    eventTime: string;
    venue: string;
    venueAddress: string;
    themes: string[];
    prizes: string[];
    contactEmail: string;
    contactPhone: string;
    registrationEnabled: boolean;
    whatsappLink: string;
    socialLinks: {
        twitter: string;
        instagram: string;
        linkedin: string;
        github: string;
    };
}

const currentYear = new Date().getFullYear();

export function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<HackathonSettings>({
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

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsDoc = await getDoc(doc(db, 'settings', 'hackathon'));
                if (settingsDoc.exists()) {
                    setSettings(prevSettings => ({
                        ...prevSettings,
                        ...settingsDoc.data() as HackathonSettings
                    }));
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'hackathon'), settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };


    const handleArrayChange = (field: 'themes' | 'prizes', index: number, value: string) => {
        setSettings(prev => {
            const newArray = [...prev[field]];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    };

    const handleAddArrayItem = (field: 'themes' | 'prizes') => {
        setSettings(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveArrayItem = (field: 'themes' | 'prizes', index: number) => {
        setSettings(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSocialLinkChange = (platform: keyof typeof settings.socialLinks, value: string) => {
        setSettings(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }));
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaCog className="mr-2 text-green-600" /> Hackathon Settings
                    </h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <FaSave className="mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            <FaCalendarAlt className="mr-2 text-green-600" /> Event Date & Time
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                                <input
                                    type="text"
                                    value={settings.eventDate}
                                    onChange={(e) => setSettings({ ...settings, eventDate: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder={`e.g., November 10-12, ${currentYear} or Coming Soon...`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                                <input
                                    type="text"
                                    value={settings.eventTime}
                                    onChange={(e) => setSettings({ ...settings, eventTime: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., 9:00 AM - 5:00 PM"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            <FaMapMarkerAlt className="mr-2 text-green-600" /> Venue
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                                <input
                                    type="text"
                                    value={settings.venue}
                                    onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                                <input
                                    type="text"
                                    value={settings.venueAddress}
                                    onChange={(e) => setSettings({ ...settings, venueAddress: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            <FaCode className="mr-2 text-green-600" /> Hackathon Themes
                        </h2>
                        <div className="space-y-3">
                            {settings.themes.map((theme, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={theme}
                                        onChange={(e) => handleArrayChange('themes', index, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                    />
                                    <button
                                        onClick={() => handleRemoveArrayItem('themes', index)}
                                        className="p-2 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => handleAddArrayItem('themes')}
                                className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                                + Add Theme
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            <FaTrophy className="mr-2 text-green-600" /> Prizes
                        </h2>
                        <div className="space-y-3">
                            {settings.prizes.map((prize, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={prize}
                                        onChange={(e) => handleArrayChange('prizes', index, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md"
                                    />
                                    <button
                                        onClick={() => handleRemoveArrayItem('prizes', index)}
                                        className="p-2 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => handleAddArrayItem('prizes')}
                                className="mt-2 text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                                + Add Prize
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            Contact Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FaEnvelope className="mr-1 text-green-600" /> Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FaPhone className="mr-1 text-green-600" /> Contact Phone
                                </label>
                                <input
                                    type="text"
                                    value={settings.contactPhone}
                                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            Registration & Links
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={settings.registrationEnabled}
                                            onChange={() => setSettings({ ...settings, registrationEnabled: !settings.registrationEnabled })}
                                        />
                                        <div className={`block w-14 h-8 rounded-full ${settings.registrationEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.registrationEnabled ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {settings.registrationEnabled ? 'Registration Open' : 'Registration Closed'}
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FaWhatsapp className="mr-1 text-green-600" /> WhatsApp Group Link
                                </label>
                                <input
                                    type="url"
                                    value={settings.whatsappLink}
                                    onChange={(e) => setSettings({ ...settings, whatsappLink: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="https://chat.whatsapp.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                            <FaLink className="mr-2 text-green-600" /> Social Media Links
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                                <input
                                    type="url"
                                    value={settings.socialLinks.twitter}
                                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                                <input
                                    type="url"
                                    value={settings.socialLinks.instagram}
                                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                                <input
                                    type="url"
                                    value={settings.socialLinks.linkedin}
                                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                                <input
                                    type="url"
                                    value={settings.socialLinks.github}
                                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-white px-6 py-2 rounded-md flex items-center hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <FaSave className="mr-2" />
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
} 