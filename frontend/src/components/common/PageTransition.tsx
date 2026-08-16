import React from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`w-full animate-page-in will-change-transform ${className}`}
      style={{ animationFillMode: 'both' }}
    >
      {children}
    </div>
  )
}

export default PageTransition
