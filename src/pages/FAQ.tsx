import { useState } from 'react'

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is Git?',
    answer: 'Git is a distributed version control system that tracks changes in source code during software development. It allows multiple developers to work together on non-linear development.'
  },
  {
    question: 'What is the difference between Git and GitHub?',
    answer: 'Git is a version control system that lets you manage and track your source code history. GitHub is a cloud-based hosting service that lets you manage Git repositories. GitHub provides additional collaboration features like bug tracking, feature requests, task management, and wikis.'
  },
  {
    question: 'What is a repository?',
    answer: 'A Git repository is a virtual storage of your project. It contains all of your project\'s files and each file\'s revision history. You can have a local repository on your computer and a remote repository on a server like GitHub.'
  },
  {
    question: 'What is a commit?',
    answer: 'A commit is a snapshot of your repository at a specific point in time. It includes changes to files, who made the changes, and a message describing the changes. Each commit has a unique identifier (hash) and can be reverted if needed.'
  },
  {
    question: 'What is a branch?',
    answer: 'A branch is a parallel version of your repository. It allows you to work on different features or fixes without affecting the main codebase. You can later merge these changes back into the main branch.'
  },
  {
    question: 'What is a merge conflict?',
    answer: 'A merge conflict occurs when Git is unable to automatically resolve differences in code between two commits. This usually happens when two people have changed the same lines in a file, or when one developer deletes a file while another is modifying it.'
  },
  {
    question: 'How do I undo a commit?',
    answer: 'There are several ways to undo a commit:\n\n1. git reset --soft HEAD~1 (undo last commit, keep changes staged)\n2. git reset --hard HEAD~1 (undo last commit and discard changes)\n3. git revert <commit-hash> (create new commit that undoes changes)'
  },
  {
    question: 'What is git stash?',
    answer: 'Git stash is a command that temporarily saves changes you\'ve made to your working copy so you can work on something else, and then come back and re-apply the changes later. It\'s useful when you need to switch branches but aren\'t ready to commit your current work.'
  }
]

const FAQ = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg">
          Common questions and answers about Git and version control.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="collapse collapse-arrow bg-base-200"
          >
            <input
              type="radio"
              name="faq-accordion"
              checked={expandedIndex === index}
              onChange={() => setExpandedIndex(expandedIndex === index ? null : index)}
            />
            <div className="collapse-title text-xl font-medium">
              {faq.question}
            </div>
            <div className="collapse-content">
              <p className="whitespace-pre-line">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info mt-8">
        <div>
          <h3 className="font-bold">Need more help?</h3>
          <p>
            Check out the official{' '}
            <a
              href="https://git-scm.com/doc"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              Git documentation
            </a>
            {' '}for detailed information.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FAQ 