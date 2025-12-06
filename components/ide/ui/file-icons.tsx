export function KotlinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <defs>
        <linearGradient id="kotlin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7F52FF" />
          <stop offset="100%" stopColor="#C811E2" />
        </linearGradient>
      </defs>
      <path d="M2 2h20L12 12l10 10H2V2z" fill="url(#kotlin-gradient)" />
    </svg>
  )
}

export function DartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4.5 12L12 4.5 19.5 12 12 19.5 4.5 12z" fill="#00D2B8" />
      <path d="M12 4.5L19.5 12H12V4.5z" fill="#00A8A8" />
      <path d="M12 12v7.5L4.5 12H12z" fill="#00D2B8" />
    </svg>
  )
}

export function HtmlIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z" fill="#E44D26" />
      <path d="M12 4v16l5.5-1.5L19 4H12z" fill="#F16529" />
      <path d="M8 8h8l-.3 3H8.3L8 8zm.5 5h6.5l-.5 5-2.5.7-2.5-.7-.2-2h2l.1 1 .6.2.6-.2.1-1H8.5z" fill="#FFF" />
    </svg>
  )
}

export function MarkdownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 5v14h18V5H3zm4 11H5v-4l1.5 2 1.5-2v4H6zm4 0H9V8h2v4l2-2 2 2V8h2v8h-2l-2-2.5L9 16zm7-4h2l-2.5 3L16 11h2v5h-2v-3l-1.5 1.5L13 13v3h-2v-5h2l1.5 1.5z" />
    </svg>
  )
}

export function GradleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <ellipse cx="12" cy="12" rx="10" ry="10" fill="#02303A" />
      <path d="M7 10c1.5-1.5 4-1 5 1s0 4-2 4-3-2-3-5zm10 0c-1.5-1.5-4-1-5 1s0 4 2 4 3-2 3-5z" fill="#FFF" />
    </svg>
  )
}

export function ConfigIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
    </svg>
  )
}

export function WebIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
      <path d="M2 12h20" />
    </svg>
  )
}

export function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#3DDC84">
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
    </svg>
  )
}

export function FlutterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14.25 0L3 11.25l3.563 3.563L20.625 0H14.25z" fill="#42A5F5" />
      <path d="M14.25 12.188L9.563 16.875l3.562 3.562 7.5-7.5L14.25 12.188z" fill="#42A5F5" />
      <path d="M9.563 16.875L5.813 20.625 9.375 24.188 13.125 20.438z" fill="#0D47A1" />
      <path d="M9.563 16.875l4.687.562-.562-4.687z" fill="#42A5F5" opacity="0.8" />
    </svg>
  )
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 .968-.786 1.754-1.754 1.754-.463 0-.898-.196-1.207-.49-1.207-.883-2.878-1.43-4.744-1.487l-.885-4.182a.342.342 0 0 1-.14-.197.35.35 0 0 1-.238-.042l-2.906.617a1.214 1.214 0 0 1-1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

export function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

export function CssIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z" fill="#264DE4" />
      <path d="M12 4v16l5.5-1.5L19 4H12z" fill="#2965F1" />
      <path d="M8 8h8l-.3 3H8.3L8 8zm.5 5h6.5l-.5 5-2.5.7-2.5-.7-.2-2h2l.1 1 .6.2.6-.2.1-1H8.5z" fill="#FFF" />
    </svg>
  )
}

export function JsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#F7DF1E" />
      <path
        d="M12 18c0-2 1-3 2.5-3s2 .8 2 1.8h-1.2c0-.5-.3-.8-.8-.8-.6 0-1 .5-1 1.5v1c0 1 .4 1.5 1 1.5.5 0 .8-.3.8-.8h1.2c0 1-.8 1.8-2 1.8-1.5 0-2.5-1-2.5-3zm-5 0v-4h1.2v4c0 .6.3 1 .8 1s.8-.4.8-1v-4h1.2v4c0 1.2-.8 2-2 2s-2-.8-2-2z"
        fill="#000"
      />
    </svg>
  )
}
