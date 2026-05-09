import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import { useToastStore } from './toast-store';
import { NAVIGATION, type NavSection } from './nav-config';

/**
 * Sidebar Feature Visibility Store — DB-backed
 *
 * Loads menu items from DB via /menu-items API.
 * Falls back to hardcoded NAVIGATION if API is offline or DB empty.
 * Each menuKey = the href path (e.g. "/pipelines", "/servers").
 */

/** Section metadata for the Settings UI */
export interface SectionMeta {
  title: string;
  color: string;
  items: { menuKey: string; label: string; emoji?: string }[];
}

/** Convert NAVIGATION config to SECTIONS format (fallback) */
const navToSections = (nav: NavSection[]): SectionMeta[] =>
  nav.map(section => ({
    title: section.title,
    color: section.color,
    items: section.items.map(item => ({
      menuKey: item.href,
      label: item.label,
      emoji: item.emoji,
    })),
  }));

/** Default sections from hardcoded config */
const DEFAULT_SECTIONS = navToSections(NAVIGATION);

interface SidebarFeaturesState {
  /** Menu sections from DB (or fallback) */
  sections: SectionMeta[];
  /** menuKey → visible. If key is missing, default is true. */
  permissions: Record<string, boolean>;
  /** Whether data has been loaded from API */
  loaded: boolean;
  /** Loading state */
  loading: boolean;
  /** Whether menu was loaded from DB */
  fromDb: boolean;
  /** Load menu structure from DB + permissions from API */
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
      sections: DEFAULT_SECTIONS,
      permissions: {},
      loaded: false,
      loading: false,
      fromDb: false,
      sectionOrder: DEFAULT_SECTIONS.map(s => s.title),
      itemOrders: DEFAULT_SECTIONS.reduce((acc, s) => {
        acc[s.title] = s.items.map(i => i.menuKey);
        return acc;
      }, {} as Record<string, string[]>),
      itemSectionMap: {},

      loadFromApi: async () => {
        if (get().loaded || get().loading) return;
        set({ loading: true });
        try {
          api.loadToken();

          // 1. Try to load menu structure from DB
          let dbSections: SectionMeta[] | null = null;
          try {
            const menuRes = await api.getMenuItems();
            const data = menuRes as any;
            const sections = data?.sections || data?.data?.sections;
            if (sections && sections.length > 0) {
              dbSections = sections.map((s: any) => ({
                title: s.title,
                color: s.color,
                items: s.items.map((i: any) => ({
                  menuKey: i.href,
                  label: i.label,
                  emoji: i.emoji,
                })),
              }));
            }
          } catch {
            // DB not seeded or API offline — use fallback
          }

          const finalSections = dbSections || DEFAULT_SECTIONS;

          // 2. Load permissions
          let perms: Record<string, boolean> = {};
          try {
            const res = await api.getMenuPermissions();
            const apiPerms = (res as unknown as { permissions?: Record<string, boolean>; data?: { permissions?: Record<string, boolean> } });
            perms = apiPerms?.permissions || apiPerms?.data?.permissions || {};
          } catch {
            // Keep local cache
          }

          const merged = { ...get().permissions, ...perms };

          set({
            sections: finalSections,
            permissions: merged,
            loaded: true,
            loading: false,
            fromDb: !!dbSections,
            sectionOrder: finalSections.map(s => s.title),
            itemOrders: finalSections.reduce((acc, s) => {
              acc[s.title] = s.items.map(i => i.menuKey);
              return acc;
            }, {} as Record<string, string[]>),
          });
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
        get().sections.forEach((s) => s.items.forEach((i) => { perms[i.menuKey] = true; }));
        set({ permissions: perms });
        api.updateMenuPermissions(perms)
          .then(() => useToastStore.getState().success('All modules shown', 'All sidebar items are now visible'))
          .catch(() => useToastStore.getState().error('Save failed', 'Could not update permissions'));
      },

      hideAll: () => {
        const perms: Record<string, boolean> = {};
        get().sections.forEach((s) => s.items.forEach((i) => { perms[i.menuKey] = false; }));
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
        const sections = get().sections;
        set({
          sectionOrder: sections.map(s => s.title),
          itemOrders: sections.reduce((acc, s) => {
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

// Re-export SECTIONS for backward compatibility
export const SECTIONS = DEFAULT_SECTIONS;
