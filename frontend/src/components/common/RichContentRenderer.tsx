import React, { useState } from 'react'
import { Check, Copy, Terminal, Code2 } from 'lucide-react'

interface RichContentRendererProps {
  content: string
}

interface CodeSnippetBlockProps {
  language: string
  code: string
}

function CodeSnippetBlock({ language, code }: CodeSnippetBlockProps) {
  const [copied, setCopied] = useState(false)
  const langLower = (language || 'text').toLowerCase().trim()

  const isTerminal = ['bash', 'sh', 'shell', 'zsh', 'powershell', 'ps1', 'cmd', 'batch'].includes(langLower)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLanguageLabel = () => {
    switch (langLower) {
      case 'bash':
      case 'sh':
      case 'shell':
      case 'zsh':
        return 'BASH'
      case 'powershell':
      case 'ps1':
        return 'POWERSHELL'
      case 'cmd':
      case 'batch':
        return 'COMMAND PROMPT'
      case 'yaml':
      case 'yml':
        return 'YAML CONFIG'
      case 'json':
        return 'JSON'
      case 'python':
      case 'py':
        return 'PYTHON'
      case 'javascript':
      case 'js':
        return 'JAVASCRIPT'
      case 'typescript':
      case 'ts':
        return 'TYPESCRIPT'
      case 'dockerfile':
      case 'docker':
        return 'DOCKERFILE'
      case 'sql':
        return 'SQL'
      default:
        return langLower.toUpperCase()
    }
  }

  const getPromptPrefix = () => {
    if (['powershell', 'ps1'].includes(langLower)) return 'PS> '
    if (['cmd', 'batch'].includes(langLower)) return '> '
    if (['bash', 'sh', 'shell', 'zsh'].includes(langLower)) return '$ '
    return ''
  }

  return (
    <div className="my-5 rounded-xl border border-slate-700/80 bg-slate-950 shadow-lg overflow-hidden font-mono text-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {isTerminal ? (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <Terminal className="h-3.5 w-3.5 ml-2 text-sky-400" />
              <span className="font-semibold text-slate-200 tracking-wider ml-1">{getLanguageLabel()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-200">
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-semibold tracking-wider">{getLanguageLabel()}</span>
            </div>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
          title="Salin ke clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-sans">Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto text-slate-100 leading-relaxed text-xs sm:text-sm">
        {isTerminal ? (
          <div>
            {code.split('\n').map((line, idx) => (
              <div key={idx} className="flex">
                <span className="text-sky-400/80 select-none mr-2 font-bold">{getPromptPrefix()}</span>
                <span className="flex-1 whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="whitespace-pre m-0 p-0 font-mono text-slate-200">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}

export function RichContentRenderer({ content }: RichContentRendererProps) {
  if (!content) return null

  // Parse fenced code blocks: ```lang ... ```
  const parts: React.ReactNode[] = []
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Push preceding text before code block
    if (match.index > lastIndex) {
      const textSection = content.substring(lastIndex, match.index)
      parts.push(<RenderFormattedText key={`text-${lastIndex}`} text={textSection} />)
    }

    const language = match[1] || 'bash'
    const code = match[2].trimEnd()

    parts.push(
      <CodeSnippetBlock
        key={`code-${match.index}`}
        language={language}
        code={code}
      />
    )

    lastIndex = codeBlockRegex.lastIndex
  }

  // Remaining text after last code block
  if (lastIndex < content.length) {
    const trailingText = content.substring(lastIndex)
    parts.push(<RenderFormattedText key={`text-${lastIndex}`} text={trailingText} />)
  }

  return <div className="space-y-4">{parts}</div>
}

function RenderFormattedText({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  let idx = 0
  while (idx < lines.length) {
    const line = lines[idx]
    const trimmed = line.trim()

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-6 mb-3 border-b pb-2">
          {renderInlineFormatting(trimmed.substring(2))}
        </h1>
      )
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-5 mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary inline-block" />
          {renderInlineFormatting(trimmed.substring(3))}
        </h2>
      )
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-lg sm:text-xl font-bold text-foreground mt-4 mb-2">
          {renderInlineFormatting(trimmed.substring(4))}
        </h3>
      )
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-foreground/90 text-sm sm:text-base leading-relaxed">
          {renderInlineFormatting(trimmed.substring(2))}
        </li>
      )
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <li key={idx} className="ml-5 list-decimal text-foreground/90 text-sm sm:text-base leading-relaxed">
          {renderInlineFormatting(trimmed.replace(/^\d+\.\s/, ''))}
        </li>
      )
    } else if (trimmed.length > 0) {
      elements.push(
        <p key={idx} className="text-foreground/90 text-sm sm:text-base leading-relaxed mb-3">
          {renderInlineFormatting(line)}
        </p>
      )
    }

    idx++
  }

  return <div>{elements}</div>
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Parse inline `code` and **bold**
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-muted font-mono text-primary font-semibold text-xs sm:text-sm border border-border">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}
