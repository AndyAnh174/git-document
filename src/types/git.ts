export interface GitCommand {
  id: string;
  command: string;
  description: string;
  category: GitCommandCategory;
  usage: string;
  examples: string[];
  advanced?: string;
}

export type GitCommandCategory = 
  | 'Basic'
  | 'Branching'
  | 'Merging'
  | 'Stashing'
  | 'Remote'
  | 'History'
  | 'Config';

export interface RemoteRepository {
  name: string;
  url: string;
  branches: RemoteBranch[];
  commits: Commit[];
}

export interface RemoteBranch {
  name: string;
  commits: string[];
  lastCommit: string;
}

export interface GitState {
  currentBranch: string;
  branches: Branch[];
  commits: Commit[];
  stagingArea: StagedFile[];
  workingDirectory: WorkingFile[];
  HEAD: string;
  stash: StashEntry[];
  remotes: RemoteRepository[];
  currentRemote?: string;
  isPushingToRemote: boolean;
  isFetchingFromRemote: boolean;
  remoteSyncStatus?: 'ahead' | 'behind' | 'diverged' | 'up-to-date';
}

export interface Branch {
  name: string;
  commits: string[];
  upstream?: string; // Format: "remote/branch"
  ahead?: number;
  behind?: number;
}

export interface Commit {
  id: string;
  message: string;
  timestamp: number;
  parent: string | null;
  author?: string;
  email?: string;
}

export interface StagedFile {
  path: string;
  status: 'added' | 'modified' | 'deleted';
}

export interface WorkingFile {
  path: string;
  status: 'modified' | 'untracked' | 'deleted';
}

export interface StashEntry {
  id: string;
  message: string;
  files: (WorkingFile | StagedFile)[];
  timestamp: number;
} 