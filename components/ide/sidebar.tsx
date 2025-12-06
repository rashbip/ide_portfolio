"use client"

import type React from "react"
import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import type { FileType } from "../ide"
import {
  KotlinIcon,
  DartIcon,
  HtmlIcon,
  MarkdownIcon,
  GradleIcon,
  ConfigIcon,
  WebIcon,
  CssIcon,
  JsIcon,
} from "./file-icons"

type Props = {
  activeView: string
  files: FileType[]
  openFile: (file: FileType) => void
  activeFile: FileType | null
}

type FolderStructure = {
  name: string
  type: "folder" | "file"
  children?: FolderStructure[]
  file?: FileType
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  kotlin: KotlinIcon,
  dart: DartIcon,
  html: HtmlIcon,
  markdown: MarkdownIcon,
  gradle: GradleIcon,
  config: ConfigIcon,
  web: WebIcon,
  css: CssIcon,
  js: JsIcon,
}

export function Sidebar({ activeView, files, openFile, activeFile }: Props) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["rashbip", "src", "lib", "build", "web"]),
  )
  const { theme, setTheme } = useTheme()

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName]
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />
    }
    return <WebIcon className="w-4 h-4" />
  }

  const fileTree: FolderStructure = {
    name: "rashbip",
    type: "folder",
    children: [
      { name: "profile.web", type: "file", file: files[0] },
      {
        name: "web",
        type: "folder",
        children: [
          { name: "profile.html", type: "file", file: files[1] },
          { name: "index.html", type: "file", file: files[3] },
          { name: "style.css", type: "file", file: files[4] },
          { name: "script.js", type: "file", file: files[5] },
        ],
      },
      {
        name: "src",
        type: "folder",
        children: [{ name: "about.kt", type: "file", file: files[6] }],
      },
      {
        name: "lib",
        type: "folder",
        children: [{ name: "stack.dart", type: "file", file: files[7] }],
      },
      {
        name: "build",
        type: "folder",
        children: [{ name: "config.gradle.kts", type: "file", file: files[8] }],
      },
      { name: "README.md", type: "file", file: files[2] },
      { name: ".gitconfig", type: "file", file: files[9] },
    ],
  }

  const renderTree = (node: FolderStructure, path = "", depth = 0) => {
    const fullPath = path ? `${path}/${node.name}` : node.name
    const isExpanded = expandedFolders.has(fullPath)
    const isActive = node.file?.path === activeFile?.path

    if (node.type === "folder") {
      return (
        <div key={fullPath}>
          <button
            onClick={() => toggleFolder(fullPath)}
            className="file-tree-item w-full flex items-center gap-1 py-1 px-2 text-sm text-foreground hover:bg-secondary"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500" />
            )}
            <span>{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div>{node.children.map((child) => renderTree(child, fullPath, depth + 1))}</div>
          )}
        </div>
      )
    }

    return (
      <button
        key={fullPath}
        onClick={() => node.file && openFile(node.file)}
        className={`file-tree-item w-full flex items-center gap-2 py-1 px-2 text-sm transition-colors ${
          isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 12 + 28}px` }}
      >
        {node.file && getIcon(node.file.icon)}
        <span>{node.name}</span>
      </button>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "explorer":
        return (
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Explorer
            </div>
            <div className="px-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">rashbip</div>
              {renderTree(fileTree)}
            </div>
          </div>
        )
      case "search":
        return (
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Search</div>
            <input
              type="text"
              placeholder="Search files..."
              className="w-full bg-input border border-border rounded px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-4">
              Press <kbd className="px-1 py-0.5 bg-secondary rounded text-xs">Ctrl+P</kbd> for quick search
            </p>
          </div>
        )
      case "git":
        return (
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Source Control
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground mb-4">
              <GitBranchIcon className="w-4 h-4" />
              <span>main</span>
            </div>
            <p className="text-xs text-muted-foreground">No changes detected.</p>
            <div className="mt-4 text-xs text-muted-foreground">
              <a
                href="https://github.com/rashbip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/rashbip
              </a>
            </div>
          </div>
        )
      case "debug":
        return (
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Run and Debug
            </div>
            <p className="text-xs text-muted-foreground">Open a .dart or .html file to run code.</p>
          </div>
        )
      case "extensions":
        return (
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Extensions</div>
            <div className="space-y-3">
              {[
                { name: "Kotlin", publisher: "JetBrains" },
                { name: "Flutter", publisher: "Dart Code" },
                { name: "Dart", publisher: "Dart Code" },
                { name: "HTML Preview", publisher: "rashbip" },
                { name: "DartPad Runner", publisher: "rashbip" },
              ].map((ext) => (
                <div key={ext.name} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-foreground">{ext.name}</div>
                    <div className="text-xs text-muted-foreground">{ext.publisher}</div>
                  </div>
                  <CheckIcon className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        )
      case "account":
        return (
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</div>
            <div className="text-sm text-foreground mb-2">rashbip</div>
            <div className="space-y-2 text-xs">
              <a
                href="https://github.com/rashbip"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary hover:underline"
              >
                GitHub: rashbip
              </a>
              <a
                href="https://reddit.com/user/Fair_Concentrate606"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary hover:underline"
              >
                Reddit: u/Fair_Concentrate606
              </a>
            </div>
          </div>
        )
      case "settings":
        return (
          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Settings</div>
            <div className="space-y-4 text-sm">
              <div className="space-y-2">
                <span className="text-muted-foreground">Color Theme</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
                      theme === "light"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
                      theme === "dark"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
                      theme === "system"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full border-r border-border overflow-y-auto" style={{ background: "var(--sidebar-bg)" }}>
      {renderContent()}
    </div>
  )
}

function GitBranchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="20,6 9,17 4,12" />
    </svg>
  )
}
