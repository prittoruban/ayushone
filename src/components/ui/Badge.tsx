import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'primary' | 'therapeutic'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  size = 'md',
  className, 
  children 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200'
  
  const variants = {
    default: 'bg-secondary-100 text-secondary-800',
    primary: 'bg-primary-100 text-primary-800',
    therapeutic: 'bg-therapeutic-100 text-therapeutic-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-accent-100 text-accent-800',
    outline: 'border border-secondary-300 text-secondary-700 bg-transparent'
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={cn(baseClasses, variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}

export { Badge }