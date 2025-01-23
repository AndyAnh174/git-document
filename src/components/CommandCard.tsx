import { useState } from 'react'
import { GitCommand } from '../types/git'

interface CommandCardProps {
  command: GitCommand;
}

const CommandCard = ({ command }: CommandCardProps) => {
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command.command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="command-card">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="card-title font-mono">{command.command}</h2>
            <p className="text-sm mt-2">{command.description}</p>
          </div>
          <button
            className={`btn btn-sm ${copied ? 'btn-success' : 'btn-ghost'}`}
            onClick={copyToClipboard}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Usage:</h3>
          <pre className="bg-base-300 p-2 rounded-lg mt-1 text-sm">
            {command.usage}
          </pre>
        </div>

        {command.examples.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Examples:</h3>
            <ul className="list-disc list-inside space-y-2 mt-1">
              {command.examples.map((example, index) => (
                <li key={index} className="text-sm">{example}</li>
              ))}
            </ul>
          </div>
        )}

        {command.advanced && (
          <div className="mt-4">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setIsAdvanced(!isAdvanced)}
            >
              {isAdvanced ? 'Show Less' : 'Show Advanced'}
            </button>
            {isAdvanced && (
              <div className="mt-2 text-sm">
                <p>{command.advanced}</p>
              </div>
            )}
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          <div className="badge badge-outline">{command.category}</div>
        </div>
      </div>
    </div>
  )
}

export default CommandCard 