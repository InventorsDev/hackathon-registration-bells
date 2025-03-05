import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaSearch, FaUserGraduate, FaClock, FaCheckCircle, FaFilter } from 'react-icons/fa';

interface Registration {
    id: string;
    registrationId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    department: string;
    preferredClass: string;
    timestamp: any;
    status: 'pending' | 'verified';
}

interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    color?: string;
}

interface RegistrationRowProps {
    registration: Registration;
}

interface StatusBadgeProps {
    status: 'pending' | 'verified';
}

interface TableEmptyStateProps {
    searchTerm: string;
}

export function AdminPanel() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Registration));
            setRegistrations(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            setIsLoading(false);
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch =
            reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.phoneNumber.includes(searchTerm);

        if (filter === 'all') return matchesSearch;
        return matchesSearch && reg.status === filter;
    });

    const stats = {
        total: registrations.length,
        pending: registrations.filter(r => r.status === 'pending').length,
        verified: registrations.filter(r => r.status === 'verified').length
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header with Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <FaUserGraduate className="text-2xl text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Registrations</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-100 p-3 rounded-xl">
                                <FaClock className="text-2xl text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, ID or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters - Mobile */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
                    >
                        <span className="font-medium text-gray-700">Filters</span>
                        <FaFilter className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    {showFilters && (
                        <div className="mt-2 p-4 bg-white rounded-xl shadow-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <FilterButton
                                    active={filter === 'all'}
                                    onClick={() => setFilter('all')}
                                    label="All"
                                />
                                <FilterButton
                                    active={filter === 'pending'}
                                    onClick={() => setFilter('pending')}
                                    label="Pending"
                                    color="yellow"
                                />
                                <FilterButton
                                    active={filter === 'verified'}
                                    onClick={() => setFilter('verified')}
                                    label="Verified"
                                    color="green"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters - Desktop */}
                <div className="hidden lg:flex gap-2">
                    <FilterButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                        label="All"
                    />
                    <FilterButton
                        active={filter === 'pending'}
                        onClick={() => setFilter('pending')}
                        label="Pending"
                        color="yellow"
                    />
                    <FilterButton
                        active={filter === 'verified'}
                        onClick={() => setFilter('verified')}
                        label="Verified"
                        color="green"
                    />
                </div>

                {/* Registrations Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Registration ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden sm:table-cell">Department</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <TableLoadingState />
                                ) : filteredRegistrations.length === 0 ? (
                                    <TableEmptyState searchTerm={searchTerm} />
                                ) : (
                                    filteredRegistrations.map((reg) => (
                                        <RegistrationRow key={reg.id} registration={reg} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
const FilterButton = ({ active, onClick, label, color = 'purple' }: FilterButtonProps) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
            ? `bg-${color}-100 text-${color}-700`
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
    >
        {label}
    </button>
);

const TableLoadingState = () => (
    <tr>
        <td colSpan={5} className="px-6 py-8 text-center">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                <p className="text-gray-500">Loading registrations...</p>
            </div>
        </td>
    </tr>
);

const TableEmptyState = ({ searchTerm }: TableEmptyStateProps) => (
    <tr>
        <td colSpan={5} className="px-6 py-8 text-center">
            <p className="text-gray-500">
                {searchTerm
                    ? 'No registrations found matching your search'
                    : 'No registrations available'
                }
            </p>
        </td>
    </tr>
);

const RegistrationRow = ({ registration: reg }: RegistrationRowProps) => (
    <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
            <div>
                <div className="font-medium text-gray-900">{reg.fullName}</div>
                <div className="text-sm text-gray-500 md:hidden">{reg.registrationId}</div>
                <div className="text-sm text-gray-500 sm:hidden">{reg.department}</div>
                <div className="text-sm text-gray-500 lg:hidden">{reg.phoneNumber}</div>
            </div>
        </td>
        <td className="px-6 py-4 hidden md:table-cell">
            <span className="font-mono text-sm text-gray-700">
                {reg.registrationId}
            </span>
        </td>
        <td className="px-6 py-4 hidden sm:table-cell">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {reg.department === 'computer_science' ? 'Computer Science' : 'IT'}
            </span>
        </td>
        <td className="px-6 py-4 hidden lg:table-cell">
            <div className="text-sm text-gray-900">{reg.phoneNumber}</div>
            <div className="text-sm text-gray-500">{reg.email}</div>
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={reg.status} />
        </td>
    </tr>
);

const StatusBadge = ({ status }: StatusBadgeProps) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'verified'
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800'
        }`}>
        {status === 'verified' ? (
            <>
                <FaCheckCircle className="text-green-500" />
                Verified
            </>
        ) : (
            <>
                <FaClock className="text-yellow-500" />
                Pending
            </>
        )}
    </span>
); 