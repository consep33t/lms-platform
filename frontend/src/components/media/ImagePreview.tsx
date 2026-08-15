import React from 'react'
import { cn } from '@/lib/utils'

interface ImagePreviewProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string
}

export function ImagePreview({ src, alt, className, fallbackText = 'Gambar tidak tersedia', ...props }: ImagePreviewProps) {
  const [error, setError] = React.useState(false)

  if (error || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground text-sm rounded-md p-4", className)}>
        {fallbackText}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || "Media preview"}
      className={cn("object-cover rounded-md", className)}
      onError={() => setError(true)}
      {...props}
    />
  )
}
