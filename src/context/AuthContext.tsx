import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pet } from '../types';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Extend Supabase User or create a compatible interface
interface User {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
    role?: string;
}

    interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
    pets: Pet[];
    addPet: (pet: Pet) => void;
    refreshPets: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [pets, setPets] = useState<Pet[]>([]);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                mapUser(session.user);
                fetchPets(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                mapUser(session.user);
                fetchPets(session.user.id);
            } else {
                setUser(null);
                setPets([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapUser = async (authUser: SupabaseUser) => {
        // Fetch user profile from 'users' table which includes the role
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
        
        setUser({
            id: authUser.id,
            email: authUser.email,
            name: userData?.full_name || authUser.user_metadata?.full_name || 'Usuário',
            avatar: authUser.user_metadata?.avatar_url,
            // Use role from users table, default to 'tutor'
            role: userData?.role || 'tutor'
        });
        setLoading(false);
    };

    const fetchPets = async (userId: string) => {
        const { data: petsData } = await supabase
            .from('pets')
            .select('*')
            .eq('owner_id', userId);
        
        if (petsData) {
             const mappedPets: Pet[] = petsData.map((p: any) => ({
                id: p.id,
                name: p.name,
                breed: p.breed,
                age: p.age,
                gender: p.gender,
                weight: p.weight,
                chipId: p.chip_id, 
                image: p.image_url || '',
                color: p.color || 'orange'
             }));
             setPets(mappedPets);
        }
    };

    const addPet = (pet: Pet) => {
        setPets(prev => [...prev, pet]);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setPets([]);
    };

    const refreshPets = async () => {
        if (user?.id) {
            await fetchPets(user.id);
        }
    }

    return (
        <AuthContext.Provider value={{ user, session, isAuthenticated: !!session, loading, signOut, pets, addPet, refreshPets }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};