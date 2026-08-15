import type { Column as ColumnType, Task } from '../types';
import TaskCard from './TaskCard';

interface Props {
  column: ColumnType;
  allColumns: ColumnType[];
  visibleTasks: Task[];
  totalTaskCount: number;
  onAddTask: (columnId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onMoveTask: (task: Task, columnId: number) => void;
}

export default function Column({
  column,
  allColumns,
  visibleTasks,
  totalTaskCount,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}: Props) {
  return (
    <div className="column">
      <div className="column-header">
        <h3>{column.name}</h3>
        <span className="column-count">{totalTaskCount}</span>
      </div>

      <div className="column-tasks">
        {visibleTasks.length === 0 && (
          <p className="column-empty">
            {totalTaskCount === 0 ? 'No tasks yet.' : 'No tasks match the current filter.'}
          </p>
        )}
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={allColumns}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onMove={onMoveTask}
          />
        ))}
      </div>

      <button type="button" className="add-task-btn" onClick={() => onAddTask(column.id)}>
        + Add task
      </button>
    </div>
  );
}
