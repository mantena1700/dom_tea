'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    PlayCircle,
    BarChart3,
    Lightbulb,
    Settings,
    Activity,
    Menu,
    X,
    Brain,
    Moon,
    Sun,
    Bell,
    User,
    UserCircle,
    ChevronRight,
    Home,
    FileText,
    HelpCircle,
    Timer,
    Trophy,
} from 'lucide-react';
import { getSettings, updateSettings, getPatient, getTodayCheckin } from '@/lib/dataService';

// Navegação principal para mobile (bottom nav)
const mobileNavItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/programs', label: 'Programas', icon: BookOpen },
    { href: '/session', label: 'Sessão', icon: PlayCircle, primary: true },
    { href: '/insights', label: 'Insights', icon: Lightbulb },
    { href: '/profile', label: 'Perfil', icon: UserCircle },
];

// Navegação completa para desktop sidebar
const desktopNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Meu Filho', icon: UserCircle },
    { href: '/programs', label: 'Programas', icon: BookOpen },
    { href: '/session', label: 'Sessão', icon: PlayCircle },
    { href: '/behaviors', label: 'Comportamentos', icon: Activity },
    { href: '/reports', label: 'Relatórios', icon: BarChart3 },
    { href: '/timing', label: 'Análise de Tempo', icon: Timer },
    { href: '/achievements', label: 'Conquistas', icon: Trophy },
    { href: '/insights', label: 'Insights IA', icon: Lightbulb },
    { href: '/help', label: 'Ajuda', icon: HelpCircle },
    { href: '/settings', label: 'Configurações', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({ theme: 'light' });
    const [patient, setPatient] = useState(null);
    const [hasCheckin, setHasCheckin] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        const loadedSettings = getSettings();
        setSettings(loadedSettings);
        setPatient(getPatient());
        setHasCheckin(!!getTodayCheckin());

        // Aplica tema
        if (loadedSettings.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Detectar mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Atualiza dados do paciente quando a rota muda
    useEffect(() => {
        if (mounted) {
            setPatient(getPatient());
            setHasCheckin(!!getTodayCheckin());
            setIsOpen(false); // Fecha menu ao navegar
        }
    }, [pathname, mounted]);

    const toggleTheme = () => {
        const newTheme = settings.theme === 'light' ? 'dark' : 'light';
        const updated = updateSettings({ theme: newTheme });
        setSettings(updated);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    if (!mounted) return null;

    return (
        <>
            {/* === MOBILE HEADER === */}
            <header className="mobile-header lg:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="font-black text-xl tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-blue-400 bg-clip-text text-transparent">DOM</span>
                        <span className="font-extrabold text-xl tracking-wide text-primary-600">TEA</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="btn-icon"
                    >
                        {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="btn-icon"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* === MOBILE BOTTOM NAVIGATION === */}
            <nav className="bottom-nav lg:hidden">
                <div className="bottom-nav-items">
                    {mobileNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`bottom-nav-item ${isActive ? 'active' : ''} ${item.primary ? 'primary' : ''}`}
                            >
                                {item.primary ? (
                                    <div className="bottom-nav-fab">
                                        <Icon size={24} />
                                    </div>
                                ) : (
                                    <>
                                        <Icon size={22} />
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* === MOBILE MENU DRAWER === */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="fixed right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-neutral-900 z-[101] shadow-2xl"
                        >
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                <span className="font-bold">Menu</span>
                                <button onClick={() => setIsOpen(false)} className="btn-icon">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Patient Card in Menu */}
                            {patient?.name && (
                                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-3">
                                        {patient.photo ? (
                                            <img src={patient.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
                                                {patient.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold">{patient.name}</p>
                                            <p className="text-sm text-neutral-500">{patient.age ? `${patient.age} anos` : ''}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <nav className="p-2">
                                {desktopNavItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                ? 'bg-primary-500 text-white'
                                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* === DESKTOP SIDEBAR === */}
            <aside className="sidebar hidden lg:flex flex-col h-screen fixed left-0 top-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-50 shadow-sm overflow-y-auto hide-scrollbar">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1E88E5, #1565C0)' }} // Forçando cor
                    >
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="flex items-baseline gap-1.5">
                            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-primary-600 via-primary-500 to-blue-400 bg-clip-text text-transparent">DOM</span>
                            <span className="font-extrabold text-xl tracking-wide text-primary-600">TEA</span>
                        </h1>
                        <p className="text-xs text-neutral-500 font-medium">ABA Insights</p>
                    </div>
                </div>

                {/* Patient Card */}
                <Link
                    href="/profile"
                    className="block glass-card p-4 mb-6 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {patient?.photo ? (
                                <img
                                    src={patient.photo}
                                    alt={patient.name || ''}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                                    {patient?.name?.charAt(0) || '?'}
                                </div>
                            )}
                            {!hasCheckin && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning-500 border-2 border-white flex items-center justify-center animate-pulse">
                                    <span className="text-xs text-white font-bold">!</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {patient?.name || 'Cadastrar Filho'}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {patient?.name
                                    ? (patient.age ? `${patient.age} anos` : 'Ver perfil')
                                    : 'Clique para adicionar'
                                }
                            </p>
                        </div>

                        <ChevronRight size={16} className="text-neutral-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {desktopNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                                {item.href === '/insights' && (
                                    <span className="ml-auto px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300 tracking-wider">IA</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <button
                            onClick={toggleTheme}
                            className="btn-icon"
                            title={settings.theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                        >
                            {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        <button className="btn-icon" title="Notificações">
                            <Bell size={18} />
                        </button>

                        <Link href="/settings" className="btn-icon" title="Configurações">
                            <Settings size={18} />
                        </Link>
                    </div>

                    <Link href="/session" className="btn-primary w-full">
                        <PlayCircle size={20} />
                        Iniciar Sessão
                    </Link>
                </div>
            </aside>
        </>
    );
}
