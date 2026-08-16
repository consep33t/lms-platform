import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { TenantProvider } from '@/context/TenantContext'
import OfflineIndicator from './components/pwa/OfflineIndicator'

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
          console.error('ServiceWorker registration failed: ', error)
        })
      })
    }
  }, [])

  return (
    <TenantProvider>
      <RouterProvider router={router} />
      <OfflineIndicator />
    </TenantProvider>
  )
}
