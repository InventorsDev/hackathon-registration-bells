import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaUsers, FaSearch } from 'react-icons/fa';

interface Registration {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    teamName: string;
    teamSize: string;
    skills: string[];
    projectIdea: string;
    memberDetails: string;
    videoLink: string;
}

export function Teams() {
    const [teams, setTeams] = useState<{ [key: string]: Registration[] }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'registrations'),
            where('teamName', '!=', ''),
            orderBy('teamName')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const teamData: { [key: string]: Registration[] } = {};

            querySnapshot.forEach((doc) => {
                const registration = { id: doc.id, ...doc.data() } as Registration;
                const teamName = registration.teamName;

                if (!teamData[teamName]) {
                    teamData[teamName] = [];
                }

                teamData[teamName].push(registration);
            });

            setTeams(teamData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredTeams = Object.entries(teams).filter(([teamName]) =>
        teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
                        <p className="text-sm text-gray-600">Manage hackathon teams</p>
                    </div>
                    <div className="w-full sm:w-auto">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-100 focus:border-green-500 focus:ring-green-500/20"
                            />
                        </div>
                    </div>
                </div>

                <p className='text-sm mb-3 text-gray-600'>Showing all <strong>{Object.keys(teams).length}</strong> teams</p>

                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                )}
                 
                {!loading && filteredTeams.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Teams Found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'No teams match your search criteria.' : 'There are no teams registered yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map(([teamName, members]) => (
                            <div key={teamName} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-green-600 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-white">{teamName}</h3>
                                    <p className="text-green-100 text-sm">{members[0].teamSize} members</p>
                                </div>
                                <div className="p-6">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Project Idea</h4>
                                        <p className="text-gray-700 text-sm">{members[0]?.projectIdea || 'No project idea specified'}</p>
                                    </div>
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Team Lead</h4>
                                        <ul className="space-y-2">
                                            {members.map((member) => (
                                                <li key={member.id} className="flex items-center justify-between">
                                                    <div className='space-y-1'>
                                                        <p className="font-medium text-gray-800">{member.fullName}</p>
                                                        <p className="text-xs text-gray-500">{member.email}</p>
                                                        <p className="text-xs text-gray-500">{member.phoneNumber}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Team Members</h4>
                                        <ul className="space-y-2">
                                            {members[0].memberDetails.split(",").map((member, index) => (
                                                <p key={member + index} className="text-sm text-gray-600">{member}</p>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(members.flatMap(m => m.skills))).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className='my-2'>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Presentation Video</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {members.map((member) => (
                                                <a 
                                                    key={member.id} href={member.videoLink} target="_blank" rel="noopener noreferrer"
                                                    className='text-xs text-blue-600 hover:underline'
                                                >
                                                    {member.videoLink}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 