"use client"

import type React from "react"

import { useState, useEffect, useRef, useContext } from "react"
import { Play, RotateCcw, Code, Eye, Split, Smartphone, Monitor, Tablet, ExternalLink } from "lucide-react"
import { IDEContext } from "../../../ide"

type Props = {
  content: string
  onContentChange: (content: string) => void
  defaultContent: string
}

export function DartPreview({ content, onContentChange, defaultContent }: Props) {
  const [code, setCode] = useState(content || defaultContent)
  const [view, setView] = useState<"split" | "code" | "preview">("split")
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("phone")
  const [isRunning, setIsRunning] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (content) {
      setCode(content)
    }
  }, [content])

  const { addTerminalOutput, setTerminalTab } = useContext(IDEContext)

  const runCode = () => {
    setIsRunning(true)
    onContentChange(code)
    setRunKey((k) => k + 1)

    // Simulate terminal feedback
    setTerminalTab("output")
    addTerminalOutput("> flutter run -d chrome", "info")
    setTimeout(() => {
      addTerminalOutput("Launching lib/stack.dart on Chrome in debug mode...", "info")
    }, 500)
    setTimeout(() => {
      addTerminalOutput("Waiting for connection from debug service on Chrome...", "info")
    }, 1500)

    setTimeout(() => {
      setIsRunning(false)
      addTerminalOutput("Syncing files to device Chrome...", "success")
      addTerminalOutput("Flutter run key commands.", "info")
      addTerminalOutput("r Hot reload. R Hot restart.", "info")
    }, 2500)
  }

  const resetCode = () => {
    setCode(defaultContent)
    onContentChange(defaultContent)
    setRunKey((k) => k + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      runCode()
    }
  }

  const getDartPadUrl = () => {
    // Base64 encode the code for reliable URL transmission
    const encodedCode = encodeURIComponent(code)
    return `https://dartpad.dev/embed-flutter.html?theme=dark&run=true&split=false&code=${encodedCode}`
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
          /\b(import|class|extends|const|final|var|void|return|if|else|for|while|switch|case|break|continue|new|this|super|static|async|await|try|catch|throw|required|override|late|factory|typedef|get|set|abstract|implements|mixin|with|enum|extension)\b/g,
          '<span class="syntax-keyword">$1</span>',
        )
        .replace(
          /\b(String|int|double|bool|List|Map|Set|Future|Stream|Widget|BuildContext|StatelessWidget|StatefulWidget|State|Key|Text|Container|Column|Row|Scaffold|AppBar|ListView|MaterialApp|ThemeData|EdgeInsets|SizedBox|Icon|Icons|Card|ListTile|Center|Padding|Colors|Color|Material|IconData)\b/g,
          '<span class="syntax-type">$1</span>',
        )
        .replace(/\b(\w+)(?=\s*\()/g, '<span class="syntax-function">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>')
        .replace(/(@\w+)/g, '<span class="syntax-function">$1</span>')

      return (
        <div key={lineIndex} className="leading-6 hover:bg-secondary/30 px-2">
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
          {/* Filename removed */}
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

          <a
            href="https://dartpad.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-border hover:bg-muted transition-colors"
            title="Open in DartPad"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">DartPad</span>
          </a>

          <button
            onClick={resetCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-border hover:bg-muted transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#00D2B8] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            title="Run (Ctrl+Enter)"
          >
            <Play className={`w-4 h-4 ${isRunning ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
          </button>
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor with syntax highlighting - FIXED SCROLL */}
        {(view === "code" || view === "split") && (
          <div
            className={`${view === "split" ? "w-1/2" : "w-full"} flex flex-col border-r border-border overflow-hidden`}
          >
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-b border-border flex items-center gap-2">
              <DartLogo className="w-4 h-4" />
              <span>DART EDITOR</span>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Line numbers */}
              <div
                className="select-none text-right pr-2 pl-4 py-4 text-xs font-mono border-r border-border overflow-y-auto"
                style={{ color: "var(--line-number)" }}
              >
                {code.split("\n").map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Editor with highlighting overlay */}
              <div className="flex-1 relative overflow-auto" ref={editorRef}>
                {/* Highlighted code (background) */}
                <pre className="absolute inset-0 p-4 font-mono text-sm pointer-events-none min-w-max">
                  <code>{highlightDart(code)}</code>
                </pre>
                {/* Textarea (foreground, transparent text) */}
                <textarea
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    onContentChange(e.target.value)
                  }}
                  onKeyDown={handleKeyDown}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-foreground font-mono text-sm resize-none focus:outline-none leading-6 min-w-max"
                  spellCheck={false}
                  placeholder="Write your Dart/Flutter code here..."
                  style={{ minHeight: `${code.split("\n").length * 24 + 32}px` }}
                />
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
              </div>
              <span className={`text-xs ${isRunning ? "text-yellow-500" : "text-green-500"}`}>
                {isRunning ? "Compiling..." : "Ready"}
              </span>
            </div>
            <div className="flex-1 overflow-hidden bg-[#1e1e1e] flex items-center justify-center p-4">
              <div
                className="h-full rounded-lg overflow-hidden border border-border shadow-xl transition-all duration-300"
                style={{ width: getDeviceWidth(), maxWidth: "100%" }}
              >
                <iframe
                  key={runKey}
                  ref={iframeRef}
                  src={getDartPadUrl()}
                  className="w-full h-full border-0"
                  title="Flutter Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1 text-xs text-muted-foreground bg-muted/20 border-t border-border flex items-center justify-between">
        <span>Press Ctrl+Enter to run | Powered by DartPad</span>
        <span>
          {code.split("\n").length} lines | {code.length} characters
        </span>
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
