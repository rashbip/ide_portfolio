"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, RotateCcw, Code, Eye, Split, ArrowLeft } from "lucide-react"

type Props = {
  content: string
  onContentChange: (content: string) => void
  defaultContent: string
  cssContent?: string
  jsContent?: string
}

export function HtmlPreview({ content, onContentChange, defaultContent, cssContent, jsContent }: Props) {
  const [code, setCode] = useState(content || defaultContent)
  const [previewHtml, setPreviewHtml] = useState("")
  const [view, setView] = useState<"split" | "code" | "preview">("split")
  const [isMobile, setIsMobile] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  useEffect(() => {
    if (content) {
      setCode(content)
    }
  }, [content])

  useEffect(() => {
    // Debounce preview update to prevent flashing
    const timer = setTimeout(() => {
      // Only auto-update preview if NOT mobile, or if we ARE viewing preview
      if (!isMobile || view === "preview" || view === "split") {
        updatePreview()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [code, cssContent, jsContent, isMobile, view])

  const updatePreview = () => {
    let combinedHtml = code

    // Inject CSS if linked
    if (cssContent && code.includes('href="style.css"')) {
      combinedHtml = combinedHtml.replace('<link rel="stylesheet" href="style.css">', `<style>${cssContent}</style>`)
    }

    // Inject JS if linked
    if (jsContent && code.includes('src="script.js"')) {
      combinedHtml = combinedHtml.replace('<script src="script.js"></script>', `<script>${jsContent}</script>`)
    }

    setPreviewHtml(combinedHtml)
  }

  const runCode = () => {
    updatePreview()
    onContentChange(code)
    if (isMobile) {
      setView("preview")
    }
  }

  const resetCode = () => {
    setCode(defaultContent)
    onContentChange(defaultContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      runCode()
    }
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newCode = code.substring(0, start) + "  " + code.substring(end)
        setCode(newCode)
        onContentChange(newCode)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  const highlightHtml = (text: string): React.ReactNode => {
    const lines = text.split("\n")
    return lines.map((line, lineIndex) => {
      let highlighted = line
        // Comments
        .replace(/(<!--[\s\S]*?-->)/g, '<span class="syntax-comment">$1</span>')
        // Doctype
        .replace(/(&lt;!DOCTYPE[^&gt;]*&gt;)/gi, '<span class="syntax-keyword">$1</span>')
        // Tags
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="syntax-keyword">$2</span>')
        // Attributes
        .replace(/\s([\w-]+)(=)/g, ' <span class="syntax-variable">$1</span>$2')
        // Attribute values
        .replace(/(["'])((?:\\\1|(?:(?!\1)).)*)(\1)/g, '<span class="syntax-string">$1$2$3</span>')

      // Escape HTML for display
      highlighted = line
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/(<!--[\s\S]*?-->)/g, '<span class="syntax-comment">$1</span>')
        .replace(/(&lt;!DOCTYPE[^&gt;]*&gt;)/gi, '<span class="syntax-keyword">$1</span>')
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="syntax-keyword">$2</span>')
        .replace(/\s([\w-]+)(=)/g, ' <span class="syntax-variable">$1</span>$2')
        .replace(/(["'])((?:\\\1|(?:(?!\1)).)*)(\1)/g, '<span class="syntax-string">$1$2$3</span>')

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
          {isMobile && view === "preview" && (
            <button
              onClick={() => setView("code")}
              className="flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Code
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && (
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
          )}

          <button
            onClick={resetCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded border border-border hover:bg-muted transition-colors"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Main Run Button */}
          {(!isMobile || view === "code") && (
            <button
              onClick={runCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#7F52FF] text-white hover:opacity-90 transition-opacity"
              title="Run (Ctrl+Enter)"
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Code Editor with syntax highlighting */}
        {(view === "code" || view === "split") && (
          <div
            className={`${view === "split" ? "w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0" : "w-full h-full"} flex flex-col border-r border-border overflow-hidden`}
          >
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-b border-border flex items-center gap-2">
              <HtmlIcon className="w-4 h-4" />
              <span>HTML EDITOR</span>
            </div>
            <div className="flex-1 flex overflow-hidden font-mono text-sm relative">
              {/* Line numbers */}
              <div
                className="select-none text-right pr-2 pl-4 py-4 text-xs font-mono border-r border-border overflow-hidden h-full z-10 bg-background"
                style={{ color: "var(--line-number)" }}
              >
                {code.split("\n").map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Editor Container - allowing generic scoll */}
              <div className="flex-1 relative overflow-auto h-full">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    onContentChange(e.target.value)
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full h-full p-4 bg-transparent text-foreground caret-foreground font-mono text-sm resize-none focus:outline-none leading-6 whitespace-pre"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  placeholder="Write your HTML here..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {(view === "preview" || view === "split") && (
          <div className={`${view === "split" ? "w-full md:w-1/2 h-1/2 md:h-full" : "w-full h-full"} flex flex-col overflow-hidden`}>
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-b border-border flex items-center justify-between">
              <span>PREVIEW</span>
              <span className="text-xs text-green-500">Live</span>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                className="w-full h-full border-0 preview-frame"
                title="HTML Preview"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1 text-xs text-muted-foreground bg-muted/20 border-t border-border flex items-center justify-between">
        <span>Press Ctrl+Enter to run | Linked: style.css, script.js</span>
        <span>{code.length} characters</span>
      </div>
    </div >
  )
}

function HtmlIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z" fill="#E44D26" />
      <path d="M12 4v16l5-1.5L18.5 4H12z" fill="#F16529" />
      <path d="M7 7h10l-.5 5H9l.25 3H16l-.5 4-3.5 1-3.5-1-.25-3" fill="white" />
    </svg>
  )
}
