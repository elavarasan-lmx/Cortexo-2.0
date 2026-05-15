'use client';

import { ReactNode, createContext, useContext, useState } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tabs — root container
   ───────────────────────────────────────────────────────────────────────────── */

interface TabsProps {
  /** Default active tab id */
  defaultTab: string;
  /** Tab definitions */
  children: ReactNode;
  /** Called when tab changes */
  onChange?: (tabId: string) => void;
  /** Full width tabs */
  fullWidth?: boolean;
}

export function Tabs({ defaultTab, children, onChange, fullWidth = false }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div style={{ width: '100%' }}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TabsList — tab button list
   ───────────────────────────────────────────────────────────────────────────── */

interface TabsListProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function TabsList({ children, fullWidth = false }: TabsListProps) {
  return (
    <div style={{
      display: 'flex',
      gap: fullWidth ? 0 : 4,
      borderBottom: '1px solid rgb(var(--border))',
      backgroundColor: 'rgb(var(--surface-hover))',
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      overflow: 'hidden',
    }}>
      {fullWidth ? (
        <div style={{ display: 'flex', width: '100%' }}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tab — individual tab button
   ───────────────────────────────────────────────────────────────────────────── */

interface TabProps {
  id: string;
  /** Icon before label */
  icon?: ReactNode;
  /** Badge count */
  badge?: number;
  children: ReactNode;
}

export function Tab({ id, icon, badge, children }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px',
        backgroundColor: isActive ? 'rgb(var(--surface))' : 'transparent',
        border: 'none',
        borderBottom: isActive ? '2px solid rgb(var(--primary))' : '2px solid transparent',
        color: isActive ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 150ms',
        flex: 1,
        justifyContent: 'center',
      }}
    >
      {icon && <span style={{ display: 'flex', opacity: isActive ? 1 : 0.6 }}>{icon}</span>}
      {children}
      {badge !== undefined && (
        <span style={{
          marginLeft: 4,
          padding: '2px 6px',
          backgroundColor: isActive ? 'rgb(var(--primary))' : 'rgb(var(--border))',
          color: isActive ? '#fff' : 'rgb(var(--text-muted))',
          borderRadius: 10,
          fontSize: 10,
          fontWeight: 600,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TabsContent — panel that shows when tab is active
   ───────────────────────────────────────────────────────────────────────────── */

interface TabsContentProps {
  /** Matches Tab id */
  tabId: string;
  children: ReactNode;
}

export function TabsContent({ tabId, children }: TabsContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== tabId) return null;

  return (
    <div style={{
      padding: 16,
      backgroundColor: 'rgb(var(--surface))',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      border: '1px solid rgb(var(--border))',
      borderTop: 'none',
    }}>
      {children}
    </div>
  );
}