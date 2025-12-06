"use client"

import type React from "react"
import { useRef, useEffect } from "react"

import { X } from "lucide-react"
import type { FileType } from "../../data/files"
import { KotlinIcon, DartIcon, HtmlIcon, MarkdownIcon, GradleIcon, ConfigIcon, WebIcon } from "../file-icons"

type Props = {
  openFiles: FileType[]
  activeFile: FileType | null
  setActiveFile: (file: FileType) => void
  closeFile: (file: FileType) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  kotlin: KotlinIcon,
  dart: DartIcon,
  html: HtmlIcon,
  markdown: MarkdownIcon,
  gradle: GradleIcon,
  config: ConfigIcon,
  web: WebIcon,
}

export function EditorTabs({ openFiles, activeFile, setActiveFile, closeFile }: Props) {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName]
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />
    }
    return <WebIcon className="w-4 h-4" />
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault()
          el.scrollLeft += e.deltaY
        }
      }
      el.addEventListener("wheel", onWheel)
      return () => el.removeEventListener("wheel", onWheel)
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex items-center border-b border-border overflow-x-auto no-scrollbar"
      style={{ background: "var(--tab-inactive)" }}
    >
      {openFiles.map((file) => (
        <div
          key={file.path}
          className={`tab-item flex items-center gap-2 px-3 py-2 text-sm border-r border-border cursor-pointer group transition-colors ${activeFile?.path === file.path
              ? "bg-background text-foreground"
              : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setActiveFile(file)}
          onMouseDown={(e) => {
            if (e.button === 1) { // Middle click
              e.preventDefault()
              closeFile(file)
            }
          }}
        >
          {getIcon(file.icon)}
          <span className="whitespace-nowrap">{file.name}</span>
          {file.isSpecial === "profile" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">WEB</span>
          )}
          {file.isSpecial === "html-preview" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">RUN</span>
          )}
          {file.isSpecial === "dart-preview" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00D2B8]/20 text-[#00D2B8]">FLUTTER</span>
          )}
          {file.isSpecial === "kotlin-viewer" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7F52FF]/20 text-[#7F52FF]">RUN</span>
          )}
          <button
            title="Close"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation()
              closeFile(file)
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-secondary rounded p-0.5 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
