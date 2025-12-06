"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Lock, Eye, Code } from "lucide-react"

export function ProfileHtmlViewer() {
  const [view, setView] = useState<"code" | "preview" | "split">("split")
  const [showProtectedMessage, setShowProtectedMessage] = useState(false)
  const { resolvedTheme } = useTheme()

  const isDark = resolvedTheme === "dark"

  const profileHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>rashbip - Developer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: ${isDark ? "#000" : "#fff"};
      --text: ${isDark ? "#fff" : "#000"};
      --muted: ${isDark ? "#888" : "#666"};
      --accent: #ef4444;
      --card: ${isDark ? "#111" : "#f5f5f5"};
    }
    body {
      font-family: system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 4rem 2rem; }
    .hero { text-align: center; margin-bottom: 4rem; animation: fadeUp 0.8s ease; }
    .status { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border: 1px solid var(--muted); border-radius: 999px; margin-bottom: 1.5rem; font-size: 0.875rem; color: var(--muted); }
    .status-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: pulse 2s infinite; }
    h1 { font-size: 4rem; font-weight: 700; margin-bottom: 1rem; }
    h1 span { color: var(--accent); }
    .tagline { font-size: 1.25rem; color: var(--muted); max-width: 500px; margin: 0 auto; }
    .links { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; }
    .link { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid var(--text); border-radius: 0.5rem; text-decoration: none; color: var(--text); transition: all 0.3s; }
    .link:hover { background: var(--text); color: var(--bg); }
    .link.primary { background: var(--text); color: var(--bg); }
    .link.primary:hover { background: transparent; color: var(--text); }
    .stack { margin-bottom: 4rem; animation: fadeUp 0.8s ease 0.2s both; }
    .section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--muted); margin-bottom: 1.5rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .card { background: var(--card); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid transparent; transition: all 0.3s; }
    .card:hover { border-color: var(--accent); transform: translateY(-4px); }
    .card-icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .card h3 { font-size: 1.125rem; margin-bottom: 0.25rem; }
    .card p { font-size: 0.875rem; color: var(--muted); }
    .skills { animation: fadeUp 0.8s ease 0.4s both; }
    .skill { margin-bottom: 1.25rem; }
    .skill-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .skill-bar { height: 4px; background: var(--card); border-radius: 999px; overflow: hidden; }
    .skill-fill { height: 100%; background: var(--accent); border-radius: 999px; animation: fillBar 1.5s ease forwards; }
    .footer { text-align: center; padding: 2rem; color: var(--muted); font-size: 0.875rem; animation: fadeUp 0.8s ease 0.6s both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes fillBar { from { width: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="status"><span class="status-dot"></span>ONLINE</div>
      <h1>rash<span>bip</span></h1>
      <p class="tagline">Not a portfolio. Not looking for a job. Just a developer existing on the internet.</p>
      <div class="links">
        <a href="https://github.com/rashbip" class="link primary" target="_blank">GitHub</a>
        <a href="https://reddit.com/user/Fair_Concentrate606" class="link" target="_blank">Reddit</a>
      </div>
    </div>
    <div class="stack">
      <div class="section-title">// Tech Stack</div>
      <div class="cards">
        <div class="card"><div class="card-icon">📱</div><h3>Android Native</h3><p>Views + Kotlin, Jetpack Compose</p></div>
        <div class="card"><div class="card-icon">🎨</div><h3>Jetpack Compose</h3><p>Modern declarative UI</p></div>
        <div class="card"><div class="card-icon">🚀</div><h3>Flutter</h3><p>All platforms, one codebase</p></div>
      </div>
    </div>
    <div class="skills">
      <div class="section-title">// Skills</div>
      <div class="skill"><div class="skill-header"><span>Kotlin</span><span>95%</span></div><div class="skill-bar"><div class="skill-fill" style="width:95%"></div></div></div>
      <div class="skill"><div class="skill-header"><span>Jetpack Compose</span><span>90%</span></div><div class="skill-bar"><div class="skill-fill" style="width:90%"></div></div></div>
      <div class="skill"><div class="skill-header"><span>Flutter</span><span>88%</span></div><div class="skill-bar"><div class="skill-fill" style="width:88%"></div></div></div>
      <div class="skill"><div class="skill-header"><span>Dart</span><span>85%</span></div><div class="skill-bar"><div class="skill-fill" style="width:85%"></div></div></div>
    </div>
    <div class="footer">Just a dev existing on the internet.</div>
  </div>
</body>
</html>`

  const handleCodeClick = () => {
    setShowProtectedMessage(true)
    setTimeout(() => setShowProtectedMessage(false), 2000)
  }

  const highlightHtml = (text: string): React.ReactNode => {
    const lines = text.split("\n")
    return lines.map((line, lineIndex) => {
      let highlighted = line
        .replace(/(&lt;!DOCTYPE[^&gt;]*&gt;)/gi, '<span class="syntax-keyword">$1</span>')
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="syntax-keyword">$2</span>')
        .replace(/\s([\w-]+)(=)/g, ' <span class="syntax-variable">$1</span>$2')
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
          {/* Filename removed */}
          <HtmlIcon className="w-4 h-4" />
          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Protected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded overflow-hidden">
            <button
              onClick={() => setView("code")}
              className={`p-1.5 transition-colors hover:bg-muted relative ${view === "code" ? "bg-primary text-primary-foreground" : ""}`}
              title="Code (Protected)"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("split")}
              className={`p-1.5 transition-colors ${view === "split" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Split View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="12" x2="12" y1="3" y2="21" /></svg>
            </button>
            <button
              onClick={() => setView("preview")}
              className={`p-1.5 transition-colors ${view === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Protected message toast */}
      {showProtectedMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-in-up">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm">This file is protected and can be read only</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Code View (Read Only) */}
        {(view === "code" || view === "split") && (
          <div className={`${view === "split" ? "w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0" : "w-full h-full"} flex flex-col border-r border-border overflow-hidden`}>
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-b border-border flex items-center gap-2">
              <Code className="w-3 h-3" />
              <span>SOURCE (READ-ONLY)</span>
            </div>
            <div className="flex-1 relative overflow-auto bg-background font-mono text-sm">
              <div className="select-none text-right pr-2 pl-4 py-4 text-xs font-mono border-r border-border float-left min-h-full h-full" style={{ color: "var(--line-number)" }}>
                {profileHtmlContent.split("\n").map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>
              <pre className="p-4 overflow-x-auto min-h-full">
                <code onClick={handleCodeClick} style={{ cursor: "not-allowed" }}>{highlightHtml(profileHtmlContent)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Preview View */}
        {(view === "preview" || view === "split") && (
          <div className={`${view === "split" ? "w-full md:w-1/2 h-1/2 md:h-full" : "w-full h-full"} flex flex-col overflow-hidden`}>
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-b border-border flex items-center gap-2">
              <Eye className="w-3 h-3" />
              <span>PREVIEW</span>
            </div>
            <iframe
              srcDoc={profileHtmlContent}
              className="w-full h-full border-0"
              title="Profile Preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1 text-xs text-muted-foreground bg-muted/20 border-t border-border flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Lock className="w-3 h-3" />
          Read-only file
        </span>
        <span>HTML Preview</span>
      </div>
    </div>
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
