'use client';

import { ReactNode, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItem<T> {
  id: string;
  data: T;
}

interface SortableListProps<T> {
  /** Items to render */
  items: SortableItem<T>[];
  /** Called when order changes */
  onReorder: (items: SortableItem<T>[]) => void;
  /** Render each item */
  renderItem: (item: SortableItem<T>, isDragging: boolean) => ReactNode;
  /** Enable drag handle only */
  handleOnly?: boolean;
}

/**
 * SortableList — wraps @dnd-kit for reorderable lists.
 *
 * Usage:
 *   <SortableList
 *     items={items}
 *     onReorder={setItems}
 *     renderItem={(item, dragging) => (
 *       <Card>{item.data.name}</Card>
 *     )}
 *   />
 */
export function SortableList<T>({
  items,
  onReorder,
  renderItem,
  handleOnly = false,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item) => (
            <SortableItemWrapper
              key={item.id}
              id={item.id}
              handleOnly={handleOnly}
            >
              {renderItem(item, false)}
            </SortableItemWrapper>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <div style={{ opacity: 0.8, transform: 'scale(1.02)', boxShadow: 'var(--shadow-lg)' }}>
            {renderItem(activeItem, true)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SortableItemWrapper — individual sortable item
   ───────────────────────────────────────────────────────────────────────────── */

interface SortableItemWrapperProps {
  id: string;
  handleOnly: boolean;
  children: ReactNode;
}

function SortableItemWrapper({ id, handleOnly, children }: SortableItemWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {handleOnly ? (
          <button
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              padding: 4,
              border: 'none',
              background: 'none',
              color: 'rgb(var(--text-muted))',
            }}
          >
            <GripVertical size={16} />
          </button>
        ) : (
          <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: 4 }}>
            <GripVertical size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </div>
        )}
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SortableCard — pre-styled card for sortable items
   ───────────────────────────────────────────────────────────────────────────── */

interface SortableCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  onDelete?: () => void;
}

export function SortableCard({ id, title, subtitle, icon, action, onDelete }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: 'rgb(var(--surface))',
        border: '1px solid rgb(var(--border))',
        borderRadius: 'var(--radius-md)',
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: 4 }}>
        <GripVertical size={16} style={{ color: 'rgb(var(--text-muted))' }} />
      </div>
      {icon && (
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: 'rgb(var(--surface-hover))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'rgb(var(--text-muted))' }}>{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}