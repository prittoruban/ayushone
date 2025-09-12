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
    default: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200',
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
    therapeutic: 'bg-therapeutic-100 dark:bg-therapeutic-900 text-therapeutic-800 dark:text-therapeutic-200',
    success: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
    error: 'bg-error-100 dark:bg-error-900 text-error-800 dark:text-error-200',
    info: 'bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200',
    outline: 'border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 bg-transparent'
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