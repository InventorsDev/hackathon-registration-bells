import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaDownload, FaSearch, FaEye, FaTimes, FaCheck, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Registration {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    registrationId: string;
    verified: boolean;
    timestamp: any;
    department: string;
    level: string;
    teamName?: string;
    institution?: string;
    areasOfAssistance?: {
        courseCode: string;
        topics: string;
    }[];
}

export function Participants() {
    const [students, setStudents] = useState<Registration[]>([]);
    const [filter, setFilter] = useState<'all' | '100' | '200' | '300' | '400' | '500' | 'individual' | 'team'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentData: Registration[] = [];
            querySnapshot.forEach((doc) => {
                studentData.push({ id: doc.id, ...doc.data() } as Registration);
            });
            setStudents(studentData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredStudents = students.filter(student => {
        let matchesFilter = true;

        if (filter === '100' || filter === '200' || filter === '300' || filter === '400' || filter === '500') {
            matchesFilter = student.level === filter;
        } else if (filter === 'individual') {
            matchesFilter = !student.teamName;
        } else if (filter === 'team') {
            matchesFilter = !!student.teamName;
        }

        const matchesSearch =
            student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.registrationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.institution?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleVerify = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistically update the UI first
            const updatedStudents = students.map(student => {
                if (student.id === id) {
                    return { ...student, verified: !currentStatus };
                }
                return student;
            });
            setStudents(updatedStudents);

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
            const originalStudents = students.map(student => {
                if (student.id === id) {
                    return { ...student, verified: currentStatus };
                }
                return student;
            });
            setStudents(originalStudents);
        }
    };

    const exportToCSV = () => {
        try {
            const headers = ['Registration ID', 'Full Name', 'Email', 'Phone', 'Level', 'Department', 'Team', 'Institution', 'Verified'];
            const data = filteredStudents.map(student => [
                student.registrationId || 'N/A',
                student.fullName || 'Not provided',
                student.email || 'No email',
                student.phoneNumber || 'No phone',
                student.level ? `${student.level} Level` : 'Not specified',
                student.department || 'Not specified',
                student.teamName || 'Individual',
                student.institution || 'Not specified',
                student.verified ? 'Yes' : 'No'
            ]);

            const csvContent = [
                headers.join(','),
                ...data.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Export successful!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Hackathon Participants</h1>
                        <p className="text-gray-600">View and manage all registered participants</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="/admin/analytics"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            View Analytics
                        </a>
                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <FaDownload className="mr-2" />
                            Export Data
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin h-12 w-12 border-4 border-green-600 rounded-full border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Search and Filters */}
                        <div className="mb-6 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, team or institution..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('individual')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === 'individual' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Individuals
                                </button>
                                <button
                                    onClick={() => setFilter('team')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === 'team' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Teams
                                </button>
                                <button
                                    onClick={() => setFilter('100')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === '100' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    100 Level
                                </button>
                                <button
                                    onClick={() => setFilter('200')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === '200' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    200 Level
                                </button>
                                <button
                                    onClick={() => setFilter('300')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === '300' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    300 Level
                                </button>
                                <button
                                    onClick={() => setFilter('400')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === '400' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    400 Level
                                </button>
                                <button
                                    onClick={() => setFilter('500')}
                                    className={`px-3 py-2 rounded-lg text-sm ${filter === '500' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    500 Level
                                </button>
                            </div>
                        </div>

                        {/* Participants Table */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID/Matric</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{student.fullName || 'Not provided'}</div>
                                                        <div className="text-xs text-gray-500">{student.email || 'No email'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 font-mono">{student.registrationId || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {student.teamName || 'Individual'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {student.level ? `${student.level} Level` : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {student.institution || 'Not specified'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {student.verified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                            onClick={() => setSelectedStudent(student)}
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            className={`${student.verified ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                                                            onClick={() => handleVerify(student.id, student.verified)}
                                                        >
                                                            {student.verified ? 'Unverify' : 'Verify'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No participants found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Participant Details</h2>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="text-base font-medium">{selectedStudent.fullName || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="text-base">{selectedStudent.email || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="text-base">{selectedStudent.phoneNumber || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Registration ID</p>
                                            <p className="text-base font-mono">{selectedStudent.registrationId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Academic Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Institution</p>
                                            <p className="text-base">{selectedStudent.institution || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Department</p>
                                            <p className="text-base">{selectedStudent.department || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Level</p>
                                            <p className="text-base">{selectedStudent.level ? `${selectedStudent.level} Level` : 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Team</p>
                                            <p className="text-base">{selectedStudent.teamName || 'Individual Participant'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedStudent.areasOfAssistance && selectedStudent.areasOfAssistance.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Areas of Assistance</h3>
                                    <div className="space-y-3">
                                        {selectedStudent.areasOfAssistance.map((area, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                <p className="font-medium text-gray-700">{area.courseCode || 'No course code'}</p>
                                                <p className="text-sm text-gray-600 mt-1">{area.topics || 'No topics specified'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        handleVerify(selectedStudent.id, selectedStudent.verified);
                                        setSelectedStudent(null);
                                    }}
                                    className={`px-4 py-2 rounded-md text-white flex items-center ${selectedStudent.verified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {selectedStudent.verified ? (
                                        <>
                                            <FaTimesCircle className="mr-2" />
                                            Unverify Participant
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck className="mr-2" />
                                            Verify Participant
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 