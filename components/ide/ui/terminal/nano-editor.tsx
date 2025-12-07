"use client"

import { useState, useEffect, useRef } from "react"
import { X, Save } from "lucide-react"

type Props = {
  filePath: string
  content: string
  onSave: (content: string) => void
  onClose: () => void
}

export function NanoEditor({ filePath, content, onSave, onClose }: Props) {
  const [editedContent, setEditedContent] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSave = () => {
    onSave(editedContent)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+O to save (Write Out)
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault()
      handleSave()
    }
    // Ctrl+X to exit
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault()
      onClose()
    }
  }

  const fileName = filePath.split('/').pop() || filePath

  return (
    <div className="h-full flex flex-col bg-background border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-primary/10 border-b border-border text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">GNU nano</span>
          <span className="text-foreground font-mono">{fileName}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>^O Write Out</span>
          <span>^X Exit</span>
        </div>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full p-2 font-mono text-sm bg-background text-foreground outline-none resize-none"
        spellCheck={false}
        style={{ tabSize: 2 }}
      />

      {/* Footer */}
      <div className="px-2 py-1 bg-primary/10 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>^G Get Help</span>
          <span>^O Write Out</span>
          <span>^W Where Is</span>
          <span>^K Cut Text</span>
          <span>^J Justify</span>
          <span>^C Cur Pos</span>
          <span>^X Exit</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-2 py-1 hover:bg-primary/20 rounded flex items-center gap-1"
            title="Save (Ctrl+O)"
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 hover:bg-primary/20 rounded flex items-center gap-1"
            title="Exit (Ctrl+X)"
          >
            <X className="w-3 h-3" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  )
}

