import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaChartBar, FaChartPie, FaUsers, FaUserFriends, FaCode, FaGraduationCap, FaCalendarAlt, FaLaptopCode, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Registration {
    id: string;
    registrationId?: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    institution: string;
    college: string;
    department: string;
    matricNumber: string;
    level: string;
    teamName: string;
    teamSize: string;
    projectIdea: string;
    skills: string[];
    timestamp: any;
    verified: boolean;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

export function Analytics() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [registrationsPerPage] = useState(10);
    const [stats, setStats] = useState({
        totalRegistrations: 0,
        verifiedRegistrations: 0,
        pendingRegistrations: 0,
        totalTeams: 0,
        individualParticipants: 0,
        level100Count: 0,
        level200Count: 0,
        level300Count: 0,
        level400Count: 0,
        level500Count: 0,
        topSkills: [] as { skill: string, count: number }[],
        recentRegistrations: [] as Registration[]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);
                const regs: Registration[] = [];
                querySnapshot.forEach((doc) => {
                    regs.push({ id: doc.id, ...doc.data() } as Registration);
                });
                setRegistrations(regs);

                // Calculate stats
                const teams = new Set(regs.filter(r => r.teamName).map(r => r.teamName));

                // Count skills
                const skillsCount: Record<string, number> = {};
                regs.forEach(reg => {
                    if (reg.skills && Array.isArray(reg.skills)) {
                        reg.skills.forEach(skill => {
                            skillsCount[skill] = (skillsCount[skill] || 0) + 1;
                        });
                    }
                });

                // Get top skills
                const topSkills = Object.entries(skillsCount)
                    .map(([skill, count]) => ({ skill, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setStats({
                    totalRegistrations: regs.length,
                    verifiedRegistrations: regs.filter(r => r.verified).length,
                    pendingRegistrations: regs.filter(r => !r.verified).length,
                    totalTeams: teams.size,
                    individualParticipants: regs.filter(r => !r.teamName).length,
                    level100Count: regs.filter(r => r.level === '100').length,
                    level200Count: regs.filter(r => r.level === '200').length,
                    level300Count: regs.filter(r => r.level === '300').length,
                    level400Count: regs.filter(r => r.level === '400').length,
                    level500Count: regs.filter(r => r.level === '500').length,
                    topSkills,
                    recentRegistrations: regs.slice(0, 5)
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredRegistrations(registrations);
        } else {
            const filtered = registrations.filter(reg =>
                reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (reg.institution && reg.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (reg.teamName && reg.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredRegistrations(filtered);
        }
    }, [searchTerm, registrations]);

    // Calculate pagination values
    const indexOfLastRegistration = currentPage * registrationsPerPage;
    const indexOfFirstRegistration = indexOfLastRegistration - registrationsPerPage;
    const currentRegistrations = filteredRegistrations.slice(indexOfFirstRegistration, indexOfLastRegistration);
    const totalPages = Math.ceil(filteredRegistrations.length / registrationsPerPage);

    // Change page function
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleVerify = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistically update the UI first
            const updatedRegistrations = registrations.map(reg => {
                if (reg.id === id) {
                    return { ...reg, verified: !currentStatus };
                }
                return reg;
            });
            setRegistrations(updatedRegistrations);

            // Update stats for optimistic UI
            const newVerifiedCount = currentStatus
                ? stats.verifiedRegistrations - 1
                : stats.verifiedRegistrations + 1;
            const newPendingCount = currentStatus
                ? stats.pendingRegistrations + 1
                : stats.pendingRegistrations - 1;

            // Also update the recent registrations list
            const updatedRecentRegistrations = stats.recentRegistrations.map(reg => {
                if (reg.id === id) {
                    return { ...reg, verified: !currentStatus };
                }
                return reg;
            });

            setStats({
                ...stats,
                verifiedRegistrations: newVerifiedCount,
                pendingRegistrations: newPendingCount,
                recentRegistrations: updatedRecentRegistrations
            });

            // Show success message
            toast.success(`Registration ${!currentStatus ? 'verified' : 'unverified'} successfully`);

            // Then update in the database
            await updateDoc(doc(db, 'registrations', id), {
                verified: !currentStatus
            });
        } catch (error) {
            console.error('Error updating verification status:', error);
            toast.error('Failed to update verification status');

            // Revert the optimistic update if the operation fails
            const originalRegistrations = registrations.map(reg => {
                if (reg.id === id) {
                    return { ...reg, verified: currentStatus };
                }
                return reg;
            });
            setRegistrations(originalRegistrations);

            // Revert recent registrations too
            const originalRecentRegistrations = stats.recentRegistrations.map(reg => {
                if (reg.id === id) {
                    return { ...reg, verified: currentStatus };
                }
                return reg;
            });

            // Revert stats
            setStats({
                ...stats,
                verifiedRegistrations: currentStatus
                    ? stats.verifiedRegistrations + 1
                    : stats.verifiedRegistrations - 1,
                pendingRegistrations: currentStatus
                    ? stats.pendingRegistrations - 1
                    : stats.pendingRegistrations + 1,
                recentRegistrations: originalRecentRegistrations
            });
        }
    };

    const handleViewRegistration = (registration: Registration) => {
        setSelectedRegistration(registration);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRegistration(null);
    };

    const StatCard = ({ title, value, icon, color }: StatCardProps) => (
        <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border-t-4 border-${color}-500`}>
            <div className="flex items-center gap-3 sm:gap-4">
                <div className={`bg-${color}-100 p-2 sm:p-3 rounded-full text-${color}-500 text-lg sm:text-xl`}>
                    {icon}
                </div>
                <div>
                    <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
                </div>
            </div>
        </div>
    );

    // Pagination component
    const Pagination = () => {
        const pageNumbers = [];

        // Generate page numbers
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        // Only show a limited number of page buttons
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        const visiblePageNumbers = pageNumbers.slice(startPage - 1, endPage);

        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{indexOfFirstRegistration + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastRegistration, filteredRegistrations.length)}
                            </span>{' '}
                            of <span className="font-medium">{filteredRegistrations.length}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {startPage > 1 && (
                                <>
                                    <button
                                        onClick={() => paginate(1)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === 1
                                            ? 'bg-green-50 text-green-600'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        1
                                    </button>
                                    {startPage > 2 && (
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                                            ...
                                        </span>
                                    )}
                                </>
                            )}

                            {visiblePageNumbers.map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === number
                                        ? 'bg-green-50 text-green-600'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {number}
                                </button>
                            ))}

                            {endPage < totalPages && (
                                <>
                                    {endPage < totalPages - 1 && (
                                        <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                                            ...
                                        </span>
                                    )}
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === totalPages
                                            ? 'bg-green-50 text-green-600'
                                            : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hackathon Analytics</h1>
                        <p className="text-sm text-gray-600">Overview of registration statistics and insights</p>
                    </div>
                    <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto justify-center sm:justify-start"
                    >
                        Back to Registration
                    </a>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin h-12 w-12 border-4 border-green-600 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                            <StatCard
                                title="Total Registrations"
                                value={stats.totalRegistrations}
                                icon={<FaUsers />}
                                color="green"
                            />
                            <StatCard
                                title="Verified Participants"
                                value={stats.verifiedRegistrations}
                                icon={<FaUserFriends />}
                                color="blue"
                            />
                            <StatCard
                                title="Teams"
                                value={stats.totalTeams}
                                icon={<FaCode />}
                                color="purple"
                            />
                            <StatCard
                                title="Pending Approvals"
                                value={stats.pendingRegistrations}
                                icon={<FaCalendarAlt />}
                                color="yellow"
                            />
                        </div>

                        {/* Detailed Analytics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            {/* Level Distribution */}
                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Level Distribution</h2>
                                    <FaGraduationCap className="text-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">100 Level</span>
                                            <span className="text-sm font-medium text-gray-800">{stats.level100Count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? (stats.level100Count / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">200 Level</span>
                                            <span className="text-sm font-medium text-gray-800">{stats.level200Count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? (stats.level200Count / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">300 Level</span>
                                            <span className="text-sm font-medium text-gray-800">{stats.level300Count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? (stats.level300Count / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">400 Level</span>
                                            <span className="text-sm font-medium text-gray-800">{stats.level400Count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? (stats.level400Count / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">500 Level</span>
                                            <span className="text-sm font-medium text-gray-800">{stats.level500Count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? (stats.level500Count / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Participation Type */}
                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Participation Type</h2>
                                    <FaChartPie className="text-purple-500" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Total Teams</span>
                                            <span className="text-sm font-medium text-gray-800">{stats.totalTeams}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? (stats.totalTeams / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Individual Participants</span>
                                            <span className="text-sm font-medium text-gray-800">{stats.individualParticipants}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? (stats.individualParticipants / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Team Participants</span>
                                            <span className="text-sm font-medium text-gray-800">
                                                {stats.totalRegistrations - stats.individualParticipants}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-500 h-2 rounded-full"
                                                style={{ width: `${stats.totalRegistrations ? ((stats.totalRegistrations - stats.individualParticipants) / stats.totalRegistrations) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Skills */}
                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Top Skills</h2>
                                    <FaLaptopCode className="text-green-500" />
                                </div>
                                <div className="space-y-4">
                                    {stats.topSkills.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-600">{item.skill}</span>
                                                <span className="text-sm font-medium text-gray-800">{item.count}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${Math.max(stats.topSkills[0]?.count || 0, 1) ? (item.count / Math.max(stats.topSkills[0]?.count || 1, 1)) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Registration Status */}
                            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Registration Status</h2>
                                    <FaChartBar className="text-blue-500" />
                                </div>
                                <div className="flex items-center justify-center h-48">
                                    <div className="relative w-40 h-40">
                                        <svg viewBox="0 0 36 36" className="w-full h-full">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#E5E7EB"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#10B981"
                                                strokeWidth="3"
                                                strokeDasharray={`${stats.totalRegistrations ? (stats.verifiedRegistrations / stats.totalRegistrations) * 100 : 0}, 100`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-gray-800">
                                                {stats.totalRegistrations ? Math.round((stats.verifiedRegistrations / stats.totalRegistrations) * 100) : 0}%
                                            </span>
                                            <span className="text-sm text-gray-500">Verified</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-500">Verified</div>
                                        <div className="text-lg font-semibold text-green-600">{stats.verifiedRegistrations}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-500">Pending</div>
                                        <div className="text-lg font-semibold text-yellow-600">{stats.pendingRegistrations}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All Registrations with Search */}
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800">All Registrations</h2>
                                <div className="w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Search registrations..."
                                        className="w-full border border-gray-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="absolute left-3 top-2.5 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID/Matric</th>
                                                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredRegistrations.length > 0 ? (
                                                currentRegistrations.map((reg) => (
                                                    <tr key={reg.id} className="hover:bg-gray-50">
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{reg.fullName}</div>
                                                            <div className="text-xs text-gray-500 sm:hidden">{reg.email}</div>
                                                        </td>
                                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{reg.matricNumber || 'N/A'}</div>
                                                            <div className="text-xs text-gray-400">{reg.registrationId || reg.id.substring(0, 8)}</div>
                                                        </td>
                                                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{reg.department || 'N/A'}</div>
                                                            <div className="text-xs text-gray-400">{reg.college || 'N/A'}</div>
                                                        </td>
                                                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {reg.teamName || 'Individual'}
                                                            {reg.teamName && (
                                                                <div className="text-xs text-gray-400">Size: {reg.teamSize || '1'}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                {reg.level || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                {reg.verified ? 'Verified' : 'Pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                    onClick={() => handleViewRegistration(reg)}
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    className={`${reg.verified ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                                                                    onClick={() => handleVerify(reg.id, reg.verified)}
                                                                >
                                                                    {reg.verified ? 'Unverify' : 'Verify'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No registrations found matching your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Add pagination component */}
                            {filteredRegistrations.length > 0 && <Pagination />}
                        </div>

                        {/* Recent Registrations */}
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Registrations</h2>
                                <FaUsers className="text-blue-500" />
                            </div>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.recentRegistrations.map((reg) => (
                                                <tr key={reg.id}>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{reg.fullName}</div>
                                                        <div className="text-xs text-gray-500 sm:hidden">{reg.email}</div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {reg.level || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {reg.teamName || 'Individual'}
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {reg.verified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Registration Details Modal - Make it more mobile-friendly */}
            {showModal && selectedRegistration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Registration Details</h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="text-base font-medium">{selectedRegistration.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="text-base">{selectedRegistration.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="text-base">{selectedRegistration.phoneNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Matric Number</p>
                                            <p className="text-base">{selectedRegistration.matricNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Registration ID</p>
                                            <p className="text-base">{selectedRegistration.registrationId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Academic Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Institution</p>
                                            <p className="text-base">{selectedRegistration.institution}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">College</p>
                                            <p className="text-base">{selectedRegistration.college || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Department</p>
                                            <p className="text-base">{selectedRegistration.department || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Level</p>
                                            <p className="text-base">{selectedRegistration.level || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleVerify(selectedRegistration.id, selectedRegistration.verified);
                                        closeModal();
                                    }}
                                    className={`px-4 py-2 rounded-md text-white w-full sm:w-auto ${selectedRegistration.verified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {selectedRegistration.verified ? 'Unverify Registration' : 'Verify Registration'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}