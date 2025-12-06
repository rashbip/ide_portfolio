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

export type { FileType }

type IDEContextType = {
  updateFileContent: (path: string, content: string) => void
  addTerminalOutput: (message: string, type?: "info" | "success" | "error") => void
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

export function IDE() {
  const [activeView, setActiveView] = useState<string>("explorer")
  const [allFiles, setAllFiles] = useState<FileType[]>(initialFiles)
  const [openFiles, setOpenFiles] = useState<FileType[]>([initialFiles[0], initialFiles[1]]) // Open profile.web and profile.html
  const [activeFile, setActiveFile] = useState<FileType | null>(initialFiles[0])
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
  const [toast, setToast] = useState<{ message: string; type: "info" | "error" | "warning" | "success" } | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const activityBarRef = useRef<HTMLDivElement>(null)

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
    const handleClickOutside = (event: MouseEvent) => {
      // If sidebar is closed, do nothing
      if (!sidebarOpen) return

      const target = event.target as Node
      // If click is inside sidebar or activity bar, do nothing
      if (sidebarRef.current?.contains(target)) return
      if (activityBarRef.current?.contains(target)) return

      // Otherwise, close sidebar
      setSidebarOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [sidebarOpen])

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

  // New function: Create File
  const handleCreateFile = () => {
    const name = prompt("Enter file name (e.g., new_script.js):")
    if (!name) return

    // Determine basic language based on extension
    let language = "plaintext"
    if (name.endsWith(".js")) language = "javascript"
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) language = "typescript"
    else if (name.endsWith(".html")) language = "html"
    else if (name.endsWith(".css")) language = "css"
    else if (name.endsWith(".json")) language = "json"
    else if (name.endsWith(".md")) language = "markdown"

    const newFile: FileType = {
      name,
      path: `/${name}`,
      icon: "file", // Default icon, could be improved
      content: "",
      language
    }

    setAllFiles(prev => [...prev, newFile])
    openFile(newFile)
    addTerminalOutput(`Created file: ${name}`, "success")
  }

  const handleSave = () => {
    if (activeFile) {
      addTerminalOutput(`Saved ${activeFile.name}`, "success")
      showToast(`Saved ${activeFile.name}`, "success")
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

  const updateFileContent = (path: string, content: string) => {
    setFileContents((prev) => ({ ...prev, [path]: content }))
  }

  const addTerminalOutput = (message: string, type: "info" | "success" | "error" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setTerminalOutputs((prev) => [...prev, { timestamp, message, type }])
  }

  const showToast = (message: string, type: "info" | "error" | "warning" | "success" = "info") => {
    setToast({ message, type })
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
    <IDEContext.Provider value={{ updateFileContent, addTerminalOutput, setTerminalTab: setActiveTerminalTab, activeTerminalTab: activeTerminalTab, showToast }}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
        <TitleBar 
          files={allFiles} 
          openFile={openFile}
          onCreateFile={handleCreateFile}
          onSave={handleSave}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onToggleTerminal={() => setTerminalOpen(prev => !prev)}
          activeFile={activeFile} 
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
                <Sidebar activeView={activeView} files={allFiles} openFile={(f) => {
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
