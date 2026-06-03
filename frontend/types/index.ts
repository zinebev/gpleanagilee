// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Project Types
export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  team_size: number;
}

// Task Types
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project: number;
  assigned_to?: User;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: any;
}