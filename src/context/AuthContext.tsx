import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { account } from '../lib/appwrite';
import { registerPushNotifications } from '../services/pushNotifications';
import { ID, OAuthProvider } from 'appwrite';

interface AuthContextType {
    user: any | null; // Unified user object
    session: any | null; // For compatibility
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            if (currentUser?.$id) {
                registerPushNotifications(currentUser.$id);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            // First, delete current session if exists to avoid "session already exists" error
            try { await account.deleteSession('current'); } catch(e) {}
            
            await account.createEmailPasswordSession(email, password);
            await refreshUser();
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Erro ao realizar login' };
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            await account.create(ID.unique(), email, password, name);
            // After creation, login automatically
            await account.createEmailPasswordSession(email, password);
            await refreshUser();
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Erro ao criar conta' };
        }
    };

    const signInWithGoogle = async () => {
        const redirectTo = `${window.location.origin}/leagues`;
        console.log('AuthContext: Initiating Appwrite Google Sign-In with redirect to:', redirectTo);
        try {
            account.createOAuth2Session(
                OAuthProvider.Google,
                redirectTo,
                `${window.location.origin}/login`
            );
        } catch (err) {
            console.error('AuthContext: Google Sign-In Error:', err);
        }
    };

    const signOut = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (err) {
            console.error('AuthContext: Error in signOut:', err);
            setUser(null); // Force logout state regardless
        }
    };

    return (
        <AuthContext.Provider value={{ user, session: user, loading, signIn, signUp, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
