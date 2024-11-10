import { create } from 'zustand';
import { Settings } from '../types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateMaxOrdersPerSlot: (value: number) => Promise<void>;
  toggleBlockedDate: (date: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        set({ settings: settingsDoc.data() as Settings });
      } else {
        // Initialize with default settings if none exist
        const defaultSettings: Settings = {
          maxOrdersPerSlot: 3,
          blockedDates: []
        };
        await updateDoc(doc(db, 'settings', 'global'), {
          maxOrdersPerSlot: defaultSettings.maxOrdersPerSlot,
          blockedDates: defaultSettings.blockedDates
        });
        set({ settings: defaultSettings });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ error: 'Failed to fetch settings' });
    } finally {
      set({ loading: false });
    }
  },

  updateMaxOrdersPerSlot: async (value: number) => {
    set({ loading: true, error: null });
    try {
      const { settings } = get();
      if (!settings) return;

      await updateDoc(doc(db, 'settings', 'global'), {
        maxOrdersPerSlot: value
      });

      set({ settings: { ...settings, maxOrdersPerSlot: value } });
    } catch (error) {
      console.error('Error updating max orders:', error);
      set({ error: 'Failed to update max orders per slot' });
    } finally {
      set({ loading: false });
    }
  },

  toggleBlockedDate: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const { settings } = get();
      if (!settings) return;

      const blockedDates = settings.blockedDates.includes(date)
        ? settings.blockedDates.filter(d => d !== date)
        : [...settings.blockedDates, date];

      await updateDoc(doc(db, 'settings', 'global'), {
        blockedDates
      });
      
      set({ settings: { ...settings, blockedDates } });
    } catch (error) {
      console.error('Error toggling blocked date:', error);
      set({ error: 'Failed to update blocked dates' });
    } finally {
      set({ loading: false });
    }
  }
}));