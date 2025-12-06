"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Minus, Square, LayoutGrid } from "lucide-react"
import type { FileType } from "../ide"

type Props = {
  files: FileType[]
  openFile: (file: FileType) => void
}

export function TitleBar({ files, openFile }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FileType[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

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
    setSearchQuery("")
  }

  return (
    <>
      <div
        className="h-9 flex items-center justify-between px-2 border-b border-border select-none"
        style={{ background: "var(--activity-bar)" }}
      >
        {/* Left - Menu */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <LayoutGrid className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">File</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Edit</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">View</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Go</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Run</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Terminal</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Help</span>
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
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Square className="w-3 h-3 text-muted-foreground" />
          </button>
          <button className="p-1.5 rounded hover:bg-red-500/80 transition-colors">
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
