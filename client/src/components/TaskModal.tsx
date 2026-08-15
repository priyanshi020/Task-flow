import { useState, type FormEvent } from 'react';
import type { Priority, Task, TaskInput } from '../types';

interface Props {
  mode: 'create' | 'edit';
  initialTask?: Task;
  columnName: string;
  onSave: (input: TaskInput) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({ mode, initialTask, columnName, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? 'Medium');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (title.trim().length === 0) {
      setTitleError('Title is required.');
      return;
    }
    setTitleError(null);
    setFormError(null);
    setSaving(true);

    try {
      await onSave({ title: title.trim(), description: description.trim() || null, priority });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === 'create' ? `New task in ${columnName}` : 'Edit task'}</h3>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Title *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            {titleError && <span className="field-error">{titleError}</span>}
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          <label className="field">
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          {formError && <div className="form-error">{formError}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
