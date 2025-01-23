import { useState, useMemo } from 'react'
import CommandCard from '../components/CommandCard'
import { GitCommand, GitCommandCategory } from '../types/git'
import { motion } from 'framer-motion'

const gitCommands: GitCommand[] = [
  {
    id: '1',
    command: 'git init',
    description: 'Initialize a new Git repository',
    category: 'Basic',
    usage: 'git init [directory]', 
    examples: [
      'git init',
      'git init my-project'
    ],
    advanced: 'Creates a new .git directory with subdirectories for objects, refs/heads, refs/tags, and template files.'
  },
  {
    id: '2', 
    command: 'git clone',
    description: 'Clone a repository into a new directory',
    category: 'Basic',
    usage: 'git clone <repository> [directory]',
    examples: [
      'git clone https://github.com/user/repo.git',
      'git clone git@github.com:user/repo.git my-project'
    ],
    advanced: 'Supports various protocols: HTTPS, SSH, and Git. Can specify branch with -b flag.'
  },
  {
    id: '3',
    command: 'git branch',
    description: 'List, create, or delete branches',
    category: 'Branching',
    usage: 'git branch [options] [branch-name]',
    examples: [
      'git branch feature',
      'git branch -d feature',
      'git branch -v'
    ],
    advanced: 'Use -D for force delete, -r for remote branches, -a for all branches.'
  },
  {
    id: '4',
    command: 'git checkout',
    description: 'Switch branches or restore files',
    category: 'Branching',
    usage: 'git checkout <branch>|<commit>|<file>',
    examples: [
      'git checkout main',
      'git checkout -b feature',
      'git checkout -- file.txt'
    ],
    advanced: 'Use -b to create and switch to new branch. -- to distinguish files from branches.'
  },
  {
    id: '5',
    command: 'git add',
    description: 'Add files to staging area',
    category: 'Basic',
    usage: 'git add <pathspec>',
    examples: [
      'git add file.txt',
      'git add .',
      'git add src/*.js'
    ],
    advanced: 'Supports glob patterns. -p for interactive staging, -u to update tracked files.'
  },
  {
    id: '6',
    command: 'git commit',
    description: 'Create a new commit with staged changes',
    category: 'Basic',
    usage: 'git commit [options]',
    examples: [
      'git commit -m "Add feature"',
      'git commit -am "Fix bug"'
    ],
    advanced: '-a to automatically stage modified files, --amend to modify previous commit.'
  },
  {
    id: '7',
    command: 'git merge',
    description: 'Merge a branch into the current branch',
    category: 'Merging',
    usage: 'git merge <branch>',
    examples: [
      'git merge feature',
      'git merge --no-ff feature'
    ],
    advanced: '--no-ff to create merge commit always, --squash to combine commits into one.'
  },
  {
    id: '8',
    command: 'git pull',
    description: 'Fetch and merge changes from remote',
    category: 'Remote',
    usage: 'git pull [remote] [branch]',
    examples: [
      'git pull origin main',
      'git pull --rebase origin main'
    ],
    advanced: '--rebase to rebase instead of merge, --ff-only to ensure fast-forward.'
  },
  {
    id: '9',
    command: 'git push',
    description: 'Push changes to remote repository',
    category: 'Remote',
    usage: 'git push [remote] [branch]',
    examples: [
      'git push origin main',
      'git push -u origin feature'
    ],
    advanced: '-u to set upstream for branch, --force to force push (use with caution).'
  },
  {
    id: '10',
    command: 'git stash',
    description: 'Temporarily store modified files',
    category: 'Stashing',
    usage: 'git stash [push|pop|apply]',
    examples: [
      'git stash save "WIP feature"',
      'git stash pop',
      'git stash list'
    ],
    advanced: 'save to store with message, apply to keep stash, pop to remove after applying.'
  },
  {
    id: '11',
    command: 'git log',
    description: 'View commit history',
    category: 'History',
    usage: 'git log [options]',
    examples: [
      'git log --oneline',
      'git log --graph --decorate',
      'git log -p file.txt'
    ],
    advanced: '--graph for visual view, -p to show patches, --stat for statistics.'
  },
  {
    id: '12',
    command: 'git reset',
    description: 'Reset current HEAD to specified state',
    category: 'History',
    usage: 'git reset [commit] [--soft|--mixed|--hard]',
    examples: [
      'git reset HEAD~1',
      'git reset --hard origin/main'
    ],
    advanced: '--soft keeps changes staged, --mixed unstages, --hard discards changes.'
  },
  {
    id: '13',
    command: 'git revert',
    description: 'Create new commit that undoes previous changes',
    category: 'History',
    usage: 'git revert <commit>',
    examples: [
      'git revert HEAD',
      'git revert abc123'
    ],
    advanced: '-n to prevent automatic commit, can revert merge commits.'
  },
  {
    id: '14',
    command: 'git remote',
    description: 'Manage remote repositories',
    category: 'Remote',
    usage: 'git remote [add|remove|show]',
    examples: [
      'git remote add origin url',
      'git remote -v'
    ],
    advanced: 'show for remote details, prune to cleanup remote branches.'
  },
  {
    id: '15',
    command: 'git config',
    description: 'Configure Git settings',
    category: 'Config',
    usage: 'git config [--global] <key> <value>',
    examples: [
      'git config --global user.name "Name"',
      'git config --list'
    ],
    advanced: '--global for user-wide, --system for machine-wide, --local for repository.'
  },
  {
    id: '16',
    command: 'git fetch',
    description: 'Download objects and refs from remote repository',
    category: 'Remote',
    usage: 'git fetch [remote] [branch]',
    examples: [
      'git fetch origin',
      'git fetch --all'
    ],
    advanced: '--prune to remove remote-tracking refs, --tags to download all tags.'
  },
  {
    id: '17',
    command: 'git rebase',
    description: 'Reapply commits on top of another base',
    category: 'Branching',
    usage: 'git rebase <base>',
    examples: [
      'git rebase main',
      'git rebase -i HEAD~3'
    ],
    advanced: '-i for interactive rebase, --onto for changing base branch.'
  },
  {
    id: '18',
    command: 'git tag',
    description: 'Create, list, delete or verify tags',
    category: 'Basic',
    usage: 'git tag [-a] <tagname> [commit]',
    examples: [
      'git tag v1.0.0',
      'git tag -a v1.0.0 -m "Release version 1.0.0"'
    ],
    advanced: '-a for annotated tags, -d to delete tags, -l to list tags.'
  },
  {
    id: '19',
    command: 'git diff',
    description: 'Show changes between commits, working tree, etc',
    category: 'Basic',
    usage: 'git diff [options] [<commit>] [--] [<path>]',
    examples: [
      'git diff',
      'git diff --staged',
      'git diff main..feature'
    ],
    advanced: '--cached for staged changes, --name-only to show only names.'
  },
  {
    id: '20',
    command: 'git cherry-pick',
    description: 'Apply changes from specific commits',
    category: 'Branching',
    usage: 'git cherry-pick <commit>',
    examples: [
      'git cherry-pick abc123',
      'git cherry-pick main~1'
    ],
    advanced: '-n to not commit automatically, --continue after resolving conflicts.'
  },
  {
    id: '21',
    command: 'git clean',
    description: 'Remove untracked files from working tree',
    category: 'Basic',
    usage: 'git clean [-d] [-f]',
    examples: [
      'git clean -n',
      'git clean -df'
    ],
    advanced: '-n for dry run, -d for directories, -f to force, -x for ignored files.'
  },
  {
    id: '22',
    command: 'git bisect',
    description: 'Use binary search to find bad commit',
    category: 'History',
    usage: 'git bisect <subcommand> <options>',
    examples: [
      'git bisect start',
      'git bisect bad',
      'git bisect good v1.0'
    ],
    advanced: 'Automates bug hunting process using binary search algorithm.'
  },
  {
    id: '23',
    command: 'git show',
    description: 'Show various types of objects',
    category: 'History',
    usage: 'git show [object]',
    examples: [
      'git show HEAD',
      'git show --pretty=format:"%h - %an, %ar : %s" HEAD'
    ],
    advanced: 'Can show commits, tags, trees, and blobs with different formats.'
  },
  {
    id: '24',
    command: 'git reflog',
    description: 'Manage reflog information',
    category: 'History',
    usage: 'git reflog [show|expire|delete]',
    examples: [
      'git reflog',
      'git reflog show main'
    ],
    advanced: 'Records when branches are updated, useful for recovery.'
  },
  {
    id: '25',
    command: 'git submodule',
    description: 'Initialize, update or inspect submodules',
    category: 'Basic',
    usage: 'git submodule [--quiet] [--] [<path>...]',
    examples: [
      'git submodule add https://github.com/user/repo',
      'git submodule update --init'
    ],
    advanced: 'Manages nested repositories within main repository.'
  },
  {
    id: '26',
    command: 'git worktree',
    description: 'Manage multiple working trees',
    category: 'Branching',
    usage: 'git worktree add [-f] [--detach] [--checkout] [--lock]',
    examples: [
      'git worktree add ../hotfix',
      'git worktree list'
    ],
    advanced: 'Allows multiple branches checked out in different directories.'
  },
  {
    id: '27',
    command: 'git blame',
    description: 'Show who last modified each line',
    category: 'History',
    usage: 'git blame [-L range] [--] <file>',
    examples: [
      'git blame file.txt',
      'git blame -L 10,20 file.txt'
    ],
    advanced: '-L for line range, -w ignores whitespace, -M detects moved lines.'
  },
  {
    id: '28',
    command: 'git archive',
    description: 'Create archive of files from named tree',
    category: 'Basic',
    usage: 'git archive [--format=<fmt>] [--prefix=<prefix>/] <tree-ish>',
    examples: [
      'git archive --format=zip HEAD > latest.zip',
      'git archive --prefix=project/ HEAD | gzip > latest.tar.gz'
    ],
    advanced: 'Supports multiple formats like tar and zip, can add prefix to paths.'
  },
  {
    id: '29',
    command: 'git grep',
    description: 'Print lines matching a pattern',
    category: 'Basic',
    usage: 'git grep [-n] [-l] [-i] [-w] <pattern>',
    examples: [
      'git grep "TODO"',
      'git grep -n "function"'
    ],
    advanced: '-n shows line numbers, -l shows only filenames, -i ignores case.'
  },
  {
    id: '30',
    command: 'git gc',
    description: 'Cleanup unnecessary files and optimize local repository',
    category: 'Basic',
    usage: 'git gc [--aggressive] [--auto]',
    examples: [
      'git gc',
      'git gc --aggressive'
    ],
    advanced: '--aggressive for more thorough optimization, --auto runs when needed.'
  },
]

const categories: GitCommandCategory[] = [
  'Basic',
  'Branching',
  'Merging',
  'Stashing',
  'Remote',
  'History',
  'Config'
]

const commandsPerPage = 4; // Số lệnh hiển thị trên mỗi trang

const CheatSheet = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GitCommandCategory | 'All'>('All')
  const [currentPage, setCurrentPage] = useState(1) // Trạng thái cho trang hiện tại

  const filteredCommands = useMemo(() => {
    return gitCommands.filter(command => {
      const matchesSearch = command.command.toLowerCase().includes(search.toLowerCase()) ||
        command.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || command.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [search, selectedCategory])

  // Tính toán số lệnh cần hiển thị cho trang hiện tại
  const paginatedCommands = useMemo(() => {
    const startIndex = (currentPage - 1) * commandsPerPage;
    return filteredCommands.slice(startIndex, startIndex + commandsPerPage);
  }, [filteredCommands, currentPage])

  const totalPages = Math.ceil(filteredCommands.length / commandsPerPage); // Tổng số trang

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">Git Cheat Sheet</h1>
        <p className="text-lg text-base-content/80">
          A comprehensive list of commonly used Git commands with examples and explanations.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search commands..."
            className="input input-bordered w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-none">
          <select
            className="select select-bordered w-full md:w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as GitCommandCategory | 'All')}
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedCommands.map(command => (
          <CommandCard key={command.id} command={command} />
        ))}
      </div>

      {paginatedCommands.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg">No commands found matching your criteria.</p>
        </div>
      )}

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`mx-1 btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 card bg-base-200 shadow-xl"
      >
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">Pro Tips</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Use <code className="text-primary">git status</code> frequently to check repository state</li>
            <li>Always create new branches for features or bug fixes</li>
            <li>Write clear and descriptive commit messages</li>
            <li>Use <code className="text-primary">git stash</code> to temporarily save changes when switching tasks</li>
            <li>Keep commits atomic - each commit should represent a single logical change</li>
            <li>Pull changes from remote before pushing to avoid conflicts</li>
            <li>Use <code className="text-primary">git log --oneline</code> for a compact history view</li>
            <li>Set up global gitignore for common system files</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CheatSheet 