import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [needsCompanyName, setNeedsCompanyName] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const snap = await getDoc(doc(db, 'companies', user.uid));
                if (snap.exists()) {
                    setCompanyName(snap.data().companyName);
                    setNeedsCompanyName(false);
                } else {
                    // First-time sign-in (usually Google) — no company profile saved yet
                    setNeedsCompanyName(true);
                }
            } else {
                setCompanyName('');
                setNeedsCompanyName(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = async (companyNameInput, email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'companies', cred.user.uid), {
            companyName: companyNameInput,
            email,
            createdAt: new Date().toISOString(),
        });
        setCompanyName(companyNameInput);
        setNeedsCompanyName(false);
    };

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const loginWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged fires next and decides needsCompanyName automatically
    };

    const completeCompanyProfile = async (companyNameInput) => {
        if (!currentUser) return;
        await setDoc(doc(db, 'companies', currentUser.uid), {
            companyName: companyNameInput,
            email: currentUser.email,
            createdAt: new Date().toISOString(),
        });
        setCompanyName(companyNameInput);
        setNeedsCompanyName(false);
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                companyName,
                needsCompanyName,
                loading,
                signup,
                login,
                loginWithGoogle,
                completeCompanyProfile,
                logout,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);