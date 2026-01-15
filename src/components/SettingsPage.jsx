'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    User,
    Users,
    Shield,
    Upload,
    Calendar,
    Clock,
    Activity,
    Check,
    Lock
} from 'lucide-react';
import {
    getSettings,
    getPatient,
    savePatient,
    getTherapists,
} from '@/lib/dataService';

// --- COMPONENTS VISUAL ---

// Input "Dark Glass"
const GlassInput = ({ label, icon: Icon, type = "text", ...props }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                {Icon && <Icon size={18} />}
            </div>
            <input
                type={type}
                {...props}
                className="w-full pl-11 pr-4 py-4 bg-[#0f172a]/60 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-[#0f172a]/80 outline-none transition-all duration-300 font-medium"
            />
        </div>
    </div>
);

// Textarea "Dark Glass"
const GlassTextarea = ({ label, ...props }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
            {label}
        </label>
        <textarea
            {...props}
            className="w-full px-5 py-4 bg-[#0f172a]/60 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-[#0f172a]/80 outline-none transition-all duration-300 font-medium resize-none min-h-[120px]"
        />
    </div>
);

// Tab Button "Neon Glow"
const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`relative px-5 py-2.5 rounded-lg flex items-center gap-2.5 font-medium transition-all duration-300 ${active
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <Icon size={16} />
            {label}
        </span>
    </button>
);

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('patient');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Dados
    const [patient, setPatient] = useState({
        name: '',
        birthDate: '',
        diagnosis: '',
        photo: null,
        notes: '',
        age: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const patientData = await getPatient();
            if (patientData) setPatient(prev => ({ ...prev, ...patientData }));
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
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Carregando painel...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                    <p className="text-slate-400">Gerencie o sistema e preferências.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#0f172a]/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm self-start">
                    <TabButton active={activeTab === 'patient'} onClick={() => setActiveTab('patient')} icon={User} label="Paciente" />
                    <TabButton active={activeTab === 'therapists'} onClick={() => setActiveTab('therapists')} icon={Users} label="Equipe" />
                    <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} icon={Settings} label="Sistema" />
                </div>
            </div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                {/* Background Glow Effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[2rem] blur-2xl -z-10" />

                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-hidden">

                    {activeTab === 'patient' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                            {/* Esquerda: Avatar e Status */}
                            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-6 border-b lg:border-b-0 lg:border-r border-slate-700/50 pb-8 lg:pb-0 lg:pr-8">
                                <div className="relative group">
                                    <div className="w-48 h-48 rounded-full bg-[#0f172a] p-1 border-2 border-slate-700 group-hover:border-blue-500/50 transition-colors shadow-xl">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center relative">
                                            {patient.photo ? (
                                                <img src={patient.photo} alt="Paciente" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={64} className="text-slate-600" />
                                            )}
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Upload className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 md:bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                                        ID: #PAC-2024
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{patient.name || 'Nome do Paciente'}</h2>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                                        <Activity size={14} />
                                        {patient.diagnosis || 'Sem Diagnóstico'}
                                    </div>
                                </div>

                                <div className="w-full pt-4">
                                    <div className="p-4 rounded-xl bg-[#0f172a]/40 border border-slate-800 text-left space-y-2">
                                        <h4 className="text-xs font-bold uppercase text-slate-500">Resumo</h4>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Idade:</span>
                                            <span className="text-white">{patient.age ? `${patient.age} anos` : '--'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Início:</span>
                                            <span className="text-white">Jan 2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Direita: Formulário */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                    <h3 className="text-xl font-bold text-white">Informações Pessoais</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <GlassInput
                                        label="Nome Completo"
                                        icon={User}
                                        value={patient.name || ''}
                                        onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                        placeholder="Ex: João da Silva"
                                    />
                                    <GlassInput
                                        label="Data de Nascimento"
                                        icon={Calendar}
                                        type="date"
                                        value={patient.birthDate || ''}
                                        onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <GlassInput
                                        label="Diagnóstico Clínico"
                                        icon={Activity}
                                        value={patient.diagnosis || ''}
                                        onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                                        placeholder="Ex: TEA Nível 1"
                                    />
                                    <GlassInput
                                        label="Idade"
                                        icon={Clock}
                                        type="number"
                                        value={patient.age || ''}
                                        onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                                        placeholder="Ex: 5"
                                    />
                                </div>

                                <GlassTextarea
                                    label="Observações & Notas Médicas"
                                    value={patient.notes || ''}
                                    onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
                                    placeholder="Registe alergias, medicações ou observações importantes..."
                                />

                                <div className="pt-6 flex justify-end border-t border-slate-700/50 mt-8">
                                    <button
                                        onClick={handleSavePatient}
                                        disabled={saving}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Salvando...' : (
                                            <>
                                                <Check size={20} />
                                                Salvar Alterações
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'patient' && (
                        <div className="py-20 text-center space-y-4">
                            <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-800 items-center justify-center text-slate-500 mb-4">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Módulo em Construção</h3>
                            <p className="text-slate-400">Esta seção estará disponível em breve com o novo visual.</p>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
}
