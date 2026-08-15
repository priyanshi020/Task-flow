import type { Priority } from '../types';

interface Props {
  priorityFilter: Priority | 'All';
  onPriorityChange: (p: Priority | 'All') => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function FilterBar({
  priorityFilter,
  onPriorityChange,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Priority:</span>
        {(['All', 'Low', 'Medium', 'High'] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={`filter-chip ${priorityFilter === p ? 'active' : ''}`}
            onClick={() => onPriorityChange(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <input
        type="text"
        className="search-input"
        placeholder="Search tasks by title…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
