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
            <div className="page-header">
                <h1 className="page-title flex items-center gap-3">
                    <Settings className="w-8 h-8 text-neutral-500" />
                    Configurações
                </h1>
                <p className="page-subtitle">
                    Gerencie perfis, preferências e dados do sistema.
                </p>
            </div>

            {/* Tabs */}
            <div className="tabs mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="chart-container max-w-2xl"
                >
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" />
                        Perfil do Paciente
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="input-label">Nome</label>
                            <input
                                type="text"
                                value={patient.name || ''}
                                onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                placeholder="Nome do paciente"
                                className="input-field"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Data de Nascimento</label>
                                <input
                                    type="date"
                                    value={patient.birthDate || ''}
                                    onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Idade</label>
                                <input
                                    type="number"
                                    value={patient.age || ''}
                                    onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                                    placeholder="Idade"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Diagnóstico</label>
                            <input
                                type="text"
                                value={patient.diagnosis || ''}
                                onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                                placeholder="Ex: TEA - Nível 1"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="input-label">Observações</label>
                            <textarea
                                value={patient.notes || ''}
                                onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
                                placeholder="Informações adicionais importantes..."
                                className="input-field resize-none"
                                rows={3}
                            />
                        </div>
                    </div>

                    <button onClick={handleSavePatient} className="btn-primary mt-6">
                        <Save size={18} />
                        Salvar Perfil
                    </button>
                </motion.div>
            )}

            {/* Therapists Tab */}
            {activeTab === 'therapists' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-4xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5 text-success-500" />
                            Equipe Terapêutica
                        </h2>
                        <button onClick={() => setShowAddTherapist(true)} className="btn-primary">
                            <Plus size={18} />
                            Adicionar Terapeuta
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {therapists.map((therapist) => (
                            <div key={therapist.id} className="chart-container">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            {therapist.name?.charAt(0) || 'T'}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{therapist.name}</p>
                                            <p className="text-sm text-neutral-500">{therapist.specialty || 'Terapeuta ABA'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingTherapist({ ...therapist })}
                                            className="btn-icon"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTherapist(therapist.id)}
                                            className="btn-icon text-error-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {(therapist.email || therapist.phone) && (
                                    <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
                                        {therapist.email && (
                                            <p className="text-sm flex items-center gap-2 text-neutral-600">
                                                <Mail size={14} />
                                                {therapist.email}
                                            </p>
                                        )}
                                        {therapist.phone && (
                                            <p className="text-sm flex items-center gap-2 text-neutral-600">
                                                <Phone size={14} />
                                                {therapist.phone}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {therapists.length === 0 && (
                            <div className="col-span-full text-center py-12 text-neutral-500">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum terapeuta cadastrado.</p>
                            </div>
                        )}
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="chart-container max-w-2xl"
                >
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-warning-500" />
                        Preferências do Sistema
                    </h2>

                    <div className="space-y-6">
                        {/* Theme */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-3">
                                {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                <div>
                                    <p className="font-medium">Tema</p>
                                    <p className="text-sm text-neutral-500">Aparência do sistema</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSaveSettings({ theme: 'light' })}
                                    className={`px-4 py-2 rounded-lg ${settings.theme === 'light' ? 'bg-primary-500 text-white' : 'bg-neutral-200'
                                        }`}
                                >
                                    Claro
                                </button>
                                <button
                                    onClick={() => handleSaveSettings({ theme: 'dark' })}
                                    className={`px-4 py-2 rounded-lg ${settings.theme === 'dark' ? 'bg-primary-500 text-white' : 'bg-neutral-200'
                                        }`}
                                >
                                    Escuro
                                </button>
                            </div>
                        </div>

                        {/* Sound */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-3">
                                {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                <div>
                                    <p className="font-medium">Sons</p>
                                    <p className="text-sm text-neutral-500">Efeitos sonoros nas sessões</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSaveSettings({ soundEnabled: !settings.soundEnabled })}
                                className={`toggle-switch ${settings.soundEnabled ? 'active' : ''}`}
                            />
                        </div>

                        {/* Celebrations */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🎉</span>
                                <div>
                                    <p className="font-medium">Celebrações</p>
                                    <p className="text-sm text-neutral-500">Animações de comemoração nos acertos</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSaveSettings({ showCelebrations: !settings.showCelebrations })}
                                className={`toggle-switch ${settings.showCelebrations ? 'active' : ''}`}
                            />
                        </div>

                        {/* Session Duration */}
                        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">Duração Padrão de Sessão</p>
                                    <p className="text-sm text-neutral-500">Tempo estimado por sessão</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="15"
                                    max="120"
                                    step="15"
                                    value={settings.sessionDuration || 60}
                                    onChange={(e) => handleSaveSettings({ sessionDuration: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="font-bold text-xl w-20 text-center">{settings.sessionDuration || 60} min</span>
                            </div>
                        </div>

                        {/* Trials per Program */}
                        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">Tentativas por Programa</p>
                                    <p className="text-sm text-neutral-500">Quantidade padrão de tentativas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="5"
                                    max="20"
                                    step="1"
                                    value={settings.trialsPerProgram || 10}
                                    onChange={(e) => handleSaveSettings({ trialsPerProgram: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="font-bold text-xl w-16 text-center">{settings.trialsPerProgram || 10}</span>
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
