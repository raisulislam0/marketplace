export type UserRole = "admin" | "buyer" | "problem_solver";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  profile?: ProblemSolverProfile;
}

export interface ProblemSolverProfile {
  bio?: string;
  skills: string[];
  experience_years?: number;
  portfolio_url?: string;
}

export type ProjectStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Project {
  id: string;
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
  requirements: string[];
  buyer_id: string;
  assigned_solver_id?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = "pending" | "accepted" | "rejected";

export interface Request {
  id: string;
  project_id: string;
  solver_id: string;
  message?: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "completed"
  | "rejected";

export interface Task {
  id: string;
  project_id: string;
  solver_id: string;
  title: string;
  description: string;
  deadline?: string;
  metadata?: Record<string, any>;
  status: TaskStatus;
  submission_file?: string;
  submission_date?: string;
  review_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
