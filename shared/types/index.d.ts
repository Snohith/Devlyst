export type ProjectRole = "OWNER" | "EDITOR";

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string | null;
  displayName: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  roomCode: string;
  name: string;
  language: string;
  role: ProjectRole;
  owner: {
    id: string;
    displayName: string;
  };
  fileCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  language: string;
  content: string;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  files: ProjectFile[];
}

export interface ExecutionRequest {
  language: string;
  code: string;
  stdin?: string;
  projectId?: string;
  fileId?: string;
}

export interface ExecutionResult {
  language: string;
  version: string;
  output: string;
  stderr: string | null;
  compileOutput: string | null;
  exitCode: number | null;
  signal: string | null;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
