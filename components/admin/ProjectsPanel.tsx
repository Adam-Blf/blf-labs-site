"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatEuros, type Project, type ProjectTask } from "@/lib/admin/types";
import { addTask, createProject, toggleTask } from "@/app/admin/actions";

/** Creation d'un projet et gestion des taches (checklist). Separe du Kanban :
 * cocher une case et glisser une carte sont deux gestes qui ne doivent pas se
 * marcher dessus. */
export function ProjectsPanel({
  projects,
  tasksByProject,
}: {
  projects: Project[];
  tasksByProject: Record<string, ProjectTask[]>;
}) {
  const [pending, start] = useTransition();
  const [newTask, setNewTask] = useState<Record<string, string>>({});

  return (
    <div className="mt-10 grid gap-8 md:grid-cols-[320px_1fr]">
      <Card className="h-fit p-6">
        <h2 className="title text-lg">Nouveau projet</h2>
        <form
          action={(fd) => start(() => createProject(fd))}
          className="mt-4 flex flex-col gap-3 text-sm"
        >
          <input
            name="title"
            required
            placeholder="Intitulé du projet"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <input
            name="client_name"
            required
            placeholder="Client"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <input
            name="client_email"
            type="email"
            placeholder="Email client (optionnel)"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <input
            name="amount_euros"
            inputMode="decimal"
            placeholder="Montant en euros (optionnel)"
            className="blk-sm bg-paper px-3 py-2 text-ink"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Ajout..." : "Créer le projet"}
          </Button>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="title text-lg">Tâches par projet</h2>
        {projects.length === 0 && (
          <p className="text-sm text-muted">Aucun projet pour l&apos;instant.</p>
        )}
        {projects.map((project) => {
          const tasks = tasksByProject[project.id] ?? [];
          const done = tasks.filter((t) => t.done).length;
          return (
            <Card key={project.id} className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="title">{project.title}</span>
                <span className="text-xs text-muted">
                  {project.client_name}
                  {project.amount_cents != null &&
                    ` - ${formatEuros(project.amount_cents)}`}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {done}/{tasks.length} tâche{tasks.length > 1 ? "s" : ""}
              </p>

              <ul className="mt-3 flex flex-col gap-1">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        start(() => toggleTask(task.id, e.target.checked))
                      }
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span className={task.done ? "line-through text-muted" : ""}>
                      {task.label}
                    </span>
                  </li>
                ))}
              </ul>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const label = newTask[project.id] ?? "";
                  if (!label.trim()) return;
                  start(() => addTask(project.id, label));
                  setNewTask((s) => ({ ...s, [project.id]: "" }));
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  value={newTask[project.id] ?? ""}
                  onChange={(e) =>
                    setNewTask((s) => ({ ...s, [project.id]: e.target.value }))
                  }
                  placeholder="Ajouter une tâche"
                  className="blk-sm flex-1 bg-paper px-3 py-2 text-sm text-ink"
                />
                <Button type="submit" variant="ghost" disabled={pending}>
                  +
                </Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
