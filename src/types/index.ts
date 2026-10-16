export type ModuleId =
  | "github"
  | "builder"
  | "tutor"
  | "viva"
  | "notes"
  | "coding"
  | "research"
  | "career"
  | "workspace"
  | "chat";

export interface RepoFile {
  path: string;
  type: "file" | "dir";
  size?: number;
}

export interface RepoData {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  defaultBranch: string;
  htmlUrl: string;
  zipUrl: string;
  archiveUrl: string;
  readme: string;
  files: RepoFile[];
  owner?: {
    login: string;
    avatarUrl: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  tags?: string[];
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  startDate?: string;
  dueDate?: string;
  progress?: number;
  milestone?: string;
}

export interface ProjectFile {
  name: string;
  content: string;
  language: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  domain: string;
  description: string;
  connectedRepo?: string;
  tasks: ProjectTask[];
  files: ProjectFile[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VivaQuestion {
  question: string;
  studentAnswer?: string;
  feedback?: string;
  score?: number;
  idealAnswer?: string;
}
