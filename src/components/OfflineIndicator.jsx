'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showReconnected, setShowReconnected] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Offline Banner */}
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-[1000] bg-warning-500 text-white py-3 px-4 flex items-center justify-center gap-3 shadow-lg"
                        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
                    >
                        <WifiOff size={20} />
                        <span className="font-medium">Você está offline. Algumas funções podem não funcionar.</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reconnected Toast */}
            <AnimatePresence>
                {showReconnected && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] bg-success-500 text-white py-2 px-4 rounded-full flex items-center gap-2 shadow-lg"
                        style={{ marginTop: 'env(safe-area-inset-top)' }}
                    >
                        <Wifi size={18} />
                        <span className="font-medium">Conectado novamente!</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
