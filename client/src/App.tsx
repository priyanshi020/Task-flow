import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from './api/client';
import type { Board, Priority, Task, TaskInput } from './types';
import Column from './components/Column';
import FilterBar from './components/FilterBar';
import TaskModal from './components/TaskModal';

// The assignment scopes out multi-board/multi-user support, so we just
// work against a single fixed board (seeded as id 1). See README.
const BOARD_ID = 1;

type ModalState = { mode: 'create'; columnId: number } | { mode: 'edit'; task: Task } | null;

export default function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);

  async function loadBoard() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getBoard(BOARD_ID);
      setBoard(data);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? err.message
          : 'Could not load the board. Please refresh and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, []);

  function showBanner(message: string) {
    setBanner(message);
    window.setTimeout(() => setBanner(null), 4000);
  }

  async function handleCreate(input: TaskInput) {
    if (modal?.mode !== 'create') return;
    const task = await api.createTask(modal.columnId, input);
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === modal.columnId ? { ...c, tasks: [...c.tasks, task] } : c
            ),
          }
        : prev
    );
    setModal(null);
  }

  async function handleEdit(input: TaskInput) {
    if (modal?.mode !== 'edit') return;
    const updated = await api.updateTask(modal.task.id, input);
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((c) => ({
              ...c,
              tasks: c.tasks.map((t) => (t.id === updated.id ? updated : t)),
            })),
          }
        : prev
    );
    setModal(null);
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;

    // Optimistic update, rolled back on failure.
    const snapshot = board;
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((c) => ({
              ...c,
              tasks: c.tasks.filter((t) => t.id !== task.id),
            })),
          }
        : prev
    );

    try {
      await api.deleteTask(task.id);
    } catch (err) {
      setBoard(snapshot);
      showBanner(err instanceof ApiError ? err.message : 'Could not delete the task.');
    }
  }

  async function handleMove(task: Task, columnId: number) {
    if (columnId === task.column_id) return;
    const snapshot = board;

    // Optimistic move for a snappy feel; roll back if the server rejects it.
    setBoard((prev) =>
      prev
        ? {
            ...prev,
            columns: prev.columns.map((c) => {
              if (c.id === task.column_id) return { ...c, tasks: c.tasks.filter((t) => t.id !== task.id) };
              if (c.id === columnId) return { ...c, tasks: [...c.tasks, { ...task, column_id: columnId }] };
              return c;
            }),
          }
        : prev
    );

    try {
      await api.moveTask(task.id, columnId);
    } catch (err) {
      setBoard(snapshot);
      showBanner(err instanceof ApiError ? err.message : 'Could not move the task.');
    }
  }

  const filteredColumns = useMemo(() => {
    if (!board) return [];
    return board.columns.map((col) => ({
      column: col,
      visibleTasks: col.tasks.filter((t) => {
        const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
        const matchesSearch = t.title.toLowerCase().includes(search.trim().toLowerCase());
        return matchesPriority && matchesSearch;
      }),
    }));
  }, [board, priorityFilter, search]);

  if (loading) {
    return <div className="state-message">Loading board…</div>;
  }

  if (loadError || !board) {
    return (
      <div className="state-message error">
        <p>{loadError ?? 'Something went wrong.'}</p>
        <button className="btn-primary" onClick={loadBoard}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{board.name}</h1>
      </header>

      {banner && <div className="banner">{banner}</div>}

      <FilterBar
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="board">
        {filteredColumns.map(({ column, visibleTasks }) => (
          <Column
            key={column.id}
            column={column}
            allColumns={board.columns}
            visibleTasks={visibleTasks}
            totalTaskCount={column.tasks.length}
            onAddTask={(columnId) => setModal({ mode: 'create', columnId })}
            onEditTask={(task) => setModal({ mode: 'edit', task })}
            onDeleteTask={handleDelete}
            onMoveTask={handleMove}
          />
        ))}
      </div>

      {modal && (
        <TaskModal
          mode={modal.mode}
          initialTask={modal.mode === 'edit' ? modal.task : undefined}
          columnName={
            modal.mode === 'create'
              ? board.columns.find((c) => c.id === modal.columnId)?.name ?? ''
              : board.columns.find((c) => c.id === modal.task.column_id)?.name ?? ''
          }
          onSave={modal.mode === 'create' ? handleCreate : handleEdit}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
