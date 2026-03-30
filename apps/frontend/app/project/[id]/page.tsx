'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { projectsApi, tasksApi, type Task } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';

const COLUMNS: { status: Task['status']; label: string; color: string; dot: string }[] = [
  { status: 'todo',        label: 'To Do',       color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  { status: 'in-progress', label: 'In Progress',  color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
  { status: 'done',        label: 'Done',         color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
];

export default function ProjectPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<{ name: string; description?: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      else void load();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [proj, taskList] = await Promise.all([projectsApi.get(id), tasksApi.list(id)]);
      setProject(proj);
      setTasks(taskList);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      if (msg.includes('401') || msg.includes('Unauthorized')) router.replace('/login');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditTask(null); setTitle(''); setDescription(''); setStatus('todo'); setShowForm(true);
  }

  function openEdit(t: Task) {
    setEditTask(t); setTitle(t.title); setDescription(t.description || ''); setStatus(t.status); setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTask) {
        const updated = await tasksApi.update(editTask.id, { title, description, status });
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await tasksApi.create({ title, description, status, project_id: id });
        setTasks((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task: Task, newStatus: Task['status']) {
    try {
      const updated = await tasksApi.update(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-6 py-3.5 flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <span>←</span> Dashboard
        </Link>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-slate-900 truncate">{project?.name ?? '…'}</h1>
          {project?.description && (
            <p className="text-xs text-slate-400 truncate">{project.description}</p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shrink-0"
        >
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </header>

      <main className="px-6 py-8">
        {error && (
          <div className="mb-6 mx-auto max-w-6xl rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Task form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">{editTask ? 'Edit Task' : 'New Task'}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input
                    required
                    autoFocus
                    placeholder="e.g. Design homepage mockup"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea
                    rows={3}
                    placeholder="Add more details…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Task['status'])}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                  >
                    {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    {saving ? 'Saving…' : editTask ? 'Save changes' : 'Create task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-400">Loading tasks…</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3 max-w-6xl mx-auto">
            {COLUMNS.map(({ status: s, label, color, dot }) => {
              const col = tasks.filter((t) => t.status === s);
              return (
                <div key={s} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {/* Column header */}
                  <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${dot}`} />
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                      {col.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="flex-1 p-3 space-y-2.5 min-h-[200px]">
                    {col.map((task) => (
                      <div key={task.id} className="group rounded-xl border border-slate-100 bg-slate-50 p-3.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-slate-800 leading-snug">{task.title}</p>
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(task)} className="rounded p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors text-xs">✏️</button>
                            <button onClick={() => handleDelete(task.id)} className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 transition-colors text-xs">🗑️</button>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-2.5">{task.description}</p>
                        )}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value as Task['status'])}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-indigo-400 cursor-pointer"
                        >
                          {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
                        </select>
                      </div>
                    ))}
                    {col.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-xs text-slate-400">No tasks here</p>
                      </div>
                    )}
                  </div>

                  {/* Add task shortcut */}
                  <div className="px-3 pb-3">
                    <button
                      onClick={openCreate}
                      className="w-full rounded-xl border border-dashed border-slate-200 py-2 text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all"
                    >
                      + Add task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
