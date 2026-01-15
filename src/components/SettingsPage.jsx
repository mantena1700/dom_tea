'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState({});
    const [patient, setPatient] = useState({
        name: '',
        birthDate: '',
        age: '',
        diagnosis: '',
        notes: '',
    });
    const [therapists, setTherapists] = useState([]);
    const [activeTab, setActiveTab] = useState('patient');
    const [showAddTherapist, setShowAddTherapist] = useState(false);
    const [editingTherapist, setEditingTherapist] = useState(null);
    const [newTherapist, setNewTherapist] = useState({
        name: '',
        specialty: '',
        email: '',
        phone: '',
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = () => {
        setSettings(getSettings());
        const patientData = getPatient();
        if (patientData) {
            setPatient(patientData);
        }
        setTherapists(getTherapists());
    };

    const handleSaveSettings = (newSettings) => {
        const updated = updateSettings(newSettings);
        setSettings(updated);

        // Apply theme
        if (newSettings.theme) {
            document.documentElement.setAttribute('data-theme', newSettings.theme);
        }

        showSavedFeedback();
    };

    const handleSavePatient = () => {
        // Calculate age from birthDate
        let age = patient.age;
        if (patient.birthDate) {
            const birth = new Date(patient.birthDate);
            const today = new Date();
            age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
        }

        savePatient({ ...patient, age });
        showSavedFeedback();
    };

    const handleAddTherapist = () => {
        if (!newTherapist.name.trim()) return;

        addTherapist(newTherapist);
        setNewTherapist({ name: '', specialty: '', email: '', phone: '' });
        setShowAddTherapist(false);
        loadData();
    };

    const handleUpdateTherapist = () => {
        if (!editingTherapist) return;

        updateTherapist(editingTherapist.id, editingTherapist);
        setEditingTherapist(null);
        loadData();
    };

    const handleDeleteTherapist = (id) => {
        if (confirm('Tem certeza que deseja remover este terapeuta?')) {
            deleteTherapist(id);
            loadData();
        }
    };

    const handleExport = () => {
        const data = exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neurotrack-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = importData(e.target.result);
            if (result.success) {
                loadData();
                alert('Dados importados com sucesso!');
            } else {
                alert('Erro ao importar dados: ' + result.error);
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do sistema. Esta ação não pode ser desfeita. Deseja continuar?')) {
            if (confirm('Tem certeza ABSOLUTA? Todos os registros de sessões, programas e comportamentos serão perdidos.')) {
                clearAllData();
                window.location.reload();
            }
        }
    };

    const showSavedFeedback = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!mounted) {
        return <div className="animate-pulse p-8">Carregando...</div>;
    }

    const tabs = [
        { id: 'patient', label: 'Paciente', icon: User },
        { id: 'therapists', label: 'Terapeutas', icon: Users },
        { id: 'preferences', label: 'Preferências', icon: Settings },
        { id: 'data', label: 'Dados', icon: Shield },
    ];

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-800 dark:text-white mb-1">
                    Configurações
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Gerencie o perfil e preferências do sistema.
                </p>
            </div>

            {/* Tabs - Modern Pill Design */}
            <div className="flex justify-start mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <div className="bg-white dark:bg-neutral-900 p-1 rounded-xl flex gap-1 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2
                                ${activeTab === tab.id
                                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                }
                            `}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-500 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Saved Feedback */}
            {saved && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-4 right-4 bg-success-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg z-50"
                >
                    <Save size={18} />
                    Salvo com sucesso!
                </motion.div>
            )}

            {/* Patient Tab */}
            {activeTab === 'patient' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl"
                >
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/20">
                            <h2 className="text-lg font-bold flex items-center gap-3 text-neutral-800 dark:text-neutral-100">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                                    <User size={18} />
                                </div>
                                Informações do Paciente
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                            Nome Completo
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={patient.name || ''}
                                                onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                                placeholder="Ex: João Silva"
                                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all pl-10"
                                            />
                                            <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                                Data Nascimento
                                            </label>
                                            <input
                                                type="date"
                                                value={patient.birthDate || ''}
                                                onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                                Idade (Anos)
                                            </label>
                                            <input
                                                type="number"
                                                value={patient.age || ''}
                                                onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                                                placeholder="Ex: 5"
                                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                            Diagnóstico Clínico
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={patient.diagnosis || ''}
                                                onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                                                placeholder="Ex: TEA - Nível 1 de Suporte"
                                                className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all pl-10"
                                            />
                                            <Activity className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                                            Observações
                                        </label>
                                        <textarea
                                            value={patient.notes || ''}
                                            onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
                                            placeholder="Informações médicas relevantes, alergias, etc."
                                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none min-h-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 bg-neutral-50/50 dark:bg-neutral-800/30 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                            <button
                                onClick={handleSavePatient}
                                className="btn-primary px-8 py-3 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all font-semibold text-base"
                            >
                                <Save size={20} />
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Therapists Tab */}
            {activeTab === 'therapists' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                                <Users className="w-6 h-6 text-success-500" />
                                Equipe Terapêutica
                            </h2>
                            <p className="text-sm text-neutral-500">Gerencie os profissionais que acompanham o paciente.</p>
                        </div>
                        <button
                            onClick={() => setShowAddTherapist(true)}
                            className="btn-primary shadow-lg shadow-primary-500/20"
                        >
                            <Plus size={18} />
                            Adicionar Terapeuta
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {therapists.map((therapist) => (
                            <div key={therapist.id} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110" />

                                <div className="relative z-10 flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow-inner">
                                        {therapist.name?.charAt(0) || 'T'}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingTherapist({ ...therapist })}
                                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-primary-500 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTherapist(therapist.id)}
                                            className="p-2 hover:bg-error-50 dark:hover:bg-error-900/30 rounded-lg text-neutral-500 hover:text-error-500 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 mb-1">{therapist.name}</h3>
                                    <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-4">
                                        {therapist.specialty || 'Terapeuta ABA'}
                                    </span>

                                    <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                        {therapist.email && (
                                            <p className="text-sm flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                                                <Mail size={14} className="text-neutral-400" />
                                                <span className="truncate">{therapist.email}</span>
                                            </p>
                                        )}
                                        {therapist.phone && (
                                            <p className="text-sm flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                                                <Phone size={14} className="text-neutral-400" />
                                                {therapist.phone}
                                            </p>
                                        )}
                                        {!therapist.email && !therapist.phone && (
                                            <p className="text-sm text-neutral-400 italic">Sem contato cadastrado</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setShowAddTherapist(true)}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group min-h-[220px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 flex items-center justify-center text-neutral-400 group-hover:text-primary-500 transition-all mb-3">
                                <Plus size={24} />
                            </div>
                            <p className="font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">Adicionar Novo</p>
                        </button>
                    </div>

                    {/* Add Therapist Modal */}
                    {showAddTherapist && (
                        <div className="modal-overlay" onClick={() => setShowAddTherapist(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <h2 className="text-xl font-bold mb-6">Adicionar Terapeuta</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="input-label">Nome</label>
                                        <input
                                            type="text"
                                            value={newTherapist.name}
                                            onChange={(e) => setNewTherapist({ ...newTherapist, name: e.target.value })}
                                            placeholder="Nome completo"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Especialidade</label>
                                        <input
                                            type="text"
                                            value={newTherapist.specialty}
                                            onChange={(e) => setNewTherapist({ ...newTherapist, specialty: e.target.value })}
                                            placeholder="Ex: Terapeuta ABA, Fonoaudióloga"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">E-mail</label>
                                        <input
                                            type="email"
                                            value={newTherapist.email}
                                            onChange={(e) => setNewTherapist({ ...newTherapist, email: e.target.value })}
                                            placeholder="email@exemplo.com"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Telefone</label>
                                        <input
                                            type="text"
                                            value={newTherapist.phone}
                                            onChange={(e) => setNewTherapist({ ...newTherapist, phone: e.target.value })}
                                            placeholder="(00) 00000-0000"
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowAddTherapist(false)} className="btn-secondary flex-1">
                                        Cancelar
                                    </button>
                                    <button onClick={handleAddTherapist} className="btn-primary flex-1">
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Therapist Modal */}
                    {editingTherapist && (
                        <div className="modal-overlay" onClick={() => setEditingTherapist(null)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <h2 className="text-xl font-bold mb-6">Editar Terapeuta</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="input-label">Nome</label>
                                        <input
                                            type="text"
                                            value={editingTherapist.name}
                                            onChange={(e) => setEditingTherapist({ ...editingTherapist, name: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Especialidade</label>
                                        <input
                                            type="text"
                                            value={editingTherapist.specialty || ''}
                                            onChange={(e) => setEditingTherapist({ ...editingTherapist, specialty: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">E-mail</label>
                                        <input
                                            type="email"
                                            value={editingTherapist.email || ''}
                                            onChange={(e) => setEditingTherapist({ ...editingTherapist, email: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Telefone</label>
                                        <input
                                            type="text"
                                            value={editingTherapist.phone || ''}
                                            onChange={(e) => setEditingTherapist({ ...editingTherapist, phone: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setEditingTherapist(null)} className="btn-secondary flex-1">
                                        Cancelar
                                    </button>
                                    <button onClick={handleUpdateTherapist} className="btn-primary flex-1">
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-100 to-warning-200 dark:from-warning-900/50 dark:to-warning-800/50 flex items-center justify-center text-warning-700 dark:text-warning-500">
                            <Settings size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Preferências do Sistema</h2>
                            <p className="text-sm text-neutral-500">Personalize sua experiência de uso.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Theme Card */}
                        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                {settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                Aparência
                            </h3>
                            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                                <button
                                    onClick={() => handleSaveSettings({ theme: 'light' })}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${settings.theme === 'light'
                                        ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                        }`}
                                >
                                    <Sun size={16} />
                                    Claro
                                </button>
                                <button
                                    onClick={() => handleSaveSettings({ theme: 'dark' })}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${settings.theme === 'dark'
                                        ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                        }`}
                                >
                                    <Moon size={16} />
                                    Escuro
                                </button>
                            </div>
                        </div>

                        {/* Sound Card */}
                        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold mb-1 flex items-center gap-2">
                                    {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                    Efeitos Sonoros
                                </h3>
                                <p className="text-sm text-neutral-500 mb-4">Feedback auditivo durante as sessões</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {settings.soundEnabled ? 'Ativado' : 'Desativado'}
                                </span>
                                <button
                                    onClick={() => handleSaveSettings({ soundEnabled: !settings.soundEnabled })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-success-500' : 'bg-neutral-200 dark:bg-neutral-700'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Celebrations Card */}
                        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="font-semibold mb-1 flex items-center gap-2">
                                    🎉 Celebrações
                                </h3>
                                <p className="text-sm text-neutral-500 mb-4">Animações de confete ao acertar</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {settings.showCelebrations ? 'Ativado' : 'Desativado'}
                                </span>
                                <button
                                    onClick={() => handleSaveSettings({ showCelebrations: !settings.showCelebrations })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.showCelebrations ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${settings.showCelebrations ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Session Settings Group */}
                        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm md:col-span-2 space-y-6">
                            <h3 className="font-semibold border-b border-neutral-100 dark:border-neutral-800 pb-3">Sessões e Tentativas</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Clock size={16} /> Duração da Sessão
                                        </label>
                                        <span className="text-sm font-bold text-primary-600">{settings.sessionDuration || 60}min</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="15"
                                        max="120"
                                        step="15"
                                        value={settings.sessionDuration || 60}
                                        onChange={(e) => handleSaveSettings({ sessionDuration: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Calendar size={16} /> Tentativas / Programa
                                        </label>
                                        <span className="text-sm font-bold text-primary-600">{settings.trialsPerProgram || 10}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="20"
                                        step="1"
                                        value={settings.trialsPerProgram || 10}
                                        onChange={(e) => handleSaveSettings({ trialsPerProgram: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="chart-container max-w-2xl"
                >
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-error-500" />
                        Gerenciamento de Dados
                    </h2>

                    <div className="space-y-4">
                        {/* Export */}
                        <div className="p-4 rounded-lg border-2 border-neutral-200 hover:border-primary-300 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <Download className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Exportar Dados</p>
                                        <p className="text-sm text-neutral-500">Baixe um backup completo do sistema</p>
                                    </div>
                                </div>
                                <button onClick={handleExport} className="btn-primary">
                                    <Download size={18} />
                                    Exportar
                                </button>
                            </div>
                        </div>

                        {/* Import */}
                        <div className="p-4 rounded-lg border-2 border-neutral-200 hover:border-success-300 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-success-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Importar Dados</p>
                                        <p className="text-sm text-neutral-500">Restaure dados de um backup anterior</p>
                                    </div>
                                </div>
                                <label className="btn-success cursor-pointer">
                                    <Upload size={18} />
                                    Importar
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImport}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Clear Data */}
                        <div className="p-4 rounded-lg border-2 border-error-200 bg-error-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-error-100 flex items-center justify-center">
                                        <Trash2 className="w-5 h-5 text-error-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-error-700">Limpar Todos os Dados</p>
                                        <p className="text-sm text-error-600">⚠️ Esta ação não pode ser desfeita!</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClearData}
                                    className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-neutral-500 mt-6">
                        💡 Dica: Faça backups regulares para não perder seus dados. Os dados são armazenados localmente no navegador.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
