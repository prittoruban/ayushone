import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'therapeutic'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0',
      therapeutic: 'bg-gradient-to-r from-therapeutic-500 to-therapeutic-600 text-white shadow-lg shadow-therapeutic-500/25 hover:shadow-xl hover:shadow-therapeutic-500/30 hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 hover:-translate-y-0.5',
      outline: 'border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 hover:-translate-y-0.5',
      ghost: 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900',
      destructive: 'bg-gradient-to-r from-error-500 to-error-600 text-white shadow-lg shadow-error-500/25 hover:shadow-xl hover:shadow-error-500/30 hover:-translate-y-0.5'
    }
    
    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-12 px-8 text-lg',
      xl: 'h-14 px-10 text-xl'
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          isLoading && 'cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="w-4 h-4">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, type ButtonProps }