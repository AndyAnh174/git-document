import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface TerminalProps {
  onCommand: (command: string) => void;
  isProcessing: boolean;
  output: string;
}

const Terminal = ({ onCommand, isProcessing, output }: TerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm>()
  const promptRef = useRef('$ ')
  const currentLineRef = useRef('')
  const processingRef = useRef(false)

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#2A303C',
        foreground: '#A6ADBB',
        cursor: '#A6ADBB',
        selection: '#444B5A',
      },
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      scrollback: 1000,
      convertEol: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    term.open(terminalRef.current)
    fitAddon.fit()

    term.write(promptRef.current)

    const handleResize = () => {
      fitAddon.fit()
    }

    window.addEventListener('resize', handleResize)

    term.onKey(({ key, domEvent }) => {
      if (processingRef.current) return

      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey

      if (domEvent.keyCode === 13) { // Enter
        term.write('\r\n')
        if (currentLineRef.current.trim().length > 0) {
          processingRef.current = true
          onCommand(currentLineRef.current)
        } else {
          term.write(promptRef.current)
        }
        currentLineRef.current = ''
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1)
          term.write('\b \b')
        }
      } else if (printable) {
        currentLineRef.current += key
        term.write(key)
      }
    })

    xtermRef.current = term

    return () => {
      term.dispose()
      window.removeEventListener('resize', handleResize)
    }
  }, [onCommand])

  useEffect(() => {
    if (!xtermRef.current) return

    const term = xtermRef.current
    processingRef.current = isProcessing

    if (!isProcessing && output) {
      const lines = output.split('\\n')
      lines.forEach((line, index) => {
        term.write(line + (index < lines.length - 1 ? '\r\n' : ''))
      })
      term.write('\r\n' + promptRef.current)
    }
  }, [isProcessing, output])

  return (
    <div className="terminal-container relative">
      <div className="absolute top-0 left-0 right-0 bg-neutral-focus text-neutral-content p-2 rounded-t-lg flex items-center space-x-2">
        <div className="flex space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-sm font-mono ml-2">Git Terminal</span>
      </div>
      <div className="pt-10">
        <div ref={terminalRef} className="h-[400px]" />
      </div>
      {isProcessing && (
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm text-neutral-content">Processing...</span>
        </div>
      )}
    </div>
  )
}

export default Terminal 