'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';

// ============================================
// DOM TEA - UI Components Library v2
// Tailwind CSS Puro com Dark Mode (.dark:class)
// ============================================

// ===== CARD =====
export const Card = ({ children, className = "", hover = true, ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`
      bg-white dark:bg-slate-800/90
      border border-slate-200/50 dark:border-slate-700/50
      rounded-2xl 
      p-4 md:p-5
      shadow-sm
      ${hover ? 'hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300' : ''}
      ${className}
    `}
        {...props}
    >
        {children}
    </motion.div>
);

// ===== STAT CARD =====
export const StatCard = ({ label, value, icon: Icon, trend, trendUp, color = "primary" }) => {
    const colorStyles = {
        primary: {
            bg: 'bg-blue-50 dark:bg-blue-950/50',
            icon: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/50'
        },
        success: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
            icon: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/50'
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-950/50',
            icon: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-100 dark:bg-amber-900/50'
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-950/50',
            icon: 'text-red-600 dark:text-red-400',
            iconBg: 'bg-red-100 dark:bg-red-900/50'
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-950/50',
            icon: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-900/50'
        }
    };

    const styles = colorStyles[color] || colorStyles.primary;

    return (
        <div className={`
      ${styles.bg} 
      rounded-2xl p-4 
      border border-slate-100 dark:border-slate-700/50
      shadow-sm
    `}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            <span>{trendUp ? '↑' : '↓'}</span> {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
                        <Icon size={24} className={styles.icon} />
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== INPUT =====
export const Input = forwardRef(({ label, icon: Icon, error, className = "", ...props }, ref) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>
        )}
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Icon size={18} className="text-slate-400 dark:text-slate-500" />
                </div>
            )}
            <input
                ref={ref}
                className={`
          w-full px-4 py-3 
          ${Icon ? 'pl-11' : ''}
          bg-white dark:bg-slate-900
          border-2 border-slate-200 dark:border-slate-700
          rounded-xl 
          text-slate-800 dark:text-white
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
          transition-all duration-200
          text-base
        `}
                {...props}
            />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
));
Input.displayName = 'Input';

// ===== TEXTAREA =====
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
        bg-white dark:bg-slate-900
        border-2 border-slate-200 dark:border-slate-700
        rounded-xl 
        text-slate-800 dark:text-white
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
        transition-all duration-200
        resize-none min-h-[100px]
        text-base
      `}
            {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
));
Textarea.displayName = 'Textarea';

// ===== BUTTON =====
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
        primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30",
        secondary: "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500",
        success: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/20",
        danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-600/20",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
    };

    const sizes = {
        sm: "px-3.5 py-2 text-sm",
        md: "px-5 py-3 text-base",
        lg: "px-6 py-4 text-lg"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`
        inline-flex items-center justify-center gap-2.5
        font-semibold rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={loading || props.disabled}
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

// ===== BADGE =====
export const Badge = ({ children, variant = "primary", size = "md" }) => {
    const variants = {
        primary: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
        success: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
        warning: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
        error: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
        purple: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
        neutral: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm"
    };

    return (
        <span className={`
      inline-flex items-center gap-1.5
      font-semibold rounded-lg
      ${variants[variant]}
      ${sizes[size]}
    `}>
            {children}
        </span>
    );
};

// ===== PROGRESS BAR =====
export const ProgressBar = ({ value = 0, max = 100, color = "primary", showLabel = false, size = "md" }) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    const colors = {
        primary: "bg-blue-600",
        success: "bg-emerald-600",
        warning: "bg-amber-500",
        error: "bg-red-600"
    };

    const heights = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4"
    };

    return (
        <div className="w-full">
            <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${heights[size]}`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${colors[color]}`}
                />
            </div>
            {showLabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">{Math.round(percent)}%</p>
            )}
        </div>
    );
};

// ===== EMPTY STATE =====
export const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Icon size={32} className="text-slate-400 dark:text-slate-500" />
            </div>
        )}
        <h3 className="font-semibold text-slate-800 dark:text-white text-lg mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">{description}</p>
        {action && action}
    </div>
);

// ===== PAGE HEADER =====
export const PageHeader = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
    </div>
);

// ===== TAB NAV =====
export const TabNav = ({ tabs, activeTab, onChange }) => (
    <div className="flex gap-1 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto scrollbar-none mb-6">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
          flex-1 min-w-max px-4 py-2.5 rounded-lg font-medium text-sm
          transition-all duration-200 whitespace-nowrap
          ${activeTab === tab.id
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }
        `}
            >
                {tab.icon && <tab.icon size={16} className="inline mr-2 -mt-0.5" />}
                {tab.label}
            </button>
        ))}
    </div>
);

// ===== SECTION TITLE =====
export const SectionTitle = ({ children, className = "" }) => (
    <h2 className={`text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ${className}`}>
        {children}
    </h2>
);

// ===== LIST ITEM =====
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
        whileTap={onClick ? { scale: 0.98 } : {}}
        onClick={onClick}
        className={`
      flex items-center gap-3 p-3.5 rounded-xl
      bg-white dark:bg-slate-800/80 
      border border-slate-100 dark:border-slate-700/50
      ${onClick ? 'cursor-pointer hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-sm active:bg-slate-50 dark:active:bg-slate-800' : ''}
      transition-all duration-200
      ${className}
    `}
    >
        {Icon && (
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Icon size={20} className="text-slate-600 dark:text-slate-400" />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 dark:text-white truncate">{title}</p>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{subtitle}</p>}
        </div>
        {badge && badge}
        {chevron && onClick && (
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        )}
    </motion.div>
);

// ===== DIVIDER =====
export const Divider = ({ className = "" }) => (
    <div className={`h-px bg-slate-200 dark:bg-slate-700 my-4 ${className}`} />
);

// ===== MODAL =====
export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        full: "max-w-full mx-4"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full ${sizes[size]} bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden shadow-xl`}
                    >
                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ===== SKELETON =====
export const Skeleton = ({ className = "", variant = "text" }) => {
    const variants = {
        text: "h-4 rounded w-full",
        title: "h-6 w-1/2 rounded",
        avatar: "w-12 h-12 rounded-full",
        card: "h-32 rounded-2xl",
        button: "h-12 w-28 rounded-xl"
    };

    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${variants[variant]} ${className}`} />
    );
};

export default {
    Card,
    StatCard,
    Input,
    Textarea,
    Button,
    Badge,
    ProgressBar,
    EmptyState,
    PageHeader,
    TabNav,
    SectionTitle,
    ListItem,
    Divider,
    Modal,
    Skeleton
};
