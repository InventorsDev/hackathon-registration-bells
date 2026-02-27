import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Initialize required collections
const requiredCollections = ['registrations', 'messages', 'sessions', 'settings', 'teams', 'projects'];

// Check if collections exist and create them if they don't
export const initializeFirestore = async () => {
    try {
        // Check each required collection
        for (const collectionName of requiredCollections) {
            const collectionRef = collection(db, collectionName);
            const snapshot = await getDocs(collectionRef);

            // If collection is empty and it's the settings collection, add default settings
            if (collectionName === 'settings' && snapshot.empty) {
                await setDoc(doc(db, 'settings', 'general'), {
                    whatsappLink: 'https://chat.whatsapp.com/example',
                    venues: [{ name: 'Main Hall', capacity: '200' }],
                    organizer: {
                        name: 'NACOS Executive Committee',
                        title: 'Organizing Committee',
                        email: 'nacos@example.com',
                        phone: '+2348012345678',
                        bio: 'The official organizing committee for NACOS Hackathon 2025.'
                    },
                    hackathonDetails: {
                        startDate: '2025-11-10',
                        endDate: '2025-11-12',
                        theme: 'Innovation for the Future',
                        maxTeamSize: 4,
                        prizes: {
                            first: '₦500,000',
                            second: '₦300,000',
                            third: '₦150,000'
                        }
                    }
                });
                console.log('Created default settings document');
            }

            console.log(`Collection '${collectionName}' is ready`);
        }
    } catch (error) {
        console.error('Error initializing Firestore collections:', error);
    }
};