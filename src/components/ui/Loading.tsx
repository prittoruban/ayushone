import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div
      className={cn(
        'border-2 border-current border-t-transparent rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  )
}

interface LoadingDotsProps {
  className?: string
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ className }) => {
  return (
    <div className={cn('flex space-x-1', className)}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  lines?: number
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className,
  lines = 1 
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded skeleton" />
      ))}
    </div>
  )
}

export { LoadingSpinner, LoadingDots, LoadingSkeleton }