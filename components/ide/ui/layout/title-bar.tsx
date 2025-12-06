"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { Search, X, Minus, Square, LayoutGrid } from "lucide-react"
import type { FileType } from "../../data/files"
import { IDEContext } from "../../../ide"

type Props = {
  files: FileType[]
  openFile: (file: FileType) => void
  onCreateFile: () => void
  onSave: () => void
  onToggleSidebar: () => void
  onToggleTerminal: () => void
  activeFile: FileType | null
}

export function TitleBar({ files, openFile, onCreateFile, onSave, onToggleSidebar, onToggleTerminal, activeFile }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FileType[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const { showToast } = useContext(IDEContext)
  
  const isReadOnly = activeFile?.isSpecial && activeFile.isSpecial !== "html-preview" && activeFile.isSpecial !== "dart-preview"

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + P to open quick search
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault()
        setSearchOpen(true)
      }
      // Escape to close
      if (e.key === "Escape") {
        setSearchOpen(false)
        setSearchQuery("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    if (searchQuery) {
      const results = files.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.path.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, files])

  const handleSelectFile = (file: FileType) => {
    openFile(file)
    setSearchOpen(false)
  }

  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null)
    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  function MenuBarItem({ label, children }: { label: string; children: React.ReactNode }) {
    const isOpen = activeMenu === label

    return (
      <div className="relative">
        <button
          className={`px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors ${isOpen ? "bg-white/10" : ""}`}
          onClick={(e) => {
            e.stopPropagation()
            setActiveMenu(isOpen ? null : label)
          }}
          onMouseEnter={() => {
            if (activeMenu) setActiveMenu(label)
          }}
        >
          {label}
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 min-w-[200px] bg-popover border border-border rounded shadow-lg py-1 z-50">
            {children}
          </div>
        )}
      </div>
    )
  }

  function MenuOption({ label, onClick, shortcut, disabled }: { label: string; onClick?: () => void; shortcut?: string; disabled?: boolean }) {
    return (
      <button
        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground"
        }`}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) {
             onClick?.()
             setActiveMenu(null)
          }
        }}
        disabled={disabled}
      >
        <span>{label}</span>
        {shortcut && <span className="text-muted-foreground ml-4">{shortcut}</span>}
      </button>
    )
  }

  return (
    <>
      <div
        className="h-9 flex items-center justify-between px-2 border-b border-border select-none"
        style={{ background: "var(--activity-bar)" }}
      >
        {/* Left - Menu */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Menu">
            <LayoutGrid className="w-4 h-4 text-muted-foreground" />
          </button>

          <MenuBarItem label="File">
            <MenuOption label="New File" onClick={onCreateFile} shortcut="Ctrl+N" />
            <MenuOption label="Open File..." onClick={() => showToast("File picker not supported in browser", "warning")} shortcut="Ctrl+O" />
            <div className="h-px bg-border my-1" />
            <MenuOption label="Save" onClick={onSave} shortcut="Ctrl+S" />
            <MenuOption label="Save As..." onClick={() => showToast("Save As not supported", "warning")} shortcut="Ctrl+Shift+S" />
            <div className="h-px bg-border my-1" />
            <MenuOption label="Exit" onClick={() => window.location.reload()} />
          </MenuBarItem>

          <MenuBarItem label="Edit">
            <MenuOption 
                label="Undo" 
                onClick={() => {
                  try { document.execCommand('undo') } catch { showToast("Undo not available", "error") }
                }} 
                shortcut="Ctrl+Z" 
                disabled={!!isReadOnly}
            />
            <MenuOption 
                label="Redo" 
                onClick={() => {
                   try { document.execCommand('redo') } catch { showToast("Redo not available", "error") }
                }} 
                shortcut="Ctrl+Y" 
                disabled={!!isReadOnly}
            />
            <div className="h-px bg-border my-1" />
            <MenuOption 
                label="Cut" 
                onClick={() => {
                  if (window.getSelection()?.toString()) {
                    navigator.clipboard.writeText(window.getSelection()!.toString())
                    document.execCommand('delete')
                    showToast("Cut to clipboard")
                  } else {
                    showToast("Nothing selected", "warning")
                  }
                }} 
                shortcut="Ctrl+X" 
                disabled={!!isReadOnly}
            />
            <MenuOption 
                label="Copy" 
                onClick={() => {
                   if (window.getSelection()?.toString()) {
                     navigator.clipboard.writeText(window.getSelection()!.toString())
                     showToast("Copied to clipboard")
                   } else {
                     showToast("Nothing selected", "warning")
                   }
                }} 
                shortcut="Ctrl+C" 
            />
            <MenuOption 
                label="Paste" 
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText()
                    if (text) document.execCommand('insertText', false, text)
                  } catch (e) {
                    showToast("Clipboard access denied", "error")
                  }
                }} 
                shortcut="Ctrl+V" 
                disabled={!!isReadOnly}
            />
          </MenuBarItem>

          <MenuBarItem label="View">
            <MenuOption label="Command Palette" onClick={() => setSearchOpen(true)} shortcut="Ctrl+P" />
            <MenuOption label="Explorer" onClick={onToggleSidebar} shortcut="Ctrl+Shift+E" />
            <MenuOption label="Terminal" onClick={onToggleTerminal} shortcut="Ctrl+`" />
          </MenuBarItem>

          <MenuBarItem label="Run">
            <MenuOption 
                label="Start Debugging" 
                onClick={() => showToast("Debugging started... (Simulation)", "success")} 
                shortcut="F5" 
                disabled={!activeFile || !/\.(js|html|dart|kt|css)$/.test(activeFile.name)}
            />
            <MenuOption 
                label="Run Without Debugging" 
                onClick={() => showToast("Running... (Simulation)", "success")} 
                shortcut="Ctrl+F5" 
                disabled={!activeFile || !/\.(js|html|dart|kt|css)$/.test(activeFile.name)} 
            />
          </MenuBarItem>

          <MenuBarItem label="Help">
            <MenuOption label="Welcome" onClick={() => showToast("Welcome to rashbip OS")} />
            <MenuOption label="Documentation" onClick={() => window.open("https://github.com/rashbip", "_blank")} />
            <MenuOption label="About" onClick={() => showToast("Rashbip OS v1.0.0")} />
          </MenuBarItem>
        </div>

        {/* Center - Search Bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors max-w-xs w-full mx-4"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground flex-1 text-left truncate">rashbip - VS Code</span>
          <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">Ctrl+P</span>
        </button>

        {/* Right - Window Controls */}
        <div className="flex items-center gap-0.5">
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Minimize">
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Maximize">
            <Square className="w-3 h-3 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded hover:bg-red-500/80 transition-colors" title="Close">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
          onClick={() => setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-xl bg-popover border border-border rounded-lg shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files by name..."
                className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 hover:bg-secondary rounded">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {searchQuery && searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground text-sm">No files found</div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleSelectFile(file)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.path}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs text-muted-foreground uppercase">Recent Files</div>
                  {files.slice(0, 5).map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleSelectFile(file)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{file.path}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
