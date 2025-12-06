"use client"

import { useState, useEffect, createContext, useRef } from "react"
import { ActivityBar } from "./ide/activity-bar"
import { Sidebar } from "./ide/sidebar"
import { EditorTabs } from "./ide/editor-tabs"
import { EditorContent } from "./ide/editor-content"
import { TerminalPanel } from "./ide/terminal-panel"
import { StatusBar } from "./ide/status-bar"
import { ProfilePage } from "./ide/profile-page"
import { HtmlPreview } from "./ide/html-preview"
import { DartPreview } from "./ide/dart-preview"
import { TitleBar } from "./ide/title-bar"
import { EmptyState } from "./ide/empty-state"
import { KotlinViewer } from "./ide/kotlin-viewer"
import { ProfileHtmlViewer } from "./ide/profile-html-viewer"

export type FileType = {
  name: string
  path: string
  icon: string
  content: string
  language: string
  isSpecial?: "profile" | "html-preview" | "dart-preview" | "kotlin-viewer" | "profile-html"
}

export const files: FileType[] = [
  {
    name: "profile.web",
    path: "/profile/profile.web",
    icon: "web",
    content: "",
    language: "web",
    isSpecial: "profile",
  },
  {
    name: "profile.html",
    path: "/profile/profile.html",
    icon: "html",
    content: "",
    language: "html",
    isSpecial: "profile-html",
  },
  {
    name: "README.md",
    path: "/README.md",
    icon: "markdown",
    content: `# rashbip

> Not a portfolio. Not looking for a job. Just existing on the internet.

## About

I build apps. Android, Flutter, whatever works.
This is a developer's space, not a showcase.

## Stack

\`\`\`
├── Android Native
│   ├── Views + Kotlin
│   └── Jetpack Compose + Kotlin
└── Flutter
    └── All platforms
\`\`\`

## Links

- GitHub: https://github.com/rashbip
- Reddit: u/Fair_Concentrate606

---

*Type \`help\` in the terminal for available commands.*`,
    language: "markdown",
  },
  {
    name: "index.html",
    path: "/web/index.html",
    icon: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Terminal</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="glitch-wrapper">
      <h1 class="glitch" data-text="RASHBIP">RASHBIP</h1>
    </div>
    <div class="terminal">
      <div class="terminal-header">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
      </div>
      <div class="terminal-body">
        <p class="typing"><span class="prompt">$</span> whoami</p>
        <p class="response">Mobile Developer | Code Enthusiast</p>
        <p class="typing"><span class="prompt">$</span> cat skills.txt</p>
        <p class="response">Android • Flutter • Kotlin • Dart</p>
        <p class="cursor-line">
          <span class="prompt">$</span> <span class="cursor">_</span>
        </p>
      </div>
    </div>
    <div class="buttons">
      <button onclick="alert('Welcome to the matrix!')">Enter</button>
      <button onclick="toggleTheme()">Toggle Theme</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    language: "html",
    isSpecial: "html-preview",
  },
  {
    name: "style.css",
    path: "/web/style.css",
    icon: "css",
    content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #0a0a0f;
  --text: #00ff88;
  --accent: #ff0055;
  --terminal-bg: rgba(0, 0, 0, 0.8);
}

body {
  font-family: 'Courier New', monospace;
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 80%, var(--accent) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, var(--text) 0%, transparent 50%);
  opacity: 0.1;
  pointer-events: none;
}

.container {
  text-align: center;
  z-index: 1;
}

.glitch-wrapper {
  margin-bottom: 2rem;
}

.glitch {
  font-size: 4rem;
  font-weight: bold;
  color: var(--text);
  position: relative;
  animation: glitch 2s infinite;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  animation: glitch-1 0.3s infinite;
  color: var(--accent);
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}

.glitch::after {
  animation: glitch-2 0.3s infinite;
  color: #00ffff;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  50% { transform: translate(3px, 0); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  50% { transform: translate(-3px, 0); }
}

.terminal {
  background: var(--terminal-bg);
  border: 1px solid var(--text);
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  margin: 0 auto;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
}

.terminal-header {
  padding: 10px;
  display: flex;
  gap: 6px;
  border-bottom: 1px solid var(--text);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.terminal-body {
  padding: 20px;
  text-align: left;
  color: var(--text);
  font-size: 14px;
  line-height: 1.8;
}

.prompt {
  color: var(--accent);
  margin-right: 8px;
}

.response {
  color: #888;
  padding-left: 16px;
  animation: fadeIn 0.5s ease;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 12px 24px;
  font-family: inherit;
  font-size: 14px;
  background: transparent;
  border: 1px solid var(--text);
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
}

button:hover {
  background: var(--text);
  color: var(--bg);
  box-shadow: 0 0 20px var(--text);
}

/* Light theme */
body.light {
  --bg: #f5f5f5;
  --text: #1a1a2e;
  --accent: #e63946;
  --terminal-bg: rgba(255, 255, 255, 0.9);
}`,
    language: "css",
  },
  {
    name: "script.js",
    path: "/web/script.js",
    icon: "js",
    content: `// Cyber Terminal Script

function toggleTheme() {
  document.body.classList.toggle('light');
}

// Matrix rain effect (optional)
function createMatrixRain() {
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix';
  canvas.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;opacity:0.1';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const chars = 'RASHBIP01';
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);
  
  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  setInterval(draw, 50);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Terminal loaded!');
  // Uncomment for matrix rain:
  // createMatrixRain();
});`,
    language: "javascript",
  },
  {
    name: "about.kt",
    path: "/src/about.kt",
    icon: "kotlin",
    content: `package dev.rashbip

/**
 * This is not a portfolio.
 * This is not a job application.
 * This is just a dev existing on the internet.
 */
object Developer {
    
    const val handle = "rashbip"
    const val status = "ACTIVE"
    
    val stack = listOf(
        Technology("Android Native", listOf("Views", "Kotlin")),
        Technology("Jetpack Compose", listOf("Kotlin", "Material3")),
        Technology("Flutter", listOf("Dart", "All Platforms"))
    )
    
    val links = mapOf(
        "github" to "https://github.com/rashbip",
        "reddit" to "u/Fair_Concentrate606"
    )
}

data class Technology(
    val name: String,
    val skills: List<String>
)`,
    language: "kotlin",
    isSpecial: "kotlin-viewer",
  },
  {
    name: "stack.dart",
    path: "/lib/stack.dart",
    icon: "dart",
    content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const TechStackPage(),
    );
  }
}

class TechStackPage extends StatelessWidget {
  const TechStackPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('rashbip - Tech Stack'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          StackCard(
            title: 'Android Native',
            subtitle: 'Views + Kotlin, Jetpack Compose',
            icon: Icons.android,
            color: Colors.green,
          ),
          SizedBox(height: 12),
          StackCard(
            title: 'Flutter',
            subtitle: 'Dart - All Platforms',
            icon: Icons.flutter_dash,
            color: Colors.blue,
          ),
        ],
      ),
    );
  }
}

class StackCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;

  const StackCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: color, size: 40),
        title: Text(title),
        subtitle: Text(subtitle),
      ),
    );
  }
}`,
    language: "dart",
    isSpecial: "dart-preview",
  },
  {
    name: "config.gradle.kts",
    path: "/build/config.gradle.kts",
    icon: "gradle",
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "dev.rashbip"
    compileSdk = 34

    defaultConfig {
        applicationId = "dev.rashbip"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
        viewBinding = true
    }
}

dependencies {
    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    
    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
}`,
    language: "kotlin",
  },
  {
    name: ".gitconfig",
    path: "/.gitconfig",
    icon: "config",
    content: `[user]
    name = rashbip
    email = dev@rashbip.dev

[core]
    editor = nvim
    autocrlf = input

[init]
    defaultBranch = main

[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    lg = log --oneline --graph --all
    yeet = push --force-with-lease
    oops = commit --amend --no-edit

[color]
    ui = auto`,
    language: "ini",
  },
]

type IDEContextType = {
  updateFileContent: (path: string, content: string) => void
  addTerminalOutput: (message: string, type?: "info" | "success" | "error") => void
  setTerminalTab: (tab: "terminal" | "problems" | "output") => void
  activeTerminalTab: "terminal" | "problems" | "output"
}

export const IDEContext = createContext<IDEContextType>({
  updateFileContent: () => { },
  addTerminalOutput: () => { },
  setTerminalTab: () => { },
  activeTerminalTab: "terminal",
})

export function IDE() {
  const [activeView, setActiveView] = useState<string>("explorer")
  const [openFiles, setOpenFiles] = useState<FileType[]>([files[0], files[1]]) // Open profile.web and profile.html
  const [activeFile, setActiveFile] = useState<FileType | null>(files[0])
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [terminalOutputs, setTerminalOutputs] = useState<
    Array<{ timestamp: string; message: string; type: "info" | "success" | "error" }>
  >([{ timestamp: new Date().toLocaleTimeString(), message: "Terminal ready.", type: "info" }])
  const [activeTerminalTab, setActiveTerminalTab] = useState<"terminal" | "problems" | "output">("terminal")
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar) return
      const newWidth = e.clientX - 48
      setSidebarWidth(Math.max(180, Math.min(500, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizingSidebar(false)
    }

    if (isResizingSidebar) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizingSidebar])

  const openFile = (file: FileType) => {
    if (!openFiles.find((f) => f.path === file.path)) {
      setOpenFiles([...openFiles, file])
    }
    setActiveFile(file)
  }

  const closeFile = (file: FileType) => {
    const newOpenFiles = openFiles.filter((f) => f.path !== file.path)
    setOpenFiles(newOpenFiles)
    if (activeFile?.path === file.path) {
      if (newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1])
      } else {
        setActiveFile(null)
      }
    }
  }

  const updateFileContent = (path: string, content: string) => {
    setFileContents((prev) => ({ ...prev, [path]: content }))
  }

  const addTerminalOutput = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setTerminalOutputs((prev) => [...prev, { timestamp, message, type }])
  }

  const getFileContent = (file: FileType) => {
    return fileContents[file.path] ?? file.content
  }

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-slow text-muted-foreground">Loading IDE...</div>
      </div>
    )
  }

  return (
    <IDEContext.Provider value={{ updateFileContent, addTerminalOutput, setTerminalTab: setActiveTerminalTab, activeTerminalTab: activeTerminalTab }}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
        <TitleBar files={files} openFile={openFile} />

        <div className="flex flex-1 overflow-hidden">
          <ActivityBar
            activeView={activeView}
            setActiveView={setActiveView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            terminalOpen={terminalOpen}
            setTerminalOpen={setTerminalOpen}
          />

          {sidebarOpen && (
            <div className={`flex animate-slide-in-left ${isMobile ? "absolute z-50 h-full bg-background border-r shadow-2xl" : ""}`} ref={sidebarRef} style={{ left: isMobile ? "48px" : "auto" }}>
              <div style={{ width: isMobile ? "240px" : sidebarWidth }}>
                <Sidebar activeView={activeView} files={files} openFile={(f) => {
                  openFile(f)
                  if (isMobile) setSidebarOpen(false)
                }} activeFile={activeFile} />
              </div>
              {!isMobile && (
                <div
                  className="w-1 cursor-ew-resize hover:bg-primary transition-colors"
                  onMouseDown={() => setIsResizingSidebar(true)}
                />
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <EditorTabs
              openFiles={openFiles}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              closeFile={closeFile}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden tab-content">
                {!activeFile ? (
                  <EmptyState />
                ) : activeFile.isSpecial === "profile" ? (
                  <ProfilePage />
                ) : activeFile.isSpecial === "profile-html" ? (
                  <ProfileHtmlViewer />
                ) : activeFile.isSpecial === "html-preview" ? (
                  <HtmlPreview
                    content={getFileContent(activeFile)}
                    onContentChange={(content) => updateFileContent(activeFile.path, content)}
                    defaultContent={activeFile.content}
                    cssContent={
                      getFileContent(files.find((f) => f.name === "style.css")!) ||
                      files.find((f) => f.name === "style.css")!.content
                    }
                    jsContent={
                      getFileContent(files.find((f) => f.name === "script.js")!) ||
                      files.find((f) => f.name === "script.js")!.content
                    }
                  />
                ) : activeFile.isSpecial === "dart-preview" ? (
                  <DartPreview
                    content={getFileContent(activeFile)}
                    onContentChange={(content) => updateFileContent(activeFile.path, content)}
                    defaultContent={activeFile.content}
                  />
                ) : activeFile.isSpecial === "kotlin-viewer" ? (
                  <KotlinViewer content={activeFile.content} filename={activeFile.name} />
                ) : (
                  <EditorContent
                    file={activeFile}
                    content={getFileContent(activeFile)}
                    onContentChange={(content) => updateFileContent(activeFile.path, content)}
                    previewTemplate={
                      activeFile.name === "style.css"
                        ? (getFileContent(files.find((f) => f.name === "index.html")!) || files.find((f) => f.name === "index.html")!.content)
                        : undefined
                    }
                  />
                )}
              </div>

              {terminalOpen && (
                <TerminalPanel
                  onClose={() => setTerminalOpen(false)}
                  height={terminalHeight}
                  onHeightChange={setTerminalHeight}
                  outputs={terminalOutputs}
                  activeTab={activeTerminalTab}
                  onTabChange={setActiveTerminalTab}
                />
              )}
            </div>
          </div>
        </div>

        <StatusBar file={activeFile} />
      </div>
    </IDEContext.Provider>
  )
}
