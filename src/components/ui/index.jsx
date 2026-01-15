'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

// ============================================
// DOM TEA - UI Components Library
// Design System Unificado Mobile-First
// ============================================

// Card Base - usa cores do tema automaticamente
export const Card = ({ children, className = "", hover = true, ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
      bg-[var(--bg-card)] 
      border border-[var(--border-default)]
      rounded-2xl 
      p-4 md:p-5
      ${hover ? 'hover:shadow-lg hover:border-[var(--border-accent)] transition-all duration-300' : ''}
      ${className}
    `}
        {...props}
    >
        {children}
    </motion.div>
);

// Card com Header
export const CardWithHeader = ({ title, subtitle, icon: Icon, action, children, className = "" }) => (
    <Card className={className} hover={false}>
        <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)]">
                        <Icon size={20} />
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-base">{title}</h3>
                    {subtitle && <p className="text-xs text-[var(--text-tertiary)]">{subtitle}</p>}
                </div>
            </div>
            {action && action}
        </div>
        {children}
    </Card>
);

// Stat Card - Compacto para Mobile
export const StatCard = ({ label, value, icon: Icon, trend, trendUp, color = "primary" }) => {
    const colors = {
        primary: "var(--primary-500)",
        success: "var(--success-500)",
        warning: "var(--warning-500)",
        error: "var(--error-500)",
        purple: "var(--purple-500)"
    };

    return (
        <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">{label}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-1 ${trendUp ? 'text-[var(--success-500)]' : 'text-[var(--error-500)]'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${colors[color]}20`, color: colors[color] }}
                    >
                        <Icon size={24} />
                    </div>
                )}
            </div>
        </Card>
    );
};

// Input Field - Estilizado
export const Input = forwardRef(({ label, icon: Icon, error, className = "", ...props }, ref) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && (
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
                {label}
            </label>
        )}
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Icon size={18} />
                </div>
            )}
            <input
                ref={ref}
                className={`
          w-full px-4 py-3 
          ${Icon ? 'pl-10' : ''}
          bg-[var(--bg-tertiary)] 
          border border-[var(--border-default)]
          rounded-xl 
          text-[var(--text-primary)]
          placeholder:text-[var(--text-muted)]
          focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20
          transition-all duration-200
          text-base
        `}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-[var(--error-500)]">{error}</p>}
    </div>
));
Input.displayName = 'Input';

// Textarea 
export const Textarea = forwardRef(({ label, error, className = "", ...props }, ref) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && (
            <label className="block text-sm font-medium text-[var(--text-secondary)]">
                {label}
            </label>
        )}
        <textarea
            ref={ref}
            className={`
        w-full px-4 py-3 
        bg-[var(--bg-tertiary)] 
        border border-[var(--border-default)]
        rounded-xl 
        text-[var(--text-primary)]
        placeholder:text-[var(--text-muted)]
        focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)]/20
        transition-all duration-200
        resize-none min-h-[100px]
        text-base
      `}
            {...props}
        />
        {error && <p className="text-xs text-[var(--error-500)]">{error}</p>}
    </div>
));
Textarea.displayName = 'Textarea';

// Button Variants
export const Button = ({
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    loading = false,
    className = "",
    ...props
}) => {
    const variants = {
        primary: "bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white shadow-lg shadow-[var(--primary-500)]/25",
        secondary: "bg-[var(--bg-tertiary)] hover:bg-[var(--interactive-hover)] text-[var(--text-primary)] border border-[var(--border-default)]",
        success: "bg-[var(--success-500)] hover:bg-[var(--success-600)] text-white shadow-lg shadow-[var(--success-500)]/25",
        danger: "bg-[var(--error-500)] hover:bg-[var(--error-600)] text-white shadow-lg shadow-[var(--error-500)]/25",
        ghost: "bg-transparent hover:bg-[var(--interactive-default)] text-[var(--text-secondary)]"
    };

    const sizes = {
        sm: "px-3 py-2 text-sm",
        md: "px-5 py-3 text-base",
        lg: "px-6 py-4 text-lg"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : Icon ? (
                <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
            ) : null}
            {children}
        </motion.button>
    );
};

// Badge Component
export const Badge = ({ children, variant = "primary", size = "md" }) => {
    const variants = {
        primary: "bg-[var(--primary-500)]/15 text-[var(--primary-500)] border-[var(--primary-500)]/30",
        success: "bg-[var(--success-500)]/15 text-[var(--success-500)] border-[var(--success-500)]/30",
        warning: "bg-[var(--warning-500)]/15 text-[var(--warning-600)] border-[var(--warning-500)]/30",
        error: "bg-[var(--error-500)]/15 text-[var(--error-500)] border-[var(--error-500)]/30",
        purple: "bg-[var(--purple-500)]/15 text-[var(--purple-500)] border-[var(--purple-500)]/30",
        neutral: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-default)]"
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm"
    };

    return (
        <span className={`
      inline-flex items-center gap-1
      font-semibold rounded-lg border
      ${variants[variant]}
      ${sizes[size]}
    `}>
            {children}
        </span>
    );
};

// Progress Bar
export const ProgressBar = ({ value = 0, max = 100, color = "primary", showLabel = false, size = "md" }) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    const colors = {
        primary: "bg-[var(--primary-500)]",
        success: "bg-[var(--success-500)]",
        warning: "bg-[var(--warning-500)]",
        error: "bg-[var(--error-500)]"
    };

    const heights = {
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3"
    };

    return (
        <div className="w-full">
            <div className={`w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden ${heights[size]}`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${colors[color]}`}
                />
            </div>
            {showLabel && (
                <p className="text-xs text-[var(--text-muted)] mt-1">{Math.round(percent)}%</p>
            )}
        </div>
    );
};

// Empty State
export const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] mb-4">
                <Icon size={32} />
            </div>
        )}
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--text-tertiary)] max-w-xs mb-4">{description}</p>
        {action && action}
    </div>
);

// Page Header - Responsivo
export const PageHeader = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
    </div>
);

// Tab Navigation - Mobile Friendly
export const TabNav = ({ tabs, activeTab, onChange }) => (
    <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl overflow-x-auto scrollbar-none mb-4">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
          flex-1 min-w-max px-4 py-2.5 rounded-lg font-medium text-sm
          transition-all duration-200 whitespace-nowrap
          ${activeTab === tab.id
                        ? 'bg-[var(--bg-card)] text-[var(--primary-500)] shadow-sm'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                    }
        `}
            >
                {tab.icon && <tab.icon size={16} className="inline mr-2" />}
                {tab.label}
            </button>
        ))}
    </div>
);

// List Item - Para listas de items
export const ListItem = ({
    title,
    subtitle,
    icon: Icon,
    badge,
    onClick,
    chevron = true,
    className = ""
}) => (
    <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={`
      flex items-center gap-3 p-3 rounded-xl
      bg-[var(--bg-card)] border border-[var(--border-default)]
      ${onClick ? 'cursor-pointer hover:border-[var(--border-accent)]' : ''}
      transition-all duration-200
      ${className}
    `}
    >
        {Icon && (
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)]">
                <Icon size={20} />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">{title}</p>
            {subtitle && <p className="text-xs text-[var(--text-tertiary)] truncate">{subtitle}</p>}
        </div>
        {badge && badge}
        {chevron && onClick && (
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        )}
    </motion.div>
);

// Section Title
export const SectionTitle = ({ children, className = "" }) => (
    <h2 className={`text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 ${className}`}>
        {children}
    </h2>
);

// Divider
export const Divider = ({ className = "" }) => (
    <div className={`h-px bg-[var(--border-default)] my-4 ${className}`} />
);

// Grid Responsivo
export const Grid = ({ children, cols = { default: 1, sm: 2, md: 3, lg: 4 }, gap = 4, className = "" }) => (
    <div className={`
    grid gap-${gap}
    grid-cols-${cols.default}
    ${cols.sm ? `sm:grid-cols-${cols.sm}` : ''}
    ${cols.md ? `md:grid-cols-${cols.md}` : ''}
    ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}
    ${className}
  `}>
        {children}
    </div>
);

// Skeleton Loading
export const Skeleton = ({ className = "", variant = "text" }) => {
    const variants = {
        text: "h-4 rounded",
        title: "h-6 w-1/2 rounded",
        avatar: "w-10 h-10 rounded-full",
        card: "h-32 rounded-2xl",
        button: "h-10 w-24 rounded-xl"
    };

    return (
        <div className={`animate-pulse bg-[var(--bg-tertiary)] ${variants[variant]} ${className}`} />
    );
};

export default {
    Card,
    CardWithHeader,
    StatCard,
    Input,
    Textarea,
    Button,
    Badge,
    ProgressBar,
    EmptyState,
    PageHeader,
    TabNav,
    ListItem,
    SectionTitle,
    Divider,
    Grid,
    Skeleton
};
