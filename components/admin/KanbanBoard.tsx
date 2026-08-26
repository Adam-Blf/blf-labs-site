"use client";

import { useState, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Column } from "@/lib/admin/types";

/**
 * Tableau Kanban generique, partage entre les leads et les projets. Les colonnes
 * (statuts) sont passees en prop ; deplacer une carte declenche `onMove`, qui
 * persiste le nouveau statut cote serveur. La carte bouge tout de suite en
 * optimiste, et un echec la remet a sa place.
 */
export type KanbanItem<S extends string> = {
  id: string;
  status: S;
  node: ReactNode;
};

function Card({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`blk-sm bg-paper p-3 text-sm cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-60" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function ColumnDrop<S extends string>({
  column,
  count,
  children,
}: {
  column: Column<S>;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div className="flex min-w-[220px] flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="title text-sm">{column.label}</span>
        <span className="text-xs text-muted">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-col gap-2 rounded-md p-2 transition-colors ${
          isOver ? "bg-support/40" : "bg-surface/50"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function KanbanBoard<S extends string>({
  columns,
  items,
  onMove,
}: {
  columns: Column<S>[];
  items: KanbanItem<S>[];
  onMove: (id: string, status: S) => Promise<void>;
}) {
  const [local, setLocal] = useState(items);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  async function onDragEnd(event: DragEndEvent) {
    const id = String(event.active.id);
    const target = event.over?.id as S | undefined;
    if (!target) return;
    const card = local.find((i) => i.id === id);
    if (!card || card.status === target) return;

    const previous = card.status;
    setLocal((cur) =>
      cur.map((i) => (i.id === id ? { ...i, status: target } : i)),
    );
    try {
      await onMove(id, target);
    } catch {
      // Echec de persistance : on remet la carte dans sa colonne d'origine.
      setLocal((cur) =>
        cur.map((i) => (i.id === id ? { ...i, status: previous } : i)),
      );
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => {
          const cards = local.filter((i) => i.status === col.id);
          return (
            <ColumnDrop key={col.id} column={col} count={cards.length}>
              {cards.map((card) => (
                <Card key={card.id} id={card.id}>
                  {card.node}
                </Card>
              ))}
            </ColumnDrop>
          );
        })}
      </div>
    </DndContext>
  );
}
