import { useEffect, useState } from 'react'
import Terminal from '../components/Terminal'
import RepositoryVisualizer from '../components/RepositoryVisualizer'
import { useGitSimulator } from '../hooks/useGitSimulator'
import { motion } from 'framer-motion'

const supportedCommands = [
  {
    category: 'Basic',
    commands: [
      {
        name: 'git init',
        description: 'Initialize a new repository',
        example: 'git init'
      },
      {
        name: 'git status',
        description: 'View the current state of the repository',
        example: 'git status'
      },
      {
        name: 'git add',
        description: 'Add files to staging area',
        example: 'git add index.html\ngit add .'
      },
      {
        name: 'git commit',
        description: 'Create a new commit with a message',
        example: 'git commit -m "Add new feature"'
      }
    ]
  },
  {
    category: 'Branch & Merge',
    commands: [
      {
        name: 'git branch',
        description: 'Create or list branches',
        example: 'git branch\ngit branch feature'
      },
      {
        name: 'git checkout',
        description: 'Switch to another branch',
        example: 'git checkout main\ngit checkout -b feature'
      },
      {
        name: 'git merge',
        description: 'Merge current branch with another branch',
        example: 'git merge feature'
      }
    ]
  },
  {
    category: 'Remote',
    commands: [
      {
        name: 'git clone',
        description: 'Create a copy of a remote repository',
        example: 'git clone https://github.com/user/repo.git'
      },
      {
        name: 'git remote',
        description: 'Manage remote repositories',
        example: 'git remote add origin https://github.com/user/repo.git\ngit remote show origin'
      },
      {
        name: 'git push',
        description: 'Push changes to remote repository',
        example: 'git push origin main'
      },
      {
        name: 'git fetch',
        description: 'Get updates from remote repository',
        example: 'git fetch origin'
      },
      {
        name: 'git pull',
        description: 'Fetch and merge changes from remote repository',
        example: 'git pull origin main'
      }
    ]
  },
  {
    category: 'History & Undo',
    commands: [
      {
        name: 'git log',
        description: 'View commit history',
        example: 'git log'
      },
      {
        name: 'git reset',
        description: 'Reset to a specific commit',
        example: 'git reset --hard abc123'
      },
      {
        name: 'git revert',
        description: 'Undo a commit by creating a new commit',
        example: 'git revert abc123'
      }
    ]
  },
  {
    category: 'Stash',
    commands: [
      {
        name: 'git stash',
        description: 'Temporarily save changes',
        example: 'git stash save "WIP feature"\ngit stash list\ngit stash pop'
      }
    ]
  }
];

const GitPlayground = () => {
  const {
    gitState,
    isProcessing,
    commandOutput,
    simulateCommand,
    simulateFileChange,
    resetState
  } = useGitSimulator()

  const [activeTab, setActiveTab] = useState<string>('Basic');
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null);

  useEffect(() => {
    resetState()
  }, [resetState])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto px-4"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold mb-4">Git Playground</h1>
          <p className="text-lg">
            Experiment with Git commands in a safe environment. All changes are simulated
            and won't affect your actual file system.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetState}
          className="btn btn-error gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Reset Playground
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">Repository Status</h2>
            <RepositoryVisualizer gitState={gitState} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Terminal
              onCommand={simulateCommand}
              isProcessing={isProcessing}
              output={commandOutput}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body p-0">
              <div className="p-4 border-b border-base-300">
                <h2 className="card-title">Supported Git Commands</h2>
              </div>
              
              <div className="tabs tabs-boxed bg-base-300 p-1 m-4 rounded-lg">
                {supportedCommands.map((category) => (
                  <a
                    key={category.category}
                    className={`tab ${activeTab === category.category ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab(category.category)}
                  >
                    {category.category}
                  </a>
                ))}
              </div>

              <div className="p-4 space-y-2">
                {supportedCommands
                  .find(c => c.category === activeTab)
                  ?.commands.map((cmd) => (
                    <div
                      key={cmd.name}
                      className="collapse collapse-arrow bg-base-300 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={expandedCommand === cmd.name}
                        onChange={() => setExpandedCommand(expandedCommand === cmd.name ? null : cmd.name)}
                      />
                      <div className="collapse-title font-mono text-primary">
                        {cmd.name}
                      </div>
                      <div className="collapse-content">
                        <p className="text-sm mb-2">{cmd.description}</p>
                        <div className="bg-base-100 p-2 rounded">
                          <pre className="text-xs whitespace-pre-wrap">
                            {cmd.example}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Usage Tips</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Use <code className="text-primary">git status</code> to check current state</li>
                <li>Commit frequently with clear messages</li>
                <li>Create new branches for features</li>
                <li>Use stash to save temporary changes</li>
                <li>View history with <code className="text-primary">git log</code></li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default GitPlayground 