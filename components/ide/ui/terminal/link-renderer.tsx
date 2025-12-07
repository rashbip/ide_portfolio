"use client"

import React, { useState, cloneElement, isValidElement } from "react"
import { ExternalLink } from "lucide-react"

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s<>"']+|rashidul\.is-a\.dev|rashbip\.github\.io|localhost:\d+)/gi

type Props = {
  text: string | React.ReactNode
}

export function LinkRenderer({ text }: Props) {
  const [showConfirm, setShowConfirm] = useState<{ url: string } | null>(null)

  const handleOpenLink = (url: string) => {
    setShowConfirm({ url })
  }

  const confirmOpen = () => {
    if (showConfirm?.url) {
      window.open(showConfirm.url, '_blank', 'noopener,noreferrer')
      setShowConfirm(null)
    }
  }

  // Recursively process React nodes to find and convert URLs
  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return processString(node)
    }
    
    if (typeof node === 'number') {
      return processString(String(node))
    }
    
    if (!isValidElement(node)) {
      return node
    }

    // Process children recursively
    const props = node.props as { children?: React.ReactNode }
    const children = props?.children
    if (children) {
      const processedChildren = Array.isArray(children)
        ? children.map((child, i) => (
            <React.Fragment key={i}>{processNode(child)}</React.Fragment>
          ))
        : processNode(children)

      return cloneElement(node as React.ReactElement<any>, { ...props, children: processedChildren })
    }

    return node
  }

  // Process string to convert URLs to clickable links
  const processString = (str: string): React.ReactNode => {
    const parts: (string | React.ReactElement)[] = []
    let lastIndex = 0
    let match
    let keyCounter = 0

    // Reset regex
    URL_REGEX.lastIndex = 0

    while ((match = URL_REGEX.exec(str)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index))
      }

      // Normalize URL
      let url = match[0]
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('localhost:')) {
          url = `http://${url}`
        } else {
          url = `https://${url}`
        }
      }

      // Add clickable link
      parts.push(
        <span
          key={`link-${keyCounter++}`}
          onClick={() => handleOpenLink(url)}
          className="text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
          title={`Click to open ${url} in new tab`}
        >
          {match[0]}
          <ExternalLink className="w-3 h-3 inline" />
        </span>
      )

      lastIndex = URL_REGEX.lastIndex
    }

    // Add remaining text
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex))
    }

    return parts.length > 0 ? parts : str
  }

  return (
    <>
      {processNode(text)}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfirm(null)}>
          <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Open Link?</h3>
            <p className="text-muted-foreground mb-4 break-all">{showConfirm.url}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 border border-border rounded hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmOpen}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

