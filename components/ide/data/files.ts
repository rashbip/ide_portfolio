
export type FileType = {
  name: string
  path: string
  icon: string
  content: string
  language: string
  isSpecial?: "profile" | "html-preview" | "dart-preview" | "kotlin-viewer" | "profile-html" | "welcome" | "documentation" | "about" | "flutter-preview"
}

export const files: FileType[] = [
  {
    name: "profile.web",
    path: "/profile/profile.web",
    icon: "web",
    content: "",
    language: "web",
    isSpecial: "profile",
  },
  {
    name: "profile.html",
    path: "/profile/profile.html",
    icon: "html",
    content: "",
    language: "html",
    isSpecial: "profile-html",
  },
  {
    name: "README.md",
    path: "/README.md",
    icon: "markdown",
    content: `# rashbip

> Not a portfolio. Not looking for a job. Just existing on the internet.

## About

I build apps. Android, Flutter, whatever works.
This is a developer's space, not a showcase.

## Stack

\`\`\`
├── Android Native
│   ├── Views + Kotlin
│   └── Jetpack Compose + Kotlin
└── Flutter
    └── All platforms
\`\`\`

## Links

- GitHub: https://github.com/rashbip
- Reddit: u/Fair_Concentrate606

---

*Type \`help\` in the terminal for available commands.*`,
    language: "markdown",
  },
  {
    name: "index.html",
    path: "/web/index.html",
    icon: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Terminal</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="glitch-wrapper">
      <h1 class="glitch" data-text="RASHBIP">RASHBIP</h1>
    </div>
    <div class="terminal">
      <div class="terminal-header">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
      </div>
      <div class="terminal-body">
        <div class="line">
          <span class="prompt">$</span> <span class="cmd">whoami</span>
        </div>
        <div class="line output">rashbip</div>
        <div class="line">
          <span class="prompt">$</span> <span class="cmd">cat skills.txt</span>
        </div>
        <div class="line output">
          <ul>
            <li>Kotlin (Android)</li>
            <li>Dart (Flutter)</li>
            <li>React / Next.js</li>
            <li>TypeScript</li>
          </ul>
        </div>
        <div class="line active">
          <span class="prompt">$</span> <span class="cursor">_</span>
        </div>
      </div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    language: "html",
    isSpecial: "html-preview",
  },
  {
    name: "style.css",
    path: "/web/style.css",
    icon: "css",
    content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #0a0a0f;
  --text: #00ff88;
  --accent: #ff0055;
  --terminal-bg: rgba(0, 0, 0, 0.8);
}

body {
  font-family: 'Courier New', monospace;
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: 
    linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%),
    linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 4px, 100% 100%;
  pointer-events: none;
  z-index: 10;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.glitch-wrapper {
  position: relative;
}

.glitch {
  font-size: 4rem;
  font-weight: bold;
  color: var(--text);
  text-shadow: 2px 2px var(--accent);
  position: relative;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -1px 0 #ff00c1;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-1 5s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -1px 0 #00fff9;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-2 5s infinite linear alternate-reverse;
}

@keyframes glitch-1 {
  0% { clip: rect(20px, 9999px, 80px, 0); }
  20% { clip: rect(60px, 9999px, 10px, 0); }
  40% { clip: rect(40px, 9999px, 50px, 0); }
  60% { clip: rect(80px, 9999px, 20px, 0); }
  80% { clip: rect(10px, 9999px, 70px, 0); }
  100% { clip: rect(30px, 9999px, 40px, 0); }
}

@keyframes glitch-2 {
  0% { clip: rect(50px, 9999px, 20px, 0); }
  20% { clip: rect(30px, 9999px, 70px, 0); }
  40% { clip: rect(70px, 9999px, 30px, 0); }
  60% { clip: rect(20px, 9999px, 60px, 0); }
  80% { clip: rect(60px, 9999px, 10px, 0); }
  100% { clip: rect(40px, 9999px, 50px, 0); }
}

.terminal {
  background: var(--terminal-bg);
  border: 1px solid var(--text);
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
}

.terminal-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  display: flex;
  gap: 6px;
  border-bottom: 1px solid var(--text);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.red { background: #ff5f56; }
.yellow { background: #ffbd2e; }
.green { background: #27c93f; }

.terminal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.line {
  color: var(--text);
  font-size: 14px;
}

.prompt {
  color: var(--accent);
  margin-right: 8px;
}

.cmd {
  color: #fff;
}

.output {
  color: #ccc;
  padding-left: 20px;
  opacity: 0.8;
}

ul {
  list-style: none;
}

.cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

@media (max-width: 600px) {
  .glitch { font-size: 3rem; }
  .terminal { width: 100%; border: none; }
}
`,
    language: "css",
  },
  {
    name: "script.js",
    path: "/web/script.js",
    icon: "javascript",
    content: `// Matrix Rain Effect
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.opacity = '0.1';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const cols = Math.floor(width / 20);
const drops = Array(cols).fill(0);
const chars = "RASHBIP01";

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = '#00ff88';
  ctx.font = '15px monospace';
  
  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * 20, drops[i] * 20);
    
    if (drops[i] * 20 > height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

// Start Matrix Rain
setInterval(draw, 50);

console.log("System initialized...");`,
    language: "javascript",
  },
  {
    name: "about.kt",
    path: "/src/about.kt",
    icon: "kotlin",
    content: `package com.rashbip.portfolio

import androidx.compose.material3.*
import androidx.compose.runtime.*

fun main() {
    println("Hello, Android World!")
}

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      MyApp()
    }
  }
}

@Composable
fun MyApp() {
  MaterialTheme {
    Surface(color = MaterialTheme.colorScheme.background) {
      Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "rashbip", style = MaterialTheme.typography.h3)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "Android Developer | Flutter Enthusiast")
      }
    }
  }
}`,
    language: "kotlin",
    isSpecial: "kotlin-viewer",
  },
  {
    name: "stack.dart",
    path: "/lib/stack.dart",
    icon: "dart",
    content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const TechStackPage(),
    );
  }
}

class TechStackPage extends StatelessWidget {
  const TechStackPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('rashbip - Tech Stack'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          StackItem(
            title: 'Android',
            subtitle: 'Kotlin, Jetpack Compose, Coroutines',
            icon: Icons.android,
            color: Colors.green,
          ),
          StackItem(
            title: 'Flutter',
            subtitle: 'Dart, Riverpod, Bloc',
            icon: Icons.flutter_dash,
            color: Colors.blue,
          ),
          StackItem(
            title: 'Web',
            subtitle: 'React, Next.js, Tailwind',
            icon: Icons.web,
            color: Colors.purple,
          ),
        ],
      ),
    );
  }
}

class StackItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;

  const StackItem({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: color, size: 40),
        title: Text(title),
        subtitle: Text(subtitle),
      ),
    );
  }
}`,
    language: "dart",
    isSpecial: "dart-preview",
  },
  {
    name: "config.gradle.kts",
    path: "/build/config.gradle.kts",
    icon: "gradle",
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.rashbip.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.rashbip.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
}`,
    language: "kotlin",
  },
  {
    name: ".gitconfig",
    path: "/.gitconfig",
    icon: "config",
    content: `[user]
    name = rashbip
    email = dev@rashbip.com

[core]
    editor = code

[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    lg = log --oneline --graph --all
    yeet = push --force-with-lease
    oops = commit --amend --no-edit

[color]
    ui = auto`,
    language: "ini",
  },
  {
    name: ".gitignore",
    path: "/.gitignore",
    icon: "config",
    content: `# Build outputs
/build/
/dist/
*.apk
*.aab
*.ipa

# Dependencies
/node_modules/
/.dart_tool/
/.packages

# IDE
/.idea/
*.iml
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# Generated
*.g.dart
*.freezed.dart
*.gr.dart

# Flutter/Dart
.flutter-plugins
.flutter-plugins-dependencies
pubspec.lock`,
    language: "gitignore",
  },
  {
    name: "settings.json",
    path: "/.ide/settings.json",
    icon: "config",
    content: `{
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "prettier",
  "terminal.integrated.fontSize": 13,
  "workbench.colorTheme": "One Dark Pro",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}`,
    language: "json",
  },
  {
    name: "workspace.json",
    path: "/.ide/workspace.json",
    icon: "config",
    content: `{
  "name": "rashbip-portfolio",
  "version": "1.0.0",
  "description": "Mobile developer portfolio",
  "author": "rashbip",
  "projects": [
    {
      "name": "android-app",
      "type": "kotlin",
      "path": "/android"
    },
    {
      "name": "flutter-app",
      "type": "dart",
      "path": "/flutter"
    },
    {
      "name": "web",
      "type": "html",
      "path": "/web"
    }
  ],
  "defaultProject": "web"
}`,
    language: "json",
  },
  {
    name: "extensions.json",
    path: "/.ide/extensions.json",
    icon: "config",
    content: `{
  "recommendations": [
    "dart-code.dart-code",
    "dart-code.flutter",
    "mathiasfrohlich.kotlin",
    "vscjava.vscode-gradle",
    "esbenp.prettier-vscode",
    "formulahendry.code-runner"
  ]
}`,
    language: "json",
  },
  {
    name: "package.json",
    path: "/package.json",
    icon: "json",
    content: `{
  "name": "rashbip-portfolio",
  "version": "1.0.0",
  "description": "Developer portfolio website",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "framer-motion": "^10.16.0",
    "lenis": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}`,
    language: "json",
  },
  {
    name: "tsconfig.json",
    path: "/tsconfig.json",
    icon: "config",
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
    language: "json",
  },
  {
    name: "tailwind.config.ts",
    path: "/tailwind.config.ts",
    icon: "config",
    content: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
export default config`,
    language: "typescript",
  },
  {
    name: "next.config.js",
    path: "/next.config.js",
    icon: "javascript",
    content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig`,
    language: "javascript",
  },
  {
    name: "MainActivity.kt",
    path: "/android/app/src/main/java/com/rashbip/MainActivity.kt",
    icon: "kotlin",
    content: `package com.rashbip.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    PortfolioScreen()
                }
            }
        }
    }
}

@Composable
fun PortfolioScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "rashbip",
            style = MaterialTheme.typography.displayMedium
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Android & Flutter Developer",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}

@Composable
fun MyAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(),
        content = content
    )
}`,
    language: "kotlin",
  },
  {
    name: "pubspec.yaml",
    path: "/flutter/pubspec.yaml",
    icon: "yaml",
    content: `name: rashbip_portfolio
description: Flutter portfolio application
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  riverpod: ^2.4.0
  flutter_riverpod: ^2.4.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/`,
    language: "yaml",
  },
  {
    name: "main.dart",
    path: "/flutter/lib/main.dart",
    icon: "dart",
    content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'rashbip Portfolio',
      theme: ThemeData.dark(),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('rashbip'),
      ),
      body: const Center(
        child: Text('Flutter Portfolio'),
      ),
    );
  }
}`,
    language: "dart",
    isSpecial: "flutter-preview",
  },
  {
    name: "LICENSE",
    path: "/LICENSE",
    icon: "text",
    content: `MIT License

Copyright (c) 2024 rashbip

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    language: "text",
  },
  {
    name: "CHANGELOG.md",
    path: "/CHANGELOG.md",
    icon: "markdown",
    content: `# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-01

### Added
- Initial portfolio website
- VS Code-like IDE interface
- Terminal with file management commands
- File explorer with folder support
- Code editor with syntax highlighting
- Multiple language support (Kotlin, Dart, TypeScript, etc.)

### Features
- File creation, deletion, and editing
- Folder management
- Terminal commands (ls, cd, cat, touch, mkdir, rm, etc.)
- Tab completion
- Command aliases
- File search and navigation`,
    language: "markdown",
  },
  {
    name: ".env.example",
    path: "/.env.example",
    icon: "config",
    content: `# Environment Variables
# Copy this file to .env and fill in your values

NEXT_PUBLIC_SITE_URL=https://rashidul.is-a.dev
NEXT_PUBLIC_GITHUB_URL=https://github.com/rashbip
NEXT_PUBLIC_REDDIT_USER=Fair_Concentrate606`,
    language: "text",
  },
  {
    name: "docker-compose.yml",
    path: "/docker-compose.yml",
    icon: "yaml",
    content: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules`,
    language: "yaml",
  },
  {
    name: "Dockerfile",
    path: "/Dockerfile",
    icon: "text",
    content: `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`,
    language: "dockerfile",
  },
  {
    name: "notes.txt",
    path: "/notes.txt",
    icon: "text",
    content: `Developer Notes
================

TODO:
- Add more terminal commands
- Improve file search
- Add git integration
- Add code snippets

IDEAS:
- Command history search
- Multiple terminal tabs
- File watcher
- Auto-save improvements

NOTES:
- Terminal default directory: /rashbip
- Use 'help' command for available commands
- Tab completion works for commands and files`,
    language: "text",
  },
  {
    name: "skills.txt",
    path: "/skills.txt",
    icon: "text",
    content: `Technical Skills
===============

Languages:
- Kotlin (Android)
- Dart (Flutter)
- TypeScript/JavaScript
- Java
- Python

Frameworks:
- Android SDK
- Jetpack Compose
- Flutter
- React/Next.js
- Node.js

Tools:
- Git
- Gradle
- Docker
- VS Code
- Android Studio`,
    language: "text",
  },
]
