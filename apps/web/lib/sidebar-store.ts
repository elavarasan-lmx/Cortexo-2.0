import { create } from 'zustand';

/**
 * Shared sidebar state so both <Sidebar> and <DashboardLayout>
 * stay in sync when the sidebar is collapsed / expanded.
 */
interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 68;

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (v: boolean) => set({ collapsed: v }),
}));
