import { useState, useEffect } from 'react';
import { updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaSave, FaWhatsapp, FaMapMarkerAlt, FaUserTie, FaTrophy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface SettingsData {
    whatsappLink: string;
    venues: {
        name: string;
        capacity: string;
    }[];
    organizer: {
        name: string;
        title: string;
        email: string;
        phone: string;
        bio: string;
    };
    hackathonDetails: {
        startDate: string;
        endDate: string;
        theme: string;
        maxTeamSize: number;
        prizes: {
            first: string;
            second: string;
            third: string;
        }
    }
}

export function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        whatsappLink: '',
        venues: [{ name: 'Main Hall', capacity: '200' }],
        organizer: {
            name: 'NACOS Executive Committee',
            title: 'Organizing Committee',
            email: '',
            phone: '',
            bio: ''
        },
        hackathonDetails: {
            startDate: '',
            endDate: '',
            theme: 'Innovation for the Future',
            maxTeamSize: 4,
            prizes: {
                first: '₦500,000',
                second: '₦300,000',
                third: '₦150,000'
            }
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as SettingsData);
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
            const settingsData = JSON.parse(JSON.stringify(settings));
            const docRef = doc(db, 'settings', 'general');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await updateDoc(docRef, settingsData);
            } else {
                await setDoc(docRef, settingsData);
            }

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addVenue = () => {
        setSettings(prev => ({
            ...prev,
            venues: [...prev.venues, { name: '', capacity: '' }]
        }));
    };

    const removeVenue = (index: number) => {
        setSettings(prev => ({
            ...prev,
            venues: prev.venues.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl xs:text-2xl font-bold text-gray-800">Settings</h1>
                    <p className="text-xs xs:text-sm text-gray-600">Manage system settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full xs:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                    <FaSave className="text-sm" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-xl p-4 xs:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <FaWhatsapp className="text-xl text-green-500" />
                        <h2 className="text-lg font-semibold text-gray-800">WhatsApp Group Link</h2>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="url"
                            value={settings.whatsappLink}
                            onChange={(e) => setSettings(prev => ({ ...prev, whatsappLink: e.target.value }))}
                            placeholder="Enter WhatsApp group invite link"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                        <p className="text-sm text-gray-500">
                            This link will be shown to students after registration
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 xs:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <FaMapMarkerAlt className="text-xl text-red-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Venues</h2>
                    </div>
                    <div className="space-y-4">
                        {settings.venues.map((venue, index) => (
                            <div key={index} className="flex gap-4">
                                <input
                                    type="text"
                                    value={venue.name}
                                    onChange={(e) => {
                                        const newVenues = [...settings.venues];
                                        newVenues[index].name = e.target.value;
                                        setSettings(prev => ({ ...prev, venues: newVenues }));
                                    }}
                                    placeholder="Venue name"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                                <input
                                    type="text"
                                    value={venue.capacity}
                                    onChange={(e) => {
                                        const newVenues = [...settings.venues];
                                        newVenues[index].capacity = e.target.value;
                                        setSettings(prev => ({ ...prev, venues: newVenues }));
                                    }}
                                    placeholder="Capacity"
                                    className="w-32 px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                                {settings.venues.length > 1 && (
                                    <button
                                        onClick={() => removeVenue(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addVenue}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                        >
                            + Add Venue
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 xs:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <FaUserTie className="text-xl text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Organizer Information</h2>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={settings.organizer.name}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    organizer: { ...prev.organizer, name: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={settings.organizer.title}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    organizer: { ...prev.organizer, title: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={settings.organizer.email}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    organizer: { ...prev.organizer, email: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={settings.organizer.phone}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    organizer: { ...prev.organizer, phone: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div className="xs:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                value={settings.organizer.bio}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    organizer: { ...prev.organizer, bio: e.target.value }
                                }))}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 xs:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <FaTrophy className="text-xl text-yellow-500" />
                        <h2 className="text-lg font-semibold text-gray-800">Hackathon Details</h2>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={settings.hackathonDetails.startDate}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    hackathonDetails: { ...prev.hackathonDetails, startDate: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={settings.hackathonDetails.endDate}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    hackathonDetails: { ...prev.hackathonDetails, endDate: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                            <input
                                type="text"
                                value={settings.hackathonDetails.theme}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    hackathonDetails: { ...prev.hackathonDetails, theme: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Team Size</label>
                            <input
                                type="number"
                                value={settings.hackathonDetails.maxTeamSize}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    hackathonDetails: { ...prev.hackathonDetails, maxTeamSize: parseInt(e.target.value) }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">1st Prize</label>
                            <input
                                type="text"
                                value={settings.hackathonDetails.prizes.first}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    hackathonDetails: {
                                        ...prev.hackathonDetails,
                                        prizes: { ...prev.hackathonDetails.prizes, first: e.target.value }
                                    }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">2nd Prize</label>
                            <input
                                type="text"
                                value={settings.hackathonDetails.prizes.second}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    hackathonDetails: {
                                        ...prev.hackathonDetails,
                                        prizes: { ...prev.hackathonDetails.prizes, second: e.target.value }
                                    }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">3rd Prize</label>
                            <input
                                type="text"
                                value={settings.hackathonDetails.prizes.third}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    hackathonDetails: {
                                        ...prev.hackathonDetails,
                                        prizes: { ...prev.hackathonDetails.prizes, third: e.target.value }
                                    }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 