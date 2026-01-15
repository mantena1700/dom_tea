'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    User,
    Users,
    Bell,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Download,
    Upload,
    Trash2,
    Save,
    Plus,
    Edit2,
    Calendar,
    Clock,
    Shield,
    Mail,
    Phone,
    Activity,
    Check,
    ChevronRight,
    Star
} from 'lucide-react';
import {
    getSettings,
    updateSettings,
    getPatient,
    savePatient,
    getTherapists,
    addTherapist,
    updateTherapist,
    deleteTherapist,
    exportAllData,
    importData,
    clearAllData,
} from '@/lib/dataService';

// --- Components de UI Premium ---

// Input Sofisticado com Animação de Foco
const ModernInput = ({ label, icon: Icon, type = "text", ...props }) => (
    <div className="group space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] ml-1 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
            {label}
        </label>
        <div className="relative transform transition-all duration-200 group-focus-within:-translate-y-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                {Icon && <Icon size={18} />}
            </div>
            <input
                type={type}
                {...props}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary-500/50 dark:focus:border-primary-500/50 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64748b] outline-none shadow-sm group-focus-within:shadow-lg group-focus-within:shadow-primary-500/10 transition-all duration-300 ease-out font-medium"
            />
        </div>
    </div>
);

// Textarea Sofisticado
const ModernTextarea = ({ label, ...props }) => (
    <div className="group space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94a3b8] ml-1 transition-colors group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
            {label}
        </label>
        <textarea
            {...props}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-[#1e293b] border-2 border-transparent focus:border-primary-500/50 dark:focus:border-primary-500/50 rounded-2xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#64748b] outline-none shadow-sm group-focus-within:shadow-lg group-focus-within:shadow-primary-500/10 transition-all duration-300 ease-out font-medium resize-none min-h-[120px]"
        />
    </div>
);

// Card Premium com Efeito Glass/Levitação
const PremiumCard = ({ children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-[#334155] overflow-hidden ${className}`}
    >
        {children}
    </motion.div>
);

// Tab Button Moderno
const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`relative px-6 py-3 rounded-xl flex items-center gap-2.5 font-semibold transition-all duration-300 ${active
                ? 'text-primary-600 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-[#94a3b8] dark:hover:text-white'
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-primary-50 dark:bg-primary-500/20 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <Icon size={18} strokeWidth={active ? 2.5 : 2} />
            {label}
        </span>
    </button>
);

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('patient');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State Objects
    const [settings, setSettings] = useState({
        theme: 'system',
        notifications: true,
        soundEnabled: true,
        autoSave: true,
        language: 'pt-BR'
    });

    const [patient, setPatient] = useState({
        name: '',
        birthDate: '',
        diagnosis: '',
        avatar: null,
        notes: '',
        age: '' // Added for compatibility
    });

    const [therapists, setTherapists] = useState([]);

    // Data Loading
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [settingsData, patientData, therapistsData] = await Promise.all([
                getSettings(),
                getPatient(),
                getTherapists()
            ]);

            if (settingsData) setSettings(settingsData);
            if (patientData) setPatient(prev => ({ ...prev, ...patientData }));
            if (therapistsData) setTherapists(therapistsData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePatient = async () => {
        setSaving(true);
        try {
            await savePatient(patient);
            // Success feedback animation could go here
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 md:px-0">
            {/* Header com Design Clean */}
            <div className="mb-10 pt-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-baseline gap-4"
                >
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Configurações
                    </h1>
                    <span className="text-slate-400 font-medium text-lg">Preferências do Sistema</span>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
                <div className="flex items-center gap-2 p-1.5 bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-[#334155] w-fit">
                    <TabButton
                        active={activeTab === 'patient'}
                        onClick={() => setActiveTab('patient')}
                        icon={User}
                        label="Paciente"
                    />
                    <TabButton
                        active={activeTab === 'therapists'}
                        onClick={() => setActiveTab('therapists')}
                        icon={Users}
                        label="Terapeutas"
                    />
                    <TabButton
                        active={activeTab === 'preferences'}
                        onClick={() => setActiveTab('preferences')}
                        icon={Settings}
                        label="Sistema"
                    />
                    <TabButton
                        active={activeTab === 'data'}
                        onClick={() => setActiveTab('data')}
                        icon={Shield}
                        label="Dados"
                    />
                </div>
            </div>

            {/* Content Area with smooth transitions */}
            <AnimatePresence mode="wait">
                {activeTab === 'patient' && (
                    <PremiumCard key="patient-card">
                        {/* Hero Section do Card */}
                        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute top-0 left-0 p-8">
                                <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                                    <User className="opacity-80" />
                                    Perfil do Paciente
                                </h2>
                                <p className="text-blue-100 mt-1 max-w-md">
                                    Gerencie as informações pessoais e clínicas essenciais.
                                </p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-8 md:p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Avatar Section (Left) */}
                                <div className="lg:col-span-4 flex flex-col items-center gap-4">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-40 h-40 rounded-full bg-slate-100 dark:bg-[#1e293b] border-4 border-white dark:border-[#0f172a] shadow-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                            {patient.photo ? (
                                                <img src={patient.photo} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={64} className="text-slate-300 dark:text-slate-600" />
                                            )}
                                        </div>
                                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-[#0f172a] group-hover:bg-primary-600 transition-colors">
                                            <Upload size={18} />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                            {patient.name || 'Novo Paciente'}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-[#94a3b8]">
                                            {patient.diagnosis || 'Sem diagnóstico definido'}
                                        </p>
                                    </div>
                                </div>

                                {/* Inputs Section (Right) */}
                                <div className="lg:col-span-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ModernInput
                                            label="Nome Completo"
                                            icon={User}
                                            value={patient.name || ''}
                                            onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                            placeholder="Ex: João Silva"
                                        />
                                        <ModernInput
                                            label="Nascimento"
                                            icon={Calendar}
                                            type="date"
                                            value={patient.birthDate || ''}
                                            onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ModernInput
                                            label="Diagnóstico"
                                            icon={Activity}
                                            value={patient.diagnosis || ''}
                                            onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                                            placeholder="Ex: TEA Nível 1"
                                        />
                                        <ModernInput
                                            label="Idade (Anos)"
                                            icon={Clock}
                                            type="number"
                                            value={patient.age || ''}
                                            onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                                            placeholder="Ex: 5"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <ModernTextarea
                                            label="Observações Clínicas & Alergias"
                                            value={patient.notes || ''}
                                            onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
                                            placeholder="Descreva detalhes importantes sobre a saúde e preferências..."
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSavePatient}
                                            disabled={saving}
                                            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-primary-500/25 font-bold text-base flex items-center gap-3 hover:shadow-primary-500/40 transition-all disabled:opacity-70"
                                        >
                                            {saving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Check size={20} />
                                            )}
                                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </PremiumCard>
                )}

                {activeTab !== 'patient' && (
                    <PremiumCard className="p-20 text-center">
                        <div className="inline-flex w-20 h-20 bg-slate-100 dark:bg-[#1e293b] rounded-full items-center justify-center mb-6">
                            <Settings size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Em Desenvolvimento</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            Estamos redesenhando esta seção para trazer a melhor experiência possível.
                        </p>
                    </PremiumCard>
                )}
            </AnimatePresence>
        </div>
    );
}
