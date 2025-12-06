"use client"

import type { FileType } from "../ide"
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
    <div className="status-bar h-6 flex items-center justify-between px-3 text-xs">
      <div className="flex items-center gap-4">
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

      <div className="flex items-center gap-4">
        {file ? (
          <>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 4</span>
            <span>UTF-8</span>
            <span>{getLanguageDisplay(file.language)}</span>
          </>
        ) : (
          <span className="text-muted-foreground">No file open</span>
        )}
        <span className="opacity-70">{resolvedTheme === "dark" ? "Dark+" : "Light+"}</span>
        <div className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          <span>Prettier</span>
        </div>
        <Bell className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}
