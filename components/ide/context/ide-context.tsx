
import { createContext } from "react"

export type IDEContextType = {
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
