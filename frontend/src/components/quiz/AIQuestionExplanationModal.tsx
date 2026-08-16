import { X, Sparkles, BrainCircuit, Lightbulb, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIQuestionExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  question: string
}

export function AIQuestionExplanationModal({ isOpen, onClose, question }: AIQuestionExplanationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
        <div className="flex items-center justify-between p-4 border-b bg-muted/10 sticky top-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Penjelasan AI
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" /> Penalaran Utama
            </h4>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm leading-relaxed">
              Pertanyaan ini menguji konsep <strong>{question}</strong>. Berdasarkan analisis, jawaban yang paling tepat didasarkan pada prinsip utama yang mengatur interaksi komponen dalam sistem ini.
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Breakdown Pilihan
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border bg-muted/10 text-sm">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Pilihan Benar:</span> Karena memenuhi semua kriteria yang diminta oleh spesifikasi tanpa menimbulkan efek samping.
              </div>
              <div className="p-3 rounded-lg border bg-muted/10 text-sm">
                <span className="font-semibold text-destructive">Pilihan Salah:</span> Gagal mengatasi kondisi edge case pada load tinggi.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Key Takeaways
            </h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-foreground/80 ml-2">
              <li>Selalu pertimbangkan skalabilitas.</li>
              <li>Pahami perbedaan mendasar antara stateful dan stateless.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
