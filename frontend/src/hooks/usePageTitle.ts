import { useEffect } from 'react'
import { useTenant } from '@/context/TenantContext'

interface UsePageTitleOptions {
  appendTenant?: boolean
  exact?: boolean
  description?: string
}

export function usePageTitle(title: string, options: UsePageTitleOptions = {}) {
  const { brand } = useTenant()
  const appendTenant = options.appendTenant ?? true
  const tenantName = brand?.name || 'LMS Platform'

  useEffect(() => {
    const prevTitle = document.title

    let finalTitle = title
    if (!options.exact && appendTenant) {
      finalTitle = `${title} — ${tenantName}`
    } else if (options.exact) {
      finalTitle = title
    }

    document.title = finalTitle

    // Update meta description if provided
    if (options.description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', options.description)
    }

    return () => {
      document.title = prevTitle
    }
  }, [title, tenantName, appendTenant, options.exact, options.description])
}

export default usePageTitle
