"use client"

import { useEffect, useState } from "react"

export function EmptyState() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Animated ASCII character
  const characterFrames = [
    `   o
  /|\\
  / \\`,
    `   o
  \\|/
  / \\`,
    `   o
  /|\\
  / \\`,
    `   o
  /|/
  \\ \\`,
  ]

  const blinkFrames = ["_", " "]

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background text-muted-foreground select-none">
      {/* Animated character */}
      <div className="relative mb-8">
        <pre className="text-4xl font-mono text-primary animate-float">{characterFrames[frame]}</pre>
        {/* Shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-muted-foreground/20 rounded-full blur-sm animate-pulse-slow" />
      </div>

      {/* Message */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Nothing here</h2>
        <p className="text-sm max-w-xs">Open a file from the explorer to start editing</p>
        <div className="font-mono text-xs text-muted-foreground/70 mt-6">
          <span className="text-primary">{">"}</span> waiting for input{blinkFrames[frame % 2]}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-8 flex items-center gap-4 text-xs text-muted-foreground/50">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-secondary rounded text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-secondary rounded text-[10px]">P</kbd>
          <span>Quick Open</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-secondary rounded text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-secondary rounded text-[10px]">`</kbd>
          <span>Terminal</span>
        </div>
      </div>
    </div>
  )
}
