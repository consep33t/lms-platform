import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Progress } from '@/components/ui/progress'
import { cn, formatFileSize } from '@/lib/utils'
import api from '@/lib/api'

interface FileUploaderProps {
  accept?: Record<string, string[]>
  maxSize?: number
  onSuccess?: (mediaId: number, url: string) => void
  onError?: (error: string) => void
  className?: string
}

export function FileUploader({ accept, maxSize, onSuccess, onError, className }: FileUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'failed'>('idle')
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    setStatus('uploading')
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percent)
          }
        },
      })
      setStatus('processing')
      onSuccess?.(response.data.id, response.data.url)
    } catch (err: any) {
      setStatus('failed')
      onError?.(err.response?.data?.detail || 'Upload gagal')
    }
  }, [onSuccess, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  return (
    <div className={cn('space-y-3', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {isDragActive ? 'Lepas file di sini...' : 'Drag & drop atau klik untuk memilih file'}
          </span>
          {maxSize && (
            <span className="text-xs text-muted-foreground">Maks. {formatFileSize(maxSize)}</span>
          )}
        </div>
      </div>

      {status !== 'idle' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="truncate">{fileName}</span>
            <span className={cn(
              status === 'failed' ? 'text-destructive' : 
              status === 'ready' ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {status === 'uploading' && `${uploadProgress}%`}
              {status === 'processing' && 'Memproses...'}
              {status === 'ready' && 'Selesai'}
              {status === 'failed' && 'Gagal'}
            </span>
          </div>
          {status === 'uploading' && <Progress value={uploadProgress} className="h-1" />}
        </div>
      )}
    </div>
  )
}
