'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';

export default function PWAInstaller() {
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check if already installed as PWA
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone
            || document.referrer.includes('android-app://');

        setIsStandalone(isInStandaloneMode);

        if (isInStandaloneMode) {
            console.log('[PWA] Running in standalone mode');
            return;
        }

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('[PWA] Service Worker registered:', registration.scope);
                })
                .catch((error) => {
                    console.error('[PWA] Service Worker registration failed:', error);
                });
        }

        // Listen for install prompt (Android/Chrome)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Check if user already dismissed
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            const dismissedAt = dismissed ? new Date(dismissed) : null;
            const daysSinceDismissed = dismissedAt
                ? (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
                : Infinity;

            // Show prompt if never dismissed or dismissed more than 7 days ago
            if (!dismissed || daysSinceDismissed > 7) {
                setTimeout(() => setShowInstallPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isIOS && isSafari) {
            const iosDismissed = localStorage.getItem('pwa-ios-dismissed');
            const iosDismissedAt = iosDismissed ? new Date(iosDismissed) : null;
            const daysSinceIOSDismissed = iosDismissedAt
                ? (Date.now() - iosDismissedAt.getTime()) / (1000 * 60 * 60 * 24)
                : Infinity;

            if (!iosDismissed || daysSinceIOSDismissed > 14) {
                setTimeout(() => setShowIOSPrompt(true), 5000);
            }
        }

        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed!');
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log('[PWA] Install prompt outcome:', outcome);

        if (outcome === 'accepted') {
            setShowInstallPrompt(false);
        }

        setDeferredPrompt(null);
    };

    const dismissPrompt = () => {
        setShowInstallPrompt(false);
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    };

    const dismissIOSPrompt = () => {
        setShowIOSPrompt(false);
        localStorage.setItem('pwa-ios-dismissed', new Date().toISOString());
    };

    if (!mounted || isStandalone) return null;

    return (
        <>
            {/* Android/Chrome Install Prompt */}
            <AnimatePresence>
                {showInstallPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
                    >
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-5 relative overflow-hidden">
                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500" />

                            <button
                                onClick={dismissPrompt}
                                className="absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <X size={18} className="text-neutral-400" />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Smartphone className="w-7 h-7 text-white" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">Instalar App</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                        Instale o Dom TEA no seu dispositivo para acesso rápido e uso offline!
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleInstall}
                                            className="btn-primary flex-1 text-sm py-2"
                                        >
                                            <Download size={16} />
                                            Instalar Agora
                                        </button>
                                        <button
                                            onClick={dismissPrompt}
                                            className="btn-secondary text-sm py-2 px-4"
                                        >
                                            Depois
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS Install Prompt */}
            <AnimatePresence>
                {showIOSPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-4 left-4 right-4 z-50"
                    >
                        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-5 relative overflow-hidden">
                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500" />

                            <button
                                onClick={dismissIOSPrompt}
                                className="absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                                <X size={18} className="text-neutral-400" />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Smartphone className="w-7 h-7 text-white" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">Instalar no iPhone</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                        Para instalar o Dom TEA:
                                    </p>

                                    <ol className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 mb-4">
                                        <li className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600">1</span>
                                            Toque em <Share className="w-4 h-4 inline mx-1 text-primary-500" /> Compartilhar
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600">2</span>
                                            Selecione <Plus className="w-4 h-4 inline mx-1 text-primary-500" /> "Adicionar à Tela de Início"
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xs font-bold text-primary-600">3</span>
                                            Toque em "Adicionar"
                                        </li>
                                    </ol>

                                    <button
                                        onClick={dismissIOSPrompt}
                                        className="btn-primary w-full text-sm py-2"
                                    >
                                        Entendi!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
