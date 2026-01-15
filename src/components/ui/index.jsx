'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

// ============================================
// DOM TEA - UI Components Library
// Usando Tailwind CSS direto (sem variáveis CSS)
// ============================================

// Card Base - Tailwind direto
export const Card = ({ children, className = "", hover = true, ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
      bg-white dark:bg-slate-800
      border border-slate-200 dark:border-slate-700
      rounded-2xl 
      p-4 md:p-5
      ${hover ? 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300' : ''}
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
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Icon size={20} />
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
                </div>
            </div>
            {action && action}
        </div>
        {children}
    </Card>
);

// Stat Card - Compacto para Mobile
export const StatCard = ({ label, value, icon: Icon, trend, trendUp, color = "primary" }) => {
    const colorStyles = {
        primary: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
        success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
        warning: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
        error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' }
    };

    const styles = colorStyles[color] || colorStyles.primary;

    return (
        <Card>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.bg} ${styles.text}`}>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>
        )}
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Icon size={18} />
                </div>
            )}
            <input
                ref={ref}
                className={`
          w-full px-4 py-3 
          ${Icon ? 'pl-10' : ''}
          bg-slate-50 dark:bg-slate-900
          border border-slate-300 dark:border-slate-600
          rounded-xl 
          text-slate-800 dark:text-white
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          transition-all duration-200
          text-base
        `}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));
Input.displayName = 'Input';

// Textarea 
export const Textarea = forwardRef(({ label, error, className = "", ...props }, ref) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>
        )}
        <textarea
            ref={ref}
            className={`
        w-full px-4 py-3 
        bg-slate-50 dark:bg-slate-900
        border border-slate-300 dark:border-slate-600
        rounded-xl 
        text-slate-800 dark:text-white
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
        transition-all duration-200
        resize-none min-h-[100px]
        text-base
      `}
            {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
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
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25",
        secondary: "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600",
        success: "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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
        primary: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        success: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
        warning: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        error: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        purple: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
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
        primary: "bg-blue-600",
        success: "bg-green-600",
        warning: "bg-amber-500",
        error: "bg-red-600"
    };

    const heights = {
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3"
    };

    return (
        <div className="w-full">
            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${heights[size]}`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${colors[color]}`}
                />
            </div>
            {showLabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{Math.round(percent)}%</p>
            )}
        </div>
    );
};

// Empty State
export const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                <Icon size={32} />
            </div>
        )}
        <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-4">{description}</p>
        {action && action}
    </div>
);

// Page Header - Responsivo
export const PageHeader = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
    </div>
);

// Tab Navigation - Mobile Friendly
export const TabNav = ({ tabs, activeTab, onChange }) => (
    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto scrollbar-none mb-4">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
          flex-1 min-w-max px-4 py-2.5 rounded-lg font-medium text-sm
          transition-all duration-200 whitespace-nowrap
          ${activeTab === tab.id
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
      bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
      ${onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-600' : ''}
      transition-all duration-200
      ${className}
    `}
    >
        {Icon && (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Icon size={20} />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 dark:text-white truncate">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        </div>
        {badge && badge}
        {chevron && onClick && (
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        )}
    </motion.div>
);

// Section Title
export const SectionTitle = ({ children, className = "" }) => (
    <h2 className={`text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ${className}`}>
        {children}
    </h2>
);

// Divider
export const Divider = ({ className = "" }) => (
    <div className={`h-px bg-slate-200 dark:bg-slate-700 my-4 ${className}`} />
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
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${variants[variant]} ${className}`} />
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
    Skeleton
};
