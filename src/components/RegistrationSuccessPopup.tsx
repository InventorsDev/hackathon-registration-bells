import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaCheckCircle, FaCopy, FaShare, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
interface RegistrationSuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    registrationId: string;
}

const currentYear = new Date().getFullYear();
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/HackathonGroup";

export function RegistrationSuccessPopup({ isOpen, onClose, registrationId }: RegistrationSuccessPopupProps) {

    const handleCopyRegistrationId = () => {
        navigator.clipboard.writeText(registrationId);
        toast.success('Registration ID copied to clipboard!');
    };

    const handleInviteFriend = () => {
        const shareUrl = window.location.href;
        const text = encodeURIComponent(
            `🚀 Join the NACOS Hackathon !\n\n` +
            `💻 Build innovative solutions\n` +
            `🏆 Win amazing prizes\n` +
            `📅 November 10-12, ${currentYear}\n` +
            `📍 ICT Complex, Bells university of Technology\n\n` +
            `Register here: ${shareUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleJoinCommunity = () => {
        window.open(WHATSAPP_GROUP_LINK, '_blank');
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black/80 p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                                <div className="text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-900/50 border border-green-500/50">
                                        <FaCheckCircle className="h-6 w-6 text-green-500" />
                                    </div>
                                    <Dialog.Title
                                        as="h3"
                                        className="mt-4 text-xl font-semibold leading-6 text-white"
                                    >
                                        Hackathon Registration Successful!
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-300">
                                            Thank you for registering for the NACOS Hackathon! Please save your registration ID.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="rounded-lg bg-green-900/30 p-4 border border-green-500/30">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm font-medium text-green-300">Your Registration ID</div>
                                            <button
                                                onClick={handleCopyRegistrationId}
                                                className="p-2 hover:bg-green-800/50 rounded-lg transition-colors flex items-center gap-2 text-sm text-green-400"
                                                title="Copy Registration ID"
                                            >
                                                <FaCopy className="text-green-500" />
                                                <span>Copy ID</span>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center bg-black/50 rounded-lg p-4 border-2 border-green-500/30">
                                            <span className="font-mono text-2xl font-bold text-green-400 tracking-wider">
                                                {registrationId}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-green-300 font-medium">
                                            ⚠️ Important: Keep this ID safe! You'll need it to verify your registration at the venue.
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-gradient-to-br from-black/80 to-green-900/30 p-6 border border-green-500/20">
                                        <div className="text-center mb-6">
                                            <h4 className="text-lg font-semibold text-white">Join Our Community! 🎉</h4>
                                            <p className="text-sm text-green-300">Stay connected and get updates about the hackathon</p>
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={handleJoinCommunity}
                                                className="w-full group relative flex items-center justify-center gap-3 bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg shadow-green-900/50 hover:shadow-xl"
                                            >
                                                <div className="absolute left-4 bg-white/20 p-2 rounded-lg">
                                                    <FaWhatsapp className="text-2xl" />
                                                </div>
                                                <div className="text-start pl-8">
                                                    <span className="block font-bold text-base">Join Hackathon Group</span>
                                                    <span className="text-xs opacity-90">Get updates & connect with participants</span>
                                                </div>
                                                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    →
                                                </div>
                                            </button>

                                            <div className="relative py-3">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-green-500/20"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-black px-2 text-green-400">
                                                        Help grow our community
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleInviteFriend}
                                                className="w-full group flex items-center justify-between gap-3 bg-black/50 border-2 border-green-500/30 text-green-400 py-4 px-6 rounded-xl hover:bg-green-900/20 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-green-900/50 p-2 rounded-lg">
                                                        <FaShare className="text-lg" />
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="block font-semibold">Invite Friends</span>
                                                        <span className="text-xs text-green-300">Share via WhatsApp</span>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    →
                                                </div>
                                            </button>
                                        </div>

                                        <div className="mt-4 bg-black/50 rounded-lg p-3 border border-green-500/20">
                                            <p className="text-xs text-green-300 text-center leading-relaxed">
                                                Join our vibrant community of innovators! Get instant updates about the hackathon schedule,
                                                resources, and connect with fellow participants. 🚀
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 px-4 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
} 