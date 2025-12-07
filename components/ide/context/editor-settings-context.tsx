"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type EditorSettings = {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  autoSave: boolean
  autoSaveInterval: number // in milliseconds
  rememberLastFile: boolean
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  autoSave: true,
  autoSaveInterval: 2 * 60 * 1000, // 2 minutes
  rememberLastFile: false, // Remember last opened file (default: OFF)
}

type EditorSettingsContextType = {
  settings: EditorSettings
  updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void
  resetSettings: () => void
}

const EditorSettingsContext = createContext<EditorSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSetting: () => {},
  resetSettings: () => {},
})

export function useEditorSettings() {
  return useContext(EditorSettingsContext)
}

function loadSettings(): EditorSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  
  try {
    return {
      fontSize: parseInt(localStorage.getItem("ide_fontSize") || "14"),
      tabSize: parseInt(localStorage.getItem("ide_tabSize") || "2"),
      wordWrap: localStorage.getItem("ide_wordWrap") !== "false",
      minimap: localStorage.getItem("ide_minimap") !== "false",
      autoSave: localStorage.getItem("ide_autoSave") !== "false",
      autoSaveInterval: 2 * 60 * 1000, // Fixed 2 minutes
      rememberLastFile: localStorage.getItem("ide_rememberLastFile") === "true", // Default false
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function EditorSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings())
    setMounted(true)
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!mounted) return
    
    localStorage.setItem("ide_fontSize", settings.fontSize.toString())
    localStorage.setItem("ide_tabSize", settings.tabSize.toString())
    localStorage.setItem("ide_wordWrap", settings.wordWrap.toString())
    localStorage.setItem("ide_minimap", settings.minimap.toString())
    localStorage.setItem("ide_autoSave", settings.autoSave.toString())
    localStorage.setItem("ide_rememberLastFile", settings.rememberLastFile.toString())
    
    // Apply CSS variables
    document.documentElement.style.setProperty("--editor-font-size", `${settings.fontSize}px`)
    document.documentElement.style.setProperty("--editor-tab-size", settings.tabSize.toString())
  }, [settings, mounted])

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    // Clear all editor settings from localStorage
    localStorage.removeItem("ide_fontSize")
    localStorage.removeItem("ide_tabSize")
    localStorage.removeItem("ide_wordWrap")
    localStorage.removeItem("ide_minimap")
    localStorage.removeItem("ide_autoSave")
    localStorage.removeItem("ide_rememberLastFile")
    
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <EditorSettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </EditorSettingsContext.Provider>
  )
}
