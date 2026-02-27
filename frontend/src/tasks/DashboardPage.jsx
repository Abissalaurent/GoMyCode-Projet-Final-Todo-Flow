import React, { useEffect, useMemo, useState } from 'react';
import { Plus, LogOut, Filter } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE = 'http://localhost:5000/api';

const STATUS_CONFIG = {
  todo: { label: 'À faire', color: 'border-amber-500/60 bg-amber-500/5' },
  in_progress: { label: 'En cours', color: 'border-sky-500/60 bg-sky-500/5' },
  done: { label: 'Terminé', color: 'border-emerald-500/60 bg-emerald-500/5' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
  });

  async function fetchTasks(nextFilter = filter) {
    setError('');
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextFilter !== 'all') {
        params.set('status', nextFilter);
      }
      const res = await fetch(`${API_BASE}/tasks?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement des tâches');
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCounts = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    }),
    [tasks]
  );

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la création');
      setTasks((prev) => [data, ...prev]);
      setForm({ title: '', description: '', status: 'todo' });
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    }
  }

  async function updateTask(id, patch) {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la mise à jour');
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    }
  }

  async function deleteTask(id) {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la suppression');
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message || 'Erreur réseau');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Bonjour, {user?.name || 'Utilisateur'} 👋
          </h1>
          <p className="text-xs text-slate-400">
            Gérez vos tâches par statut et gardez une vue claire sur votre journée.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </button>
      </div>

      <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-semibold">{filteredCounts.total}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-slate-400">À faire</p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">{filteredCounts.todo}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-slate-400">En cours</p>
          <p className="mt-1 text-2xl font-semibold text-sky-300">
            {filteredCounts.in_progress}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="text-slate-400">Terminées</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-300">{filteredCounts.done}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1.4fr)]">
        <form
          onSubmit={handleCreateTask}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-100">Nouvelle tâche</h2>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">Titre</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500/70 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1"
              placeholder="Ex: Finaliser la maquette du dashboard"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500/70 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1"
              placeholder="Détails optionnels, checklist, lien, etc."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">Statut initial</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none ring-indigo-500/70 focus:border-indigo-500 focus:ring-1"
            >
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/40 transition hover:bg-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Ajouter la tâche
          </button>
        </form>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-100">Tâches</p>
            </div>
            <div className="flex gap-1 rounded-full bg-slate-900/90 p-1 text-[11px]">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'todo', label: 'À faire' },
                { id: 'in_progress', label: 'En cours' },
                { id: 'done', label: 'Terminées' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFilter(f.id);
                    fetchTasks(f.id);
                  }}
                  className={`rounded-full px-2.5 py-1 ${
                    filter === f.id
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
            {loading && (
              <p className="text-xs text-slate-400">Chargement des tâches en cours…</p>
            )}
            {!loading && tasks.length === 0 && (
              <p className="text-xs text-slate-500">
                Aucune tâche pour le moment. Créez votre première tâche à gauche.
              </p>
            )}
            {tasks.map((task) => (
              <div
                key={task._id}
                className="group flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 hover:border-slate-600"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.isCompleted || task.status === 'done'}
                      onChange={(e) =>
                        updateTask(task._id, {
                          isCompleted: e.target.checked,
                          status: e.target.checked ? 'done' : 'todo',
                        })
                      }
                      className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-emerald-400 focus:ring-0"
                    />
                    <p className="text-xs font-medium text-slate-100">{task.title}</p>
                  </div>
                  {task.description && (
                    <p className="pl-5 text-[11px] text-slate-400">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 pl-5">
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span className="text-[11px] text-slate-500">
                        Échéance : {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTask(task._id)}
                  className="mt-1 hidden rounded-full border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-100 hover:bg-red-500/20 group-hover:inline-flex"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

