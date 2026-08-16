import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScormPlayer } from '@/components/scorm/ScormPlayer'
import { UploadCloud, FileType, PlayCircle, X } from 'lucide-react'

export default function AdminScormManagerPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SCORM Manager</h1>
        <p className="text-muted-foreground mt-2">Upload and manage SCORM packages.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Package</CardTitle>
          <CardDescription>Drag and drop your SCORM ZIP package here</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <FileType className="w-12 h-12 text-blue-500" />
                <div>
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setFile(null)}>Cancel</Button>
                  <Button onClick={() => setIsPreviewOpen(true)}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Test Launch
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <UploadCloud className="w-12 h-12 text-gray-400" />
                <div className="space-y-1">
                  <p className="font-medium">Drag & drop your ZIP file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <input 
                  type="file" 
                  accept=".zip" 
                  className="hidden" 
                  id="scorm-upload"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" onClick={() => document.getElementById('scorm-upload')?.click()}>
                  Select File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package Manifest Preview (Mockup) */}
      {file && (
        <Card>
          <CardHeader>
            <CardTitle>Package Manifest Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
              <p><strong>Title:</strong> Sample SCORM Course</p>
              <p><strong>Version:</strong> SCORM 2004</p>
              <p><strong>Mastery Score:</strong> 80</p>
              <p><strong>Entry Point:</strong> index_lms.html</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Launch Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl overflow-hidden flex flex-col h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">SCORM Preview</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 bg-gray-100 p-4 overflow-auto">
              <ScormPlayer 
                entryUrl="/mock-scorm/index.html" 
                onCompleted={() => alert('Course completed!')}
                onProgress={(p) => console.log('Progress:', p)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
