import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaDownload, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
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
    areasOfAssistance: {
        courseCode: string;
        topics: string;
    }[];
}

export function Participants() {
    const [students, setStudents] = useState<Registration[]>([]);
    const [filter, setFilter] = useState<'all' | '100' | '200'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Registration | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'registrations'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const studentData: Registration[] = [];
            querySnapshot.forEach((doc) => {
                studentData.push({ id: doc.id, ...doc.data() } as Registration);
            });
            setStudents(studentData);
        });

        return () => unsubscribe();
    }, []);

    const filteredStudents = students.filter(student => {
        const matchesFilter = filter === 'all' || student.level === filter;
        const matchesSearch =
            student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.registrationId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const exportToCSV = () => {
        try {
            const headers = ['Registration ID', 'Full Name', 'Email', 'Phone', 'Level', 'Department', 'Courses'];
            const data = filteredStudents.map(student => [
                student.registrationId || 'N/A',
                student.fullName || 'Not provided',
                student.email || 'No email',
                student.phoneNumber || 'No phone',
                student.level ? `${student.level} Level` : 'Not specified',
                student.department ?
                    (student.department === 'computer_science' ? 'Computer Science' : 'IT')
                    : 'Not specified',
                student.areasOfAssistance && student.areasOfAssistance.length > 0
                    ? student.areasOfAssistance.map(area =>
                        `${area.courseCode || 'No code'} (${area.topics || 'No topics'})`
                    ).join('; ')
                    : 'No courses specified'
            ]);

            const csvContent = [
                headers.join(','),
                ...data.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
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
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl xs:text-2xl font-bold text-gray-800">Participants</h1>
                    <p className="text-xs xs:text-sm text-gray-600">View and manage hackathon participants</p>
                </div>
                <div className="w-full xs:w-auto flex flex-col xs:flex-row gap-3">
                    <div className="relative flex-1 xs:flex-none">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search participants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border"
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        <FaDownload className="text-sm" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    All Participants
                </button>
                <button
                    onClick={() => setFilter('individual')}
                    className={`px-4 py-2 rounded-lg ${filter === 'individual' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    Individuals
                </button>
                <button
                    onClick={() => setFilter('team')}
                    className={`px-4 py-2 rounded-lg ${filter === 'team' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    Teams
                </button>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{student.registrationId || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.fullName || 'Not provided'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{student.level ? `${student.level} Level` : 'Not specified'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {student.department ?
                                            (student.department === 'computer_science' ? 'Computer Science' : 'IT')
                                            : 'Not specified'
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div>{student.email || 'No email'}</div>
                                        <div className="text-gray-500">{student.phoneNumber || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <button
                                            onClick={() => setSelectedStudent(student)}
                                            className="text-purple-600 hover:text-purple-800"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{selectedStudent.fullName}</h2>
                                <p className="text-sm text-gray-600">Registration ID: {selectedStudent.registrationId}</p>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Level</h3>
                                    <p className="mt-1">{selectedStudent.level ? `${selectedStudent.level} Level` : 'Not specified'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                                    <p className="mt-1">
                                        {selectedStudent.department ?
                                            (selectedStudent.department === 'computer_science' ? 'Computer Science' : 'IT')
                                            : 'Not specified'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="mt-1">{selectedStudent.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                    <p className="mt-1">{selectedStudent.phoneNumber || 'Not provided'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Courses & Topics</h3>
                                {selectedStudent.areasOfAssistance && selectedStudent.areasOfAssistance.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedStudent.areasOfAssistance.map((area, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                <p className="font-medium text-gray-700">{area.courseCode || 'No course code'}</p>
                                                <p className="text-sm text-gray-600 mt-1">{area.topics || 'No topics specified'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-gray-500">No courses or topics specified</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 