import type { Column, Task } from '../types';

interface Props {
  task: Task;
  columns: Column[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, columnId: number) => void;
}

const priorityClass: Record<Task['priority'], string> = {
  Low: 'priority-badge priority-low',
  Medium: 'priority-badge priority-medium',
  High: 'priority-badge priority-high',
};

export default function TaskCard({ task, columns, onEdit, onDelete, onMove }: Props) {
  return (
    <div className="task-card">
      <div className="task-card-top">
        <span className={priorityClass[task.priority]}>{task.priority}</span>
      </div>

      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-card-actions">
        <select
          className="move-select"
          value={task.column_id}
          onChange={(e) => onMove(task, Number(e.target.value))}
          aria-label={`Move "${task.title}" to another column`}
        >
          {columns.map((col) => (
            <option key={col.id} value={col.id}>
              {col.id === task.column_id ? `${col.name} (current)` : `Move to ${col.name}`}
            </option>
          ))}
        </select>

        <div className="task-card-buttons">
          <button type="button" className="btn-link" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button type="button" className="btn-link btn-danger" onClick={() => onDelete(task)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
