"use client"

import type React from "react"

import { useState, useEffect, useRef, useContext } from "react"
import { Play, RotateCcw, Code, Eye, Split, Smartphone, Monitor, Tablet, ExternalLink, Code2, Globe } from "lucide-react"
import { IDEContext } from "../../context/ide-context"

type Props = {
  content: string
  onContentChange: (content: string) => void
  defaultContent: string
}

export function DartPreview({ content, onContentChange, defaultContent }: Props) {
  const initialCode = content || defaultContent
  const [code, setCode] = useState(initialCode)
  const [view, setView] = useState<"split" | "code" | "preview">("split")
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">("phone")
  const [isRunning, setIsRunning] = useState(false)
  const [runKey, setRunKey] = useState(0)
  const [dartPadCode, setDartPadCode] = useState<string | null>(null) // Only set when Run is pressed
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (content) {
      setCode(content)
    }
  }, [content])

  const { addTerminalOutput, setTerminalTab } = useContext(IDEContext)

  const runCode = () => {
    setIsRunning(true)
    // Update DartPad code only when Run is pressed
    setDartPadCode(code)
    onContentChange(code)
    // Force iframe reload by incrementing runKey
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
    setDartPadCode(null) // Reset DartPad code
    setRunKey(0) // Reset run key
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      runCode()
    }
  }

  // Create a data URL with the code embedded in HTML
  // This creates a wrapper page that loads DartPad and injects code via postMessage
  const getDartPadUrl = () => {
    if (!dartPadCode) {
      return "" // Return empty if no code to run
    }
    
    // Escape the code for JavaScript string
    const cleanCode = dartPadCode.trim().replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${')
    
    // Create an HTML page that loads DartPad and injects code via postMessage
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: #1e1e1e; }
    iframe { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe id="dartpad" src="https://dartpad.dev/embed-flutter.html?theme=dark&run=false&split=false&null_safety=true"></iframe>
  <script>
    (function() {
      const code = \`${cleanCode}\`;
      const iframe = document.getElementById('dartpad');
      let sent = false;
      
      function sendCode() {
        if (sent) return;
        try {
          if (iframe.contentWindow) {
            // Try multiple DartPad message formats
            const messages = [
              { source: 'dartpad', type: 'code', code: code },
              { type: 'setCode', code: code },
              { method: 'updateCode', params: { code: code } },
              { source: 'dartpad-embed', type: 'setSource', sourceCode: code },
              { action: 'setCode', code: code }
            ];
            
            messages.forEach(msg => {
              iframe.contentWindow.postMessage(msg, 'https://dartpad.dev');
            });
            
            // Also try to access DartPad's internal API
            try {
              if (iframe.contentWindow.dartpad) {
                iframe.contentWindow.dartpad.setCode(code);
              }
            } catch(e) {}
          }
        } catch(e) {
          console.error('Error sending code:', e);
        }
      }
      
      iframe.addEventListener('load', function() {
        // Wait for DartPad to fully initialize
        setTimeout(() => {
          sendCode();
          sent = true;
        }, 2500);
      });
      
      // Also try after various delays
      setTimeout(sendCode, 1000);
      setTimeout(sendCode, 2000);
      setTimeout(sendCode, 3000);
      setTimeout(sendCode, 4000);
    })();
  </script>
</body>
</html>`
    
    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
  }

  // Code injection is now handled in the data URL HTML wrapper
  // This ensures code is sent to DartPad via postMessage after it loads

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
        {/* Code Editor - Normal textarea like script.js */}
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
                className="editor-font select-none text-right pr-2 pl-4 py-4 font-mono border-r border-border overflow-y-auto"
                style={{ color: "var(--line-number)" }}
              >
                {code.split("\n").map((_, i) => (
                  <div key={i} className="leading-relaxed">
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Simple textarea editor */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  onContentChange(e.target.value)
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 p-4 bg-background text-foreground font-mono resize-none focus:outline-none leading-relaxed overflow-auto"
                spellCheck={false}
                placeholder="Write your Dart/Flutter code here..."
                style={{ 
                  fontSize: "14px",
                  tabSize: 2,
                }}
              />
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
                {dartPadCode && runKey > 0 ? (
                  <FlutterStackPreview code={dartPadCode} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-900">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm mb-2">Click Run to execute the code</p>
                      <p className="text-xs opacity-75">Code will render as Flutter app</p>
                    </div>
                  </div>
                )}
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

// Custom Flutter preview that parses and renders the code
function FlutterStackPreview({ code }: { code: string }) {
  // Parse StackItem widgets from the code
  const parseStackItems = (): Array<{ title: string; subtitle: string; icon: string; color: string }> => {
    const items: Array<{ title: string; subtitle: string; icon: string; color: string }> = []
    
    // Regex to find StackItem widgets - matches: StackItem(title: '...', subtitle: '...', icon: Icons.xxx, color: Colors.xxx)
    // Format: StackItem(title: 'Android', subtitle: '...', icon: Icons.android, color: Colors.green)
    const regex = /StackItem\s*\(\s*title:\s*['"]([^'"]+)['"]\s*,\s*subtitle:\s*['"]([^'"]+)['"]\s*,\s*icon:\s*Icons\.(\w+)\s*,\s*color:\s*Colors\.(\w+)/gs
    
    let match
    while ((match = regex.exec(code)) !== null) {
      const title = match[1] || ''
      const subtitle = match[2] || ''
      const icon = match[3] || 'code'
      const color = (match[4] || 'gray').toLowerCase()
      
      if (title && subtitle) {
        items.push({ title, subtitle, icon, color })
      }
    }
    
    return items
  }

  const items = parseStackItems()
  const hasItems = items.length > 0

  // Get app bar title from code
  const getAppBarTitle = (): string => {
    const titleMatch = code.match(/title:\s*(?:const\s+)?Text\s*\(['"]([^'"]+)['"]\)/)
    return titleMatch ? titleMatch[1] : 'rashbip - Tech Stack'
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      android: <Code2 className="w-6 h-6" />,
      flutter_dash: <Code2 className="w-6 h-6" />,
      web: <Globe className="w-6 h-6" />,
    }
    return iconMap[iconName] || <Code2 className="w-6 h-6" />
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    }
    return colorMap[color] || "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
  }

  return (
    <div className="h-full w-full bg-white dark:bg-gray-950 flex flex-col">
      {/* App Bar */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-900">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">{getAppBarTitle()}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-2">
          {hasItems ? (
            items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 active:bg-gray-100 dark:active:bg-gray-900 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getColorClass(item.color)}`}>
                  {getIconComponent(item.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p className="text-sm mb-2">Unable to parse Flutter code</p>
                <p className="text-xs opacity-75">Make sure your code contains StackItem widgets</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
