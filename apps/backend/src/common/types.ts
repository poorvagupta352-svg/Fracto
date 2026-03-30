export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseError {
  message: string;
}

export interface SingleResult<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface ListResult<T> {
  data: T[] | null;
  error: SupabaseError | null;
}
