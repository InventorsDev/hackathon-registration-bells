import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FaCheck, FaSpinner, FaSearch, FaUserGraduate, FaClock, FaArrowLeft, FaBook, FaCode } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Registration {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    registrationId: string;
    verified: boolean;
    timestamp: any;
    institution: string;
    level: string;
    teamName: string;
    teamSize: string;
    projectIdea: string;
    skills: string[];
    dietaryRestrictions: string;
    tshirtSize: string;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    filteredRegistrations: Registration[];
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: string;
    className?: string;
    isText?: boolean;
}

interface StatusBadgeProps {
    verified: boolean;
}

export function AdminDashboard() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const regs: Registration[] = [];
            querySnapshot.forEach((doc) => {
                regs.push({ id: doc.id, ...doc.data() } as Registration);
            });
            setRegistrations(regs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleVerify = async (id: string) => {
        try {
            await updateDoc(doc(db, 'registrations', id), {
                verified: true
            });
            toast.success('Registration verified successfully!');
        } catch (error) {
            toast.error('Failed to verify registration');
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const searchLower = searchTerm.toLowerCase().trim();

        // Check all searchable fields
        return (
            reg.fullName?.toLowerCase().includes(searchLower) ||
            reg.email?.toLowerCase().includes(searchLower) ||
            reg.registrationId?.toLowerCase().includes(searchLower) ||
            reg.phoneNumber?.includes(searchTerm) ||
            reg.institution?.toLowerCase().includes(searchLower) ||
            reg.level?.includes(searchTerm) ||
            reg.teamName?.toLowerCase().includes(searchLower) ||
            reg.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
            reg.dietaryRestrictions?.toLowerCase().includes(searchLower) ||
            reg.tshirtSize?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const paginatedRegistrations = filteredRegistrations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        total: registrations.length,
        verified: registrations.filter(r => r.verified).length,
        pending: registrations.filter(r => !r.verified).length,
        todayCount: registrations.filter(r =>
            new Date(r.timestamp?.toDate()).toDateString() === new Date().toDateString()
        ).length,
        teams: new Set(registrations.filter(r => r.teamName).map(r => r.teamName)).size
    };

    const getMostRequestedCourse = () => {
        const courseCounts = registrations
            .filter(reg => reg.skills)
            .flatMap(reg => reg.skills.map(skill => skill.trim()))
            .reduce((acc, skill) => {
                acc[skill] = (acc[skill] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(courseCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    };

    const getMostCommonTopic = () => {
        const topicCounts = registrations
            .filter(reg => reg.skills)
            .flatMap(reg =>
                reg.skills.flatMap(skill =>
                    skill.split(',').map(topic => topic.trim())
                )
            ).reduce((acc, topic) => {
                acc[topic] = (acc[topic] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    };

    const getTopTopics = (limit: number) => {
        const topicCounts = registrations
            .filter(reg => reg.skills)
            .flatMap(reg =>
                reg.skills.flatMap(skill =>
                    skill.split(',').map(topic => topic.trim())
                )
            ).reduce((acc, topic) => {
                acc[topic] = (acc[topic] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="text-4xl text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-4">
                <div>
                    <h1 className="text-xl xs:text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-xs xs:text-sm text-gray-600">Monitor registration statistics and student data</p>
                </div>
                <div className="w-full xs:w-auto flex flex-col xs:flex-row gap-2">
                    {/* <div className="relative flex-1 xs:flex-none">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border"
                        />
                    </div> */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-colors duration-200"
                    >
                        <FaArrowLeft className="text-xs" />
                        <span className=" xs:inline">Back to Registration</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid - Keep existing stats but improve layout */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4">
                <StatCard
                    title="Total"
                    value={stats.total}
                    icon={<FaUserGraduate />}
                    color="purple"
                    className="col-span-1"
                />
                <StatCard
                    title="Today's Registrations"
                    value={stats.todayCount}
                    icon={<FaClock />}
                    color="blue"
                    className="col-span-1"
                />
                <StatCard
                    title="Verified"
                    value={stats.verified}
                    icon={<FaCheck />}
                    color="green"
                    className="col-span-1"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<FaClock />}
                    color="yellow"
                    className="col-span-1"
                />
                <StatCard
                    title="100 Level Students"
                    value={registrations.filter(r => r.level === '100').length}
                    icon={<FaUserGraduate />}
                    color="indigo"
                    className="col-span-1"
                />
                <StatCard
                    title="200 Level Students"
                    value={registrations.filter(r => r.level === '200').length}
                    icon={<FaUserGraduate />}
                    color="blue"
                    className="col-span-1"
                />
                <StatCard
                    title="CS Students"
                    value={registrations.filter(r => r.institution === 'computer_science').length}
                    icon={<FaUserGraduate />}
                    color="purple"
                />
                <StatCard
                    title="IT Students"
                    value={registrations.filter(r => r.institution === 'it').length}
                    icon={<FaUserGraduate />}
                    color="blue"
                />
                <StatCard
                    title="Most Requested Course"
                    value={getMostRequestedCourse()}
                    icon={<FaBook />}
                    color="indigo"
                    isText
                />
                <StatCard
                    title="Most Common Topic"
                    value={getMostCommonTopic()}
                    icon={<FaCode />}
                    color="pink"
                    isText
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm sm:text-lg font-semibold mb-4">Department Distribution</h2>
                        <div className="h-[300px]">
                            <Bar
                                data={{
                                    labels: ['Computer Science', 'IT'],
                                    datasets: [{
                                        label: 'Registrations by Department',
                                        data: [
                                            registrations.filter(r => r.institution === 'computer_science').length,
                                            registrations.filter(r => r.institution === 'it').length,
                                        ],
                                        backgroundColor: ['rgba(147, 51, 234, 0.5)', 'rgba(59, 130, 246, 0.5)'],
                                    }]
                                }}
                                options={{ maintainAspectRatio: false }}
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm sm:text-lg font-semibold mb-4">Level Distribution</h2>
                        <div className="h-[300px]">
                            <Bar
                                data={{
                                    labels: ['100 Level', '200 Level'],
                                    datasets: [{
                                        label: 'Registrations by Level',
                                        data: [
                                            registrations.filter(r => r.level === '100').length,
                                            registrations.filter(r => r.level === '200').length,
                                        ],
                                        backgroundColor: ['rgba(79, 70, 229, 0.5)', 'rgba(59, 130, 246, 0.5)'],
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm sm:text-lg font-semibold mb-4">Level-Department Distribution</h2>
                        <div className="h-[300px]">
                            <Bar
                                data={{
                                    labels: ['100 Level CS', '100 Level IT', '200 Level CS', '200 Level IT'],
                                    datasets: [{
                                        label: 'Registrations by Level and Department',
                                        data: [
                                            registrations.filter(r => r.level === '100' && r.institution === 'computer_science').length,
                                            registrations.filter(r => r.level === '100' && r.institution === 'it').length,
                                            registrations.filter(r => r.level === '200' && r.institution === 'computer_science').length,
                                            registrations.filter(r => r.level === '200' && r.institution === 'it').length,
                                        ],
                                        backgroundColor: [
                                            'rgba(79, 70, 229, 0.5)',  // Indigo for 100 CS
                                            'rgba(79, 70, 229, 0.3)',  // Light Indigo for 100 IT
                                            'rgba(59, 130, 246, 0.5)', // Blue for 200 CS
                                            'rgba(59, 130, 246, 0.3)', // Light Blue for 200 IT
                                        ],
                                    }]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                stepSize: 1
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm sm:text-lg font-semibold mb-4">Popular Topics</h2>
                        <div className="h-[300px]">
                            <Bar
                                data={{
                                    labels: getTopTopics(5).map(([topic]) => topic),
                                    datasets: [{
                                        label: 'Most Requested Topics',
                                        data: getTopTopics(5).map(([, count]) => count),
                                        backgroundColor: 'rgba(147, 51, 234, 0.5)',
                                    }]
                                }}
                                options={{ maintainAspectRatio: false }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 xs:p-6 border-b">
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
                        <div>
                            <h2 className="text-base xs:text-lg font-semibold">Recent Registrations</h2>
                            <p className="text-xs xs:text-sm text-gray-600">Latest registrations</p>
                        </div>
                        <div className="w-full xs:w-auto relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, course..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page when searching
                                }}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-medium text-gray-500 uppercase hidden md:table-cell">ID</th>
                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-medium text-gray-500 uppercase hidden sm:table-cell">Department</th>
                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-medium text-gray-500 uppercase hidden lg:table-cell">Contact</th>
                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-medium text-gray-500 uppercase hidden sm:table-cell">Level</th>
                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedRegistrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50">
                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                        <div>
                                            <div className="font-medium text-gray-900 text-[10px] xs:text-xs sm:text-sm">
                                                {reg.fullName}
                                            </div>
                                            <div className="text-[9px] xs:text-[10px] text-gray-500 md:hidden">
                                                {reg.registrationId}
                                            </div>
                                            <div className="text-[9px] xs:text-[10px] text-gray-500 sm:hidden">
                                                {reg.institution}
                                            </div>
                                            <div className="text-[9px] xs:text-[10px] text-gray-500 lg:hidden">
                                                {reg.phoneNumber}
                                            </div>
                                            <div className="text-[9px] xs:text-[10px] text-gray-500 sm:hidden">
                                                Level {reg.level}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 hidden md:table-cell">
                                        <span className="font-mono text-[9px] xs:text-xs text-gray-700">
                                            {reg.registrationId}
                                        </span>
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 hidden sm:table-cell">
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium bg-purple-100 text-purple-800">
                                            {reg.institution === 'computer_science' ? 'Computer Science' : 'IT'}
                                        </span>
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 hidden lg:table-cell">
                                        <div className="text-xs text-gray-900">
                                            {reg.phoneNumber}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {reg.email}
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 hidden sm:table-cell">
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium bg-blue-100 text-blue-800">
                                            Level {reg.level}
                                        </span>
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                        <StatusBadge verified={reg.verified} />
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                        {!reg.verified && (
                                            <button
                                                onClick={() => handleVerify(reg.id)}
                                                className="text-purple-600 hover:text-purple-900 text-[10px] xs:text-xs"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    filteredRegistrations={filteredRegistrations}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />
            </div>
        </div>
    );
}

// Helper Components
const StatCard = ({ title, value, icon, color = 'purple', className = '', isText = false }: StatCardProps) => (
    <div className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-2 sm:gap-3">
            <div className={`bg-${color}-100 p-1.5 sm:p-2 lg:p-3 rounded-lg`}>
                <div className={`text-base xs:text-lg sm:text-xl lg:text-2xl text-${color}-600`}>{icon}</div>
            </div>
            <div>
                <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600">{title}</p>
                <p className={`text-sm xs:text-base sm:text-lg lg:text-2xl font-bold text-gray-900 ${isText ? 'text-gray-500' : ''}`}>{value}</p>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ verified }: StatusBadgeProps) => (
    <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${verified
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800'
        }`}>
        {verified ? (
            <>
                <FaCheck className="text-[8px] xs:text-xs text-green-500" />
                <span className="text-[9px] xs:text-xs">Verified</span>
            </>
        ) : (
            <>
                <FaClock className="text-[8px] xs:text-xs text-yellow-500" />
                <span className="text-[9px] xs:text-xs">Pending</span>
            </>
        )}
    </span>
);

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, filteredRegistrations }: PaginationProps) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, filteredRegistrations.length)}
                        </span> of{' '}
                        <span className="font-medium">{filteredRegistrations.length}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === page
                                    ? 'z-10 bg-purple-600 text-white'
                                    : 'text-gray-900 hover:bg-gray-50'
                                    } border border-gray-300`}
                            >
                                {page}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
};