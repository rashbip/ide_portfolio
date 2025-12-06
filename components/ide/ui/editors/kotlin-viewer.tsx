"use client"

import type React from "react"
import { useState, useContext } from "react"
import { Play } from "lucide-react"
import { IDEContext } from "../../context/ide-context"

type Props = {
  content: string
  filename: string
}

export function KotlinViewer({ content, filename }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const { addTerminalOutput, setTerminalTab } = useContext(IDEContext)

  const lines = content.split("\n")

  const handleRun = () => {
    setIsRunning(true)
    setTerminalTab("output")
    addTerminalOutput("> Task :compileKotlin", "info")

    setTimeout(() => {
      addTerminalOutput("> Task :processResources NO-SOURCE", "info")
    }, 300)

    setTimeout(() => {
      addTerminalOutput("> Task :classes", "info")
    }, 600)

    setTimeout(() => {
      addTerminalOutput("> Task :run", "info")
    }, 900)

    setTimeout(() => {
      addTerminalOutput(
        `
Developer(
  handle = "rashbip",
  status = "ACTIVE",
  stack = [
    Technology(name=Android Native, skills=[Views, Kotlin]),
    Technology(name=Jetpack Compose, skills=[Kotlin, Material3]),
    Technology(name=Flutter, skills=[Dart, All Platforms])
  ],
  links = {github=https://github.com/rashbip, reddit=u/Fair_Concentrate606}
)`,
        "info",
      )
    }, 1200)

    setTimeout(() => {
      addTerminalOutput("BUILD SUCCESSFUL in 2s", "success")
      addTerminalOutput("3 actionable tasks: 3 executed", "success")
      setIsRunning(false)
    }, 2000)
  }

  const highlightSyntax = (line: string): React.ReactNode => {
    const keywords =
      /\b(package|import|object|class|data|fun|val|var|const|if|else|when|for|while|return|override|static|final|void|extends|implements|abstract|interface|enum|sealed|suspend|async|await|required|super|this|new|throw|try|catch|finally|is|as|in|out|get|set|late|factory|typedef)\b/g
    const types =
      /\b(String|Int|Long|Float|Double|Boolean|List|Map|Set|Duration|LocalDate|Widget|BuildContext|StatelessWidget|StatefulWidget|State|Key|Text|Container|Column|Row|Scaffold|AppBar|ListView|Framework|Technology)\b/g
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
      .replace(numbers, '<span class="syntax-number">$1</span>')

    return <span dangerouslySetInnerHTML={{ __html: result }} />
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">

        </div>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[#7F52FF] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          title="Run (outputs to Terminal > Output)"
        >
          {isRunning ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isRunning ? "Running..." : "Run"}</span>
        </button>
      </div>

      {/* Editor (Read Only) */}
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-1 text-xs text-muted-foreground flex items-center gap-1">
          <span>rashbip</span>
          <span className="text-border">{">"}</span>
          <span>src {">"} about.kt</span>
        </div>

        <div className="flex font-mono">
          <div
            className="editor-font select-none text-right pr-4 pl-4 py-2 border-r border-border"
            style={{ color: "var(--line-number)" }}
          >
            {lines.map((_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>

          <pre className="editor-font flex-1 p-2 overflow-x-auto">
            <code>
              {lines.map((line, i) => (
                <div key={i} className="leading-relaxed hover:bg-secondary/30 px-2">
                  {highlightSyntax(line) || " "}
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}

function KotlinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id="kotlin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7F52FF" />
          <stop offset="100%" stopColor="#C811E2" />
        </linearGradient>
      </defs>
      <path d="M2 2h20L12 12l10 10H2V2z" fill="url(#kotlin-grad)" />
    </svg>
  )
}
