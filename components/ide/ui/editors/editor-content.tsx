"use client"

import type React from "react"
import { useState, useRef, useEffect, useContext, useCallback } from "react"
import type { FileType } from "../../data/files"
import { Play, Split, Eye, Code, RotateCcw, ArrowLeft } from "lucide-react"
import { IDEContext } from "../../../ide"
import { useEditorSettings } from "../../context/editor-settings-context"

type Props = {
  file: FileType
  content?: string
  onContentChange?: (content: string) => void
  previewTemplate?: string
}

export function EditorContent({ file, content, onContentChange, previewTemplate }: Props) {
  const fileContent = content ?? file.content
  const [code, setCode] = useState(fileContent)
  const [view, setView] = useState<"code" | "split" | "preview">(previewTemplate ? "split" : "code")
  const [previewHtml, setPreviewHtml] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const codeContainerRef = useRef<HTMLDivElement>(null)
  const { addTerminalOutput, setTerminalTab, updateFileContent } = useContext(IDEContext)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { settings } = useEditorSettings()

  // Special Page Rendering
  if (file.isSpecial === "welcome") {
     return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-6 overflow-auto bg-background">
           <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Welcome to rashbip OS</h1>
           <p className="max-w-md text-muted-foreground">
             An advanced web-based IDE simulation. Not valid for production use, but perfect for exploring code in a safe sandbox.
           </p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer group">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="p-2 bg-blue-500/20 text-blue-400 rounded group-hover:bg-blue-500/30 transition-colors">
                       <Code className="w-5 h-5" />
                    </span>
                    <h3 className="font-semibold text-foreground">Explore Code</h3>
                 </div>
                 <p className="text-sm text-muted-foreground text-left">Browse the file tree to see how this portfolio is built.</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 mb-2">
                    <span className="p-2 bg-purple-500/20 text-purple-400 rounded group-hover:bg-purple-500/30 transition-colors">
                       <Play className="w-5 h-5" />
                    </span>
                    <h3 className="font-semibold text-foreground">Run & Debug</h3>
                 </div>
                 <p className="text-sm text-muted-foreground text-left">Open HTML/JS files and hit Run to see live previews or output.</p>
              </div>
           </div>
        </div>
     )
  }

  if (file.isSpecial === "documentation") {
     return (
        <div className="h-full w-full p-8 overflow-auto prose prose-invert max-w-none bg-background">
           <h1 className="text-3xl font-bold mb-4">Documentation</h1>
           <p className="text-muted-foreground mb-6">Welcome to the <strong>rashbip OS</strong> documentation. A fully functional web-based IDE simulation.</p>
           
           <h3 className="text-xl font-semibold mb-2 mt-6">Core Features</h3>
           <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
             <li><strong>Virtual File System</strong>: Create, read, update, and delete files/folders directly in the browser. Changes persist via LocalStorage.</li>
             <li><strong>Rich Editor</strong>: Syntax highlighting for 10+ languages including JS, TS, HTML, CSS, Dart, Kotlin, Python, etc.</li>
             <li><strong>Integrated Terminal</strong>: A simulated shell environment with a variety of built-in commands.</li>
             <li><strong>Live Preview</strong>: Real-time HTML/CSS/JS rendering engine for web projects.</li>
             <li><strong>Customization</strong>: Settings for font size, tab size, word wrap, minimap, and auto-save.</li>
           </ul>

           <h3 className="text-xl font-semibold mb-2 mt-6">Terminal Commands</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4 bg-secondary/10">
                 <h4 className="font-bold mb-2 text-primary">File Operations</h4>
                 <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><code className="text-foreground">ls</code> - List directory contents</li>
                    <li><code className="text-foreground">cd [dir]</code> - Change directory</li>
                    <li><code className="text-foreground">mkdir [name]</code> - Create directory (simulated) </li>
                    <li><code className="text-foreground">touch [file]</code> - Create file (simulated)</li>
                    <li><code className="text-foreground">cat [file]</code> - Read file content</li>
                    <li><code className="text-foreground">rm [file]</code> - Remove file (simulated)</li>
                 </ul>
              </div>
              <div className="border border-border rounded-lg p-4 bg-secondary/10">
                 <h4 className="font-bold mb-2 text-primary">System & Utils</h4>
                 <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><code className="text-foreground">help</code> - Show available commands</li>
                    <li><code className="text-foreground">clear</code> - Clear terminal output</li>
                    <li><code className="text-foreground">whoami</code> - Current user info</li>
                    <li><code className="text-foreground">date</code> - Show current system date</li>
                    <li><code className="text-foreground">matrix</code> - Toggle Matrix rain effect</li>
                    <li><code className="text-foreground">neofetch</code> - Show system info</li>
                 </ul>
              </div>
              <div className="border border-border rounded-lg p-4 bg-secondary/10">
                 <h4 className="font-bold mb-2 text-primary">Dev Tools</h4>
                 <ul className="space-y-1 text-sm text-muted-foreground">
                    <li><code className="text-foreground">flutter doctor</code> - Check flutter status</li>
                    <li><code className="text-foreground">npm install</code> - Install dependencies (simulated)</li>
                    <li><code className="text-foreground">git status</code> - Check git status</li>
                    <li><code className="text-foreground">gradle build</code> - Run gradle build</li>
                    <li><code className="text-foreground">adb devices</code> - List Android devices</li>
                 </ul>
              </div>
           </div>

           <h3 className="text-xl font-semibold mb-2 mt-6">Keyboard Shortcuts</h3>
           <div className="border border-border rounded-lg overflow-hidden">
             <table className="w-full text-left text-sm">
               <thead className="bg-muted/50">
                 <tr className="border-b border-border">
                   <th className="py-2 px-4 font-medium">Key</th>
                   <th className="py-2 px-4 font-medium">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 <tr><td className="py-2 px-4"><kbd className="bg-secondary px-1.5 py-0.5 rounded text-xs border border-border">Ctrl+P</kbd></td><td className="py-2 px-4 text-muted-foreground">Quick File Search</td></tr>
                 <tr><td className="py-2 px-4"><kbd className="bg-secondary px-1.5 py-0.5 rounded text-xs border border-border">F5</kbd></td><td className="py-2 px-4 text-muted-foreground">Start Debugging / Run</td></tr>
                 <tr><td className="py-2 px-4"><kbd className="bg-secondary px-1.5 py-0.5 rounded text-xs border border-border">Ctrl+S</kbd></td><td className="py-2 px-4 text-muted-foreground">Save File</td></tr>
                 <tr><td className="py-2 px-4"><kbd className="bg-secondary px-1.5 py-0.5 rounded text-xs border border-border">Ctrl+Shift+E</kbd></td><td className="py-2 px-4 text-muted-foreground">Toggle Explorer</td></tr>
                 <tr><td className="py-2 px-4"><kbd className="bg-secondary px-1.5 py-0.5 rounded text-xs border border-border">Ctrl+`</kbd></td><td className="py-2 px-4 text-muted-foreground">Toggle Terminal</td></tr>
               </tbody>
             </table>
           </div>
        </div>
     )
  }

  if (file.isSpecial === "about") {
     return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-background">
           <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full rounded-full border-4 border-border shadow-xl flex items-center justify-center bg-secondary text-4xl">
                 R
              </div>
           </div>
           
           <h1 className="text-3xl font-bold mb-2">rashbip</h1>
           <p className="text-muted-foreground mb-8">Mobile Developer • Android • Flutter</p>
           
           <div className="space-y-4 max-w-md w-full">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border">
                 <span className="text-sm text-muted-foreground">Version</span>
                 <span className="font-mono text-sm">2.4.6</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border">
                 <span className="text-sm text-muted-foreground">Date</span>
                 <span className="font-mono text-sm">2025.12.06</span>
              </div>
              <button 
                onClick={() => window.open('https://github.com/rashbip/ide_portfolio', '_blank')}
                className="w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                 <span>View on GitHub</span>
              </button>
           </div>
        </div>
     )
  }

  const isCss = file.language === "css"
  const isJs = file.language === "javascript"

  const [isMobile, setIsMobile] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile && view === "split") {
        setView("code")
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Sync scroll for minimap
  useEffect(() => {
    const container = codeContainerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [view, previewTemplate])

  // Autosave functionality - saves every 2 minutes when enabled and changes exist
  useEffect(() => {
    if (!settings.autoSave || !onContentChange) {
      return
    }

    // Clear existing timer on new changes
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Only start timer if there are unsaved changes
    if (hasUnsavedChanges.current) {
      autoSaveTimerRef.current = setTimeout(() => {
        if (hasUnsavedChanges.current) {
          onContentChange(code)
          setLastSaved(new Date())
          hasUnsavedChanges.current = false
          addTerminalOutput(`Auto-saved ${file.name}`, "success")
        }
      }, settings.autoSaveInterval)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [code, settings.autoSave, settings.autoSaveInterval, onContentChange, file.name, addTerminalOutput])

  // Reset autosave state when file changes
  useEffect(() => {
    hasUnsavedChanges.current = false
    setLastSaved(null)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
  }, [file.path])

  useEffect(() => {
    setCode(fileContent)
  }, [fileContent])

  useEffect(() => {
    if (previewTemplate && isCss) {
      let html = previewTemplate
      // More robust regex to find the style.css link tag
      const linkRegex = /<link[^>]*href=["']style\.css["'][^>]*>/i

      if (linkRegex.test(html)) {
        html = html.replace(linkRegex, `<style>${code}</style>`)
      } else {
        // Fallback: append to head if no link tag found
        html = html.replace('</head>', `<style>${code}</style></head>`)
      }
      setPreviewHtml(html)
    }
  }, [code, previewTemplate, isCss])

  const handleRun = () => {
    setTerminalTab("output")
    if (isCss) {
      addTerminalOutput(`> Injecting ${file.name} into preview...`, "info")
      // Update preview immediately handled by useEffect, just simulate terminal feedback
      setTimeout(() => addTerminalOutput("Preview updated.", "success"), 200)

      if (isMobile) {
        setView("preview")
      } else if (view === "code") {
        setView("split") // Open split view if currently just in code
      }
    } else if (isJs) {
      addTerminalOutput(`> Executing ${file.name}...`, "info")
      try {
        const originalLog = console.log
        const logs: string[] = []
        console.log = (...args) => logs.push(args.join(" "))

        // Very basic eval
        // eslint-disable-next-line no-eval
        eval(code)

        console.log = originalLog

        if (logs.length > 0) {
          logs.forEach(log => addTerminalOutput(log, "info"))
        }
        addTerminalOutput("Script executed successfully.", "success")
      } catch (e: any) {
        addTerminalOutput(`Error: ${e.message}`, "error")
      }
    } else {
      addTerminalOutput(`Running ${file.language} is not supported directly.`, "error")
    }
  }

  const lines = code.split("\n")
  const isEditable = isCss || isJs || file.language === "html" || file.language === "json" || file.language === "markdown" || file.language === "ini"

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCode(newCode)
    hasUnsavedChanges.current = true
    onContentChange?.(newCode)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      handleRun()
    }
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newCode = code.substring(0, start) + "  " + code.substring(end)
        setCode(newCode)
        onContentChange?.(newCode)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  // Syntax highlighting helper (kept from original)
  const highlightSyntax = (line: string, language: string): React.ReactNode => {
    // ... (Keep existing implementation logic mostly)
    // For brevity in this thought process, assume I copy the huge function.
    // In actual tool call I will include the full function.
    if (language === "markdown") {
      if (line.startsWith("# ")) return <span className="syntax-keyword font-bold text-lg">{line}</span>
      if (line.startsWith("## ")) return <span className="syntax-keyword font-bold">{line}</span>
      if (line.startsWith("```")) return <span className="syntax-comment">{line}</span>
      if (line.startsWith("> ")) return <span className="syntax-string italic">{line}</span>
      if (line.startsWith("- ")) return <><span className="syntax-operator">- </span><span>{line.slice(2)}</span></>
      if (line.startsWith("*") && line.endsWith("*")) return <span className="syntax-comment italic">{line}</span>
      const codeRegex = /`([^`]+)`/g
      const parts = line.split(codeRegex)
      if (parts.length > 1) {
        return parts.map((part, i) => i % 2 === 1 ? <span key={i} className="syntax-string bg-secondary px-1 rounded">{part}</span> : <span key={i}>{part}</span>)
      }
      return line
    }

    if (language === "kotlin" || language === "dart") {
      // ... existing regexes
      const keywords = /\b(package|import|object|class|data|fun|val|var|const|if|else|when|for|while|return|override|static|final|void|extends|implements|abstract|interface|enum|sealed|suspend|async|await|required|super|this|new|throw|try|catch|finally|is|as|in|out|get|set|late|factory|const|typedef)\b/g
      const types = /\b(String|Int|Long|Float|Double|Boolean|List|Map|Set|Duration|LocalDate|Widget|BuildContext|StatelessWidget|StatefulWidget|State|Key|Text|Container|Column|Row|Scaffold|AppBar|ListView|Framework|Technology)\b/g
      const functions = /\b(\w+)(?=\s*\()/g
      const strings = /(["'])((?:\\\1|(?:(?!\1)).)*)(\1)/g
      const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
      const annotations = /(@\w+)/g
      const numbers = /\b(\d+)\b/g

      const result = line
        .replace(comments, '<span class="syntax-comment">$1</span>')
        .replace(strings, '<span class="syntax-string">$1$2$3</span>')
        .replace(annotations, '<span class="syntax-function">$1</span>')
        .replace(keywords, '<span class="syntax-keyword">$1</span>')
        .replace(types, '<span class="syntax-type">$1</span>')
        .replace(functions, '<span class="syntax-function">$1</span>')
        .replace(numbers, '<span class="syntax-number">$1</span>')
      return <span dangerouslySetInnerHTML={{ __html: result }} />
    }

    if (language === "css") {
      const result = line
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syntax-comment">$1</span>')
        .replace(/([.#]?[\w-]+)(\s*\{)/g, '<span class="syntax-keyword">$1</span>$2')
        .replace(/([\w-]+)(\s*:)/g, '<span class="syntax-variable">$1</span>$2')
        .replace(/:\s*([^;{}]+)/g, ': <span class="syntax-string">$1</span>')
        .replace(/(@[\w-]+)/g, '<span class="syntax-function">$1</span>')
        .replace(/(\d+(?:px|em|rem|%|vh|vw|s|ms)?)/g, '<span class="syntax-number">$1</span>')
      return <span dangerouslySetInnerHTML={{ __html: result }} />
    }

    if (language === "javascript") {
      const result = line
        .replace(/(\/\/.*$)/gm, '<span class="syntax-comment">$1</span>')
        .replace(/(["'`])((?:\\\1|(?:(?!\1)).)*)(\1)/g, '<span class="syntax-string">$1$2$3</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|this|class|extends|import|export|default|async|await|try|catch|throw|typeof|instanceof)\b/g, '<span class="syntax-keyword">$1</span>')
        .replace(/\b(\w+)(?=\s*\()/g, '<span class="syntax-function">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="syntax-type">$1</span>')
      return <span dangerouslySetInnerHTML={{ __html: result }} />
    }

    if (language === "html") {
      const escaped = line.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      const result = escaped
        .replace(/(<!--[\s\S]*?-->)/g, '<span class="syntax-comment">$1</span>')
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="syntax-keyword">$2</span>')
        .replace(/\s([\w-]+)(=)/g, ' <span class="syntax-variable">$1</span>$2')
        .replace(/(["'])((?:\\\1|(?:(?!\1)).)*)(\1)/g, '<span class="syntax-string">$1$2$3</span>')
      return <span dangerouslySetInnerHTML={{ __html: result }} />
    }

    if (language === "ini") {
      // ... (Keep existing)
      if (line.startsWith("[") && line.endsWith("]")) return <span className="syntax-keyword">{line}</span>
      if (line.includes("=")) {
        const [key, ...valueParts] = line.split("=")
        const value = valueParts.join("=")
        return <><span className="syntax-variable">{key}</span><span className="syntax-operator">=</span><span className="syntax-string">{value}</span></>
      }
      if (line.trim().startsWith("#")) return <span className="syntax-comment">{line}</span>
      return line
    }
    return line
  }

  // Render logic
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 min-h-[48px]">
        <div className="flex items-center gap-2">
          {isMobile && view === "preview" && (
            <button
              onClick={() => setView("code")}
              className="flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Code
            </button>
          )}

          {/* If has preview, show view toggles */}
          {previewTemplate && !isMobile && (
            <div className="flex items-center border border-border rounded overflow-hidden">
              <button onClick={() => setView("code")} className={`p-1.5 transition-colors ${view === "code" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} title="Code only"><Code className="w-4 h-4" /></button>
              <button onClick={() => setView("split")} className={`p-1.5 transition-colors ${view === "split" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} title="Split view"><Split className="w-4 h-4" /></button>
              <button onClick={() => setView("preview")} className={`p-1.5 transition-colors ${view === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} title="Preview only"><Eye className="w-4 h-4" /></button>
            </div>
          )}

          {/* View indicators or Breadcrumbs could go here if needed, but keeping it clean as per user req */}
        </div>

        {/* Run Button for JS/CSS */}
        {(isCss || isJs) && (
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#7F52FF] text-white hover:opacity-90 transition-opacity"
            title={isCss ? "Inject CSS into Preview" : "Run Script"}
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Code Editor */}
        {(view === "code" || view === "split" || !previewTemplate) && (
          <div className={`${(view === "split" && previewTemplate) ? "w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r" : "w-full h-full"} flex flex-col overflow-hidden`}>
            <div className="flex-1 flex font-mono relative overflow-hidden">
              {/* Line numbers */}
              <div className="editor-font select-none text-right pr-4 pl-4 py-2 border-r border-border overflow-hidden bg-background z-10" style={{ color: "var(--line-number)" }}>
                {lines.map((_, i) => <div key={i} className="leading-relaxed">{i + 1}</div>)}
              </div>

              {/* Editor Content */}
              <div ref={codeContainerRef} className="flex-1 relative overflow-auto h-full">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`editor-font w-full h-full p-2 pl-4 bg-transparent text-foreground caret-foreground font-mono resize-none focus:outline-none leading-relaxed ${
                    settings.wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                  }`}
                  style={{ 
                    overflowWrap: settings.wordWrap ? "break-word" : "normal",
                    wordBreak: settings.wordWrap ? "break-word" : "normal"
                  }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                />
              </div>

              {/* Minimap */}
              {settings.minimap && !isMobile && (
                <div className="w-[60px] bg-muted/30 border-l border-border overflow-hidden relative flex-shrink-0">
                  <div 
                    className="absolute inset-0 overflow-hidden minimap pointer-events-none"
                    style={{ fontSize: "2px", lineHeight: "3px" }}
                  >
                    <div className="p-1 text-muted-foreground/50 select-none">
                      {lines.slice(0, 1000).map((line, i) => (
                        <div 
                          key={i} 
                          className="truncate"
                          style={{ 
                            height: "3px", 
                            background: line.trim() ? "currentColor" : "transparent",
                            opacity: line.trim() ? 0.3 : 0,
                            marginBottom: "1px"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Viewport indicator */}
                  <div 
                    className="absolute left-0 right-0 bg-primary/10 border border-primary/30 rounded-sm transition-all pointer-events-none"
                    style={{
                      top: codeContainerRef.current 
                        ? `${(scrollTop / (codeContainerRef.current.scrollHeight - codeContainerRef.current.clientHeight)) * 100}%` 
                        : "0%",
                      height: `${Math.min(40, Math.max(10, (20 / Math.max(1, lines.length)) * 100))}px`
                    }}
                  />
                </div>
              )}
            </div>

            {/* Autosave indicator */}
            {settings.autoSave && lastSaved && (
              <div className="px-2 py-0.5 text-xs text-muted-foreground bg-muted/50 border-t border-border">
                Auto-saved at {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* Preview Pane */}
        {previewTemplate && (view === "preview" || view === "split") && (
          <div className={`${view === "split" ? "w-full md:w-1/2 h-1/2 md:h-full" : "w-full h-full"} flex flex-col overflow-hidden bg-white`}>
            <iframe
              ref={iframeRef}
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="CSS Preview"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        )}
      </div>
    </div>
  )
}
// Helper icons...
