import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import { useToastStore } from './toast-store';

/**
 * Sidebar Feature Visibility Store — DB-backed
 *
 * Loads per-user menu permissions from the API (backed by DB).
 * Falls back to "all visible" if API is offline.
 * Each menuKey = the href path (e.g. "/pipelines", "/provision").
 *
 * Admin can restrict other users via the admin endpoints.
 */

/** Section metadata for the Settings UI */
export interface SectionMeta {
  title: string;
  color: string;
  items: { menuKey: string; label: string }[];
}

export const SECTIONS: SectionMeta[] = [
  {
    title: 'PROJECTS', color: '#818CF8',
    items: [{ menuKey: '/projects', label: 'All Projects' }],
  },
  {
    title: 'CI/CD', color: '#10B981',
    items: [
      { menuKey: '/pipelines', label: 'Pipelines' },
      { menuKey: '/pipelines/runs', label: 'Pipeline Runs' },
      { menuKey: '/pipelines/editor', label: 'Pipeline Editor' },
      { menuKey: '/deployments', label: 'Deployments' },
      { menuKey: '/deployments/canary', label: 'Canary Releases' },
      { menuKey: '/rollbacks', label: 'Rollbacks' },
    ],
  },
  {
    title: 'BUGS & ERRORS', color: '#EF4444',
    items: [
      { menuKey: '/errors', label: 'Errors' },
      { menuKey: '/root-causes', label: 'Root Causes' },
      { menuKey: '/scans', label: 'Scan Results' },
    ],
  },
  {
    title: 'OPERATIONS', color: '#F59E0B',
    items: [
      { menuKey: '/postmortem', label: 'Postmortem' },
      { menuKey: '/deprecation', label: 'Deprecations' },
    ],
  },
  {
    title: 'INFRASTRUCTURE', color: '#06B6D4',
    items: [
      { menuKey: '/servers', label: 'Servers' },
      { menuKey: '/servers/mounts', label: 'Server Mounts' },
      { menuKey: '/logs', label: 'Log Viewer' },
    ],
  },
  {
    title: 'AGENT INTELLIGENCE', color: '#A78BFA',
    items: [
      { menuKey: '/agent/memory', label: 'Agent Memory' },
      { menuKey: '/agent/skills', label: 'Skill Library' },
      { menuKey: '/agent/context', label: 'Context Monitor' },
      { menuKey: '/agent/performance', label: 'Agent Performance' },
      { menuKey: '/agent/runner', label: 'Agent Runner' },
      { menuKey: '/agent/marketplace', label: 'Marketplace' },
    ],
  },
  {
    title: 'SYNC & MIGRATION', color: '#F97316',
    items: [
      { menuKey: '/sync', label: 'Source Sync' },
      { menuKey: '/db-migration', label: 'DB Migration' },
    ],
  },
  {
    title: 'ANALYTICS', color: '#14B8A6',
    items: [
      { menuKey: '/analytics', label: 'Insights' },
      { menuKey: '/reports', label: 'Reports' },
      { menuKey: '/analytics/audit', label: 'Activity Log' },
    ],
  },
  {
    title: 'TOOLS', color: '#6B7280',
    items: [
      { menuKey: '/mysql', label: 'MySQL' },
      { menuKey: '/docs', label: 'Docs' },
    ],
  },
  {
    title: 'SOURCE REGISTRY', color: '#EC4899',
    items: [
      { menuKey: '/sources', label: 'Managed Sources' },
      { menuKey: '/sources/clients', label: 'Client Configs' },
      { menuKey: '/sources/provision', label: 'New Client Wizard' },
    ],
  },
  {
    title: 'TESTING', color: '#8B5CF6',
    items: [
      { menuKey: '/testing/load', label: 'Load Test' },
      { menuKey: '/testing/socket', label: 'Socket Test' },
      { menuKey: '/testing/module', label: 'Module Test' },
      { menuKey: '/testing/checklist', label: 'Checklist' },
      { menuKey: '/testing/api-health', label: 'API Health' },
      { menuKey: '/testing/ssl', label: 'SSL Monitor' },
    ],
  },
];

interface SidebarFeaturesState {
  /** menuKey → visible. If key is missing, default is true. */
  permissions: Record<string, boolean>;
  /** Whether data has been loaded from API */
  loaded: boolean;
  /** Loading state */
  loading: boolean;
  /** Load from API */
  loadFromApi: () => Promise<void>;
  /** Toggle a single menu item and save to API */
  toggleItem: (menuKey: string) => void;
  /** Set a single item and save to API */
  setItem: (menuKey: string, visible: boolean) => void;
  /** Show all items */
  showAll: () => void;
  /** Hide all items */
  hideAll: () => void;
  /** Check if a menu item is visible */
  isVisible: (menuKey: string) => boolean;
  /** Custom order of main sections */
  sectionOrder: string[];
  /** Custom order of items within each section */
  itemOrders: Record<string, string[]>;
  /** menuKey → sectionTitle override (for cross-section moves) */
  itemSectionMap: Record<string, string>;
  /** Update section order */
  setSectionOrder: (order: string[]) => void;
  /** Update item order in a section */
  setItemOrder: (sectionTitle: string, order: string[]) => void;
  /** Move item from one section to another */
  moveItemToSection: (menuKey: string, fromSection: string, toSection: string, insertIndex?: number) => void;
  /** Reset layout to defaults */
  resetLayout: () => void;
}

export const useSidebarFeatures = create<SidebarFeaturesState>()(
  persist(
    (set, get) => ({
      permissions: {},
      loaded: false,
      loading: false,
      sectionOrder: SECTIONS.map(s => s.title),
      itemOrders: SECTIONS.reduce((acc, s) => {
        acc[s.title] = s.items.map(i => i.menuKey);
        return acc;
      }, {} as Record<string, string[]>),
      itemSectionMap: {},

      loadFromApi: async () => {
        if (get().loaded || get().loading) return;
        set({ loading: true });
        try {
          api.loadToken();
          const res = await api.getMenuPermissions();
          const apiPerms = (res as unknown as { permissions?: Record<string, boolean>; data?: { permissions?: Record<string, boolean> } });
          const perms = apiPerms?.permissions || apiPerms?.data?.permissions || {};
          // Merge API permissions over local cache (API is source of truth)
          const merged = { ...get().permissions, ...perms };
          set({ permissions: merged, loaded: true, loading: false });
        } catch {
          // API offline — keep localStorage permissions (already hydrated by persist)
          set({ loaded: true, loading: false });
        }
      },

      toggleItem: (menuKey) => {
        const current = get().permissions[menuKey] ?? true;
        const newVal = !current;
        set((s) => ({ permissions: { ...s.permissions, [menuKey]: newVal } }));
        // Save to API in background
        api.updateMenuPermissions({ [menuKey]: newVal }).catch(() => {});
      },

      setItem: (menuKey, visible) => {
        set((s) => ({ permissions: { ...s.permissions, [menuKey]: visible } }));
        api.updateMenuPermissions({ [menuKey]: visible }).catch(() => {});
      },

      showAll: () => {
        const perms: Record<string, boolean> = {};
        SECTIONS.forEach((s) => s.items.forEach((i) => { perms[i.menuKey] = true; }));
        set({ permissions: perms });
        api.updateMenuPermissions(perms)
          .then(() => useToastStore.getState().success('All modules shown', 'All sidebar items are now visible'))
          .catch(() => useToastStore.getState().error('Save failed', 'Could not update permissions'));
      },

      hideAll: () => {
        const perms: Record<string, boolean> = {};
        SECTIONS.forEach((s) => s.items.forEach((i) => { perms[i.menuKey] = false; }));
        set({ permissions: perms });
        api.updateMenuPermissions(perms)
          .then(() => useToastStore.getState().info('All modules hidden', 'Toggle items back from Settings'))
          .catch(() => useToastStore.getState().error('Save failed', 'Could not update permissions'));
      },

      isVisible: (menuKey) => {
        return get().permissions[menuKey] !== false;
      },

      setSectionOrder: (order) => {
        set({ sectionOrder: order });
      },

      setItemOrder: (sectionTitle, order) => {
        set((s) => ({ itemOrders: { ...s.itemOrders, [sectionTitle]: order } }));
      },

      moveItemToSection: (menuKey, fromSection, toSection, insertIndex) => {
        set((s) => {
          const newItemSectionMap = { ...s.itemSectionMap, [menuKey]: toSection };
          const newItemOrders = { ...s.itemOrders };
          // Remove from source section order
          newItemOrders[fromSection] = (newItemOrders[fromSection] || []).filter(k => k !== menuKey);
          // Add to target section order
          const targetOrder = (newItemOrders[toSection] || []).filter(k => k !== menuKey);
          if (insertIndex !== undefined && insertIndex >= 0) {
            targetOrder.splice(insertIndex, 0, menuKey);
          } else {
            targetOrder.push(menuKey);
          }
          newItemOrders[toSection] = targetOrder;
          return { itemSectionMap: newItemSectionMap, itemOrders: newItemOrders };
        });
      },

      resetLayout: () => {
        set({
          sectionOrder: SECTIONS.map(s => s.title),
          itemOrders: SECTIONS.reduce((acc, s) => {
            acc[s.title] = s.items.map(i => i.menuKey);
            return acc;
          }, {} as Record<string, string[]>),
          itemSectionMap: {},
        });
        useToastStore.getState().success('Layout reset', 'Sidebar restored to defaults');
      },
    }),
    {
      name: 'cortexo-sidebar-storage',
      partialize: (state) => ({
        permissions: state.permissions,
        sectionOrder: state.sectionOrder,
        itemOrders: state.itemOrders,
        itemSectionMap: state.itemSectionMap,
      }),
    }
  )
);
