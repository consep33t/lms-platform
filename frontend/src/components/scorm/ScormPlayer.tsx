import React, { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    API?: any;
    API_1484_11?: any;
  }
}

interface ScormPlayerProps {
  entryUrl: string;
  onCompleted?: () => void;
  onProgress?: (progress: number) => void;
}

export const ScormPlayer: React.FC<ScormPlayerProps> = ({ entryUrl, onCompleted, onProgress }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // SCORM 1.2 API
    window.API = {
      LMSInitialize: () => "true",
      LMSGetValue: (key: string) => {
        console.log(`[SCORM 1.2] LMSGetValue: ${key}`)
        return ""
      },
      LMSSetValue: (key: string, value: string) => {
        console.log(`[SCORM 1.2] LMSSetValue: ${key} = ${value}`)
        if (key === 'cmi.core.lesson_status' && (value === 'completed' || value === 'passed')) {
          onCompleted?.()
        }
        return "true"
      },
      LMSCommit: () => "true",
      LMSFinish: () => "true",
      LMSGetLastError: () => "0",
      LMSGetErrorString: () => "No error",
      LMSGetDiagnostic: () => "No error"
    }

    // SCORM 2004 API
    window.API_1484_11 = {
      Initialize: () => "true",
      GetValue: (key: string) => {
        console.log(`[SCORM 2004] GetValue: ${key}`)
        return ""
      },
      SetValue: (key: string, value: string) => {
        console.log(`[SCORM 2004] SetValue: ${key} = ${value}`)
        if (key === 'cmi.completion_status' && (value === 'completed' || value === 'passed')) {
          onCompleted?.()
        }
        if (key === 'cmi.progress_measure') {
          onProgress?.(parseFloat(value))
        }
        return "true"
      },
      Commit: () => "true",
      Terminate: () => "true",
      GetLastError: () => "0",
      GetErrorString: () => "No error",
      GetDiagnostic: () => "No error"
    }

    return () => {
      delete window.API
      delete window.API_1484_11
    }
  }, [onCompleted, onProgress])

  return (
    <div className="w-full h-full min-h-[600px] border rounded bg-white relative">
      {error && <div className="absolute top-0 left-0 w-full p-4 bg-red-100 text-red-700">{error}</div>}
      <iframe
        ref={iframeRef}
        src={entryUrl}
        className="w-full h-full min-h-[600px] border-0"
        sandbox="allow-scripts allow-same-origin"
        title="SCORM Player"
        onError={() => setError("Failed to load SCORM content.")}
      />
    </div>
  )
}
