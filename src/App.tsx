import { Routes, Route, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

// Pages
import GitPlayground from './pages/GitPlayground'
import CheatSheet from './pages/CheatSheet'
import FAQ from './pages/FAQ'

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <div className="min-h-screen">
      <nav className="navbar bg-base-200">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost normal-case text-xl">
            Git Document
          </NavLink>
        </div>
        <div className="flex-none gap-2">
          <NavLink to="/" className="nav-link" end>
            Playground
          </NavLink>
          <NavLink to="/cheatsheet" className="nav-link">
            Cheat Sheet
          </NavLink>
          <NavLink to="/faq" className="nav-link">
            FAQ
          </NavLink>
          <button
            className="btn btn-ghost btn-circle"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<GitPlayground />} />
          <Route path="/cheatsheet" element={<CheatSheet />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </main>

      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <div>
          <p>Copyright © 2025 - <a href="https://myportfolio-andyanh.vercel.app/" target="_blank" rel="noopener noreferrer">AndyAnh</a> - Một công cụ học Git tương tác</p>
        </div>
      </footer>
    </div>
  )
}

export default App 
