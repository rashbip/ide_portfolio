"use client"

import { Files, Search, GitBranch, Bug, Blocks, Settings, Terminal, User, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

type Props = {
  activeView: string
  setActiveView: (view: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  terminalOpen: boolean
  setTerminalOpen: (open: boolean) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export function ActivityBar({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
  terminalOpen,
  setTerminalOpen,
  containerRef,
}: Props) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const topIcons = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "debug", icon: Bug, label: "Run and Debug" },
    { id: "extensions", icon: Blocks, label: "Extensions" },
  ]

  const bottomIcons = [
    { id: "account", icon: User, label: "Account" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  const handleClick = (id: string) => {
    if (activeView === id && sidebarOpen) {
      setSidebarOpen(false)
    } else {
      setActiveView(id)
      setSidebarOpen(true)
    }
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div 
      ref={containerRef} 
      className="w-12 flex flex-col justify-between py-2 overflow-y-auto overflow-x-hidden" 
      style={{ 
        background: "var(--activity-bar)", 
        maxHeight: "100vh",
        scrollbarWidth: 'none', // Hide scrollbar
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none' // IE/Edge
      }}
    >
      <div className="flex flex-col items-center gap-1 min-w-max">
        {topIcons.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className={`activity-icon w-10 h-10 flex items-center justify-center rounded transition-all ${activeView === id && sidebarOpen ? "active" : ""
              }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 min-w-max">
        <button
          onClick={toggleTheme}
          className="activity-icon w-10 h-10 flex items-center justify-center rounded transition-all"
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
        >
          {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setTerminalOpen(!terminalOpen)}
          className={`activity-icon w-10 h-10 flex items-center justify-center rounded transition-all ${terminalOpen ? "active" : ""}`}
          title="Terminal"
        >
          <Terminal className="w-5 h-5" />
        </button>
        {bottomIcons.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className={`activity-icon w-10 h-10 flex items-center justify-center rounded transition-all ${activeView === id && sidebarOpen ? "active" : ""
              }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  )
}
