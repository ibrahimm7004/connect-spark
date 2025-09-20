import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl focus:ring-orange-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-orange-500 hover:bg-orange-500 text-orange-500 hover:text-white focus:ring-orange-500',
    ghost: 'text-orange-500 hover:bg-orange-50 focus:ring-orange-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
