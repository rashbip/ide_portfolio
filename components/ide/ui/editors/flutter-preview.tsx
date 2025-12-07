"use client"

import type React from "react"
import { useState, useEffect, useRef, useContext } from "react"
import { Play, RotateCcw, Code, Eye, Split, Smartphone, Monitor, Tablet, RefreshCw, Power, Info, Search, Code2, Globe, Wrench, User, ExternalLink } from "lucide-react"
import { IDEContext } from "../../context/ide-context"

type Props = {
  content: string
  filename: string
}

export function FlutterPreview({ content, filename }: Props) {
  const [view, setView] = useState<"split" | "code" | "preview">("split")
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("phone")
  const [isRunning, setIsRunning] = useState(false)
  const [isHotReloading, setIsHotReloading] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [appState, setAppState] = useState<"stopped" | "running" | "reloading">("stopped")
  const previewRef = useRef<HTMLDivElement>(null)

  const { addTerminalOutput, setTerminalTab } = useContext(IDEContext)

  const runApp = () => {
    if (appState === "running") return
    
    setIsRunning(true)
    setAppState("running")
    setRunKey((k) => k + 1)

    setTerminalTab("output")
    addTerminalOutput("> flutter run -d chrome", "info")
    setTimeout(() => {
      addTerminalOutput("Launching lib/main.dart on Chrome in debug mode...", "info")
    }, 500)
    setTimeout(() => {
      addTerminalOutput("Waiting for connection from debug service on Chrome...", "info")
    }, 1000)
    setTimeout(() => {
      addTerminalOutput("Flutter run key commands:", "info")
      addTerminalOutput("r Hot reload. 🔥🔥🔥", "info")
      addTerminalOutput("R Hot restart. (Currently disabled)", "info")
      addTerminalOutput("q Quit (terminate the application on the device).", "info")
    }, 2000)
    setTimeout(() => {
      setIsRunning(false)
      addTerminalOutput("Syncing files to device Chrome...", "success")
      addTerminalOutput("Flutter run succeeded!", "success")
    }, 2500)
  }

  const hotReload = () => {
    if (appState !== "running") {
      addTerminalOutput("No active session to reload. Run the app first.", "error")
      return
    }

    setIsHotReloading(true)
    setAppState("reloading")
    setRunKey((k) => k + 1)

    setTerminalTab("output")
    addTerminalOutput("Performing hot reload...", "info")
    setTimeout(() => {
      addTerminalOutput("Reloaded 1 of 1,234 libraries", "success")
      setIsHotReloading(false)
      setAppState("running")
    }, 800)
  }

  const restart = () => {
    if (appState === "stopped") {
      runApp()
      return
    }

    setIsRunning(true)
    setAppState("running")
    setRunKey((k) => k + 1)

    setTerminalTab("output")
    addTerminalOutput("Performing hot restart...", "info")
    setTimeout(() => {
      addTerminalOutput("Restarted application in 1,234ms", "success")
      setIsRunning(false)
    }, 1200)
  }

  const stopApp = () => {
    setAppState("stopped")
    addTerminalOutput("Application finished.", "info")
  }

  const getDeviceWidth = () => {
    switch (device) {
      case "phone":
        return "375px"
      case "tablet":
        return "768px"
      case "desktop":
        return "100%"
    }
  }

  const highlightDart = (text: string): React.ReactNode => {
    const lines = text.split("\n")
    return lines.map((line, lineIndex) => {
      const highlighted = line
        .replace(/(\/\/.*$)/gm, '<span class="syntax-comment">$1</span>')
        .replace(/(["'])((?:\\\1|(?:(?!\1)).)*)(\1)/g, '<span class="syntax-string">$1$2$3</span>')
        .replace(
          /\b(import|package|class|extends|const|final|var|void|return|if|else|for|while|switch|case|break|continue|new|this|super|static|async|await|try|catch|throw|required|override|late|factory|typedef|get|set|abstract|implements|mixin|with|enum|extension)\b/g,
          '<span class="syntax-keyword">$1</span>',
        )
        .replace(
          /\b(String|int|double|bool|List|Map|Set|Future|Stream|Widget|BuildContext|StatelessWidget|StatefulWidget|State|Key|Text|Container|Column|Row|Scaffold|AppBar|ListView|MaterialApp|ThemeData|EdgeInsets|SizedBox|Icon|Icons|Card|ListTile|Center|Padding|Colors|Color|Material|IconData|ProviderScope)\b/g,
          '<span class="syntax-type">$1</span>',
        )
        .replace(/\b(\w+)(?=\s*\()/g, '<span class="syntax-function">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>')
        .replace(/(@\w+)/g, '<span class="syntax-function">$1</span>')

      return (
        <div key={lineIndex} className="leading-6 px-2">
          <span dangerouslySetInnerHTML={{ __html: highlighted || " " }} />
        </div>
      )
    })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <FlutterLogo className="w-4 h-4" />
          <span className="text-sm font-medium">{filename}</span>
          <span className="text-xs text-muted-foreground">(Read-only)</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Device selector */}
          <div className="flex items-center border border-border rounded overflow-hidden">
            <button
              onClick={() => setDevice("phone")}
              className={`p-1.5 transition-colors ${device === "phone" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Phone"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 transition-colors ${device === "tablet" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 transition-colors ${device === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-border rounded overflow-hidden">
            <button
              onClick={() => setView("code")}
              className={`p-1.5 transition-colors ${view === "code" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Code only"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("split")}
              className={`p-1.5 transition-colors ${view === "split" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Split view"
            >
              <Split className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("preview")}
              className={`p-1.5 transition-colors ${view === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Preview only"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-1 border border-border rounded overflow-hidden">
            <button
              onClick={stopApp}
              disabled={appState === "stopped"}
              className="p-1.5 transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              title="Stop"
            >
              <Power className="w-4 h-4" />
            </button>
            <button
              onClick={restart}
              disabled={isRunning}
              className="p-1.5 transition-colors hover:bg-muted disabled:opacity-50"
              title="Hot Restart (R)"
            >
              <RotateCcw className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={hotReload}
              disabled={isHotReloading || appState !== "running"}
              className="p-1.5 transition-colors hover:bg-muted disabled:opacity-50"
              title="Hot Reload (r)"
            >
              <RefreshCw className={`w-4 h-4 ${isHotReloading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={runApp}
              disabled={isRunning || appState === "running"}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#00D2B8] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Run"
            >
              <Play className={`w-4 h-4 ${isRunning ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor - READ ONLY */}
        {(view === "code" || view === "split") && (
          <div
            className={`${view === "split" ? "w-1/2" : "w-full"} flex flex-col border-r border-border overflow-hidden`}
          >
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-b border-border flex items-center gap-2">
              <DartLogo className="w-4 h-4" />
              <span>DART CODE (READ-ONLY)</span>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Line numbers */}
              <div
                className="editor-font select-none text-right pr-2 pl-4 py-4 font-mono border-r border-border overflow-y-auto"
                style={{ color: "var(--line-number)" }}
              >
                {content.split("\n").map((_, i) => (
                  <div key={i} className="leading-relaxed">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Read-only code display */}
              <div className="flex-1 relative overflow-auto">
                <pre className="editor-font p-4 font-mono min-w-max">
                  <code>{highlightDart(content)}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {(view === "preview" || view === "split") && (
          <div className={`${view === "split" ? "w-1/2" : "w-full"} flex flex-col overflow-hidden`}>
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlutterLogo className="w-4 h-4" />
                <span>FLUTTER PREVIEW</span>
                {appState === "running" && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-xs">Running</span>
                )}
                {appState === "reloading" && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-xs">Reloading...</span>
                )}
              </div>
              <span className={`text-xs ${isRunning || isHotReloading ? "text-yellow-500" : appState === "running" ? "text-green-500" : "text-muted-foreground"}`}>
                {isRunning ? "Compiling..." : isHotReloading ? "Reloading..." : appState === "running" ? "Ready" : "Stopped"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden bg-[#1e1e1e] flex items-center justify-center p-4">
              <div
                ref={previewRef}
                key={runKey}
                className="h-full rounded-lg overflow-hidden border border-border shadow-xl transition-all duration-300 bg-white"
                style={{ width: getDeviceWidth(), maxWidth: "100%" }}
              >
                {appState === "stopped" ? (
                  <div className="h-full flex items-center justify-center bg-gray-900 text-gray-500">
                    <div className="text-center">
                      <Power className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">App stopped. Click Run to start.</p>
                    </div>
                  </div>
                ) : (
                  <FlutterAppPreview device={device} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1 text-xs text-muted-foreground bg-muted/20 border-t border-border flex items-center justify-between">
        <span>Read-only mode | Press Run to start the app</span>
        <span>
          {content.split("\n").length} lines | {content.length} characters
        </span>
      </div>
    </div>
  )
}

function FlutterAppPreview({ device }: { device: "phone" | "tablet" | "desktop" }) {
  return (
    <div className="h-full w-full bg-white dark:bg-gray-950 flex flex-col">
      {/* Minimal App Bar */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">rashbip</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border-0 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 space-y-2">
          {/* Profile Section */}
          <div className="flex items-center gap-3 py-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">rashbip</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Android & Flutter Developer</p>
            </div>
          </div>

          {/* Tech Stack - Minimal Cards */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 active:bg-gray-100 dark:active:bg-gray-900 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Android</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kotlin, Compose, Coroutines</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 active:bg-gray-100 dark:active:bg-gray-900 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Flutter</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dart, Riverpod, Bloc</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 active:bg-gray-100 dark:active:bg-gray-900 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Web</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">React, Next.js, Tailwind</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 active:bg-gray-100 dark:active:bg-gray-900 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Tools</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Git, Gradle, Docker</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="pt-3 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <InfoIcon className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">About</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pl-6">
              Not a portfolio. Not looking for a job. Just existing on the internet.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-2 pt-2 pb-4">
            <a href="#" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-900 dark:bg-gray-800 text-white rounded-xl active:scale-[0.98] transition-all text-xs font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a href="#" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-xl active:scale-[0.98] transition-all text-xs font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Reddit
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function DartLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4.5 12L12 4.5 19.5 12 12 19.5 4.5 12z" fill="#00D2B8" />
      <path d="M12 4.5L19.5 12H12V4.5z" fill="#00A8A8" />
    </svg>
  )
}

function FlutterLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14.25 0L3 11.25l3.563 3.563L20.625 0H14.25z" fill="#42A5F5" />
      <path d="M14.25 12.188L9.563 16.875l3.562 3.562 7.5-7.5L14.25 12.188z" fill="#42A5F5" />
      <path d="M9.563 16.875L5.813 20.625 9.375 24.188 13.125 20.438z" fill="#0D47A1" />
    </svg>
  )
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1349 1.0987L4.8429 5.4467a.4161.4161 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.186.8532 13.3074.0116 16.0082c-.0806.321.1322.6583.4532.7389.321.0805.6583-.1322.7389-.4532 1.3015-5.2019 6.7078-8.9815 12.7953-8.9815s11.4938 3.7796 12.7953 8.9815c.0806.321.4179.5338.7389.4532.321-.0806.5338-.4179.4532-.7389-.8416-2.7008-2.6774-4.8221-5.1348-6.3868z"/>
    </svg>
  )
}

function FlutterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M14.314 0L.012 12.223l5.647 5.647 14.302-12.22L14.314 0zm.014 11.463l-4.31 4.31 4.31 4.31 4.31-4.31-4.31-4.31z"/>
    </svg>
  )
}

function WebIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function ToolsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  )
}

