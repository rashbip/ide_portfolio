"use client"

import type React from "react"
import { useState, useRef, useEffect, useContext } from "react"
import type { FileType } from "../ide"
import { Play, Split, Eye, Code, RotateCcw } from "lucide-react"
import { IDEContext } from "../ide"

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
  const { addTerminalOutput, setTerminalTab } = useContext(IDEContext)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isCss = file.language === "css"
  const isJs = file.language === "javascript"

  useEffect(() => {
    setCode(fileContent)
  }, [fileContent])

  useEffect(() => {
    if (previewTemplate && isCss) {
      // Simple injection for CSS
      // We replace the link tag with the style tag or append it
      let html = previewTemplate
      if (html.includes('href="style.css"')) {
        html = html.replace('<link rel="stylesheet" href="style.css">', `<style>${code}</style>`)
      } else {
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
          {/* If has preview, show view toggles */}
          {previewTemplate && (
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
            <div className="flex-1 flex text-sm font-mono relative overflow-hidden">
              {/* Line numbers */}
              <div className="select-none text-right pr-4 pl-4 py-2 border-r border-border overflow-hidden bg-background z-10" style={{ color: "var(--line-number)" }}>
                {lines.map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
              </div>

              {/* Editor Content */}
              <div className="flex-1 relative overflow-auto h-full">
                <pre className="p-2 min-h-full pointer-events-none">
                  <code>
                    {lines.map((line, i) => (
                      <div key={i} className="leading-6 hover:bg-secondary/30 px-2 min-w-max">
                        {highlightSyntax(line, file.language) || " "}
                      </div>
                    ))}
                  </code>
                </pre>
                {isEditable && (
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 w-full h-full p-2 pl-4 bg-transparent text-transparent caret-foreground font-mono text-sm resize-none focus:outline-none leading-6 whitespace-pre"
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
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
