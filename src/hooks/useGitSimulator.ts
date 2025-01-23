import { useState, useCallback } from 'react';
import { GitState, Branch, Commit, StagedFile, WorkingFile } from '../types/git';

const initialState: GitState = {
  currentBranch: 'main',
  branches: [
    { name: 'main', commits: ['initial'] }
  ],
  commits: [
    {
      id: 'initial',
      message: 'Initial commit',
      timestamp: Date.now(),
      parent: null,
      author: 'User',
      email: 'user@example.com'
    }
  ],
  stagingArea: [],
  workingDirectory: [],
  HEAD: 'initial',
  stash: [],
  remotes: [],
  isPushingToRemote: false,
  isFetchingFromRemote: false
};

const sampleFiles = [
  { path: 'index.html', content: '<!DOCTYPE html><html>...</html>' },
  { path: 'styles.css', content: 'body { margin: 0; }' },
  { path: 'app.js', content: 'console.log("Hello");' }
];

export const useGitSimulator = () => {
  const [gitState, setGitState] = useState<GitState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandOutput, setCommandOutput] = useState<string>('');

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateCommitId = () => Math.random().toString(36).substr(2, 7);

  const resetState = useCallback(async () => {
    setIsProcessing(true);
    setCommandOutput('Resetting playground...');
    await delay(800);
    
    // Reset về trạng thái ban đầu với các file mẫu
    setGitState({
      ...initialState,
      workingDirectory: sampleFiles.map(file => ({
        path: file.path,
        status: 'untracked' as const
      }))
    });
    
    setCommandOutput('Playground has been reset to initial state with sample files');
    setIsProcessing(false);
  }, []);

  const simulateCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    setCommandOutput('');
    const parts = command.trim().split(' ');

    if (parts[0] !== 'git') {
      setCommandOutput('Error: Not a git command');
      setIsProcessing(false);
      return;
    }

    try {
      switch (parts[1]) {
        case 'init':
          await delay(1000);
          setGitState({
            ...initialState,
            workingDirectory: sampleFiles.map(file => ({
              path: file.path,
              status: 'untracked' as const
            }))
          });
          setCommandOutput('Initialized empty Git repository');
          break;

        case 'status':
          await delay(500);
          const status = [
            `On branch ${gitState.currentBranch}`,
            `HEAD -> ${gitState.HEAD}`,
            '',
            gitState.stagingArea.length > 0
              ? 'Changes to be committed:'
              : '',
            ...gitState.stagingArea.map(file => `  ${file.status}: ${file.path}`),
            '',
            gitState.workingDirectory.length > 0
              ? 'Changes not staged for commit:'
              : '',
            ...gitState.workingDirectory.map(file => `  ${file.status}: ${file.path}`)
          ].filter(Boolean).join('\\n');
          setCommandOutput(status);
          break;

        case 'log':
          await delay(300);
          const log = gitState.commits
            .map(commit => [
              `commit ${commit.id}${commit.id === gitState.HEAD ? ' (HEAD)' : ''}`,
              `Date: ${new Date(commit.timestamp).toLocaleString()}`,
              '',
              `    ${commit.message}`,
              ''
            ].join('\\n'))
            .join('\\n');
          setCommandOutput(log);
          break;

        case 'stash': {
          if (parts[2] === 'save') {
            const message = parts.slice(3).join(' ') || 'WIP';
            if (gitState.workingDirectory.length === 0 && gitState.stagingArea.length === 0) {
              setCommandOutput('No changes to stash');
              break;
            }
            await delay(500);
            setGitState(prev => ({
              ...prev,
              stash: [{
                id: generateCommitId(),
                message,
                files: [...prev.workingDirectory, ...prev.stagingArea.map(file => ({
                  path: file.path,
                  status: file.status === 'added' ? 'untracked' : file.status
                } as WorkingFile))],
                timestamp: Date.now()
              }, ...prev.stash],
              workingDirectory: [],
              stagingArea: []
            }));
            setCommandOutput(`Saved working directory and index state: ${message}`);
          } else if (parts[2] === 'list') {
            await delay(300);
            const stashList = gitState.stash
              .map((stash, index) => `stash@{${index}}: ${stash.message}`)
              .join('\\n');
            setCommandOutput(stashList || 'No stash entries found');
          } else if (parts[2] === 'pop') {
            if (gitState.stash.length === 0) {
              setCommandOutput('No stash entries found');
              break;
            }
            await delay(500);
            const [stash, ...remainingStash] = gitState.stash;
            setGitState(prev => ({
              ...prev,
              workingDirectory: [...prev.workingDirectory, ...stash.files.filter((file): file is WorkingFile => 
                'status' in file && (file.status === 'modified' || file.status === 'untracked' || file.status === 'deleted')
              )],
              stash: remainingStash
            }));
            setCommandOutput(`Applied stash@{0}: ${stash.message}`);
          }
          break;
        }

        case 'reset':
          if (parts[2] === '--hard' && parts[3]) {
            const commitId = parts[3];
            const targetCommit = gitState.commits.find(c => c.id === commitId);
            if (!targetCommit) {
              setCommandOutput(`Error: commit ${commitId} does not exist`);
              break;
            }
            await delay(800);
            setGitState(prev => ({
              ...prev,
              HEAD: commitId,
              workingDirectory: [],
              stagingArea: []
            }));
            setCommandOutput(`HEAD is now at ${commitId.slice(0, 7)} ${targetCommit.message}`);
          }
          break;

        case 'revert':
          if (parts[2]) {
            const commitId = parts[2];
            const targetCommit = gitState.commits.find(c => c.id === commitId);
            if (!targetCommit) {
              setCommandOutput(`Error: commit ${commitId} does not exist`);
              break;
            }
            await delay(800);
            const newCommit = {
              id: generateCommitId(),
              message: `Revert "${targetCommit.message}"`,
              timestamp: Date.now(),
              parent: gitState.HEAD
            };
            setGitState(prev => ({
              ...prev,
              commits: [newCommit, ...prev.commits],
              HEAD: newCommit.id,
              branches: prev.branches.map(branch =>
                branch.name === prev.currentBranch
                  ? { ...branch, commits: [newCommit.id, ...branch.commits] }
                  : branch
              )
            }));
            setCommandOutput(`Created revert commit ${newCommit.id.slice(0, 7)}`);
          }
          break;

        case 'add': {
          if (parts[2] === '.') {
            await delay(800);
            setCommandOutput('Adding all changes to staging area...');
            await delay(400);
            setGitState(prev => ({
              ...prev,
              stagingArea: [
                ...prev.stagingArea,
                ...prev.workingDirectory.map(file => ({
                  path: file.path,
                  status: file.status === 'untracked' ? ('added' as const) : ('modified' as const)
                }))
              ],
              workingDirectory: []
            }));
            setCommandOutput('Changes staged successfully');
          } else {
            const filePath = parts[2];
            const fileExists = gitState.workingDirectory.find(f => f.path === filePath);
            if (!fileExists) {
              setCommandOutput(`Error: pathspec '${filePath}' did not match any files`);
            } else {
              await delay(600);
              setGitState(prev => ({
                ...prev,
                stagingArea: [
                  ...prev.stagingArea,
                  {
                    path: filePath,
                    status: fileExists.status === 'untracked' ? ('added' as const) : ('modified' as const)
                  }
                ],
                workingDirectory: prev.workingDirectory.filter(f => f.path !== filePath)
              }));
              setCommandOutput(`Added '${filePath}' to staging area`);
            }
          }
          break;
        }

        case 'commit':
          if (parts[2] === '-m' && parts[3]) {
            if (gitState.stagingArea.length === 0) {
              setCommandOutput('Nothing to commit, working tree clean');
              break;
            }
            const message = parts.slice(3).join(' ').replace(/['"]/g, '');
            await delay(1000);
            setCommandOutput('Creating commit...');
            const newCommit: Commit = {
              id: Math.random().toString(36).substr(2, 7),
              message,
              timestamp: Date.now(),
              parent: gitState.commits[0].id
            };
            await delay(500);
            setGitState(prev => ({
              ...prev,
              commits: [newCommit, ...prev.commits],
              stagingArea: [],
              branches: prev.branches.map(branch =>
                branch.name === prev.currentBranch
                  ? { ...branch, commits: [newCommit.id, ...branch.commits] }
                  : branch
              )
            }));
            setCommandOutput(`[${gitState.currentBranch} ${newCommit.id}] ${message}`);
          } else {
            setCommandOutput('Error: please provide a commit message (-m "message")');
          }
          break;

        case 'branch':
          if (parts.length === 1) {
            // List branches
            await delay(300);
            const branchList = gitState.branches
              .map(b => `${b.name === gitState.currentBranch ? '* ' : '  '}${b.name}`)
              .join('\\n');
            setCommandOutput(branchList);
          } else if (parts[2]?.startsWith('-')) {
            // Branch options (-d, -D, etc.)
            const branchName = parts[3];
            if (!branchName) {
              setCommandOutput('Error: branch name required');
              break;
            }
            if (parts[2] === '-d' || parts[2] === '-D') {
              if (branchName === gitState.currentBranch) {
                setCommandOutput(`Error: Cannot delete the currently checked out branch '${branchName}'`);
                break;
              }
              await delay(600);
              setGitState(prev => ({
                ...prev,
                branches: prev.branches.filter(b => b.name !== branchName)
              }));
              setCommandOutput(`Deleted branch ${branchName}`);
            }
          } else {
            // Create new branch
            const newBranchName = parts[2];
            if (gitState.branches.some(b => b.name === newBranchName)) {
              setCommandOutput(`Error: branch '${newBranchName}' already exists`);
              break;
            }
            await delay(500);
            const currentBranch = gitState.branches.find(b => b.name === gitState.currentBranch)!;
            setGitState(prev => ({
              ...prev,
              branches: [...prev.branches, { name: newBranchName, commits: [...currentBranch.commits] }]
            }));
            setCommandOutput(`Created branch '${newBranchName}'`);
          }
          break;

        case 'checkout':
          const isNewBranch = parts[2] === '-b';
          const branchName = isNewBranch ? parts[3] : parts[2];
          
          if (!branchName) {
            setCommandOutput('Error: please specify a branch name');
            break;
          }

          if (isNewBranch) {
            if (gitState.branches.some(b => b.name === branchName)) {
              setCommandOutput(`Error: branch '${branchName}' already exists`);
              break;
            }
            await delay(800);
            setCommandOutput(`Creating new branch '${branchName}'...`);
            const currentBranch = gitState.branches.find(b => b.name === gitState.currentBranch)!;
            await delay(400);
            setGitState(prev => ({
              ...prev,
              currentBranch: branchName,
              branches: [...prev.branches, { name: branchName, commits: [...currentBranch.commits] }]
            }));
            setCommandOutput(`Switched to a new branch '${branchName}'`);
          } else {
            const targetBranch = gitState.branches.find(b => b.name === branchName);
            if (!targetBranch) {
              setCommandOutput(`Error: branch '${branchName}' does not exist`);
              break;
            }
            await delay(600);
            setGitState(prev => ({
              ...prev,
              currentBranch: branchName
            }));
            setCommandOutput(`Switched to branch '${branchName}'`);
          }
          break;

        case 'remote':
          if (parts[2] === 'add' && parts[3] && parts[4]) {
            const remoteName = parts[3];
            const remoteUrl = parts[4];
            await delay(500);
            setGitState(prev => ({
              ...prev,
              remotes: [...prev.remotes, {
                name: remoteName,
                url: remoteUrl,
                branches: [],
                commits: []
              }],
              currentRemote: remoteName
            }));
            setCommandOutput(`Remote '${remoteName}' added with url '${remoteUrl}'`);
          } else if (parts[2] === 'show' && parts[3]) {
            const remoteName = parts[3];
            const remote = gitState.remotes.find(r => r.name === remoteName);
            if (!remote) {
              setCommandOutput(`Error: remote '${remoteName}' not found`);
              break;
            }
            const output = [
              `* remote ${remoteName}`,
              `  URL: ${remote.url}`,
              '  Branches:',
              ...remote.branches.map(b => `    ${b.name}`),
              ''
            ].join('\\n');
            setCommandOutput(output);
          }
          break;

        case 'push': {
          if (!gitState.remotes.length) {
            setCommandOutput('Error: No remote repository configured');
            break;
          }
          
          const pushRemoteName = parts[2] || 'origin';
          const pushBranchName = parts[3] || gitState.currentBranch;
          const pushRemote = gitState.remotes.find(r => r.name === pushRemoteName);
          
          if (!pushRemote) {
            setCommandOutput(`Error: remote '${pushRemoteName}' not found`);
            break;
          }

          setGitState(prev => ({ ...prev, isPushingToRemote: true }));
          await delay(1000);
          setCommandOutput('Counting objects...');
          await delay(500);
          setCommandOutput('Compressing objects...');
          await delay(800);
          setCommandOutput('Writing objects...');
          await delay(600);

          setGitState(prev => {
            const currentBranch = prev.branches.find(b => b.name === prev.currentBranch)!;
            const remoteBranch = pushRemote.branches.find(b => b.name === pushBranchName);
            
            if (remoteBranch) {
              remoteBranch.commits = [...currentBranch.commits];
              remoteBranch.lastCommit = currentBranch.commits[0];
            } else {
              pushRemote.branches.push({
                name: pushBranchName,
                commits: [...currentBranch.commits],
                lastCommit: currentBranch.commits[0]
              });
            }

            const updatedBranches = prev.branches.map(b =>
              b.name === pushBranchName
                ? { ...b, upstream: `${pushRemoteName}/${pushBranchName}`, ahead: 0, behind: 0 }
                : b
            );

            return {
              ...prev,
              branches: updatedBranches,
              isPushingToRemote: false,
              remoteSyncStatus: 'up-to-date'
            };
          });

          setCommandOutput(`Branch '${pushBranchName}' pushed to '${pushRemoteName}/${pushBranchName}'`);
          break;
        }

        case 'fetch': {
          if (!gitState.remotes.length) {
            setCommandOutput('Error: No remote repository configured');
            break;
          }

          const fetchRemoteName = parts[2] || 'origin';
          const fetchRemote = gitState.remotes.find(r => r.name === fetchRemoteName);
          
          if (!fetchRemote) {
            setCommandOutput(`Error: remote '${fetchRemoteName}' not found`);
            break;
          }

          setGitState(prev => ({ ...prev, isFetchingFromRemote: true }));
          await delay(800);
          setCommandOutput('Fetching origin...');
          await delay(600);

          setGitState(prev => {
            const updatedBranches = prev.branches.map(branch => {
              const remoteBranch = fetchRemote.branches.find(rb => rb.name === branch.name);
              if (remoteBranch && branch.upstream) {
                const behind = remoteBranch.commits.length - branch.commits.length;
                return { ...branch, behind: Math.max(0, behind) };
              }
              return branch;
            });

            return {
              ...prev,
              branches: updatedBranches,
              isFetchingFromRemote: false,
              remoteSyncStatus: 'behind'
            };
          });

          setCommandOutput('Remote changes fetched successfully');
          break;
        }

        case 'pull': {
          if (!gitState.remotes.length) {
            setCommandOutput('Error: No remote repository configured');
            break;
          }

          const pullRemoteName = parts[2] || 'origin';
          const pullRemote = gitState.remotes.find(r => r.name === pullRemoteName);
          
          if (!pullRemote) {
            setCommandOutput(`Error: remote '${pullRemoteName}' not found`);
            break;
          }

          setGitState(prev => ({ ...prev, isFetchingFromRemote: true }));
          await delay(800);
          setCommandOutput('Fetching origin...');
          await delay(600);
          setCommandOutput('Updating local branch...');
          await delay(500);

          setGitState(prev => {
            const currentBranch = prev.branches.find(b => b.name === prev.currentBranch)!;
            const remoteBranch = pullRemote.branches.find(rb => rb.name === currentBranch.name);
            
            if (remoteBranch) {
              const updatedBranches = prev.branches.map(b =>
                b.name === currentBranch.name
                  ? { ...b, commits: [...remoteBranch.commits], behind: 0, ahead: 0 }
                  : b
              );

              return {
                ...prev,
                branches: updatedBranches,
                commits: [...remoteBranch.commits.map(id => ({
                  id,
                  message: `Remote commit ${id}`,
                  timestamp: Date.now(),
                  parent: null,
                  author: 'Remote User',
                  email: 'remote@example.com'
                })), ...prev.commits],
                isFetchingFromRemote: false,
                remoteSyncStatus: 'up-to-date'
              };
            }

            return prev;
          });

          setCommandOutput('Successfully pulled changes');
          break;
        }

        case 'clone':
          if (parts[2]) {
            const repoUrl = parts[2];
            const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo';
            
            setIsProcessing(true);
            await delay(1000);
            setCommandOutput('Cloning into ' + repoName + '...');
            await delay(800);
            setCommandOutput('Counting objects...');
            await delay(600);
            setCommandOutput('Receiving objects...');
            await delay(800);
            
            // Mô phỏng clone repository
            setGitState({
              ...initialState,
              remotes: [{
                name: 'origin',
                url: repoUrl,
                branches: [{ name: 'main', commits: ['initial'], lastCommit: 'initial' }],
                commits: [{
                  id: 'initial',
                  message: 'Initial commit',
                  timestamp: Date.now(),
                  parent: null,
                  author: 'Remote User',
                  email: 'remote@example.com'
                }]
              }],
              currentRemote: 'origin',
              branches: [{ 
                name: 'main', 
                commits: ['initial'],
                upstream: 'origin/main',
                ahead: 0,
                behind: 0
              }]
            });
            
            setCommandOutput('Repository cloned successfully');
          } else {
            setCommandOutput('Error: Please provide a repository URL');
          }
          break;

        default:
          setCommandOutput(`Error: unknown git command '${parts[1]}'`);
      }
    } catch (error) {
      setCommandOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [gitState]);

  const simulateFileChange = useCallback(async (path: string, content: string) => {
    setGitState(prev => ({
      ...prev,
      workingDirectory: [
        ...prev.workingDirectory,
        { path, status: 'untracked' as const }
      ]
    }));
  }, []);

  return {
    gitState,
    isProcessing,
    commandOutput,
    simulateCommand,
    simulateFileChange,
    resetState
  };
}; 