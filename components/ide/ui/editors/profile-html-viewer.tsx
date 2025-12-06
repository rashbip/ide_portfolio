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
    :root {
      --bg: ${isDark ? "#000000" : "#ffffff"};
      --text: ${isDark ? "#ffffff" : "#000000"};
      --muted: ${isDark ? "#a3a3a3" : "#525252"};
      --border: ${isDark ? "#262626" : "#e5e5e5"};
      --card-bg: ${isDark ? "#171717" : "#f5f5f5"};
      --red: #ef4444;
      --red-soft: rgba(239, 68, 68, 0.1);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      line-height: 1.5;
      overflow-x: hidden;
    }
    
    /* Layout */
    .container {
      max-width: 64rem;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      position: relative;
      z-index: 10;
    }
    
    /* Background FX */
    .bg-gradient {
      position: fixed;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, var(--red-soft) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
      filter: blur(40px);
    }

    /* Animations */
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes fillWidth { from { width: 0; } }
    
    .animate-up { animation: slideUp 0.6s ease forwards; opacity: 0; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    
    /* Typography */
    h1 { font-size: 3.75rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 1rem; line-height: 1; }
    @media (min-width: 768px) { h1 { font-size: 6rem; } }
    h1 span { display: inline-block; }
    h1 .highlight { color: var(--red); }
    
    p.lead { font-size: 1.25rem; color: var(--muted); margin-bottom: 2rem; max-width: 36rem; line-height: 1.6; }
    @media (min-width: 768px) { p.lead { font-size: 1.5rem; } }
    
    .section-label { font-family: monospace; font-size: 0.875rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; display: block; }
    
    /* Components */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 9999px;
      font-family: monospace;
      font-size: 0.875rem;
      color: var(--muted);
      margin-bottom: 1.5rem;
    }
    .status-dot { width: 0.5rem; height: 0.5rem; background-color: var(--red); border-radius: 50%; animation: pulse 2s infinite; }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-primary { background-color: var(--text); color: var(--bg); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px var(--red-soft); }
    .btn-outline { border: 2px solid var(--text); color: var(--text); }
    .btn-outline:hover { background-color: var(--text); color: var(--bg); transform: translateY(-2px); }
    
    /* Grid Layouts */
    .grid { display: grid; gap: 1rem; }
    .grid-2 { grid-template-columns: 1fr; }
    .grid-3 { grid-template-columns: 1fr; }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    @media (min-width: 768px) {
      .grid-2 { grid-template-columns: repeat(2, 1fr); }
      .grid-3 { grid-template-columns: repeat(3, 1fr); }
      .grid-4 { grid-template-columns: repeat(4, 1fr); }
    }
    
    /* Cards */
    .card {
      background-color: transparent;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .card:hover { border-color: var(--red); transform: scale(1.02); }
    .card-icon {
      width: 3rem; height: 3rem;
      background-color: var(--card-bg);
      border-radius: 0.5rem;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
      transition: color 0.3s;
    }
    .card:hover .card-icon { color: var(--red); }
    .card h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
    
    /* Skills */
    .skill-row { margin-bottom: 1.25rem; }
    .skill-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; }
    .skill-track { width: 100%; height: 0.375rem; background-color: var(--border); border-radius: 9999px; overflow: hidden; }
    .skill-bar { height: 100%; background-color: var(--red); border-radius: 9999px; animation: fillWidth 1.5s ease forwards; }

    /* Terminal */
    .terminal-box {
      background-color: ${isDark ? "#0a0a0a" : "#f1f1f1"};
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      font-family: monospace;
      font-size: 0.875rem;
    }
    .cmd { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--muted); }
    .cmd span:first-child { color: var(--red); }
    .output { color: var(--text); padding-left: 1rem; margin-bottom: 1rem; }
    
    /* Utilities */
    .text-muted { color: var(--muted); }
    .text-sm { font-size: 0.875rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-16 { margin-bottom: 4rem; }
    .flex { display: flex; gap: 1rem; }
    .text-center { text-align: center; }
    
    svg { width: 1.25rem; height: 1.25rem; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="container">
  
    <!-- Hero -->
    <div class="mb-16 animate-up">
      <div class="status-badge"><span class="status-dot"></span>ONLINE</div>
      <h1>
        r a s h <span class="highlight">b i p</span>
      </h1>
      <p class="lead">
        Not a portfolio. Not looking for a job. Just a developer <strong style="color:var(--red)">existing</strong> on the internet.
      </p>
      <div class="flex">
        <a href="https://github.com/rashbip" target="_blank" class="btn btn-primary">
          <svg viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
          GitHub
        </a>
        <a href="https://reddit.com/user/Fair_Concentrate606" target="_blank" class="btn btn-outline">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M17 12a5 5 0 0 0-5 5 5 5 0 0 0-5-5 5 5 0 0 0 5-5 5 5 0 0 0 5 5Z"></path></svg>
          Reddit
        </a>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-4 mb-16 animate-up delay-1">
      <div class="card">
        <div style="font-size:2rem; font-weight:700; margin-bottom:0.25rem">5+</div>
        <div class="text-muted text-sm">Years Coding</div>
      </div>
      <div class="card">
        <div style="font-size:2rem; font-weight:700; margin-bottom:0.25rem">3</div>
        <div class="text-muted text-sm">Frameworks</div>
      </div>
      <div class="card">
        <div style="font-size:2rem; font-weight:700; margin-bottom:0.25rem">All</div>
        <div class="text-muted text-sm">Platforms</div>
      </div>
      <div class="card">
        <div style="font-size:2rem; font-weight:700; margin-bottom:0.25rem">∞</div>
        <div class="text-muted text-sm">Coffee/Day</div>
      </div>
    </div>

    <!-- Layout: Tech Stack & Skills -->
    <div class="mb-16">
      <span class="section-label">// Tech Stack</span>
      <div class="grid grid-3 animate-up delay-2">
        <div class="card">
          <div class="card-icon"><svg viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg></div>
          <h3>Android Native</h3>
          <p class="text-muted text-sm">Views + Kotlin, Jetpack Compose</p>
        </div>
        <div class="card">
          <div class="card-icon"><svg viewBox="0 0 24 24"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg></div>
          <h3>Jetpack Compose</h3>
          <p class="text-muted text-sm">Modern declarative UI</p>
        </div>
        <div class="card">
          <div class="card-icon"><svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg></div>
          <h3>Flutter</h3>
          <p class="text-muted text-sm">All platforms, one codebase</p>
        </div>
      </div>
    </div>

    <!-- Skills -->
    <div class="mb-16 animate-up delay-3">
      <span class="section-label">// Skills</span>
      <div class="card">
        <div class="skill-row">
          <div class="skill-header"><span>Kotlin</span><span>95%</span></div>
          <div class="skill-track"><div class="skill-bar" style="width:95%"></div></div>
        </div>
        <div class="skill-row">
          <div class="skill-header"><span>Jetpack Compose</span><span>90%</span></div>
          <div class="skill-track"><div class="skill-bar" style="width:90%; animation-delay:0.1s"></div></div>
        </div>
        <div class="skill-row">
          <div class="skill-header"><span>Flutter</span><span>88%</span></div>
          <div class="skill-track"><div class="skill-bar" style="width:88%; animation-delay:0.2s"></div></div>
        </div>
        <div class="skill-row">
          <div class="skill-header"><span>Dart</span><span>85%</span></div>
          <div class="skill-track"><div class="skill-bar" style="width:85%; animation-delay:0.3s"></div></div>
        </div>
      </div>
    </div>
    
    <!-- Terminal Quote -->
    <div class="mb-16 animate-up delay-4">
      <div class="terminal-box">
        <div class="cmd">
          <span>$</span> whoami
        </div>
        <div class="output">
          rashbip - Mobile Developer
        </div>
        <div class="cmd">
          <span>$</span> cat /etc/motd
        </div>
        <div class="output text-muted" style="font-style:italic">
          "This is not a portfolio. This is not a job application."
        </div>
        <div class="cmd">
          <span>$</span> <span style="width:10px; height:20px; background:var(--red); display:inline-block; animation:pulse 1s infinite"></span>
        </div>
      </div>
    </div>

    <div class="text-center text-muted text-sm animate-up delay-4">
      Just a dev existing on the internet.
    </div>

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
