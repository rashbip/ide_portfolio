"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Terminal, Code2, Smartphone, Layers, ArrowRight } from "lucide-react"

export function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [skillsAnimated, setSkillsAnimated] = useState(false)
  const [activeCard, setActiveCard] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setSkillsAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const skills = [
    { name: "Kotlin", level: 95 },
    { name: "Jetpack Compose", level: 90 },
    { name: "Android SDK", level: 92 },
    { name: "Flutter", level: 88 },
    { name: "Dart", level: 85 },
    { name: "Material Design", level: 90 },
  ]

  const stack = [
    {
      title: "Android Native",
      description: "Views + Kotlin, Jetpack Compose",
      icon: Smartphone,
    },
    {
      title: "Jetpack Compose",
      description: "Modern declarative UI",
      icon: Layers,
    },
    {
      title: "Flutter",
      description: "All platforms, one codebase",
      icon: Code2,
    },
  ]

  const stats = [
    { label: "Years Coding", value: "5+" },
    { label: "Frameworks", value: "3" },
    { label: "Platforms", value: "All" },
    { label: "Coffee/Day", value: "∞" },
  ]

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"
  const bgColor = isDark ? "bg-black" : "bg-white"
  const textColor = isDark ? "text-white" : "text-black"
  const mutedText = isDark ? "text-neutral-400" : "text-neutral-600"
  const borderColor = isDark ? "border-neutral-800" : "border-neutral-200"
  const cardBg = isDark ? "bg-neutral-900" : "bg-neutral-100"

  return (
    <div className={`h-full overflow-auto ${bgColor} relative`}>
      <div
        className="fixed w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl transition-transform duration-1000 ease-out"
        style={{
          background: "radial-gradient(circle, #ef4444 0%, transparent 70%)",
          transform: `translate(${mousePos.x - 128}px, ${mousePos.y - 128}px)`,
        }}
      />

      <div className="min-h-full max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <div className="mb-16 animate-slide-in-up">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl animate-float" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse-slow"
              style={{ animationDelay: "1s" }}
            />

            <div className="relative">
              <div
                className={`inline-flex items-center gap-2 mb-6 px-4 py-2 border ${borderColor} rounded-full animate-scale-in`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className={`text-sm ${mutedText} font-mono`}>ONLINE</span>
              </div>

              <h1 className={`text-6xl md:text-8xl font-bold ${textColor} mb-4 tracking-tight`}>
                <span className="inline-block animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
                  r
                </span>
                <span className="inline-block animate-slide-in-up" style={{ animationDelay: "0.15s" }}>
                  a
                </span>
                <span className="inline-block animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
                  s
                </span>
                <span className="inline-block animate-slide-in-up" style={{ animationDelay: "0.25s" }}>
                  h
                </span>
                <span className="inline-block text-red-500 animate-slide-in-up" style={{ animationDelay: "0.3s" }}>
                  b
                </span>
                <span className="inline-block text-red-500 animate-slide-in-up" style={{ animationDelay: "0.35s" }}>
                  i
                </span>
                <span className="inline-block text-red-500 animate-slide-in-up" style={{ animationDelay: "0.4s" }}>
                  p
                </span>
              </h1>

              <p
                className={`text-xl md:text-2xl ${mutedText} mb-8 max-w-xl leading-relaxed animate-slide-in-up`}
                style={{ animationDelay: "0.5s" }}
              >
                Not a portfolio. Not looking for a job. Just a developer
                <span className="text-red-500 font-semibold"> existing </span>
                on the internet.
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-4 animate-slide-in-up" style={{ animationDelay: "0.6s" }}>
                <a
                  href="https://github.com/rashbip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 px-6 py-3 ${isDark ? "bg-white text-black" : "bg-black text-white"} rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20`}
                >
                  <GitHubIcon className="w-5 h-5" />
                  <span className="font-medium">GitHub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://reddit.com/user/Fair_Concentrate606"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 px-6 py-3 border-2 ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"} rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20`}
                >
                  <RedditIcon className="w-5 h-5" />
                  <span className="font-medium">Reddit</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`relative p-6 border ${borderColor} rounded-xl overflow-hidden group hover:border-red-500/50 transition-all duration-300 animate-slide-in-up hover:scale-105`}
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className={`text-3xl font-bold ${textColor} mb-1`}>{stat.value}</div>
                <div className={`text-sm ${mutedText}`}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stack Section */}
        <div className="mb-16">
          <h2
            className={`text-sm font-mono ${mutedText} uppercase tracking-widest mb-6 animate-slide-in-up`}
            style={{ animationDelay: "1.1s" }}
          >
            {"// Tech Stack"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stack.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className={`relative p-6 border ${borderColor} rounded-xl cursor-pointer transition-all duration-300 overflow-hidden animate-slide-in-up ${
                    activeCard === index
                      ? "border-red-500 scale-[1.02]"
                      : isDark
                        ? "hover:border-neutral-600"
                        : "hover:border-neutral-400"
                  }`}
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                  style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                >
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 bg-red-500 transition-transform duration-500 ${
                      activeCard === index ? "translate-x-10 -translate-y-10" : "translate-x-20 -translate-y-20"
                    }`}
                    style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                  />

                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-lg ${cardBg} flex items-center justify-center mb-4 transition-all duration-300 ${
                        activeCard === index ? "bg-red-500/10 scale-110" : ""
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 transition-colors duration-300 ${activeCard === index ? "text-red-500" : textColor}`}
                      />
                    </div>
                    <h3 className={`text-lg font-semibold ${textColor} mb-2`}>{item.title}</h3>
                    <p className={`${mutedText} text-sm`}>{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <h2
            className={`text-sm font-mono ${mutedText} uppercase tracking-widest mb-6 animate-slide-in-up`}
            style={{ animationDelay: "1.5s" }}
          >
            {"// Skills"}
          </h2>
          <div
            className={`p-6 border ${borderColor} rounded-xl animate-slide-in-up`}
            style={{ animationDelay: "1.6s" }}
          >
            <div className="space-y-5">
              {skills.map((skill, index) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={`${textColor} font-medium`}>{skill.name}</span>
                    <span className={`${mutedText} font-mono`}>{skill.level}%</span>
                  </div>
                  <div className={`h-1.5 ${isDark ? "bg-neutral-800" : "bg-neutral-200"} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: skillsAnimated ? `${skill.level}%` : "0%",
                        transitionDelay: `${1.7 + index * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Terminal Quote */}
        <div className="mb-16">
          <div
            className={`relative p-6 border ${borderColor} rounded-xl ${isDark ? "bg-neutral-950" : "bg-neutral-50"} font-mono animate-slide-in-up`}
            style={{ animationDelay: "2.3s" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-red-500" />
              <span className={`text-xs ${mutedText}`}>terminal</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-red-500">$</span>
                <span className={mutedText}> whoami</span>
              </div>
              <div className={`${textColor} pl-2`}>rashbip - Mobile Developer</div>
              <div>
                <span className="text-red-500">$</span>
                <span className={mutedText}> cat /etc/motd</span>
              </div>
              <div className={`${mutedText} pl-2 italic`}>
                "This is not a portfolio. This is not a job application."
              </div>
              <div className="flex items-center">
                <span className="text-red-500">$</span>
                <span className="w-2 h-4 bg-red-500 ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8 animate-slide-in-up" style={{ animationDelay: "2.5s" }}>
          <p className={`${isDark ? "text-neutral-600" : "text-neutral-400"} text-sm`}>
            Just a dev existing on the internet.
          </p>
        </div>
      </div>
    </div>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}
