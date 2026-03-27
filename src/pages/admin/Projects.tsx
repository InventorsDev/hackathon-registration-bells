import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaCode, FaSearch, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Project {
    id: string;
    teamName: string;
    projectIdea: string;
    videoLink: string;
    skills: string[];
    members: number;
    rating?: number;
}

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get unique projects based on team names
        const q = query(
            collection(db, 'registrations'),
            where('teamName', '!=', ''),
            orderBy('teamName')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const teamProjects = new Map<string, Project>();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const teamName = data.teamName;

                if (!teamProjects.has(teamName)) {
                    teamProjects.set(teamName, {
                        id: doc.id,
                        teamName,
                        projectIdea: data.projectIdea || 'No project idea specified',
                        videoLink: data.videoLink || "",
                        skills: data.skills || [],
                        members: 1,
                        rating: data.rating
                    });
                } else {
                    const project = teamProjects.get(teamName)!;
                    project.members += 1;
                    project.skills = [...new Set([...project.skills, ...(data.skills || [])])];
                }
            });

            setProjects(Array.from(teamProjects.values()));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredProjects = projects.filter(project =>
        project.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectIdea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleRateProject = async (id: string, rating: number) => {
        try {
            await updateDoc(doc(db, 'registrations', id), { rating });
            toast.success('Project rating updated');
        } catch (error) {
            toast.error('Failed to update rating');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
                        <p className="text-sm text-gray-600">View and rate pitchathon projects</p>
                    </div>
                    <div className="w-full sm:w-auto">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-100 focus:border-green-500 focus:ring-green-500/20"
                            />
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                )}
                
                {!loading && filteredProjects.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <FaCode className="text-4xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No Projects Found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'No projects match your search criteria.' : 'There are no projects registered yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{project.teamName}</h3>
                                            <p className="text-blue-100 text-sm">{project.members} team members</p>
                                        </div>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRateProject(project.id, star)}
                                                    className={`text-lg ${star <= (project.rating || 0) ? 'text-yellow-300' : 'text-white/40'}`}
                                                >
                                                    <FaStar />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Project Idea</h4>
                                        <p className="text-gray-700">{project.projectIdea}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Technologies</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Presentation Video</h4>
                                        <a href={project.videoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                                            {project.videoLink}    
                                        </a>
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