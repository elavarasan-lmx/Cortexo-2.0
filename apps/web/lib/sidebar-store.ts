import { create } from 'zustand';

/**
 * Shared sidebar state so both <Sidebar> and <DashboardLayout>
 * stay in sync when the sidebar is collapsed / expanded.
 * Also manages mobile drawer open/close state.
 */
interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
  toggleMobile: () => void;
}

export const SIDEBAR_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 68;
export const MOBILE_BREAKPOINT = 768;

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (v: boolean) => set({ collapsed: v }),
  setMobileOpen: (v: boolean) => set({ mobileOpen: v }),
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
}));
