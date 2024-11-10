import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  email: string;
  createdAt: string;
  lastLogin: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<void>;
  setAdminStatus: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      loading: true,
      error: null,
      isAdmin: false,

      setAdminStatus: (status: boolean) => {
        set({ isAdmin: status });
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          const userProfile = {
            email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isAdmin: false
          };
          
          try {
            await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
          } catch (error) {
            console.error('Error saving to Firestore, using local storage:', error);
          }
          
          set({ userProfile });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Check if this is the admin email
          const isAdmin = email === 'admin@example.com';
          set({ isAdmin });

          try {
            const userRef = doc(db, 'users', userCredential.user.uid);
            await setDoc(userRef, { 
              lastLogin: new Date().toISOString(),
              isAdmin 
            }, { merge: true });
          } catch (error) {
            console.error('Error updating Firestore, using local storage:', error);
          }
          
          await get().fetchUserProfile(userCredential.user.uid);
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          await firebaseSignOut(auth);
          set({ userProfile: null, isAdmin: false });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchUserProfile: async (uid: string) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            set({ 
              userProfile: profile,
              isAdmin: profile.isAdmin || profile.email === 'admin@example.com'
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If offline, check local storage for admin status
          const state = get();
          if (state.user?.email === 'admin@example.com') {
            set({ isAdmin: true });
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAdmin: state.isAdmin,
        userProfile: state.userProfile 
      })
    }
  )
);

// Set up auth state listener
onAuthStateChanged(auth, async (user) => {
  useAuthStore.setState({ user, loading: false });
  if (user) {
    await useAuthStore.getState().fetchUserProfile(user.uid);
  }
});