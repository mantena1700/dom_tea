'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings,
    Moon,
    Sun,
    Bell,
    Palette,
    Clock,
    User,
    Save,
    Check,
    Monitor,
    Volume2,
    Vibrate,
    Shield,
    Download,
    Trash2
} from 'lucide-react';
import {
    Card,
    Button,
    Input,
    PageHeader,
    SectionTitle,
    Divider,
    Badge
} from '@/components/ui';
import {
    getSettings,
    updateSettings,
    getPatient,
    savePatient,
    exportAllData,
    clearAllData
} from '@/lib/dataService';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        theme: 'light',
        notifications: true,
        sounds: true,
        haptics: true,
        sessionDuration: 15,
        trialsPerTarget: 10,
    });
    const [patient, setPatient] = useState({
        name: '',
        birthDate: '',
        diagnosis: ''
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadedSettings = getSettings();
        if (loadedSettings) setSettings(prev => ({ ...prev, ...loadedSettings }));

        const loadedPatient = getPatient();
        if (loadedPatient) setPatient(prev => ({ ...prev, ...loadedPatient }));
    }, []);

    const handleToggle = (key) => {
        const updated = updateSettings({ [key]: !settings[key] });
        setSettings(updated);
    };

    const handleThemeChange = (theme) => {
        const updated = updateSettings({ theme });
        setSettings(updated);

        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleSavePatient = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await savePatient(patient);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = () => {
        try {
            const data = exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `domtea-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar:', error);
        }
    };

    const handleClearData = () => {
        if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados. Essa ação não pode ser desfeita. Deseja continuar?')) {
            clearAllData();
            window.location.reload();
        }
    };

    const ToggleSwitch = ({ enabled, onClick }) => (
        <button
            onClick={onClick}
            className={`relative w-14 h-8 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
            <motion.div
                className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                animate={{ x: enabled ? 28 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-6">

            <PageHeader
                title="Configurações"
                subtitle="Personalize sua experiência"
            />

            <div className="space-y-6">

                {/* === APARÊNCIA === */}
                <Card hover={false}>
                    <SectionTitle>
                        <Palette size={16} className="inline mr-2 -mt-1" />
                        Aparência
                    </SectionTitle>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`
                                flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all
                                ${settings.theme === 'light'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
                                }
                            `}
                        >
                            <Sun size={24} className="text-amber-500" />
                            <div className="text-left">
                                <p className="font-semibold text-slate-800 dark:text-white">Claro</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Tema luminoso</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`
                                flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all
                                ${settings.theme === 'dark'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
                                }
                            `}
                        >
                            <Moon size={24} className="text-indigo-500" />
                            <div className="text-left">
                                <p className="font-semibold text-slate-800 dark:text-white">Escuro</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Menos luz</p>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* === NOTIFICAÇÕES === */}
                <Card hover={false}>
                    <SectionTitle>
                        <Bell size={16} className="inline mr-2 -mt-1" />
                        Experiência
                    </SectionTitle>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Bell size={20} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Notificações</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Lembretes de sessão</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={settings.notifications} onClick={() => handleToggle('notifications')} />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Volume2 size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Sons</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Feedback sonoro</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={settings.sounds} onClick={() => handleToggle('sounds')} />
                        </div>

                        <Divider />

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Vibrate size={20} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Vibração</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Feedback tátil</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={settings.haptics} onClick={() => handleToggle('haptics')} />
                        </div>
                    </div>
                </Card>

                {/* === DADOS DO PACIENTE === */}
                <Card hover={false}>
                    <SectionTitle>
                        <User size={16} className="inline mr-2 -mt-1" />
                        Dados do Paciente
                    </SectionTitle>

                    <div className="space-y-4">
                        <Input
                            label="Nome"
                            value={patient.name || ''}
                            onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                            placeholder="Nome do paciente"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Data de Nascimento"
                                type="date"
                                value={patient.birthDate || ''}
                                onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                            />
                            <Input
                                label="Diagnóstico"
                                value={patient.diagnosis || ''}
                                onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                                placeholder="Ex: TEA"
                            />
                        </div>

                        <Button onClick={handleSavePatient} loading={saving} className="w-full">
                            {saved ? (
                                <>
                                    <Check size={18} />
                                    Salvo!
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Salvar Dados
                                </>
                            )}
                        </Button>
                    </div>
                </Card>

                {/* === SESSÃO === */}
                <Card hover={false}>
                    <SectionTitle>
                        <Clock size={16} className="inline mr-2 -mt-1" />
                        Configurações de Sessão
                    </SectionTitle>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Duração padrão da sessão: <span className="text-blue-600 font-bold">{settings.sessionDuration} min</span>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={settings.sessionDuration}
                                onChange={(e) => {
                                    const updated = updateSettings({ sessionDuration: parseInt(e.target.value) });
                                    setSettings(updated);
                                }}
                                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>5 min</span>
                                <span>60 min</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tentativas por alvo: <span className="text-blue-600 font-bold">{settings.trialsPerTarget}</span>
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="20"
                                step="1"
                                value={settings.trialsPerTarget}
                                onChange={(e) => {
                                    const updated = updateSettings({ trialsPerTarget: parseInt(e.target.value) });
                                    setSettings(updated);
                                }}
                                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>5</span>
                                <span>20</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* === DADOS === */}
                <Card hover={false}>
                    <SectionTitle>
                        <Shield size={16} className="inline mr-2 -mt-1" />
                        Dados e Backup
                    </SectionTitle>

                    <div className="space-y-3">
                        <Button
                            variant="secondary"
                            onClick={handleExportData}
                            className="w-full"
                        >
                            <Download size={18} />
                            Exportar Todos os Dados
                        </Button>

                        <Button
                            variant="danger"
                            onClick={handleClearData}
                            className="w-full"
                        >
                            <Trash2 size={18} />
                            Limpar Todos os Dados
                        </Button>
                    </div>
                </Card>

                {/* === VERSÃO === */}
                <div className="text-center pt-4">
                    <Badge variant="neutral" size="lg">
                        DOM TEA v2.0
                    </Badge>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        Sistema de Acompanhamento Terapêutico
                    </p>
                </div>
            </div>
        </div>
    );
}
