import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  copied: boolean
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by GlobalErrorBoundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleCopyError = () => {
    const errorDetails = `Error: ${this.state.error?.toString()}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-card border border-border shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 animate-scale-in">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive shrink-0">
                <AlertCircle className="h-8 w-8 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display text-foreground">
                  Terjadi Kesalahan Aplikasi
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Sistem mendeteksi kendala pada tampilan komponen ini.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/80 text-xs font-mono text-muted-foreground overflow-auto max-h-36 custom-scrollbar">
              {this.state.error?.message || 'Unknown runtime error occurred.'}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="button"
                onClick={this.handleReload}
                className="gap-2 rounded-xl active-press"
              >
                <RefreshCw className="h-4 w-4" /> Muat Ulang Halaman
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={this.handleGoHome}
                className="gap-2 rounded-xl active-press"
              >
                <Home className="h-4 w-4" /> Ke Beranda
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={this.handleCopyError}
                className="gap-1.5 rounded-xl ml-auto text-xs text-muted-foreground"
              >
                {this.state.copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Salin Detail
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary
