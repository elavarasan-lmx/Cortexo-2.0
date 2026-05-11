'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Eye, EyeOff, GripVertical, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { useSidebarFeatures, SECTIONS, SectionMeta } from '@/lib/sidebar-features';
import { useAutoLoadToken } from '@/lib/hooks';
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Toggle Switch ──────────────────────────────────────────────────────────
function ToggleSwitch({ on, color, onClick }: { on: boolean; color: string; onClick: () => void }) {
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      width: '34px', height: '18px', borderRadius: '9px', position: 'relative', flexShrink: 0,
      backgroundColor: on ? color : 'rgb(var(--border))', transition: 'background-color 200ms', cursor: 'pointer',
    }}>
      <div style={{
        position: 'absolute', top: '2px', width: '14px', height: '14px', borderRadius: '50%',
        backgroundColor: '#fff', transition: 'left 200ms', left: on ? '18px' : '2px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

// ─── Helper: find all items metadata from SECTIONS ──────────────────────────
const ALL_ITEMS_MAP = new Map<string, { menuKey: string; label: string }>();
SECTIONS.forEach(s => s.items.forEach(item => ALL_ITEMS_MAP.set(item.menuKey, item)));

// ─── Sortable Sub-Item ─────────────────────────────────────────────────────
function SortableItem({
  menuKey,
  sectionColor,
  on,
  isDragOverlay,
}: {
  menuKey: string;
  sectionColor: string;
  on: boolean;
  isDragOverlay?: boolean;
}) {
  const { toggleItem } = useSidebarFeatures();
  const item = ALL_ITEMS_MAP.get(menuKey);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: menuKey,
    data: { type: 'item' },
  });

  const style: React.CSSProperties = isDragOverlay
    ? { opacity: 0.95, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', borderRadius: '8px', backgroundColor: 'rgb(var(--surface))' }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      };

  if (!item) return null;

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px',
        borderRadius: isDragOverlay ? '8px' : 0,
      }}
        onMouseEnter={(e) => { if (!isDragOverlay) e.currentTarget.style.backgroundColor = 'rgba(var(--primary), 0.03)'; }}
        onMouseLeave={(e) => { if (!isDragOverlay) e.currentTarget.style.backgroundColor = 'transparent'; }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', color: 'rgb(var(--text-muted))' }}>
            <GripVertical size={14} />
          </div>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            backgroundColor: on ? sectionColor + '80' : 'rgb(var(--border))',
          }} />
          <span style={{ fontSize: '13px', color: on ? 'rgb(var(--text-primary))' : 'rgb(var(--text-muted))' }}>{item.label}</span>
          <span style={{ fontSize: '10px', color: 'rgb(var(--text-muted))', fontFamily: "'JetBrains Mono', monospace" }}>{item.menuKey}</span>
        </div>
        {!isDragOverlay && <ToggleSwitch on={on} color={sectionColor} onClick={() => toggleItem(menuKey)} />}
      </div>
    </div>
  );
}

// ─── Droppable Section Container ────────────────────────────────────────────
function DroppableSection({
  section,
  itemKeys,
  allOn,
  allOff,
  isOverSection,
}: {
  section: SectionMeta;
  itemKeys: string[];
  allOn: boolean;
  allOff: boolean;
  isOverSection: boolean;
}) {
  const { toggleItem, permissions } = useSidebarFeatures();
  const { setNodeRef: setDropRef } = useDroppable({ id: `section-${section.title}`, data: { type: 'section', sectionTitle: section.title } });

  return (
    <div ref={setDropRef} style={{
      borderRadius: '12px',
      border: `1px solid ${isOverSection ? section.color : allOff ? 'rgb(var(--border))' : section.color + '30'}`,
      backgroundColor: 'rgb(var(--surface))',
      overflow: 'hidden',
      transition: 'border-color 200ms, box-shadow 200ms',
      boxShadow: isOverSection ? `0 0 0 2px ${section.color}40` : 'none',
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: isOverSection ? section.color + '12' : allOff ? 'transparent' : section.color + '08',
        borderBottom: '1px solid rgba(var(--border), 0.3)',
        transition: 'background-color 200ms',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            backgroundColor: allOff ? 'rgb(var(--text-muted))' : section.color,
          }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--text-primary))' }}>{section.title}</span>
          <span style={{
            padding: '1px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
            backgroundColor: `${section.color}15`, color: section.color,
          }}>
            {itemKeys.filter(k => permissions[k] !== false).length}/{itemKeys.length}
          </span>
          {isOverSection && (
            <span style={{
              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
              backgroundColor: section.color + '20', color: section.color,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <ArrowRightLeft size={10} /> Drop here
            </span>
          )}
        </div>
        <ToggleSwitch on={allOn} color={section.color} onClick={() => {
          itemKeys.forEach((k) => {
            if (allOn) toggleItem(k);
            else if (permissions[k] === false) toggleItem(k);
          });
        }} />
      </div>

      {/* Items */}
      <div style={{ padding: '6px 0', minHeight: '40px' }}>
        <SortableContext items={itemKeys} strategy={verticalListSortingStrategy}>
          {itemKeys.map((menuKey) => {
            const on = permissions[menuKey] !== false;
            return <SortableItem key={menuKey} menuKey={menuKey} sectionColor={section.color} on={on} />;
          })}
        </SortableContext>
        {itemKeys.length === 0 && (
          <div style={{ padding: '12px 16px', fontSize: '12px', color: 'rgb(var(--text-muted))', fontStyle: 'italic', textAlign: 'center' }}>
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sortable Section Wrapper (for reordering sections) ─────────────────────
function SortableSectionWrapper({
  section,
  itemKeys,
  allOn,
  allOff,
  isOverSection,
}: {
  section: SectionMeta;
  itemKeys: string[];
  allOn: boolean;
  allOff: boolean;
  isOverSection: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `section-sort-${section.title}`,
    data: { type: 'section-sort' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Section drag handle - positioned top-left */}
      <div {...attributes} {...listeners} style={{
        position: 'absolute', left: '-28px', top: '12px', cursor: 'grab', color: 'rgb(var(--text-muted))',
        display: 'flex', alignItems: 'center', zIndex: 2,
        padding: '4px', borderRadius: '6px',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgb(var(--primary))'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(var(--text-muted))'; }}>
        <GripVertical size={16} />
      </div>
      <DroppableSection section={section} itemKeys={itemKeys} allOn={allOn} allOff={allOff} isOverSection={isOverSection} />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ModulesPage() {
  useAutoLoadToken();
  const {
    permissions, showAll, hideAll, loadFromApi,
    sectionOrder, itemOrders, itemSectionMap,
    setSectionOrder, setItemOrder, moveItemToSection, resetLayout,
  } = useSidebarFeatures();

  React.useEffect(() => { loadFromApi(); }, [loadFromApi]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overSectionTitle, setOverSectionTitle] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Build the effective sections using the itemSectionMap for reassigned items
  const effectiveSections = useMemo(() => {
    // Start from the base SECTIONS, build a map of sectionTitle -> items
    const sectionItemsMap: Record<string, { menuKey: string; label: string }[]> = {};
    SECTIONS.forEach(s => { sectionItemsMap[s.title] = [...s.items]; });

    // Apply cross-section overrides
    if (itemSectionMap && Object.keys(itemSectionMap).length > 0) {
      // Remove reassigned items from their original sections
      for (const [menuKey, targetSection] of Object.entries(itemSectionMap)) {
        const item = ALL_ITEMS_MAP.get(menuKey);
        if (!item) continue;
        // Remove from all sections
        for (const secTitle of Object.keys(sectionItemsMap)) {
          sectionItemsMap[secTitle] = sectionItemsMap[secTitle].filter(i => i.menuKey !== menuKey);
        }
        // Add to target section
        if (!sectionItemsMap[targetSection]) sectionItemsMap[targetSection] = [];
        sectionItemsMap[targetSection].push(item);
      }
    }

    // Sort sections by sectionOrder
    const sorted = [...SECTIONS]
      .sort((a, b) => {
        const idxA = sectionOrder?.indexOf(a.title) ?? -1;
        const idxB = sectionOrder?.indexOf(b.title) ?? -1;
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      })
      .map(section => {
        const items = sectionItemsMap[section.title] || [];
        // Sort items within section by itemOrders
        const orderMap = itemOrders?.[section.title] || [];
        const sortedItems = [...items].sort((a, b) => {
          const idxA = orderMap.indexOf(a.menuKey);
          const idxB = orderMap.indexOf(b.menuKey);
          return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        });
        return { ...section, items: sortedItems };
      });

    return sorted;
  }, [sectionOrder, itemOrders, itemSectionMap]);

  // Find which section a menuKey currently belongs to
  const findSectionForItem = useCallback((menuKey: string): string | null => {
    for (const section of effectiveSections) {
      if (section.items.some(i => i.menuKey === menuKey)) {
        return section.title;
      }
    }
    return null;
  }, [effectiveSections]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    if (!id.startsWith('section-sort-')) {
      setActiveId(id);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const activeId = active.id as string;
    if (activeId.startsWith('section-sort-')) return; // Don't process section drags here

    // Determine what we're over
    const overId = over.id as string;
    let targetSection: string | null = null;

    if (overId.startsWith('section-')) {
      // Over a droppable section container
      targetSection = overId.replace('section-', '');
    } else if (!overId.startsWith('section-sort-')) {
      // Over another item — find its section
      targetSection = findSectionForItem(overId);
    }

    setOverSectionTitle(targetSection);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverSectionTitle(null);

    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Handle section reordering
    if (activeIdStr.startsWith('section-sort-') && overIdStr.startsWith('section-sort-')) {
      const fromTitle = activeIdStr.replace('section-sort-', '');
      const toTitle = overIdStr.replace('section-sort-', '');
      if (fromTitle !== toTitle) {
        const oldIndex = sectionOrder.indexOf(fromTitle);
        const newIndex = sectionOrder.indexOf(toTitle);
        if (oldIndex !== -1 && newIndex !== -1) {
          setSectionOrder(arrayMove(sectionOrder, oldIndex, newIndex));
        }
      }
      return;
    }

    // Handle item drag
    if (activeIdStr.startsWith('section-sort-')) return;

    const fromSection = findSectionForItem(activeIdStr);
    if (!fromSection) return;

    // Determine target section
    let toSection: string | null = null;
    let overItemKey: string | null = null;

    if (overIdStr.startsWith('section-')) {
      toSection = overIdStr.replace('section-', '');
    } else if (!overIdStr.startsWith('section-sort-')) {
      toSection = findSectionForItem(overIdStr);
      overItemKey = overIdStr;
    }

    if (!toSection) return;

    if (fromSection === toSection) {
      // Same section — just reorder
      const sectionItems = effectiveSections.find(s => s.title === toSection)?.items || [];
      const keys = sectionItems.map(i => i.menuKey);
      const oldIndex = keys.indexOf(activeIdStr);
      const newIndex = overItemKey ? keys.indexOf(overItemKey) : keys.length;
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setItemOrder(toSection, arrayMove(keys, oldIndex, newIndex));
      }
    } else {
      // Cross-section move
      const targetItems = effectiveSections.find(s => s.title === toSection)?.items || [];
      const targetKeys = targetItems.map(i => i.menuKey);
      const insertIndex = overItemKey ? targetKeys.indexOf(overItemKey) : targetKeys.length;
      moveItemToSection(activeIdStr, fromSection, toSection, insertIndex >= 0 ? insertIndex : undefined);
    }
  };

  const totalItems = SECTIONS.reduce((n, s) => n + s.items.length, 0);
  const visibleItems = effectiveSections.reduce((n, s) => n + s.items.filter(i => permissions[i.menuKey] !== false).length, 0);

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
    border: '1px solid rgb(var(--border))', cursor: 'pointer',
    backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text-secondary))',
    display: 'flex', alignItems: 'center', gap: '5px',
    transition: 'all 150ms',
  };

  const activeItem = activeId ? ALL_ITEMS_MAP.get(activeId) : null;
  const activeSectionColor = activeId ? (() => {
    const sec = effectiveSections.find(s => s.items.some(i => i.menuKey === activeId));
    return sec?.color || '#888';
  })() : '#888';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 4px' }}>Sidebar Modules</h1>
          <p style={{ fontSize: '13px', color: 'rgb(var(--text-secondary))', margin: 0 }}>
            {visibleItems} of {totalItems} modules visible — drag items between sections to reorganize
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={resetLayout} style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--primary))'; e.currentTarget.style.color = 'rgb(var(--primary))'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; }}>
            <RotateCcw style={{ width: 13, height: 13 }} /> Reset
          </button>
          <button onClick={showAll} style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; }}>
            <Eye style={{ width: 13, height: 13 }} /> Show All
          </button>
          <button onClick={hideAll} style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgb(var(--border))'; e.currentTarget.style.color = 'rgb(var(--text-secondary))'; }}>
            <EyeOff style={{ width: 13, height: 13 }} /> Hide All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '32px' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={effectiveSections.map(s => `section-sort-${s.title}`)}
            strategy={verticalListSortingStrategy}
          >
            {effectiveSections.map((section) => {
              const itemKeys = section.items.map(i => i.menuKey);
              const allOn = itemKeys.every((k) => permissions[k] !== false);
              const allOff = itemKeys.length > 0 && itemKeys.every((k) => permissions[k] === false);
              const isOver = overSectionTitle === section.title;
              return (
                <SortableSectionWrapper
                  key={section.title}
                  section={section}
                  itemKeys={itemKeys}
                  allOn={allOn}
                  allOff={allOff}
                  isOverSection={isOver}
                />
              );
            })}
          </SortableContext>

          {/* Drag overlay — the floating ghost item */}
          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
            {activeId && activeItem ? (
              <SortableItem
                menuKey={activeId}
                sectionColor={activeSectionColor}
                on={permissions[activeId] !== false}
                isDragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
