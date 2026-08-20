import { supabaseServer } from "@/lib/supabase-server";
import {
  PROJECT_COLUMNS,
  formatEuros,
  type Project,
  type ProjectTask,
} from "@/lib/admin-types";
import { KanbanBoard, type KanbanItem } from "@/components/admin/KanbanBoard";
import { ProjectsPanel } from "@/components/admin/ProjectsPanel";
import { updateProjectStatus } from "@/app/admin/actions";

/** Suivi de livraison des projets clients. Kanban pour l'avancement, checklist
 * de taches en dessous. */
export async function SectionProjets() {
  const supabase = await supabaseServer();

  const [{ data: projectsData }, { data: tasksData }] = supabase
    ? await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, created_at, title, client_name, client_email, status, amount_cents, due_date, notes, position",
          )
          .order("position", { ascending: true }),
        supabase
          .from("project_tasks")
          .select("id, project_id, label, done, position")
          .order("position", { ascending: true }),
      ])
    : [{ data: null }, { data: null }];

  const projects = (projectsData ?? []) as Project[];
  const tasks = (tasksData ?? []) as ProjectTask[];

  const tasksByProject: Record<string, ProjectTask[]> = {};
  for (const task of tasks) {
    (tasksByProject[task.project_id] ??= []).push(task);
  }

  const items: KanbanItem<Project["status"]>[] = projects.map((project) => {
    const t = tasksByProject[project.id] ?? [];
    const done = t.filter((x) => x.done).length;
    return {
      id: project.id,
      status: project.status,
      node: (
        <div className="flex flex-col gap-1">
          <span className="title">{project.title}</span>
          <span className="text-xs text-muted">{project.client_name}</span>
          {project.amount_cents != null && (
            <span className="text-xs text-muted">
              {formatEuros(project.amount_cents)}
            </span>
          )}
          {t.length > 0 && (
            <span className="text-xs text-muted">
              {done}/{t.length} tache{t.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      ),
    };
  });

  return (
    <section className="space-y-8">

      <KanbanBoard
        columns={PROJECT_COLUMNS}
        items={items}
        onMove={updateProjectStatus}
      />

      <ProjectsPanel projects={projects} tasksByProject={tasksByProject} />
    </section>
  );
}
