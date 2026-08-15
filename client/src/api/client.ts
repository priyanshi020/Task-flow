import type { Board, Task, TaskInput } from '../types';

// In dev, Vite proxies /api -> http://localhost:4000 (see vite.config.ts).
// In production you'd set this to the deployed backend's URL.
const BASE_URL = '/api';

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    // Network failure - backend unreachable, offline, etc.
    throw new ApiError('Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON response (shouldn't normally happen) - fall through to status check below.
  }

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : 'Something went wrong. Please try again.';
    throw new ApiError(message);
  }

  return body as T;
}

export const api = {
  getBoard: (boardId: number) => request<Board>(`/boards/${boardId}`),

  createTask: (columnId: number, input: TaskInput) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ columnId, ...input }),
    }),

  updateTask: (taskId: number, input: TaskInput) =>
    request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  moveTask: (taskId: number, columnId: number) =>
    request<Task>(`/tasks/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ columnId }),
    }),

  deleteTask: (taskId: number) =>
    request<void>(`/tasks/${taskId}`, { method: 'DELETE' }),
};
