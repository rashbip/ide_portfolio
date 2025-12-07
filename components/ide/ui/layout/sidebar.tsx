"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, Moon, Sun, Monitor, Trash2, FolderPlus, FilePlus, RotateCcw, RefreshCw } from "lucide-react"
import { useTheme } from "next-themes"
import type { FileType } from "../../data/files"
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
} from "../file-icons"
import { useEditorSettings } from "../../context/editor-settings-context"

type Props = {
  activeView: string
  files: FileType[]
  openFile: (file: FileType) => void
  activeFile: FileType | null
  onDeleteFile?: (file: FileType) => void
  onCreateFolder?: (folderPath: string) => void
  onDeleteFolder?: (folderPath: string) => void
  onCreateFile?: (name: string, parentPath?: string) => void
  onRenameFile?: (file: FileType, newName: string) => void
  onRenameFolder?: (oldPath: string, newName: string) => void
  onDownloadFile?: (file: FileType) => void
  onResetSettings?: () => void
  onResetToDefault?: () => void
}

type FolderStructure = {
  name: string
  type: "folder" | "file"
  path?: string
  children?: FolderStructure[]
  file?: FileType
  isUserCreated?: boolean
}

type ContextMenuState = {
  visible: boolean
  x: number
  y: number
  item: FolderStructure | null
  isFolder: boolean
}

type ConfirmDialogState = {
  visible: boolean
  title: string
  message: string
  onConfirm: () => void
}

type InputDialogState = {
  visible: boolean
  title: string
  value: string
  placeholder: string
  onSubmit: ((value: string) => void) | null
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

// Core folders that cannot be deleted
const PROTECTED_FOLDERS = ["rashbip", "web", "lib", "src", ".ide"]

export function Sidebar({ activeView, files, openFile, activeFile, onDeleteFile, onCreateFolder, onDeleteFolder, onCreateFile, onRenameFile, onRenameFolder, onDownloadFile, onResetSettings, onResetToDefault }: Props) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, item: null, isFolder: false })
  const [inputDialog, setInputDialog] = useState<InputDialogState>({ visible: false, title: "", value: "", placeholder: "", onSubmit: null })
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({ visible: false, title: "", message: "", onConfirm: () => {} })
  const contextMenuRef = useRef<HTMLDivElement>(null)
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("expandedFolders")
      if (saved) {
        return new Set(JSON.parse(saved))
      }
    }
    // Default expanded folders with correct absolute paths
    return new Set(["/rashbip", "/rashbip/src", "/rashbip/lib", "/rashbip/web"])
  })

  // Use shared editor settings context
  const { settings, updateSetting, resetSettings: resetEditorSettings } = useEditorSettings()

  const { theme, setTheme } = useTheme()

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }))
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle right-click on files/folders
  const handleContextMenu = (e: React.MouseEvent, item: FolderStructure, isFolder: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
      isFolder
    })
  }

  // Check if file is protected (cannot be deleted)
  const isProtectedFile = (file: FileType) => {
    return file.isSpecial === "profile" || file.isSpecial === "profile-html"
  }

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
    localStorage.setItem("expandedFolders", JSON.stringify([...newExpanded]))
  }

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName]
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />
    }
    return <WebIcon className="w-4 h-4" />
  }

  // Build file tree dynamically from files array
  const buildFileTree = (): FolderStructure => {
    const root: FolderStructure = {
      name: "rashbip",
      type: "folder",
      path: "/rashbip",
      children: []
    }

    // Helper to get/create a folder node
    const getOrCreateFolder = (parts: string[], parent: FolderStructure, currentPath: string): FolderStructure => {
      if (parts.length === 0) return parent
      
      const folderName = parts[0]
      let folder = parent.children?.find(c => c.name === folderName && c.type === "folder")
      
      const newPath = `${currentPath}/${folderName}`
      
      if (!folder) {
        folder = { 
          name: folderName, 
          type: "folder", 
          path: newPath, 
          children: [] 
        }
        parent.children = parent.children || []
        parent.children.push(folder)
      }
      
      return getOrCreateFolder(parts.slice(1), folder, newPath)
    }

    // Add files to tree
    for (const file of files) {
      // Remove leading slash for splitting
      const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path
      const pathParts = cleanPath.split('/').filter(Boolean)
      
      if (pathParts.length === 0) continue

      const fileName = pathParts.pop()!
      // Folders are remaining parts
      const folderParts = pathParts
      
      // Determine ROOT for this file
      const parentFolder = getOrCreateFolder(folderParts, root, "/rashbip")
      
      // Don't show placeholder files in the tree
      if (fileName === ".keep" || fileName === ".folder") {
        continue
      }

      parentFolder.children = parentFolder.children || []
      parentFolder.children.push({
        name: fileName,
        type: "file",
        path: file.path, 
        file
      })
    }

    // Sort children
    const sortChildren = (node: FolderStructure) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.name === "profile.web") return -1
          if (b.name === "profile.web") return 1
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        node.children.forEach(sortChildren)
      }
    }
    sortChildren(root)

    return root
  }

  const fileTree = buildFileTree()

  const renderTree = (node: FolderStructure, depth = 0) => {
    // Use the absolute path stored in the node
    const fullPath = node.path || node.name 
    const isExpanded = expandedFolders.has(fullPath)
    const isActive = node.file?.path === activeFile?.path

    if (node.type === "folder") {
      return (
        <div key={fullPath}>
          <button
            onClick={() => toggleFolder(fullPath)}
            onContextMenu={(e) => handleContextMenu(e, node, true)}
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
            <div>{node.children.map((child) => renderTree(child, depth + 1))}</div>
          )}
        </div>
      )
    }

    return (
      <button
        key={fullPath}
        onClick={() => node.file && openFile(node.file)}
        onContextMenu={(e) => handleContextMenu(e, node, false)}
        className={`file-tree-item w-full flex items-center gap-2 py-1 px-2 text-sm transition-colors ${isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
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
          <div className="p-4 overflow-y-auto">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Settings</div>
            <div className="space-y-6 text-sm">
              
              {/* Color Theme */}
              <div className="space-y-2">
                <span className="text-muted-foreground font-medium">Color Theme</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 min-w-[70px] flex items-center justify-center gap-2 px-3 py-2 rounded border transition-colors ${theme === "light"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 min-w-[70px] flex items-center justify-center gap-2 px-3 py-2 rounded border transition-colors ${theme === "dark"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex-1 min-w-[70px] flex items-center justify-center gap-2 px-3 py-2 rounded border transition-colors ${theme === "system"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Editor Settings */}
              <div className="space-y-4">
                <span className="text-muted-foreground font-medium">Editor</span>
                
                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Font Size</span>
                    <span className="text-primary font-mono">{settings.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    title="Font Size"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10px</span>
                    <span>24px</span>
                  </div>
                </div>

                {/* Tab Size */}
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Tab Size</span>
                  <div className="flex gap-1">
                    {[2, 4].map(size => (
                      <button
                        key={size}
                        onClick={() => updateSetting("tabSize", size)}
                        className={`px-3 py-1 rounded text-xs font-mono ${settings.tabSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Word Wrap Toggle */}
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Word Wrap</span>
                  <button
                    onClick={() => updateSetting("wordWrap", !settings.wordWrap)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${settings.wordWrap ? "bg-primary" : "bg-secondary"}`}
                    title="Toggle Word Wrap"
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.wordWrap ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Minimap Toggle */}
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Minimap</span>
                  <button
                    onClick={() => updateSetting("minimap", !settings.minimap)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${settings.minimap ? "bg-primary" : "bg-secondary"}`}
                    title="Toggle Minimap"
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.minimap ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Auto Save Toggle */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-foreground">Auto Save</span>
                    <span className="text-xs text-muted-foreground ml-2">(every 2 min)</span>
                  </div>
                  <button
                    onClick={() => updateSetting("autoSave", !settings.autoSave)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${settings.autoSave ? "bg-primary" : "bg-secondary"}`}
                    title="Toggle Auto Save"
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.autoSave ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Remember Last File Toggle */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-foreground">Remember Last File</span>
                    <span className="text-xs text-muted-foreground ml-2">(reopen on load)</span>
                  </div>
                  <button
                    onClick={() => updateSetting("rememberLastFile", !settings.rememberLastFile)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${settings.rememberLastFile ? "bg-primary" : "bg-secondary"}`}
                    title="Toggle Remember Last File"
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.rememberLastFile ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Reset Options */}
              <div className="space-y-3">
                <span className="text-muted-foreground font-medium">Reset Options</span>
                
                {/* Reset Settings */}
                <button
                  onClick={() => {
                    setConfirmDialog({
                      visible: true,
                      title: "Reset Settings",
                      message: "This will reset theme to System, font size, and all editor preferences to defaults. Your files will not be affected.",
                      onConfirm: () => {
                        // Reset all editor settings via context
                        setTheme("system")
                        resetEditorSettings()
                        setExpandedFolders(new Set(["rashbip", "src", "lib", "build", "web"]))
                        localStorage.removeItem("expandedFolders")
                        // Call parent handler for additional resets
                        if (onResetSettings) {
                          onResetSettings()
                        }
                        setConfirmDialog(prev => ({ ...prev, visible: false }))
                      }
                    })
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Reset Settings</div>
                    <div className="text-xs opacity-70">Reset theme & editor preferences</div>
                  </div>
                </button>

                {/* Default IDE */}
                <button
                  onClick={() => {
                    setConfirmDialog({
                      visible: true,
                      title: "Reset to Default IDE",
                      message: "This will restore the IDE to its initial state. All created files will be deleted and original files will be restored. This action cannot be undone.",
                      onConfirm: () => {
                        // Reset all editor settings via context
                        setTheme("system")
                        resetEditorSettings()
                        setExpandedFolders(new Set(["rashbip", "src", "lib", "build", "web"]))
                        // Call parent handler for full reset
                        if (onResetToDefault) {
                          onResetToDefault()
                        }
                        setConfirmDialog(prev => ({ ...prev, visible: false }))
                      }
                    })
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">Default IDE</div>
                    <div className="text-xs opacity-70">Restore everything to first open state</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="h-full border-r border-border overflow-y-auto" style={{ background: "var(--sidebar-bg)" }}>
        {renderContent()}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.isFolder ? (
            <>
              {/* Folder Actions */}
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                onClick={() => {
                  setInputDialog({
                    visible: true,
                    title: "New File",
                    value: "",
                    placeholder: "File name (e.g. page.tsx)",
                    onSubmit: (name) => {
                      if (onCreateFile && name.trim()) {
                        onCreateFile(name, contextMenu.item?.path)
                      }
                    }
                  })
                  setContextMenu(prev => ({ ...prev, visible: false }))
                }}
              >
                <FilePlus className="w-4 h-4" />
                New File
              </button>
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                onClick={() => {
                  setInputDialog({
                    visible: true,
                    title: "New Folder",
                    value: "",
                    placeholder: "Folder name",
                    onSubmit: (name) => {
                      if (onCreateFolder && name.trim()) {
                        onCreateFolder(`${contextMenu.item?.path}/${name}`)
                      }
                    }
                  })
                  setContextMenu(prev => ({ ...prev, visible: false }))
                }}
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
              
              <div className="my-1 border-t border-border" />

              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                onClick={() => {
                  const path = contextMenu.item?.path || ""
                  if (navigator?.clipboard?.writeText) {
                    navigator.clipboard.writeText(path).catch(err => console.error("Failed to copy path:", err))
                  } else {
                    console.log("Clipboard API unavailable, path:", path)
                  }
                  setContextMenu(prev => ({ ...prev, visible: false }))
                }}
              >
                <span className="w-4 h-4 flex items-center justify-center text-xs border border-current rounded">CP</span>
                Copy Path
              </button>

              {/* Rename Folder (only user folders) */}
              {contextMenu.item?.name && !PROTECTED_FOLDERS.includes(contextMenu.item.name) && (
                <button
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                  onClick={() => {
                    setInputDialog({
                      visible: true,
                      title: "Rename Folder",
                      value: contextMenu.item?.name || "",
                      placeholder: "New name",
                      onSubmit: (newName) => {
                        if (onRenameFolder && newName.trim() && contextMenu.item?.path) {
                          onRenameFolder(contextMenu.item.path, newName)
                        }
                      }
                    })
                    setContextMenu(prev => ({ ...prev, visible: false }))
                  }}
                >
                  <span className="w-4 h-4 flex items-center justify-center">R</span>
                  Rename
                </button>
              )}

              <div className="my-1 border-t border-border" />

              {/* Delete Folder */}
              {contextMenu.item?.name && !PROTECTED_FOLDERS.includes(contextMenu.item.name) && (
                <button
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
                  onClick={() => {
                    const folderPath = contextMenu.item?.path
                    setConfirmDialog({
                      visible: true,
                      title: "Delete Folder",
                      message: `Are you sure you want to delete "${contextMenu.item?.name}" and all its contents?`,
                      onConfirm: () => {
                        if (folderPath && onDeleteFolder) {
                          onDeleteFolder(folderPath)
                        }
                        setConfirmDialog(prev => ({ ...prev, visible: false }))
                      }
                    })
                    setContextMenu(prev => ({ ...prev, visible: false }))
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Folder
                </button>
              )}
            </>
          ) : (
            <>
              {/* File Actions */}
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                onClick={() => {
                  const path = contextMenu.item?.path || ""
                  if (navigator?.clipboard?.writeText) {
                    navigator.clipboard.writeText(path).catch(err => console.error("Failed to copy path:", err))
                  } else {
                    console.log("Clipboard API unavailable, path:", path)
                  }
                  setContextMenu(prev => ({ ...prev, visible: false }))
                }}
              >
                <span className="w-4 h-4 flex items-center justify-center text-xs border border-current rounded">CP</span>
                Copy Path
              </button>

              {contextMenu.item?.file && !isProtectedFile(contextMenu.item.file) && (
                 <button
                   className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                   onClick={() => {
                     setInputDialog({
                       visible: true,
                       title: "Rename File",
                       value: contextMenu.item?.name || "",
                       placeholder: "New name",
                       onSubmit: (newName) => {
                         if (onRenameFile && newName.trim() && contextMenu.item?.file) {
                           onRenameFile(contextMenu.item.file, newName)
                         }
                       }
                     })
                     setContextMenu(prev => ({ ...prev, visible: false }))
                   }}
                 >
                   <span className="w-4 h-4 flex items-center justify-center">R</span>
                   Rename
                 </button>
              )}
              
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                onClick={() => {
                  if (onDownloadFile && contextMenu.item?.file) {
                    onDownloadFile(contextMenu.item.file)
                  }
                  setContextMenu(prev => ({ ...prev, visible: false }))
                }}
              >
                <span className="w-4 h-4 flex items-center justify-center">⬇</span>
                Download
              </button>

              <div className="my-1 border-t border-border" />

              {contextMenu.item?.file && !isProtectedFile(contextMenu.item.file) && (
                <button
                  className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
                  onClick={() => {
                    const file = contextMenu.item?.file
                    setConfirmDialog({
                      visible: true,
                      title: "Delete File",
                      message: `Are you sure you want to delete "${file?.name}"?`,
                      onConfirm: () => {
                        if (file && onDeleteFile) {
                          onDeleteFile(file)
                        }
                        setConfirmDialog(prev => ({ ...prev, visible: false }))
                      }
                    })
                    setContextMenu(prev => ({ ...prev, visible: false }))
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-80 overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-red-500/10">
              <h3 className="text-sm font-semibold text-red-400">{confirmDialog.title}</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">{confirmDialog.message}</p>
            </div>
            <div className="px-4 py-3 border-t border-border bg-secondary/30 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-3 py-1.5 text-sm bg-red-500 text-white hover:bg-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Input Dialog */}
      {inputDialog.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-80 overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-secondary/50">
              <h3 className="text-sm font-semibold text-foreground">{inputDialog.title}</h3>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={inputDialog.value}
                onChange={(e) => setInputDialog(prev => ({ ...prev, value: e.target.value }))}
                placeholder={inputDialog.placeholder}
                className="w-full px-3 py-2 bg-input border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputDialog.onSubmit) {
                    inputDialog.onSubmit(inputDialog.value)
                    setInputDialog(prev => ({ ...prev, visible: false, value: "" }))
                  } else if (e.key === "Escape") {
                    setInputDialog(prev => ({ ...prev, visible: false, value: "" }))
                  }
                }}
              />
            </div>
            <div className="px-4 py-3 border-t border-border bg-secondary/30 flex justify-end gap-2">
              <button
                onClick={() => setInputDialog(prev => ({ ...prev, visible: false, value: "" }))}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (inputDialog.onSubmit) {
                    inputDialog.onSubmit(inputDialog.value)
                    setInputDialog(prev => ({ ...prev, visible: false, value: "" }))
                  }
                }}
                disabled={!inputDialog.value.trim()}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
