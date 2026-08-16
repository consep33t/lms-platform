import React from 'react'
import { AppLayout, AppLayoutProps } from '@/components/templates/AppLayout'

export interface PageLayoutProps extends AppLayoutProps {}

export const PageLayout: React.FC<PageLayoutProps> = (props) => {
  return <AppLayout {...props} />
}

export default PageLayout
