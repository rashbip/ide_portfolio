import type { FileType } from "../data/files"

export const createFile = (
  name: string,
  parentPath?: string
): FileType => {
  // Determine path
  let path = `/${name}`
  if (parentPath && typeof parentPath === 'string') {
     // Remove trailing slash if present to avoid double slashes
     let cleanParent = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
     
     // Map /rashbip to / for file creation (terminal uses /rashbip but files are at root)
     if (cleanParent === '/rashbip') {
       path = `/${name}`
     } else if (cleanParent.startsWith('/rashbip/')) {
       // For nested paths under /rashbip, remove /rashbip prefix
       cleanParent = cleanParent.replace('/rashbip', '')
       path = cleanParent ? `${cleanParent}/${name}` : `/${name}`
     } else if (cleanParent.startsWith('/')) {
       // Other absolute paths
       path = `${cleanParent}/${name}`
     } else {
       // Relative paths
       path = `${cleanParent}/${name}`
     }
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

  return {
    name,
    path,
    icon,
    content: "",
    language,
    isSpecial
  }
}

export const createFolderMarker = (folderPath: string): FileType | null => {
  // Map display path to actual file path
  // The folderPath comes from sidebar like: /rashbip/web/newfolder
  // Or from terminal like: /rashbip/newfolder (which should map to /newfolder)
  const pathParts = folderPath.split('/').filter(Boolean)
  
  // Map /rashbip paths to root /
  let actualPath: string
  if (folderPath === '/rashbip') {
    // Can't create /rashbip itself
    return null
  } else if (pathParts[0] === 'rashbip') {
    // Remove 'rashbip' prefix - files are stored at root
    pathParts.shift()
    actualPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/'
  } else {
    actualPath = '/' + pathParts.join('/')
  }
  
  // Create a hidden marker file to represent the folder
  return {
    name: ".keep",
    path: `${actualPath}/.keep`,
    icon: "config",
    content: "",
    language: "plaintext"
  }
}

export const normalizeFilePath = (path: string, currentCwd: string): string => {
  if (path.startsWith("/")) {
    // Map /rashbip to / for actual file system
    return path === "/rashbip" ? "/" : path
  }
  if (path === "..") {
    const parts = currentCwd.split("/").filter(Boolean)
    if (currentCwd === "/rashbip") {
      return "/rashbip" // Can't go above /rashbip
    }
    if (parts.length > 0) {
      parts.pop()
      const newPath = parts.length > 0 ? "/" + parts.join("/") : "/"
      // Map back to /rashbip if we're at root
      return newPath === "/" ? "/rashbip" : newPath
    }
    return "/rashbip"
  }
  if (path === "." || path === "") return currentCwd
  // If currentCwd is /rashbip, create paths under root /
  const basePath = currentCwd === "/rashbip" ? "/" : currentCwd
  return basePath === "/" ? `/${path}` : `${basePath}/${path}`
}

export const getFilesInDirectory = (
  dir: string,
  files: FileType[]
): Array<{ name: string; path: string; isDir: boolean }> => {
  // Map /rashbip to root / for file system access
  const actualDir = dir === "/rashbip" ? "/" : (dir.endsWith("/") ? dir.slice(0, -1) : dir)
  const normalizedDir = actualDir
  const items: Array<{ name: string; path: string; isDir: boolean }> = []
  const seenDirs = new Set<string>()
  const seenFiles = new Set<string>()
  
  files.forEach(file => {
    // Check if file is directly in this directory
    if (file.path.startsWith(normalizedDir + "/") && normalizedDir !== "/") {
      const relative = file.path.substring(normalizedDir.length + 1)
      const parts = relative.split("/").filter(Boolean)
      
      if (parts.length === 1) {
        // Direct child file
        const itemName = parts[0]
        if (itemName === ".keep") {
          // This is a .keep file in the current directory - don't show it as a subdirectory
          // The .keep file just marks that the current directory exists
          // Skip it - we don't want to show the current directory as a subdirectory of itself
        } else if (!seenFiles.has(itemName)) {
          seenFiles.add(itemName)
          items.push({ name: itemName, path: file.path, isDir: false })
        }
      } else if (parts.length > 1) {
        // Nested - first part is a subdirectory
        const dirName = parts[0]
        const dirPath = normalizedDir + "/" + dirName
        // Only add if it's a real directory (has a .keep file or contains files)
        // AND it's not the same as the current directory (avoid self-reference)
        // AND it's not a parent of the current directory
        if (dirPath !== normalizedDir && !normalizedDir.startsWith(dirPath + "/") && !seenDirs.has(dirPath)) {
          // Check if this directory actually exists by looking for .keep file or other files
          const hasKeepFile = files.some(f => f.path === dirPath + "/.keep")
          // Check for files that are direct children (not nested deeper)
          const directChildren = files.filter(f => {
            if (!f.path.startsWith(dirPath + "/")) return false
            const relative = f.path.substring(dirPath.length + 1)
            const childParts = relative.split("/").filter(Boolean)
            // Only count as direct child if it's one level deep
            return childParts.length === 1
          })
          
          if (hasKeepFile || directChildren.length > 0) {
            seenDirs.add(dirPath)
            items.push({ name: dirName, path: dirPath, isDir: true })
          }
        }
      }
    } else if (normalizedDir === "/") {
      // Root directory - show all top-level files and folders
      const parts = file.path.split("/").filter(Boolean)
      if (parts.length === 1) {
        // Top-level file
        const itemName = parts[0]
        if (!seenFiles.has(itemName)) {
          seenFiles.add(itemName)
          items.push({ name: itemName, path: file.path, isDir: false })
        }
      } else if (parts.length === 2 && parts[1] === ".keep") {
        // Folder marker at root: /foldername/.keep
        const folderName = parts[0]
        const dirPath = "/" + folderName
        if (!seenDirs.has(dirPath)) {
          seenDirs.add(dirPath)
          items.push({ name: folderName, path: dirPath, isDir: true })
        }
      } else if (parts.length > 1) {
        // Subdirectory - show first level only if it has a .keep file or contains files
        const dirName = parts[0]
        const dirPath = "/" + dirName
        // Make sure we're not showing the root directory as a subdirectory
        if (dirPath !== normalizedDir) {
          const hasKeepFile = files.some(f => f.path === dirPath + "/.keep")
          const hasFiles = files.some(f => f.path.startsWith(dirPath + "/") && f.path !== dirPath + "/.keep")
          if ((hasKeepFile || hasFiles) && !seenDirs.has(dirPath)) {
            seenDirs.add(dirPath)
            items.push({ name: dirName, path: dirPath, isDir: true })
          }
        }
      }
    }
  })
  
  return items.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export const pathExistsInFiles = (path: string, files: FileType[]): boolean => {
  // Map /rashbip paths to / for checking
  const actualPath = path === "/rashbip" ? "/" : (path.startsWith("/rashbip/") ? path.replace("/rashbip", "") : path)
  return files.some(f => f.path === actualPath || f.path.startsWith(actualPath + "/"))
}

