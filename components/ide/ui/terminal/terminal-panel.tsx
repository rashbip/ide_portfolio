"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, Maximize2, Minimize2, Plus, Ban, Trash2 } from "lucide-react"
import { normalizeFilePath, getFilesInDirectory, pathExistsInFiles } from "../../utils/file-management"
import { NanoEditor } from "./nano-editor"
import { LinkRenderer } from "./link-renderer"

type HistoryEntry = {
  cmd: string
  output: React.ReactNode
}

type Problem = {
  type: "error" | "warning" | "info"
  message: string
  file: string
  line: number
}

type OutputEntry = {
  timestamp: string
  message: string
  type: "info" | "success" | "error" | "warning"
}

type Props = {
  onClose: () => void
  height: number
  onHeightChange: (height: number) => void
  outputs?: OutputEntry[]
  activeTab: "terminal" | "problems" | "output"
  onTabChange: (tab: "terminal" | "problems" | "output") => void
  onClearOutputs?: () => void
  onCommand?: (command: string) => void
  files?: Array<{ name: string; path: string; icon: string; content: string; language: string; isSpecial?: "profile" | "html-preview" | "dart-preview" | "kotlin-viewer" | "profile-html" | "welcome" | "documentation" | "about" | "flutter-preview" }>
  onCreateFile?: (name: string, parentPath?: string) => void
  onDeleteFile?: (path: string) => void
  onCreateFolder?: (folderPath: string) => void
  onDeleteFolder?: (folderPath: string) => void
  onOpenFile?: (path: string) => void
  getFileContent?: (path: string) => string
  onUpdateFileContent?: (path: string, content: string) => void
  onMoveFile?: (sourcePath: string, destPath: string) => void
}

export function TerminalPanel({ onClose, height, onHeightChange, outputs: externalOutputs, activeTab, onTabChange, onClearOutputs, onCommand, files = [], onCreateFile, onDeleteFile, onCreateFolder, onDeleteFolder, onOpenFile, getFileContent, onUpdateFileContent, onMoveFile }: Props) {
  const [isResizing, setIsResizing] = useState(false)
  const [sessions, setSessions] = useState<{ id: string; name: string; history: HistoryEntry[]; cwd: string }[]>([
    {
      id: "1",
      name: "bash",
      cwd: "/rashbip",
      history: [
        {
          cmd: "",
          output: (
            <div className="text-muted-foreground">Welcome to rashbip's terminal. Type 'help' for available commands.</div>
          ),
        },
      ],
    },
  ])
  const [activeSessionId, setActiveSessionId] = useState("1")
  const [input, setInput] = useState("")
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [matrixMode, setMatrixMode] = useState(false)
  const [nanoEditor, setNanoEditor] = useState<{ filePath: string; content: string } | null>(null)

  // existing problems state...
  const [problems, setProblems] = useState<Problem[]>([
    { type: "warning", message: "Unused import 'dart:async'", file: "lib/stack.dart", line: 2 },
    { type: "info", message: "Consider using 'const' constructor", file: "lib/stack.dart", line: 15 },
  ])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0]
  const currentCwd = activeSession?.cwd || "/rashbip"

  // Helper functions for file system
  const normalizePath = (path: string): string => {
    return normalizeFilePath(path, currentCwd)
  }

  const getFilesInDir = (dir: string): Array<{ name: string; path: string; isDir: boolean }> => {
    return getFilesInDirectory(dir, files)
  }

  const pathExists = (path: string): boolean => {
    return pathExistsInFiles(path, files)
  }

  // Levenshtein distance for command suggestions
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  // Resize handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const container = document.querySelector(".flex-1.flex.flex-col.overflow-hidden")
      if (container) {
        const rect = container.getBoundingClientRect()
        const newHeight = rect.bottom - e.clientY
        onHeightChange(Math.max(100, Math.min(500, newHeight)))
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, onHeightChange])

  // Scroll to bottom when history changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [sessions, externalOutputs, activeSessionId])

  const availableCommands = [
    "help", "about", "stack", "links", "clear", "neofetch", "whoami", "date", "pwd",
    "ls", "cat", "echo", "ping", "gradle", "flutter", "adb", "git", "npm", "coffee",
    "matrix", "exit", "sudo", "rm", "cd", "mkdir", "touch", "vim", "nano", "code",
    "history", "grep", "find", "head", "tail", "wc", "sort", "uniq", "diff", "mv",
    "cp", "ps", "jobs", "kill", "uname", "hostname", "env", "export", "alias", "unalias",
    "which", "type", "whereis", "man", "less", "more", "tree", "du", "df", "top",
  ]

  // Command aliases
  const aliases: Record<string, string> = {
    "ll": "ls -l",
    "la": "ls -a",
    "l": "ls",
    "..": "cd ..",
    "...": "cd ../..",
    "h": "history",
    "c": "clear",
  }

  // Process commands

  // Let's replace the state declarations and effects first, then processCommand, then UI.
  // Actually, I can allow multiple replacements.

  // Let's update the helper/handlers first.

  const handleAddSession = () => {
    const newId = (sessions.length + 1).toString()
    setSessions([...sessions, {
      id: newId,
      name: sessions.length % 2 === 0 ? "zsh" : "bash",
      cwd: "/rashbip",
      history: [{ cmd: "", output: <div className="text-muted-foreground">New terminal session.</div> }]
    }])
    setActiveSessionId(newId)
  }

  const handleRemoveSession = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (sessions.length === 1) return // Don't remove last one? Or just clear it? VS Code allows closing all, but then shows "No terminal"

    const newSessions = sessions.filter(s => s.id !== id)
    setSessions(newSessions)
    if (activeSessionId === id) {
      setActiveSessionId(newSessions[newSessions.length - 1].id)
    }
  }

  const handleClear = () => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, history: [] }
      }
      return s
    }))
  }

  // Expand aliases
  const expandAlias = (cmd: string): string => {
    const parts = cmd.trim().split(" ")
    const firstPart = parts[0].toLowerCase()
    if (aliases[firstPart]) {
      return aliases[firstPart] + (parts.length > 1 ? " " + parts.slice(1).join(" ") : "")
    }
    return cmd
  }

  // Tab completion helper
  const getCompletions = (input: string): string[] => {
    const parts = input.trim().split(" ")
    const lastPart = parts[parts.length - 1] || ""
    
    // Command completion
    if (parts.length === 1) {
      return availableCommands.filter(c => c.startsWith(lastPart.toLowerCase()))
    }
    
    // File/directory completion
    const prefix = lastPart.substring(0, lastPart.lastIndexOf('/') + 1)
    const searchTerm = lastPart.substring(lastPart.lastIndexOf('/') + 1)
    const dir = prefix ? normalizePath(prefix) : currentCwd
    const items = getFilesInDir(dir)
    
    return items
      .filter(item => item.name.startsWith(searchTerm))
      .map(item => prefix + item.name + (item.isDir ? "/" : ""))
  }

  const processCommand = (cmd: string): React.ReactNode => {
    // Expand aliases first
    const expandedCmd = expandAlias(cmd)
    const parts = expandedCmd.trim().split(" ")
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case "help":
        return (
          <div className="space-y-2">
            <div className="text-primary font-bold">Available Commands:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
              {availableCommands.map((c) => (
                <span key={c} className="text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-border">
              <div className="text-primary font-bold text-xs mb-1">File System:</div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>cd [dir] - Change directory (default: /rashbip)</div>
                <div>ls [-l|-a] - List files (use -l for details, -a for all)</div>
                <div>cat [file] - Display file contents</div>
                <div>touch [file] - Create a new file</div>
                <div>mkdir [dir] - Create a new directory</div>
                <div>rm [file] - Remove a file</div>
                <div>rm -r [dir] - Remove a directory</div>
                <div>mv [src] [dest] - Move/rename file</div>
                <div>cp [src] [dest] - Copy file</div>
                <div>grep [pattern] [file] - Search in file</div>
                <div>find [dir] [name] - Find files</div>
                <div>head/tail [file] - Show first/last lines</div>
                <div>wc [file] - Word count</div>
                <div>tree [-L depth] - Directory tree</div>
                <div>less/more [file] - View file with pager</div>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-border">
              <div className="text-primary font-bold text-xs mb-1">System:</div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>uname [-a] - System info</div>
                <div>hostname - Show hostname</div>
                <div>env - Environment variables</div>
                <div>ps - Process list</div>
                <div>which [cmd] - Find command path</div>
                <div>alias - Show aliases (ll, la, l, .., h, c)</div>
                <div>man [cmd] - Manual pages</div>
                <div>history [-c] - Command history</div>
              </div>
            </div>
          </div>
        )
      // ... (Rest of commands identical to previous, just need to ensure 'clear' calls handleClear or equivalent)
      case "clear":
        handleClear()
        return null

      case "about":
        return (
          <div className="space-y-1">
            <div className="text-primary">rashbip</div>
            <div className="text-muted-foreground">Mobile Developer | Android & Flutter</div>
            <div className="text-muted-foreground">Not a portfolio. Not looking for a job.</div>
            <div className="text-muted-foreground">Just existing on the internet.</div>
          </div>
        )

      case "stack":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500">Android</span>
              <span className="text-muted-foreground">Native (Views + Kotlin)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-500">Compose</span>
              <span className="text-muted-foreground">Jetpack Compose + Kotlin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">Flutter</span>
              <span className="text-muted-foreground">Dart - All Platforms</span>
            </div>
          </div>
        )

      case "links":
        return (
          <div className="space-y-1">
            <a
              href="https://github.com/rashbip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              GitHub: github.com/rashbip
            </a>
            <a
              href="https://reddit.com/user/Fair_Concentrate606"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              Reddit: u/Fair_Concentrate606
            </a>
          </div>
        )

      case "neofetch":
        return (
          <pre className="text-xs leading-tight">
            {`
  ██████╗  █████╗ ███████╗██╗  ██╗██████╗ ██╗██████╗ 
  ██╔══██╗██╔══██╗██╔════╝██║  ██║██╔══██╗██║██╔══██╗
  ██████╔╝███████║███████╗███████║██████╔╝██║██████╔╝
  ██╔══██╗██╔══██║╚════██║██╔══██║██╔══██╗██║██╔═══╝ 
  ██║  ██║██║  ██║███████║██║  ██║██████╔╝██║██║     
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝     
`}
            <span className="text-primary">rashbip</span>@<span className="text-red-500">dev</span>
            {`
  ───────────────────────
  OS: Developer OS
  Host: Internet
  Shell: rashbip-terminal
  Stack: Android, Flutter, Kotlin
  Status: Not looking for a job
  Coffee: ∞ cups/day`}
          </pre>
        )

      case "whoami":
        return <div className="text-foreground">rashbip - Mobile Developer</div>

      case "date":
        return <div className="text-foreground">{new Date().toString()}</div>

      case "pwd":
        return <div className="text-foreground">{currentCwd}</div>

      case "ls":
        const showAll = args.includes("-a") || args.includes("--all")
        const showLong = args.includes("-l") || args.includes("--long")
        const lsArgs = args.filter(arg => !arg.startsWith("-"))
        const targetDir = lsArgs[0] ? normalizePath(lsArgs[0]) : currentCwd
        const items = getFilesInDir(targetDir)
        const filteredItems = showAll ? items : items.filter(item => !item.name.startsWith("."))
        
        if (filteredItems.length === 0) {
          return <div className="text-muted-foreground">(empty directory)</div>
        }

        if (showLong) {
          return (
            <div className="space-y-1 font-mono text-xs">
              {filteredItems.map(item => {
                const file = files.find(f => f.path === item.path || (item.isDir && f.path.startsWith(item.path + "/")))
                const size = file ? (getFileContent ? getFileContent(file.path) : file.content).length : 0
                const date = new Date().toLocaleDateString()
                return (
                  <div key={item.path} className="flex items-center gap-4">
                    <span className="text-muted-foreground w-10">-rw-r--r--</span>
                    <span className="text-muted-foreground w-12">1</span>
                    <span className="text-muted-foreground w-16">rashbip</span>
                    <span className="text-muted-foreground w-16">rashbip</span>
                    <span className="text-muted-foreground w-16 text-right">{size}</span>
                    <span className="text-muted-foreground w-24">{date}</span>
                    <span className={item.isDir ? "text-blue-500" : "text-foreground"}>
                      {item.name}{item.isDir ? "/" : ""}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        }

        return (
          <div className="flex flex-wrap gap-4">
            {filteredItems.map(item => (
              <span key={item.path} className={item.isDir ? "text-blue-500" : "text-foreground"}>
                {item.name}{item.isDir ? "/" : ""}
              </span>
            ))}
          </div>
        )

      case "cd":
        if (!args[0]) {
          setSessions(prev => prev.map(s => 
            s.id === activeSessionId ? { ...s, cwd: "/rashbip" } : s
          ))
          return <div className="text-foreground">Changed to /rashbip</div>
        }
        let newDir = normalizePath(args[0])
        // If normalized path is /, map it back to /rashbip for display
        if (newDir === "/") {
          newDir = "/rashbip"
        }
        // Check if path exists (normalizePath already maps /rashbip to /)
        const checkPath = newDir === "/rashbip" ? "/" : newDir
        if (pathExists(checkPath) || newDir === "/rashbip") {
          setSessions(prev => prev.map(s => 
            s.id === activeSessionId ? { ...s, cwd: newDir } : s
          ))
          return <div className="text-foreground">Changed to {newDir}</div>
        }
        return <div className="text-red-500">cd: {args[0]}: No such file or directory</div>

      case "cat":
        if (!args[0]) {
          return <div className="text-red-500">cat: missing file operand</div>
        }
        let filePath = normalizePath(args[0])
        // Map /rashbip paths to / for file lookup
        const actualFilePath = filePath.startsWith("/rashbip/") ? filePath.replace("/rashbip", "") : (filePath === "/rashbip" ? "/" : filePath)
        const file = files.find(f => f.path === actualFilePath)
        if (file) {
          const content = getFileContent ? getFileContent(actualFilePath) : file.content
          return (
            <div className="text-foreground whitespace-pre-wrap font-mono text-xs">
              {content || "(empty file)"}
            </div>
          )
        }
        return <div className="text-red-500">cat: {args[0]}: No such file</div>

      case "echo":
        return <div className="text-foreground">{args.join(" ")}</div>

      case "ping":
        return (
          <div className="space-y-1">
            <div>PING {args[0] || "rashbip.dev"}</div>
            <div className="text-green-500">64 bytes: time=1ms TTL=64</div>
            <div className="text-green-500">64 bytes: time=1ms TTL=64</div>
            <div className="text-green-500">64 bytes: time=1ms TTL=64</div>
          </div>
        )

      case "gradle":
        return (
          <div className="space-y-1">
            <div className="text-foreground">{"> "}Task :compileKotlin</div>
            <div className="text-foreground">{"> "}Task :processResources NO-SOURCE</div>
            <div className="text-foreground">{"> "}Task :classes</div>
            <div className="text-green-500">BUILD SUCCESSFUL in 2s</div>
          </div>
        )

      case "flutter":
        if (args[0] === "doctor") {
          return (
            <div className="space-y-1">
              <div className="text-green-500">[✓] Flutter (Channel stable)</div>
              <div className="text-green-500">[✓] Android toolchain</div>
              <div className="text-green-500">[✓] Xcode</div>
              <div className="text-green-500">[✓] Chrome</div>
              <div className="text-green-500">[✓] Android Studio</div>
              <div className="text-green-500">[✓] VS Code</div>
              <div className="text-green-500 mt-2">• No issues found!</div>
            </div>
          )
        }
        if (args[0] === "run") {
          return (
            <div className="space-y-1">
              <div>Launching lib/main.dart...</div>
              <div className="text-green-500">✓ Built build/app.apk (32.5MB)</div>
              <div className="text-green-500">✓ Installing...</div>
              <div className="text-primary">Syncing files to device...</div>
            </div>
          )
        }
        return <div className="text-muted-foreground">Usage: flutter [doctor|run|build|clean]</div>

      case "adb":
        return (
          <div className="space-y-1">
            <div>List of devices attached</div>
            <div className="text-foreground">emulator-5554 device</div>
          </div>
        )

      case "git":
        if (!args[0]) {
          return (
            <div className="space-y-1">
              <div className="text-foreground">usage: git &lt;command&gt; [&lt;args&gt;]</div>
              <div className="text-muted-foreground mt-2">Available commands:</div>
              <div className="text-muted-foreground ml-4">status, log, commit, push, pull, remote, config, branch, clone</div>
            </div>
          )
        }

        const gitCommand = args[0].toLowerCase()

        if (gitCommand === "status") {
          return (
            <div className="space-y-1">
              <div>On branch main</div>
              <div className="text-green-500">Your branch is up to date with 'origin/main'.</div>
              <div className="text-muted-foreground">nothing to commit, working tree clean</div>
            </div>
          )
        }

        if (gitCommand === "log") {
          const lines = args[1] === "--oneline" ? 10 : 5
          return (
            <div className="space-y-1 font-mono text-xs">
              {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="text-foreground">
                  {i === 0 ? "*" : " "} {String(Math.random()).substring(2, 10)} {i === 0 ? "(HEAD -> main)" : ""} Initial commit
                </div>
              ))}
            </div>
          )
        }

        if (gitCommand === "commit") {
          if (args[1] === "-m" && args[2]) {
            return (
              <div className="space-y-1">
                <div className="text-foreground">[main {String(Math.random()).substring(2, 8)}] {args[2]}</div>
                <div className="text-green-500">1 file changed, 0 insertions(+), 0 deletions(-)</div>
              </div>
            )
          }
          return <div className="text-muted-foreground">Usage: git commit -m &quot;&lt;message&gt;&quot;</div>
        }

        if (gitCommand === "push") {
          return (
            <div className="space-y-1">
              <div className="text-foreground">Enumerating objects: 5, done.</div>
              <div className="text-foreground">Counting objects: 100% (5/5), done.</div>
              <div className="text-foreground">Writing objects: 100% (3/3), done.</div>
              <div className="text-green-500">To https://github.com/rashbip/portfolio.git</div>
              <div className="text-green-500">   abc1234..def5678  main -&gt; main</div>
            </div>
          )
        }

        if (gitCommand === "pull") {
          return (
            <div className="space-y-1">
              <div className="text-foreground">From https://github.com/rashbip/portfolio</div>
              <div className="text-green-500">Already up to date.</div>
            </div>
          )
        }

        if (gitCommand === "remote") {
          if (args[1] === "-v") {
            return (
              <div className="space-y-1">
                <div className="text-foreground">origin  https://github.com/rashbip/portfolio.git (fetch)</div>
                <div className="text-foreground">origin  https://github.com/rashbip/portfolio.git (push)</div>
              </div>
            )
          }
          if (args[1] === "add" && args[2] && args[3]) {
            return (
              <div className="text-green-500">
                Remote '{args[2]}' added. URL: {args[3]}
              </div>
            )
          }
          if (args[1] === "remove" && args[2]) {
            return (
              <div className="text-green-500">
                Remote '{args[2]}' removed.
              </div>
            )
          }
          return (
            <div className="space-y-1">
              <div className="text-foreground">origin</div>
              <div className="text-muted-foreground">Usage: git remote [-v|add|remove] [name] [url]</div>
            </div>
          )
        }

        if (gitCommand === "config") {
          if (args[1] === "--global" && args[2] === "user.name") {
            if (args[3]) {
              return <div className="text-green-500">Config set: user.name = {args[3]}</div>
            }
            return <div className="text-foreground">rashbip</div>
          }
          if (args[1] === "--global" && args[2] === "user.email") {
            if (args[3]) {
              return <div className="text-green-500">Config set: user.email = {args[3]}</div>
            }
            return <div className="text-foreground">dev@rashbip.com</div>
          }
          if (args[1] === "user.name") {
            if (args[2]) {
              return <div className="text-green-500">Config set: user.name = {args[2]}</div>
            }
            return <div className="text-foreground">rashbip</div>
          }
          if (args[1] === "user.email") {
            if (args[2]) {
              return <div className="text-green-500">Config set: user.email = {args[2]}</div>
            }
            return <div className="text-foreground">dev@rashbip.com</div>
          }
          if (args[1] === "--list" || args[1] === "-l") {
            return (
              <div className="space-y-1 font-mono text-xs">
                <div className="text-foreground">user.name=rashbip</div>
                <div className="text-foreground">user.email=dev@rashbip.com</div>
                <div className="text-foreground">core.editor=code</div>
                <div className="text-foreground">init.defaultBranch=main</div>
              </div>
            )
          }
          return <div className="text-muted-foreground">Usage: git config [--global] [user.name|user.email|--list] [value]</div>
        }

        if (gitCommand === "branch") {
          if (args[1] === "-a" || args[1] === "--all") {
            return (
              <div className="space-y-1">
                <div className="text-primary">* main</div>
                <div className="text-muted-foreground">  remotes/origin/main</div>
              </div>
            )
          }
          return (
            <div className="space-y-1">
              <div className="text-primary">* main</div>
            </div>
          )
        }

        if (gitCommand === "clone") {
          if (args[1]) {
            return (
              <div className="space-y-1">
                <div className="text-foreground">Cloning into '{args[1].split('/').pop()?.replace('.git', '') || 'repository'}'...</div>
                <div className="text-green-500">remote: Enumerating objects: 100, done.</div>
                <div className="text-green-500">remote: Counting objects: 100% (100/100), done.</div>
                <div className="text-green-500">Receiving objects: 100% (100/100), done.</div>
                <div className="text-green-500">Resolving deltas: 100% (50/50), done.</div>
              </div>
            )
          }
          return <div className="text-muted-foreground">Usage: git clone &lt;repository-url&gt;</div>
        }

        // Check for username-related commands
        if (gitCommand === "whoami" || (args[0] === "config" && args[1] === "user.name" && !args[2])) {
          return <div className="text-foreground">rashbip</div>
        }

        return <div className="text-muted-foreground">git: '{gitCommand}' is not a git command. See 'git --help'.</div>

      case "npm":
        if (!args[0]) {
          return (
            <div className="space-y-1">
              <div className="text-foreground">npm &lt;command&gt;</div>
              <div className="text-muted-foreground">Available commands: install, run, start, build, dev</div>
            </div>
          )
        }

        const npmCommand = args[0].toLowerCase()

        if (npmCommand === "install" || npmCommand === "i") {
          return (
            <div className="space-y-1">
              <div className="text-foreground">added 245 packages in 15s</div>
              <div className="text-green-500">✓ Dependencies installed successfully</div>
            </div>
          )
        }

        if (npmCommand === "run") {
          const script = args[1]?.toLowerCase()
          if (script === "build") {
            return (
              <div className="space-y-1">
                <div className="text-foreground">{"> "}next build</div>
                <div className="text-foreground">Creating an optimized production build...</div>
                <div className="text-foreground">✓ Compiled successfully</div>
                <div className="text-foreground">Collecting page data...</div>
                <div className="text-foreground">✓ Generating static pages (3/3)</div>
                <div className="text-green-500">✓ Build completed in 2.3s</div>
                <div className="text-primary mt-2">🌐 Website available on:</div>
                <div className="text-foreground ml-4">Network: <span className="text-primary">rashidul.is-a.dev</span></div>
                <div className="text-foreground ml-4">Local: <span className="text-primary">rashbip.github.io</span></div>
              </div>
            )
          }
          if (script === "dev") {
            return (
              <div className="space-y-1">
                <div className="text-foreground">{"> "}next dev</div>
                <div className="text-green-500">✓ Ready in 1.2s</div>
                <div className="text-primary">○ Local: http://localhost:3000</div>
                <div className="text-primary mt-2">🌐 Website available on:</div>
                <div className="text-foreground ml-4">Network: <span className="text-primary">rashidul.is-a.dev</span></div>
                <div className="text-foreground ml-4">Local: <span className="text-primary">rashbip.github.io</span></div>
              </div>
            )
          }
          if (script === "start") {
            return (
              <div className="space-y-1">
                <div className="text-foreground">{"> "}next start</div>
                <div className="text-green-500">✓ Server started</div>
                <div className="text-primary">○ Local: http://localhost:3000</div>
                <div className="text-primary mt-2">🌐 Website available on:</div>
                <div className="text-foreground ml-4">Network: <span className="text-primary">rashidul.is-a.dev</span></div>
                <div className="text-foreground ml-4">Local: <span className="text-primary">rashbip.github.io</span></div>
              </div>
            )
          }
          return <div className="text-muted-foreground">npm run {script || "&lt;script&gt;"} - Script not found or not implemented</div>
        }

        if (npmCommand === "build") {
          return (
            <div className="space-y-1">
              <div className="text-foreground">{"> "}next build</div>
              <div className="text-foreground">Creating an optimized production build...</div>
              <div className="text-foreground">✓ Compiled successfully</div>
              <div className="text-foreground">Collecting page data...</div>
              <div className="text-foreground">✓ Generating static pages (3/3)</div>
              <div className="text-green-500">✓ Build completed in 2.3s</div>
              <div className="text-primary mt-2">🌐 Website available on:</div>
              <div className="text-foreground ml-4">Network: <span className="text-primary">rashidul.is-a.dev</span></div>
              <div className="text-foreground ml-4">Local: <span className="text-primary">rashbip.github.io</span></div>
            </div>
          )
        }

        if (npmCommand === "dev" || npmCommand === "start") {
          return (
            <div className="space-y-1">
              <div className="text-foreground">{"> "}next {npmCommand}</div>
              <div className="text-green-500">✓ Ready in 1.2s</div>
              <div className="text-primary">○ Local: http://localhost:3000</div>
              <div className="text-primary mt-2">🌐 Website available on:</div>
              <div className="text-foreground ml-4">Network: <span className="text-primary">rashidul.is-a.dev</span></div>
              <div className="text-foreground ml-4">Local: <span className="text-primary">rashbip.github.io</span></div>
            </div>
          )
        }

        return <div className="text-muted-foreground">npm {npmCommand} - Command not implemented. Try: install, run, build, dev, start</div>

      case "coffee":
        return (
          <pre className="text-yellow-600">
            {`
      ( (
       ) )
    .______.
    |      |]
    \\      /
     \`----'
   COFFEE TIME!`}
          </pre>
        )

      case "matrix":
        setMatrixMode(true)
        setTimeout(() => setMatrixMode(false), 5000)
        return <div className="text-green-500">Entering the matrix...</div>

      case "exit":
        return <div className="text-yellow-500">Exiting IDE... Type 'code' or 'enter' to restore.</div>

      case "sudo":
        return <div className="text-red-500">Nice try. You don't have sudo privileges here.</div>

      case "rm":
        if (!args[0]) {
          return <div className="text-red-500">rm: missing operand</div>
        }
        let rmPath = normalizePath(args[0])
        // Map /rashbip paths to / for file lookup
        const actualRmPath = rmPath.startsWith("/rashbip/") ? rmPath.replace("/rashbip", "") : (rmPath === "/rashbip" ? "/" : rmPath)
        const rmFile = files.find(f => f.path === actualRmPath)
        if (rmFile) {
          if (rmFile.isSpecial === "profile" || rmFile.isSpecial === "profile-html") {
            return <div className="text-red-500">rm: cannot remove '{args[0]}': Protected file</div>
          }
          onDeleteFile?.(actualRmPath)
          return <div className="text-green-500">Removed {args[0]}</div>
        }
        // Check if it's a folder - look for .keep file or any files inside
        const hasKeepFile = files.some(f => f.path === actualRmPath + "/.keep")
        const folderFiles = files.filter(f => f.path.startsWith(actualRmPath + "/") && f.path !== actualRmPath + "/.keep")
        if (hasKeepFile || folderFiles.length > 0) {
          if (args.includes("-r") || args.includes("-rf")) {
            // Delete the .keep file if it exists
            if (hasKeepFile) {
              const keepFile = files.find(f => f.path === actualRmPath + "/.keep")
              if (keepFile) {
                onDeleteFile?.(actualRmPath + "/.keep")
              }
            }
            // Delete all files in the folder
            folderFiles.forEach(f => {
              if (f.isSpecial !== "profile" && f.isSpecial !== "profile-html") {
                onDeleteFile?.(f.path)
              }
            })
            onDeleteFolder?.(actualRmPath)
            return <div className="text-green-500">Removed directory {args[0]}</div>
          }
          return <div className="text-red-500">rm: {args[0]}: is a directory (use -r flag)</div>
        }
        return <div className="text-red-500">rm: {args[0]}: No such file or directory</div>

      case "mkdir":
        if (!args[0]) {
          return <div className="text-red-500">mkdir: missing operand</div>
        }
        const mkdirPath = normalizePath(args[0])
        if (pathExists(mkdirPath)) {
          return <div className="text-red-500">mkdir: {args[0]}: File or directory exists</div>
        }
        // Pass the full path including /rashbip if we're in /rashbip
        onCreateFolder?.(mkdirPath)
        return <div className="text-green-500">Created directory {args[0]}</div>

      case "touch":
        if (!args[0]) {
          return <div className="text-red-500">touch: missing file operand</div>
        }
        const fileName = args[0].split("/").pop() || args[0]
        const touchPath = normalizePath(args[0])
        // Map /rashbip paths to / for file lookup
        const actualTouchPath = touchPath.startsWith("/rashbip/") ? touchPath.replace("/rashbip", "") : (touchPath === "/rashbip" ? "/" : touchPath)
        if (files.some(f => f.path === actualTouchPath)) {
          return <div className="text-muted-foreground">File {args[0]} already exists</div>
        }
        // Extract parent directory from the normalized path
        const parentDir = actualTouchPath.substring(0, actualTouchPath.lastIndexOf('/')) || '/'
        // If parentDir is empty or just '/', use currentCwd (mapped if needed)
        const parentPath = parentDir === '/' ? (currentCwd === '/rashbip' ? '/' : currentCwd) : parentDir
        onCreateFile?.(fileName, parentPath)
        return <div className="text-green-500">Created file {args[0]}</div>

      case "vim":
        return <div className="text-muted-foreground">Vim not available. Use 'nano' or IDE tabs instead.</div>

      case "nano":
        if (!args[0]) {
          return <div className="text-red-500">nano: missing file operand</div>
        }
        let nanoPath = normalizePath(args[0])
        // Map /rashbip paths to / for file lookup
        const actualNanoPath = nanoPath.startsWith("/rashbip/") ? nanoPath.replace("/rashbip", "") : (nanoPath === "/rashbip" ? "/" : nanoPath)
        const nanoFile = files.find(f => f.path === actualNanoPath)
        if (nanoFile) {
          const fileContent = getFileContent ? getFileContent(actualNanoPath) : nanoFile.content
          setNanoEditor({ filePath: actualNanoPath, content: fileContent || "" })
          return null // Don't show output, editor will take over
        }
        // File doesn't exist - create it
        const newNanoPath = actualNanoPath
        setNanoEditor({ filePath: newNanoPath, content: "" })
        return null

      case "code":
      case "enter":
        return <div className="text-green-500">Restoring VS Code IDE...</div>

      case "history":
        const historyArgs = args[0] === "-c" || args[0] === "--clear"
        if (historyArgs) {
          setCommandHistory([])
          return <div className="text-green-500">History cleared.</div>
        }
        return (
          <div className="space-y-1 font-mono text-xs">
            {commandHistory.map((c, i) => (
              <div key={i} className="text-muted-foreground">
                {String(commandHistory.length - i).padStart(4, " ")} {c}
              </div>
            ))}
          </div>
        )

      case "grep":
        if (!args[0] || !args[1]) {
          return <div className="text-red-500">Usage: grep &lt;pattern&gt; &lt;file&gt;</div>
        }
        const grepPattern = args[0]
        const grepFile = normalizePath(args[1])
        const actualGrepPath = grepFile.startsWith("/rashbip/") ? grepFile.replace("/rashbip", "") : (grepFile === "/rashbip" ? "/" : grepFile)
        const grepFileObj = files.find(f => f.path === actualGrepPath)
        if (grepFileObj) {
          const content = getFileContent ? getFileContent(actualGrepPath) : grepFileObj.content
          const lines = content.split("\n")
          const matches = lines
            .map((line, i) => ({ line, num: i + 1 }))
            .filter(({ line }) => line.toLowerCase().includes(grepPattern.toLowerCase()))
          
          if (matches.length === 0) {
            return <div className="text-muted-foreground">No matches found</div>
          }
          return (
            <div className="space-y-1 font-mono text-xs">
              {matches.map(({ line, num }) => (
                <div key={num} className="text-foreground">
                  <span className="text-muted-foreground">{num}:</span> {line}
                </div>
              ))}
            </div>
          )
        }
        return <div className="text-red-500">grep: {args[1]}: No such file</div>

      case "find":
        const findPath = args[0] ? normalizePath(args[0]) : currentCwd
        const findName = args[args.length - 1]
        const actualFindPath = findPath.startsWith("/rashbip/") ? findPath.replace("/rashbip", "") : (findPath === "/rashbip" ? "/" : findPath)
        const foundFiles = files.filter(f => {
          const path = f.path
          if (findName && !f.name.toLowerCase().includes(findName.toLowerCase())) return false
          return path.startsWith(actualFindPath + "/") || path === actualFindPath
        })
        if (foundFiles.length === 0) {
          return <div className="text-muted-foreground">No files found</div>
        }
        return (
          <div className="space-y-1 font-mono text-xs">
            {foundFiles.map(f => (
              <div key={f.path} className="text-foreground">{f.path}</div>
            ))}
          </div>
        )

      case "head":
        if (!args[0]) {
          return <div className="text-red-500">Usage: head &lt;file&gt; [-n lines]</div>
        }
        const headLines = args.includes("-n") ? parseInt(args[args.indexOf("-n") + 1]) || 10 : 10
        const headFile = normalizePath(args[0])
        const actualHeadPath = headFile.startsWith("/rashbip/") ? headFile.replace("/rashbip", "") : (headFile === "/rashbip" ? "/" : headFile)
        const headFileObj = files.find(f => f.path === actualHeadPath)
        if (headFileObj) {
          const content = getFileContent ? getFileContent(actualHeadPath) : headFileObj.content
          const lines = content.split("\n").slice(0, headLines)
          return (
            <div className="font-mono text-xs whitespace-pre-wrap">
              {lines.join("\n")}
            </div>
          )
        }
        return <div className="text-red-500">head: {args[0]}: No such file</div>

      case "tail":
        if (!args[0]) {
          return <div className="text-red-500">Usage: tail &lt;file&gt; [-n lines]</div>
        }
        const tailLines = args.includes("-n") ? parseInt(args[args.indexOf("-n") + 1]) || 10 : 10
        const tailFile = normalizePath(args[0])
        const actualTailPath = tailFile.startsWith("/rashbip/") ? tailFile.replace("/rashbip", "") : (tailFile === "/rashbip" ? "/" : tailFile)
        const tailFileObj = files.find(f => f.path === actualTailPath)
        if (tailFileObj) {
          const content = getFileContent ? getFileContent(actualTailPath) : tailFileObj.content
          const lines = content.split("\n").slice(-tailLines)
          return (
            <div className="font-mono text-xs whitespace-pre-wrap">
              {lines.join("\n")}
            </div>
          )
        }
        return <div className="text-red-500">tail: {args[0]}: No such file</div>

      case "wc":
        if (!args[0]) {
          return <div className="text-red-500">Usage: wc &lt;file&gt;</div>
        }
        const wcFile = normalizePath(args[0])
        const actualWcPath = wcFile.startsWith("/rashbip/") ? wcFile.replace("/rashbip", "") : (wcFile === "/rashbip" ? "/" : wcFile)
        const wcFileObj = files.find(f => f.path === actualWcPath)
        if (wcFileObj) {
          const content = getFileContent ? getFileContent(actualWcPath) : wcFileObj.content
          const lines = content.split("\n").length
          const words = content.split(/\s+/).filter(w => w).length
          const chars = content.length
          return (
            <div className="text-foreground font-mono">
              {lines} {words} {chars} {args[0]}
            </div>
          )
        }
        return <div className="text-red-500">wc: {args[0]}: No such file</div>

      case "mv":
        if (args.length < 2) {
          return <div className="text-red-500">Usage: mv &lt;source&gt; &lt;dest&gt;</div>
        }
        const mvSource = normalizePath(args[0])
        const mvDest = normalizePath(args[1])
        const actualMvSource = mvSource.startsWith("/rashbip/") ? mvSource.replace("/rashbip", "") : (mvSource === "/rashbip" ? "/" : mvSource)
        const actualMvDest = mvDest.startsWith("/rashbip/") ? mvDest.replace("/rashbip", "") : (mvDest === "/rashbip" ? "/" : mvDest)
        const mvFile = files.find(f => f.path === actualMvSource)
        if (mvFile) {
          // Check if destination is a directory (has .keep file or contains files)
          const destIsDir = files.some(f => f.path === actualMvDest + "/.keep" || (f.path.startsWith(actualMvDest + "/") && f.path !== actualMvDest + "/.keep"))
          const finalDestPath = destIsDir ? `${actualMvDest}/${mvFile.name}` : actualMvDest
          
          // Check if destination already exists
          if (files.some(f => f.path === finalDestPath && f.path !== actualMvSource)) {
            return <div className="text-red-500">mv: {args[1]}: File already exists</div>
          }
          
          onMoveFile?.(actualMvSource, finalDestPath)
          return <div className="text-green-500">Moved {args[0]} to {args[1]}</div>
        }
        return <div className="text-red-500">mv: {args[0]}: No such file or directory</div>

      case "cp":
        if (args.length < 2) {
          return <div className="text-red-500">Usage: cp &lt;source&gt; &lt;dest&gt;</div>
        }
        const cpSource = normalizePath(args[0])
        const cpDest = normalizePath(args[1])
        const actualCpSource = cpSource.startsWith("/rashbip/") ? cpSource.replace("/rashbip", "") : (cpSource === "/rashbip" ? "/" : cpSource)
        const actualCpDest = cpDest.startsWith("/rashbip/") ? cpDest.replace("/rashbip", "") : (cpDest === "/rashbip" ? "/" : cpDest)
        const cpFile = files.find(f => f.path === actualCpSource)
        if (cpFile) {
          const content = getFileContent ? getFileContent(actualCpSource) : cpFile.content
          const destName = actualCpDest.split("/").pop() || cpFile.name
          const destParent = actualCpDest.substring(0, actualCpDest.lastIndexOf("/")) || "/"
          onCreateFile?.(destName, destParent === "/" ? (currentCwd === "/rashbip" ? "/" : currentCwd) : destParent)
          // Update content after creation
          setTimeout(() => {
            onUpdateFileContent?.(actualCpDest, content)
          }, 100)
          return <div className="text-green-500">Copied {args[0]} to {args[1]}</div>
        }
        return <div className="text-red-500">cp: {args[0]}: No such file or directory</div>

      case "uname":
        const unameFlag = args[0] || ""
        if (unameFlag === "-a") {
          return <div className="text-foreground">Linux rashbip-dev 6.1.0-generic #1 SMP rashbip OS</div>
        }
        return <div className="text-foreground">Linux</div>

      case "hostname":
        return <div className="text-foreground">rashbip-dev</div>

      case "env":
        return (
          <div className="space-y-1 font-mono text-xs">
            <div className="text-foreground">USER=rashbip</div>
            <div className="text-foreground">HOME=/home/rashbip</div>
            <div className="text-foreground">SHELL=/bin/bash</div>
            <div className="text-foreground">PWD={currentCwd}</div>
            <div className="text-foreground">PATH=/usr/local/bin:/usr/bin:/bin</div>
          </div>
        )

      case "which":
        if (!args[0]) {
          return <div className="text-red-500">Usage: which &lt;command&gt;</div>
        }
        const whichCmd = args[0].toLowerCase()
        if (availableCommands.includes(whichCmd) || aliases[whichCmd]) {
          return <div className="text-foreground">/usr/bin/{whichCmd}</div>
        }
        return <div className="text-muted-foreground">which: no {whichCmd} in (/usr/local/bin:/usr/bin:/bin)</div>

      case "alias":
        if (args.length === 0) {
          return (
            <div className="space-y-1">
              {Object.entries(aliases).map(([key, value]) => (
                <div key={key} className="text-foreground">alias {key}='{value}'</div>
              ))}
            </div>
          )
        }
        return <div className="text-muted-foreground">Alias management not fully implemented. Predefined aliases: ll, la, l, .., ..., h, c</div>

      case "tree":
        const treeDepth = args.includes("-L") ? parseInt(args[args.indexOf("-L") + 1]) || 2 : 2
        const treePath = args[0] ? normalizePath(args[0]) : currentCwd
        const actualTreePath = treePath.startsWith("/rashbip/") ? treePath.replace("/rashbip", "") : (treePath === "/rashbip" ? "/" : treePath)
        
        const buildTree = (path: string, depth: number, prefix: string = ""): React.ReactNode[] => {
          if (depth <= 0) return []
          const items = getFilesInDir(path === "/" ? "/rashbip" : path)
          const result: React.ReactNode[] = []
          
          items.forEach((item, i) => {
            const isLast = i === items.length - 1
            const currentPrefix = prefix + (isLast ? "└── " : "├── ")
            result.push(
              <div key={item.path} className="text-foreground font-mono text-xs">
                {currentPrefix}
                <span className={item.isDir ? "text-blue-500" : "text-foreground"}>
                  {item.name}{item.isDir ? "/" : ""}
                </span>
              </div>
            )
            if (item.isDir && depth > 1) {
              const nextPrefix = prefix + (isLast ? "    " : "│   ")
              const subItems = buildTree(item.path, depth - 1, nextPrefix)
              result.push(...subItems)
            }
          })
          return result
        }
        
        return (
          <div className="font-mono text-xs">
            {actualTreePath === "/" ? "/rashbip" : actualTreePath}
            <div className="mt-1">
              {buildTree(actualTreePath, treeDepth)}
            </div>
          </div>
        )

      case "ps":
        return (
          <div className="space-y-1 font-mono text-xs">
            <div className="text-foreground">  PID TTY          TIME CMD</div>
            <div className="text-foreground">    1 ?        00:00:00 bash</div>
            <div className="text-foreground">  123 ?        00:00:01 node</div>
            <div className="text-foreground">  456 ?        00:00:00 npm</div>
          </div>
        )

      case "jobs":
        return <div className="text-muted-foreground">No jobs running</div>

      case "kill":
        if (!args[0]) {
          return <div className="text-red-500">Usage: kill &lt;pid&gt;</div>
        }
        return <div className="text-green-500">Process {args[0]} terminated</div>

      case "man":
        if (!args[0]) {
          return <div className="text-red-500">Usage: man &lt;command&gt;</div>
        }
        const manCmd = args[0].toLowerCase()
        if (availableCommands.includes(manCmd)) {
          return (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-primary font-bold">{manCmd.toUpperCase()}(1) - Manual page</div>
              <div className="text-foreground">NAME</div>
              <div className="text-muted-foreground ml-4">{manCmd} - {manCmd} command</div>
              <div className="text-foreground mt-2">SYNOPSIS</div>
              <div className="text-muted-foreground ml-4">{manCmd} [options] [arguments]</div>
              <div className="text-foreground mt-2">DESCRIPTION</div>
              <div className="text-muted-foreground ml-4">This is a simulated {manCmd} command in rashbip's terminal.</div>
            </div>
          )
        }
        return <div className="text-red-500">No manual entry for {manCmd}</div>

      case "less":
      case "more":
        if (!args[0]) {
          return <div className="text-muted-foreground">Use 'cat' or 'nano' to view files</div>
        }
        const lessFile = normalizePath(args[0])
        const actualLessPath = lessFile.startsWith("/rashbip/") ? lessFile.replace("/rashbip", "") : (lessFile === "/rashbip" ? "/" : lessFile)
        const lessFileObj = files.find(f => f.path === actualLessPath)
        if (lessFileObj) {
          const content = getFileContent ? getFileContent(actualLessPath) : lessFileObj.content
          return (
            <div className="font-mono text-xs whitespace-pre-wrap max-h-96 overflow-auto">
              {content}
            </div>
          )
        }
        return <div className="text-red-500">{command}: {args[0]}: No such file</div>

      default:
        if (cmd.trim()) {
          // Suggest similar commands
          const suggestions = availableCommands.filter(c => {
            const dist = levenshteinDistance(command, c)
            return dist <= 2 && dist > 0
          }).slice(0, 3)
          
          if (suggestions.length > 0) {
            return (
              <div className="space-y-1">
                <div className="text-red-500">Command not found: {command}</div>
                <div className="text-muted-foreground">Did you mean:</div>
                {suggestions.map(s => (
                  <div key={s} className="text-primary cursor-pointer hover:underline" onClick={() => setInput(s + " ")}>
                    {s}
                  </div>
                ))}
              </div>
            )
          }
          return <div className="text-red-500">Command not found: {command}. Type 'help' for available commands.</div>
        }
        return null
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Propagate command to parent
    onCommand?.(input.trim().toLowerCase())
    
    const output = processCommand(input)
    if (output !== null || input.toLowerCase() !== "clear") {
      // Update ONLY active session
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, history: [...s.history, { cmd: input, output }] }
        }
        return s
      }))
    }
    setCommandHistory((prev) => [...prev, input])
    setInput("")
    setHistoryIndex(-1)
  }

  // Key down remains mostly same
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      const completions = getCompletions(input)
      if (completions.length === 1) {
        const parts = input.trim().split(" ")
        if (parts.length === 1) {
          setInput(completions[0] + " ")
        } else {
          const prefix = parts.slice(0, -1).join(" ") + " "
          setInput(prefix + completions[0])
        }
      } else if (completions.length > 1) {
        // Show possible completions
        const parts = input.trim().split(" ")
        if (parts.length === 1) {
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                history: [...s.history, {
                  cmd: input,
                  output: (
                    <div className="text-muted-foreground">
                      {completions.map(c => <span key={c} className="mr-2">{c}</span>)}
                    </div>
                  )
                }]
              }
            }
            return s
          }))
        }
      }
    }
  }

  const errorCount = problems.filter((p) => p.type === "error").length
  const warningCount = problems.filter((p) => p.type === "warning").length



  // If nano editor is open, show it instead of terminal
  if (nanoEditor) {
    return (
      <div
        className="flex flex-col border-t border-border animate-slide-in-up"
        style={{ height, background: "var(--sidebar-bg)" }}
      >
        <NanoEditor
          filePath={nanoEditor.filePath}
          content={nanoEditor.content}
          onSave={(content) => {
            onUpdateFileContent?.(nanoEditor.filePath, content)
            // Create file if it doesn't exist
            if (!files.some(f => f.path === nanoEditor.filePath)) {
              const fileName = nanoEditor.filePath.split('/').pop() || 'untitled'
              onCreateFile?.(fileName, nanoEditor.filePath.substring(0, nanoEditor.filePath.lastIndexOf('/')))
            }
            setNanoEditor(null)
            // Add to terminal history
            setSessions(prev => prev.map(s => {
              if (s.id === activeSessionId) {
                return {
                  ...s,
                  history: [...s.history, {
                    cmd: `nano ${nanoEditor.filePath.split('/').pop()}`,
                    output: <div className="text-green-500">File saved: {nanoEditor.filePath}</div>
                  }]
                }
              }
              return s
            }))
          }}
          onClose={() => setNanoEditor(null)}
        />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col border-t border-border animate-slide-in-up"
      style={{ height, background: "var(--sidebar-bg)" }}
    >
      {matrixMode && <MatrixRain />}

      {/* Resize handle */}
      <div
        ref={resizeRef}
        className="h-1 cursor-ns-resize hover:bg-primary transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange("terminal")}
            className={`flex items-center gap-2 text-sm pb-1 transition-colors ${activeTab === "terminal"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <TerminalIcon className="w-4 h-4" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => onTabChange("problems")}
            className={`flex items-center gap-2 text-sm pb-1 transition-colors ${activeTab === "problems"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <AlertIcon className="w-4 h-4" />
            <span>Problems</span>
            {(errorCount > 0 || warningCount > 0) && (
              <span className="text-xs bg-secondary px-1.5 rounded">
                {errorCount > 0 && <span className="text-red-500">{errorCount}</span>}
                {errorCount > 0 && warningCount > 0 && " "}
                {warningCount > 0 && <span className="text-yellow-500">{warningCount}</span>}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange("output")}
            className={`flex items-center gap-2 text-sm pb-1 transition-colors ${activeTab === "output"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <OutputIcon className="w-4 h-4" />
            <span>Output</span>
            {externalOutputs && externalOutputs.length > 1 && (
              <span className="text-xs bg-primary/20 text-primary px-1.5 rounded">{externalOutputs.length}</span>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {activeTab === "terminal" && (
            <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
              <div className="flex items-center bg-secondary/30 rounded overflow-hidden">
                {sessions.length > 1 && (
                  <select
                    value={activeSessionId}
                    onChange={(e) => setActiveSessionId(e.target.value)}
                    className="bg-transparent text-xs border-none outline-none py-1 px-2 cursor-pointer hover:bg-muted"
                    title="Select Terminal Session"
                    aria-label="Select Terminal Session"
                  >
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.id}: {s.name}</option>)}
                  </select>
                )}
                <button onClick={handleAddSession} className="p-1 hover:bg-muted" title="New Terminal">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={(e) => handleRemoveSession(activeSessionId, e)}
                className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-red-500 transition-colors"
                title="Kill Terminal Session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              if (activeTab === "terminal") handleClear()
              if (activeTab === "output") onClearOutputs?.()
              if (activeTab === "problems") setProblems([])
            }}
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
            title={`Clear ${activeTab}`}
          >
            <Ban className="w-4 h-4" />
          </button>

          <button
            onClick={() => onHeightChange(height === 200 ? 400 : 200)}
            className="p-1 hover:bg-secondary rounded"
            title={height === 200 ? "Maximize" : "Minimize"}
          >
            {height === 200 ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
        onClick={() => {
          inputRef.current?.focus()
          // Scroll to input on mobile
          setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }, 100)
        }}
      >
        {activeTab === "terminal" && activeSession && (
          <>
            {activeSession.history.map((entry, i) => (
              <div key={i} className="terminal-output mb-2">
                {entry.cmd && (
                  <div className="flex items-center gap-2">
                    <span className="text-primary">rashbip</span>
                    <span className="text-muted-foreground">@</span>
                    <span className="text-red-500">dev</span>
                    <span className="text-muted-foreground">:{activeSession.cwd}$</span>
                    <span className="text-foreground">{entry.cmd}</span>
                  </div>
                )}
                <div className="pl-0 mt-1"><LinkRenderer text={entry.output} /></div>
              </div>
            ))}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-primary">rashbip</span>
              <span className="text-muted-foreground">@</span>
              <span className="text-red-500">dev</span>
              <span className="text-muted-foreground">:{currentCwd}$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  // Scroll input into view on mobile when keyboard appears
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }, 300)
                }}
                className="flex-1 bg-transparent text-foreground outline-none"
                autoComplete="off"
                spellCheck={false}
                autoFocus
                aria-label="Terminal Input"
                title="Terminal Input"
              />
              <span className="w-2 h-4 bg-foreground cursor-blink" />
            </form>
          </>
        )}

        {/* ... (Rest of activeTab logic for problems and output remains) */}
        {activeTab === "problems" && (
          <div className="space-y-2">
            {problems.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">No problems detected</div>
            ) : (
              problems.map((problem, i) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-secondary/50 rounded cursor-pointer">
                  {problem.type === "error" && <ErrorIcon className="w-4 h-4 text-red-500 mt-0.5" />}
                  {problem.type === "warning" && <WarningIcon className="w-4 h-4 text-yellow-500 mt-0.5" />}
                  {problem.type === "info" && <InfoIcon className="w-4 h-4 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <div className="text-foreground">{problem.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {problem.file}:{problem.line}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "output" && (
          <div className="space-y-1">
            {externalOutputs &&
              externalOutputs.map((output, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-muted-foreground text-xs">[{output.timestamp}]</span>
                  <pre
                    className={`whitespace-pre-wrap ${output.type === "error"
                      ? "text-red-500"
                      : output.type === "success"
                        ? "text-green-500"
                        : output.type === "warning"
                          ? "text-yellow-500"
                          : "text-foreground"
                      }`}
                  >
                    <LinkRenderer text={output.message} />
                  </pre>
                </div>
              ))}
          </div>
        )}
      </div>
    </div >
  )
}

function MatrixRain() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-green-500 text-xs font-mono animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animation: `text-rain ${2 + Math.random() * 3}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          {String.fromCharCode(0x30a0 + Math.random() * 96)}
        </div>
      ))}
    </div>
  )
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function OutputIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </svg>
  )
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}
