import { create } from 'zustand';

interface RealtimeState {
  isConnected: boolean;
  activeUsers: number;
  setConnected: (status: boolean) => void;
  setActiveUsers: (count: number) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  activeUsers: 0,
  setConnected: (status) => set({ isConnected: status }),
  setActiveUsers: (count) => set({ activeUsers: count }),
}));
