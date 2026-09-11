import { useEffect, useRef, useState } from 'react'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import {
  ChevronDown,
  CircleCheck,
  Maximize2,
  Minimize2,
  TerminalSquare,
} from 'lucide-react'
import brandLight from '@/assets/brand-light.png'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface MainWindowContentProps {
  children?: React.ReactNode
  className?: string
}

export function MainWindowContent({
  children,
  className,
}: MainWindowContentProps) {
  const terminalElement = useRef<HTMLDivElement>(null)
  const [isLogMenuOpen, setIsLogMenuOpen] = useState(false)
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false)
  const [logFilter, setLogFilter] = useState('All logs')

  useEffect(() => {
    if (!terminalElement.current) return

    const terminal = new Terminal({
      allowTransparency: true,
      convertEol: true,
      cursorBlink: false,
      disableStdin: true,
      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: 12,
      scrollback: 100,
      theme: {
        background: '#111318',
        foreground: '#c8ced8',
        cursor: '#6ee7b7',
        black: '#111318',
        brightBlack: '#697386',
        green: '#6ee7b7',
        brightGreen: '#86efac',
        yellow: '#facc15',
        brightYellow: '#fde68a',
        red: '#fb7185',
        brightRed: '#fda4af',
      },
    })
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalElement.current)
    fitAddon.fit()

    terminal.writeln('\x1b[38;5;114m●\x1b[0m WalletOS runtime connected')
    terminal.writeln('\x1b[38;5;110m→\x1b[0m Loading local wallet services... \x1b[38;5;114mdone\x1b[0m')
    terminal.writeln('\x1b[38;5;110m→\x1b[0m Listening for agent events... \x1b[38;5;114mready\x1b[0m')
    terminal.writeln('')
    terminal.write('\x1b[38;5;114mwalletos\x1b[0m \x1b[38;5;110m$\x1b[0m ')

    const unsubscribe = logger.subscribe(entry => {
      const color = entry.level === 'error' ? 203 : entry.level === 'warn' ? 221 : 252
      terminal.writeln(`\x1b[38;5;${color}m[${entry.level.toUpperCase()}]\x1b[0m ${entry.message}`)
    })

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => fitAddon.fit())
        : null
    resizeObserver?.observe(terminalElement.current)

    return () => {
      resizeObserver?.disconnect()
      unsubscribe()
      terminal.dispose()
    }
  }, [])

  if (children) {
    return <div className={cn('flex h-full flex-col bg-background', className)}>{children}</div>
  }

  return (
    <main className={cn('about-shell', className)}>
      <section className="about-intro" aria-labelledby="about-title">
        <div className="about-mark">
          <img src={brandLight} alt="WalletOS logo" />
        </div>
        <div className="about-kicker">Hackathon build · 2026</div>
        <h1 id="about-title">WalletOS</h1>
        <p className="about-copy">
          WalletOS an open OS for crypto wallets makes your crypto autonomous workflows{' '}
          <b>smarter, safer, and easier to use with AI.</b>
        </p>
        <div className="about-status">
          <CircleCheck size={15} strokeWidth={2.5} />
          <span>Core services online</span>
        </div>
      </section>

      <section
        className={cn('log-panel', isTerminalExpanded && 'log-panel-expanded')}
        aria-label="Runtime logs"
      >
        <div className="log-panel-header">
          <div className="log-panel-title">
            <TerminalSquare size={16} />
            <span>Runtime logs</span>
            <span className="log-live-dot" aria-label="Live" />
          </div>
          <div className="log-menu-wrap">
            <div className="log-actions">
              <button
                type="button"
                className="log-expand-button"
                aria-label={isTerminalExpanded ? 'Reduce terminal' : 'Expand terminal'}
                title={isTerminalExpanded ? 'Reduce terminal' : 'Expand terminal'}
                onClick={() => setIsTerminalExpanded(expanded => !expanded)}
              >
                {isTerminalExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                className="log-filter-button"
                aria-expanded={isLogMenuOpen}
                onClick={() => setIsLogMenuOpen(open => !open)}
              >
                {logFilter}
                <ChevronDown size={14} />
              </button>
            </div>
            {isLogMenuOpen && (
              <div className="log-menu" role="menu">
                {['All logs', 'Errors only', 'Clear logs'].map(option => (
                  <button
                    type="button"
                    key={option}
                    role="menuitem"
                    onClick={() => {
                      setLogFilter(option)
                      setIsLogMenuOpen(false)
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div ref={terminalElement} className="runtime-terminal" />
      </section>
    </main>
  )
}
