/* eslint-disable react/prop-types */
import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    type = 'button',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
        primary: 'bg-brand-admin text-white hover:bg-brand-admin/90 focus:ring-indigo-500 shadow-sm hover:shadow',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        link: 'text-brand-admin hover:underline p-0 h-auto'
    };

    // Allow passing specific semantic colors if needed via className, but define base variants
    // This supports the dynamic theming if the parent passes a specific class for background

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
