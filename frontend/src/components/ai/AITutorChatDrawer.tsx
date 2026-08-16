import { useState } from 'react'
import { X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichContentRenderer } from '@/components/common/RichContentRenderer'

export function AITutorChatDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Halo! Saya AI Tutor Anda. Ada yang bisa saya bantu dengan materi ini?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sedang memproses pertanyaan Anda...' }])
    }, 500)
  }

  const promptChips = ["💡 Rangkum Materi", "🔍 Beri Contoh Nyata", "❓ Uji Pemahaman Saya"]

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-background border-l shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> AI Tutor
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="h-5 w-5" /></Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <div className="text-sm">
                <RichContentRenderer content={msg.content} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-muted/10 space-y-3">
        <div className="flex flex-wrap gap-2">
          {promptChips.map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-xs px-3 py-1.5 bg-background border rounded-full hover:bg-muted transition-colors whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Tanya AI Tutor..."
            className="flex-1 px-4 py-2 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <Button onClick={() => handleSend(input)} size="icon" className="shrink-0 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
