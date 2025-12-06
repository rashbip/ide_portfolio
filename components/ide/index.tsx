"use client"

import { useState, useEffect, createContext, useRef } from "react"
import { ActivityBar } from "./ui/layout/activity-bar"
import { Sidebar } from "./ui/layout/sidebar"
import { EditorTabs } from "./ui/layout/editor-tabs"
import { EditorContent } from "./ui/editors/editor-content"
import { TerminalPanel } from "./ui/terminal/terminal-panel"
import { StatusBar } from "./ui/layout/status-bar"
import { ProfilePage } from "./ui/editors/profile-page"
import { HtmlPreview } from "./ui/editors/html-preview"
import { DartPreview } from "./ui/editors/dart-preview"
import { TitleBar } from "./ui/layout/title-bar"
import { EmptyState } from "./ui/editors/empty-state"
import { KotlinViewer } from "./ui/editors/kotlin-viewer"
import { ProfileHtmlViewer } from "./ui/editors/profile-html-viewer"
import { files as initialFiles, type FileType } from "./data/files"
import { EditorSettingsProvider } from "./context/editor-settings-context"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export type { FileType }

type IDEContextType = {
  updateFileContent: (path: string, content: string) => void
  addTerminalOutput: (message: string, type?: "info" | "success" | "error" | "warning") => void
  setTerminalTab: (tab: "terminal" | "problems" | "output") => void
  activeTerminalTab: "terminal" | "problems" | "output"
  showToast: (message: string, type?: "info" | "error" | "warning" | "success") => void
}

export const IDEContext = createContext<IDEContextType>({
  updateFileContent: () => { },
  addTerminalOutput: () => { },
  setTerminalTab: () => { },
  activeTerminalTab: "terminal",
  showToast: () => { },
})

const STORAGE_KEY_FILES = "ide_files"
const STORAGE_KEY_CONTENTS = "ide_file_contents"

// Load files from localStorage or use defaults
function loadStoredFiles(): FileType[] {
  if (typeof window === 'undefined') return initialFiles
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FILES)
    if (stored) {
      const parsed = JSON.parse(stored) as FileType[]
      // Merge with initial files to ensure core files exist
      const storedPaths = new Set(parsed.map(f => f.path))
      const coreFiles = initialFiles.filter(f => 
        f.isSpecial === "profile" || f.isSpecial === "profile-html"
      )
      // Add core files if missing
      for (const core of coreFiles) {
        if (!storedPaths.has(core.path)) {
          parsed.unshift(core)
        }
      }
      return parsed
    }
  } catch (e) {
    console.error("Failed to load files from storage:", e)
  }
  return initialFiles
}

function loadStoredContents(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONTENTS)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error("Failed to load contents from storage:", e)
  }
  return {}
}

export function IDE() {
  const [activeView, setActiveView] = useState<string>("explorer")
  const [allFiles, setAllFiles] = useState<FileType[]>(initialFiles)
  const [openFiles, setOpenFiles] = useState<FileType[]>([])
  const [activeFile, setActiveFile] = useState<FileType | null>(null)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [terminalOutputs, setTerminalOutputs] = useState<
    Array<{ timestamp: string; message: string; type: "info" | "success" | "error" | "warning" }>
  >([{ timestamp: new Date().toLocaleTimeString(), message: "Terminal ready.", type: "info" }])
  const [activeTerminalTab, setActiveTerminalTab] = useState<"terminal" | "problems" | "output">("terminal")
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" | "warning" | "success" } | null>(null)
  const [isExited, setIsExited] = useState(false)
  const [isWindowed, setIsWindowed] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const activityBarRef = useRef<HTMLDivElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const storedFiles = loadStoredFiles()
    const storedContents = loadStoredContents()
    setAllFiles(storedFiles)
    setFileContents(storedContents)
    // Set default open files
    const profileFile = storedFiles.find(f => f.isSpecial === "profile")
    const profileHtml = storedFiles.find(f => f.isSpecial === "profile-html")
    setOpenFiles([profileFile, profileHtml].filter(Boolean) as FileType[])
    setActiveFile(profileFile || storedFiles[0] || null)
    setMounted(true)
  }, [])

  // Save files to localStorage when they change
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(allFiles))
    } catch (e) {
      console.error("Failed to save files:", e)
    }
  }, [allFiles, mounted])

  // Save contents to localStorage when they change
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY_CONTENTS, JSON.stringify(fileContents))
    } catch (e) {
      console.error("Failed to save contents:", e)
    }
  }, [fileContents, mounted])

  useEffect(() => {
    if (!mounted) return
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mounted])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close sidebar on click-outside for mobile devices
      if (!isMobile) return
      
      // If sidebar is closed, do nothing
      if (!sidebarOpen) return

      const target = event.target as Node
      // If click is inside sidebar or activity bar, do nothing
      if (sidebarRef.current?.contains(target)) return
      if (activityBarRef.current?.contains(target)) return

      // Otherwise, close sidebar (mobile only)
      setSidebarOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [sidebarOpen, isMobile])

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
    // Check if the file already exists in allFiles to ensure we use the latest reference
    const existingFile = allFiles.find(f => f.path === file.path) || file

    if (!openFiles.find((f) => f.path === existingFile.path)) {
      setOpenFiles([...openFiles, existingFile])
    }
    setActiveFile(existingFile)
  }

  // Create File function - now accepts name from dialog or TitleBar
  const handleCreateFile = (name: string, parentPath?: string) => {
    // Determine path
    let path = `/${name}`
    if (parentPath && typeof parentPath === 'string') {
       // Remove trailing slash if present to avoid double slashes
       let cleanParent = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
       
       // Remove '/rashbip' prefix if present (Sidebar root issue)
       if (cleanParent.startsWith('/rashbip')) {
         cleanParent = cleanParent.replace('/rashbip', '')
       }
       
       path = `${cleanParent}/${name}`
    }

    // Determine basic language based on extension
    const ext = name.split('.').pop()?.toLowerCase() || ''
    let language = "plaintext"
    let icon = "web"
    let isSpecial: "html-preview" | "dart-preview" | undefined

    if (ext === "html") { language = "html"; icon = "html"; isSpecial = "html-preview" }
    else if (ext === "css") { language = "css"; icon = "css" }
    else if (ext === "js") { language = "javascript"; icon = "js" }
    else if (ext === "dart") { language = "dart"; icon = "dart"; isSpecial = "dart-preview" }
    else if (ext === "ts" || ext === "tsx") { language = "typescript"; icon = "web" }
    else if (ext === "json") { language = "json"; icon = "config" }
    else if (ext === "md") { language = "markdown"; icon = "markdown" }

    const newFile: FileType = {
      name,
      path,
      icon,
      content: "",
      language,
      isSpecial
    }

    setAllFiles(prev => [...prev, newFile])
    openFile(newFile)
    addTerminalOutput(`Created file: ${name}`, "success")
    showToast(`Created ${name}`, "success")
  }

  // Create folder function placeholder - implementation moved to bottom or deduped


  // Rename File
  const handleRenameFile = (file: FileType, newName: string) => {
    if (!newName.trim() || newName === file.name) return

    const parentPath = file.path.substring(0, file.path.lastIndexOf('/'))
    const newPath = `${parentPath}/${newName}`

    if (allFiles.some(f => f.path === newPath)) {
      showToast(`File ${newName} already exists`, "error")
      return
    }

    setAllFiles(prev => prev.map(f => f.path === file.path ? { ...f, name: newName, path: newPath } : f))

    setFileContents(prev => {
      const content = prev[file.path]
      if (content !== undefined) {
        const { [file.path]: _, ...rest } = prev
        return { ...rest, [newPath]: content }
      }
      return prev
    })

    setOpenFiles(prev => prev.map(f => f.path === file.path ? { ...f, name: newName, path: newPath } : f))

    if (activeFile?.path === file.path) {
      setActiveFile(prev => prev ? { ...prev, name: newName, path: newPath } : null)
    }

    addTerminalOutput(`Renamed ${file.name} to ${newName}`, "info")
  }

  // Rename Folder
  const handleRenameFolder = (oldPath: string, newName: string) => {
    const parts = oldPath.split('/')
    const oldName = parts[parts.length - 1]
    if (oldName === newName) return

    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'))
    const newFolderPath = `${parentPath}/${newName}`

    setAllFiles(prev => prev.map(f => {
      if (f.path.startsWith(oldPath + '/')) {
        const suffix = f.path.substring(oldPath.length)
        return { ...f, path: newFolderPath + suffix }
      }
      return f
    }))

    setFileContents(prev => {
      const newContents = { ...prev }
      Object.keys(prev).forEach(key => {
        if (key.startsWith(oldPath + '/')) {
          const content = prev[key]
          const suffix = key.substring(oldPath.length)
          delete newContents[key]
          newContents[newFolderPath + suffix] = content
        }
      })
      return newContents
    })

    setOpenFiles(prev => prev.map(f => {
      if (f.path.startsWith(oldPath + '/')) {
        const suffix = f.path.substring(oldPath.length)
        return { ...f, path: newFolderPath + suffix }
      }
      return f
    }))

    if (activeFile?.path.startsWith(oldPath + '/')) {
      setActiveFile(prev => {
        if (!prev) return null
        const suffix = prev.path.substring(oldPath.length)
        return { ...prev, path: newFolderPath + suffix }
      })
    }

    addTerminalOutput(`Renamed folder ${oldName} to ${newName}`, "info")
  }

  // Download File
  const handleDownloadFile = (file: FileType) => {
    const content = fileContents[file.path] ?? file.content
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    saveAs(blob, file.name)
    addTerminalOutput(`Downloaded ${file.name}`, "success")
  }

  // Open file from disk
  const handleOpenFile = (file: FileType) => {
    // Check if file already exists
    const existing = allFiles.find(f => f.name === file.name)
    if (existing) {
      // Update content and open
      setAllFiles(prev => prev.map(f => f.name === file.name ? { ...f, content: file.content } : f))
      openFile({ ...existing, content: file.content })
    } else {
      setAllFiles(prev => [...prev, file])
      openFile(file)
    }
    addTerminalOutput(`Opened file: ${file.name}`, "success")
  }

  const handleSave = () => {
    if (activeFile) {
      addTerminalOutput(`Saved ${activeFile.name}`, "success")
      showToast(`Saved ${activeFile.name}`, "success")
    }
  }

  // Save As - Download project files as ZIP (client-side only)
  const handleSaveAs = async () => {
    try {
      // Include all project files except profile pages (our internal special views)
      const projectFiles = allFiles.filter(f => 
        !f.isSpecial || f.isSpecial === "html-preview" || f.isSpecial === "dart-preview"
      )
      
      if (projectFiles.length === 0) {
        showToast("No project files to download", "warning")
        return
      }

      // Create ZIP with folder structure
      const zip = new JSZip()
      
      for (const file of projectFiles) {
        const content = fileContents[file.path] ?? file.content
        // Use the path for folder structure (remove leading slash)
        const zipPath = file.path.startsWith('/') ? file.path.slice(1) : file.path
        zip.file(zipPath, content)
      }

      // Generate ZIP blob and download
      const zipBlob = await zip.generateAsync({ type: "blob" })
      saveAs(zipBlob, "rashbip-project.zip")

      showToast(`Downloaded project as ZIP (${projectFiles.length} files)`, "success")
      addTerminalOutput(`Downloaded project as ZIP with ${projectFiles.length} file(s)`, "success")
    } catch (error) {
      console.error("ZIP creation failed:", error)
      showToast("Failed to create ZIP file", "error")
    }
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

  // Delete file (except protected files)
  const handleDeleteFile = (file: FileType) => {
    // Cannot delete profile pages
    if (file.isSpecial === "profile" || file.isSpecial === "profile-html") {
      showToast("Cannot delete protected file", "error")
      return
    }
    
    // Close file if open
    closeFile(file)
    
    // Remove from allFiles
    setAllFiles(prev => prev.filter(f => f.path !== file.path))
    
    // Remove content
    setFileContents(prev => {
      const newContents = { ...prev }
      delete newContents[file.path]
      return newContents
    })
    
    showToast(`Deleted ${file.name}`, "success")
    addTerminalOutput(`Deleted file: ${file.name}`, "info")
  }

  // Create folder - creates a hidden .keep file to represent the folder
  const handleCreateFolder = (folderPath: string) => {
    // Map display path to actual file path
    // The folderPath comes from sidebar like: /rashbip/web/newfolder
    // We need to convert it to actual path like: /web/newfolder
    const pathParts = folderPath.split('/').filter(Boolean)
    
    // Remove 'rashbip' from path if present (it's the display root)
    if (pathParts[0] === 'rashbip') {
      pathParts.shift()
    }
    
    // Create actual path (e.g., /web/newfolder)
    const actualPath = '/' + pathParts.join('/')
    const folderName = pathParts[pathParts.length - 1] || 'New Folder'
    
    // Check if folder exists
    if (allFiles.some(f => f.path.startsWith(actualPath + '/'))) {
      showToast("Folder already exists", "error")
      return
    }

    // Create a hidden marker file to represent the folder
    const markerFile: FileType = {
      name: ".keep",
      path: `${actualPath}/.keep`,
      icon: "config",
      content: "",
      language: "plaintext"
    }
    
    setAllFiles(prev => [...prev, markerFile])
    showToast(`Created folder: ${folderName}`, "success")
    addTerminalOutput(`Created folder: ${actualPath}`, "info")
  }


  // Delete folder and all files within it
  const handleDeleteFolder = (folderPath: string) => {
    // Map display path to actual file paths
    const pathParts = folderPath.split('/').filter(Boolean)
    
    // Remove 'rashbip' from path if present
    if (pathParts[0] === 'rashbip') {
      pathParts.shift()
    }
    
    const actualFolderPath = '/' + pathParts.join('/')
    const folderName = pathParts[pathParts.length - 1]
    
    // Find all files within this folder
    const filesToDelete = allFiles.filter(f => f.path.startsWith(actualFolderPath + '/') || f.path === actualFolderPath)
    
    // Check if any protected files would be deleted
    const hasProtectedFiles = filesToDelete.some(f => 
      f.isSpecial === "profile" || f.isSpecial === "profile-html"
    )
    
    if (hasProtectedFiles) {
      showToast("Cannot delete folder containing protected files", "error")
      return
    }
    
    // Close any open files from this folder
    for (const file of filesToDelete) {
      closeFile(file)
    }
    
    // Remove files
    setAllFiles(prev => prev.filter(f => !f.path.startsWith(actualFolderPath + '/') && f.path !== actualFolderPath))
    
    // Remove contents
    setFileContents(prev => {
      const newContents = { ...prev }
      for (const file of filesToDelete) {
        delete newContents[file.path]
      }
      return newContents
    })
    
    showToast(`Deleted folder: ${folderName}`, "success")
    addTerminalOutput(`Deleted folder: ${actualFolderPath} (${filesToDelete.length} files)`, "info")
  }

  // Reset settings only (theme, expanded folders, UI preferences)
  const handleResetSettings = () => {
    // Clear localStorage settings (but not files)
    localStorage.removeItem("expandedFolders")
    localStorage.removeItem("theme")
    // Clear editor settings
    localStorage.removeItem("ide_fontSize")
    localStorage.removeItem("ide_tabSize")
    localStorage.removeItem("ide_wordWrap")
    localStorage.removeItem("ide_minimap")
    localStorage.removeItem("ide_autoSave")
    
    // Reset UI state
    setSidebarOpen(true)
    setTerminalOpen(true)
    setSidebarWidth(240)
    setTerminalHeight(200)
    
    showToast("Settings reset successfully", "success")
    addTerminalOutput("Reset settings to defaults", "info")
  }

  // Reset to default IDE state (restore all files to initial state)
  const handleResetToDefault = () => {
    // Clear all localStorage
    localStorage.removeItem(STORAGE_KEY_FILES)
    localStorage.removeItem(STORAGE_KEY_CONTENTS)
    localStorage.removeItem("expandedFolders")
    localStorage.removeItem("theme")
    // Clear editor settings
    localStorage.removeItem("ide_fontSize")
    localStorage.removeItem("ide_tabSize")
    localStorage.removeItem("ide_wordWrap")
    localStorage.removeItem("ide_minimap")
    localStorage.removeItem("ide_autoSave")
    
    // Reset all state to initial values
    setAllFiles(initialFiles)
    setFileContents({})
    
    // Reset open files
    const profileFile = initialFiles.find(f => f.isSpecial === "profile")
    const profileHtml = initialFiles.find(f => f.isSpecial === "profile-html")
    setOpenFiles([profileFile, profileHtml].filter(Boolean) as FileType[])
    setActiveFile(profileFile || null)
    
    // Reset UI
    setSidebarOpen(true)
    setTerminalOpen(true)
    setSidebarWidth(240)
    setTerminalHeight(200)
    setTerminalOutputs([{ timestamp: new Date().toLocaleTimeString(), message: "IDE reset to default state.", type: "info" }])
    
    showToast("IDE restored to default state", "success")
  }

  const updateFileContent = (path: string, content: string) => {
    setFileContents((prev) => ({ ...prev, [path]: content }))
  }

  const addTerminalOutput = (message: string, type: "info" | "success" | "error" | "warning" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setTerminalOutputs((prev) => [...prev, { timestamp, message, type }])
  }

  const showToast = (message: string, type: "info" | "error" | "warning" | "success" = "info") => {
    setToast({ message, type })
  }

  const getFileContent = (file: FileType) => {
    return fileContents[file.path] ?? file.content
  }

  const handleTerminalCommand = (command: string) => {
    if (command === "exit") {
      setIsExited(true)
      setSidebarOpen(false)
    } else if (command === "code" || command === "enter") {
      if (isExited) {
        setIsExited(false)
        setSidebarOpen(true)
        setTerminalOpen(true)
        // Restore default files
        if (openFiles.length === 0) {
          setOpenFiles([initialFiles[0]])
          setActiveFile(initialFiles[0])
        }
      }
    }
  }

  if (!mounted) {
    return (
      <EditorSettingsProvider>
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <div className="animate-pulse-slow text-muted-foreground">Loading IDE...</div>
        </div>
      </EditorSettingsProvider>
    )
  }

  // If exited, show only full-screen terminal
  if (isExited) {
    return (
      <EditorSettingsProvider>
        <IDEContext.Provider value={{ updateFileContent, addTerminalOutput, setTerminalTab: setActiveTerminalTab, activeTerminalTab: activeTerminalTab, showToast }}>
          <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
            <div className="h-full flex flex-col">
              <TerminalPanel
                onClose={() => {}}
                height={window.innerHeight}
                onHeightChange={() => {}}
                outputs={terminalOutputs}
                activeTab={activeTerminalTab}
                onTabChange={setActiveTerminalTab}
                onClearOutputs={() => setTerminalOutputs([])}
                onCommand={handleTerminalCommand}
              />
            </div>
          </div>
        </IDEContext.Provider>
      </EditorSettingsProvider>
    )
  }

  // Run functionality
  const handleRun = (debugMode = false) => {
    if (!activeFile) return

    const ext = activeFile.name.split('.').pop()?.toLowerCase() || ''
    
    // Clear output if fresh run/debug
    // No need to clear all outputs, maybe just a separator?
    if (debugMode) {
      addTerminalOutput(`--- Debugging ${activeFile.name} ---`, "info")
    } else {
      addTerminalOutput(`--- Running ${activeFile.name} ---`, "info")
    }

    // Always show terminal and switch to output for feedback/errors
    setTerminalOpen(true)
    setActiveTerminalTab("output")

    // HTML / Web Preview
    // For HTML, "Run" and "Debug" means "Show me the result"
    if (ext === 'html' || ext === 'htm') {
      
      // Auto-open preview tab logic
      // We need to create a special file type for preview if not exists, or just open the existing logic
      // But we can simplify: just use openFile with a special crafted file object that triggers the preview component
      
      // Check if this specific file's preview is already open? 
      // Current architecture has 'profile-html' as a special key. 
      // We can create a dynamic preview.
      
      const previewFile: FileType = {
        name: `Preview: ${activeFile.name}`,
        path: `${activeFile.path}.preview`,
        content: activeFile.content, // Pass content though usually preview reads from source
        language: 'html',
        icon: 'html',
        isSpecial: 'html-preview' // This triggers the HTMLPreview component
      }
      
      handleOpenFile(previewFile)
      
      if (debugMode) {
         try {
           const parser = new DOMParser()
           const doc = parser.parseFromString(activeFile.content, "application/xml")
           const errorNode = doc.querySelector("parsererror")
           if (errorNode) {
             addTerminalOutput(`HTML Syntax Error: ${errorNode.textContent}`, "error")
           } else {
             addTerminalOutput("HTML Syntax OK. Rendering preview...", "success")
           }
         } catch (e) {
             addTerminalOutput(`HTML Validation Error: ${e}`, "error")
         }
      }
       return
    }

    // JS Execution
    if (ext === 'js') {
       try {
         const logs: string[] = []
         const errors: string[] = []
         
         const safeConsole = {
           log: (...args: any[]) => {
             const msg = args.map(String).join(' ')
             addTerminalOutput(msg, "info")
             logs.push(msg)
           },
           error: (...args: any[]) => {
            const msg = args.map(String).join(' ')
            addTerminalOutput(msg, "error")
            errors.push(msg)
           },
           warn: (...args: any[]) => {
            const msg = args.map(String).join(' ')
            addTerminalOutput(msg, "warning")
           },
           clear: () => {}
         }

         const runCode = new Function('console', `
            try {
              ${activeFile.content}
            } catch (e) {
              console.error(e.message || e);
            }
         `)
         
         runCode(safeConsole)
         
         if (debugMode && errors.length === 0) {
            addTerminalOutput("No runtime errors executed.", "success")
         }
         
       } catch (e: any) {
         addTerminalOutput(`Runtime Error: ${e.message || e}`, "error")
       }
       return
    }

    // CSS Validation (Simple)
    if (ext === 'css') {
      if (debugMode) {
         const open = (activeFile.content.match(/\{/g) || []).length
         const close = (activeFile.content.match(/\}/g) || []).length
         if (open !== close) {
           addTerminalOutput(`CSS Error: Mismatched braces (Open: ${open}, Close: ${close})`, "error")
         } else {
           addTerminalOutput("CSS basic checks passed.", "success")
         }
      } else {
        addTerminalOutput("CSS is applied when linked to HTML. Auto-opening linked HTML not supported yet.", "warning")
      }
      return
    }

    addTerminalOutput(`File type .${ext} not supported for direct run.`, "warning")
  }



  // ... (previous functions)

  return (
    <EditorSettingsProvider>
      <IDEContext.Provider value={{ updateFileContent, addTerminalOutput, setTerminalTab: setActiveTerminalTab, activeTerminalTab: activeTerminalTab, showToast }}>
        <div className={`
          flex flex-col overflow-hidden bg-background 
          ${isWindowed 
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] rounded-lg shadow-2xl border border-border resize overflow-auto'
            : 'h-screen w-screen'
          }
          ${isExited ? 'hidden' : ''}
          `}
          style={isWindowed ? { maxWidth: '100vw', maxHeight: '100vh' } : {}}
        >
          <TitleBar 
            files={allFiles} 
            openFile={openFile}
            onCreateFile={handleCreateFile}
            onSave={handleSave}
            onSaveAs={handleSaveAs}
            onOpenFile={handleOpenFile}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            onToggleTerminal={() => setTerminalOpen(prev => !prev)}
            onExit={() => setIsExited(true)}
            onRun={() => handleRun(false)}
            onDebug={() => handleRun(true)}
            activeFile={activeFile}
            allFiles={allFiles}
            isWindowed={isWindowed}
            onMinimize={() => setIsWindowed(true)}
            onMaximize={() => setIsWindowed(false)}
            onClose={() => setIsExited(true)}
          />

        <div className="flex flex-1 overflow-hidden">
          <ActivityBar
            activeView={activeView}
            setActiveView={setActiveView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            terminalOpen={terminalOpen}
            setTerminalOpen={setTerminalOpen}
            containerRef={activityBarRef}
          />

          {sidebarOpen && (
            <div className={`flex animate-slide-in-left ${isMobile ? "absolute z-50 h-full bg-background border-r shadow-2xl" : ""}`} ref={sidebarRef} style={{ left: isMobile ? "48px" : "auto" }}>
              <div style={{ width: isMobile ? "240px" : sidebarWidth }}>
                <Sidebar 
                  activeView={activeView} 
                  files={allFiles} 
                  openFile={(f) => {
                    openFile(f)
                    if (isMobile) setSidebarOpen(false)
                  }} 
                  activeFile={activeFile}
                  onDeleteFile={handleDeleteFile}
                  onCreateFolder={handleCreateFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onCreateFile={handleCreateFile}
                  onRenameFile={handleRenameFile}
                  onRenameFolder={handleRenameFolder}
                  onDownloadFile={handleDownloadFile}
                  onResetSettings={handleResetSettings}
                  onResetToDefault={handleResetToDefault}
                />
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
                      getFileContent(allFiles.find((f) => f.name === "style.css")!) ||
                      allFiles.find((f) => f.name === "style.css")?.content || ""
                    }
                    jsContent={
                      getFileContent(allFiles.find((f) => f.name === "script.js")!) ||
                      allFiles.find((f) => f.name === "script.js")?.content || ""
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
                        ? (getFileContent(allFiles.find((f) => f.name === "index.html")!) || allFiles.find((f) => f.name === "index.html")?.content)
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
                  onClearOutputs={() => setTerminalOutputs([])}
                  onCommand={handleTerminalCommand}
                />
              )}
            </div>
          </div>
        </div>

        <StatusBar file={activeFile || null} />
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        </div>
      </IDEContext.Provider>
    </EditorSettingsProvider>
  )
}

function Toast({ message, type, onClose }: { message: string, type: "info" | "error" | "warning" | "success", onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  const bg = type === "error" ? "bg-red-500" : type === "warning" ? "bg-yellow-500" : type === "success" ? "bg-green-500" : "bg-blue-500"
  
  return (
    <div className={`fixed bottom-10 right-4 ${bg} text-white px-4 py-2 rounded shadow-lg animate-slide-in-up z-50 flex items-center gap-2`}>
      <span>{message}</span>
    </div>
  )
}
