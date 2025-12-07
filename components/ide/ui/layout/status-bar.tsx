"use client"

import type { FileType } from "../../data/files"
import { GitBranch, Bell, Check, AlertTriangle, X } from "lucide-react"
import { useTheme } from "next-themes"

type Props = {
  file: FileType | null
}

export function StatusBar({ file }: Props) {
  const { resolvedTheme } = useTheme()

  const getLanguageDisplay = (lang: string) => {
    const map: Record<string, string> = {
      kotlin: "Kotlin",
      dart: "Dart",
      markdown: "Markdown",
      ini: "Properties",
      html: "HTML",
      web: "Web Preview",
    }
    return map[lang] || lang
  }

  return (
    <div 
      className="status-bar h-6 flex items-center justify-between px-3 text-xs overflow-x-auto overflow-y-hidden" 
      style={{ 
        scrollbarWidth: 'none', // Hide scrollbar
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        msOverflowStyle: 'none' // IE/Edge
      }}
      onWheel={(e) => {
        // Enable horizontal scrolling with mouse wheel
        e.preventDefault()
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX
        if (delta !== 0) {
          e.currentTarget.scrollLeft += delta
        }
      }}
    >
      <div className="flex items-center gap-4 min-w-max">
        <div className="flex items-center gap-1">
          <GitBranch className="w-3.5 h-3.5" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <X className="w-3 h-3" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>0</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 min-w-max">
        {file ? (
          <>
            <span className="hidden sm:inline">Ln 1, Col 1</span>
            <span className="hidden md:inline">Spaces: 4</span>
            <span className="hidden lg:inline">UTF-8</span>
            <span>{getLanguageDisplay(file.language)}</span>
          </>
        ) : (
          <span className="text-muted-foreground">No file open</span>
        )}
        <span className="opacity-70 hidden sm:inline">{resolvedTheme === "dark" ? "Dark+" : "Light+"}</span>
        <div className="flex items-center gap-1 hidden md:flex">
          <Check className="w-3.5 h-3.5" />
          <span>Prettier</span>
        </div>
        <Bell className="w-3.5 h-3.5 hidden sm:block" />
      </div>
    </div>
  )
}
