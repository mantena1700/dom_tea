'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    User,
    Camera,
    Calendar,
    Heart,
    Star,
    Edit2,
    Save,
    Plus,
    X,
    Cake,
    Clock,
    Activity,
    Award,
    Target,
    TrendingUp,
    Sparkles,
    ChevronRight,
    Image as ImageIcon,
    Trash2,
    Phone,
    Mail,
    MapPin,
    FileText,
    Stethoscope,
    Brain,
    Puzzle,
    Music,
    Palette,
    Gamepad2,
    UtensilsCrossed,
    Baby,
} from 'lucide-react';
import {
    getPatient,
    savePatient,
    getDashboardStats,
    getPrograms,
    getSessions,
} from '@/lib/dataService';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DevelopmentalAssessment from './DevelopmentalAssessment';

const interestIcons = {
    music: Music,
    art: Palette,
    games: Gamepad2,
    food: UtensilsCrossed,
    puzzles: Puzzle,
    other: Star,
};

export default function PatientProfile() {
    const [mounted, setMounted] = useState(false);
    const [patient, setPatient] = useState({
        name: '',
        nickname: '',
        birthDate: '',
        photo: null,
        diagnosis: '',
        diagnosisDate: '',
        diagnosisLevel: '',
        doctors: [],
        medications: [],
        allergies: [],
        interests: [],
        strengths: [],
        challenges: [],
        sensoryPreferences: {
            likes: [],
            dislikes: [],
        },
        communicationStyle: '',
        emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
        },
        notes: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showDevelopmentAssessment, setShowDevelopmentAssessment] = useState(false);
    const fileInputRef = useRef(null);
    const [saved, setSaved] = useState(false);

    // New item inputs
    const [newInterest, setNewInterest] = useState('');
    const [newStrength, setNewStrength] = useState('');
    const [newChallenge, setNewChallenge] = useState('');
    const [newMedication, setNewMedication] = useState('');
    const [newAllergy, setNewAllergy] = useState('');
    const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', phone: '' });

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = () => {
        const patientData = getPatient();
        if (patientData) {
            setPatient({ ...patient, ...patientData });
        }
        setStats(getDashboardStats());
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const years = differenceInYears(new Date(), birth);
        const months = differenceInMonths(new Date(), birth) % 12;

        if (years === 0) {
            return `${months} ${months === 1 ? 'mês' : 'meses'}`;
        }
        return `${years} ${years === 1 ? 'ano' : 'anos'}${months > 0 ? ` e ${months} ${months === 1 ? 'mês' : 'meses'}` : ''}`;
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida.');
            return;
        }

        // Compressão e redimensionamento
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Max dimensions
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG 0.7
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                setPatient({ ...patient, photo: compressedBase64 });
                setShowPhotoModal(false);
            };
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPatient({ ...patient, photo: null });
        setShowPhotoModal(false);
    };

    const handleSave = () => {
        // Calculate age from birthDate
        let age = patient.age;
        if (patient.birthDate) {
            const birth = new Date(patient.birthDate);
            age = differenceInYears(new Date(), birth);
        }

        savePatient({ ...patient, age });
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const addListItem = (list, item, setItem, key) => {
        if (!item.trim()) return;
        setPatient({
            ...patient,
            [key]: [...(patient[key] || []), item.trim()],
        });
        setItem('');
    };

    const removeListItem = (key, index) => {
        setPatient({
            ...patient,
            [key]: patient[key].filter((_, i) => i !== index),
        });
    };

    const addDoctor = () => {
        if (!newDoctor.name.trim()) return;
        setPatient({
            ...patient,
            doctors: [...(patient.doctors || []), { ...newDoctor }],
        });
        setNewDoctor({ name: '', specialty: '', phone: '' });
    };

    const removeDoctor = (index) => {
        setPatient({
            ...patient,
            doctors: patient.doctors.filter((_, i) => i !== index),
        });
    };

    if (!mounted) {
        return <div className="animate-pulse p-8">Carregando...</div>;
    }

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'health', label: 'Saúde', icon: Heart },
        { id: 'preferences', label: 'Preferências', icon: Star },
        { id: 'team', label: 'Equipe', icon: Stethoscope },
    ];

    return (
        <div className="animate-fade-in">
            {/* Saved Feedback */}
            <AnimatePresence>
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
            </AnimatePresence>

            {/* Developmental Assessment Modal */}
            <AnimatePresence>
                {showDevelopmentAssessment && (
                    <DevelopmentalAssessment
                        onClose={() => setShowDevelopmentAssessment(false)}
                        onComplete={(programs) => {
                            setShowDevelopmentAssessment(false);
                            loadData();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Header with Photo */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl mb-8"
                style={{
                    background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 50%, #0D47A1 100%)',
                    padding: '2rem',
                }}
            >
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                    {/* Photo */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative flex-shrink-0"
                    >
                        <div
                            className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/40 shadow-xl cursor-pointer"
                            onClick={() => setShowPhotoModal(true)}
                        >
                            {patient.photo ? (
                                <img
                                    src={patient.photo}
                                    alt={patient.name || 'Foto do paciente'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-white/80">
                                    <Camera className="w-10 h-10 mx-auto mb-1" />
                                    <span className="text-xs">Adicionar foto</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowPhotoModal(true)}
                            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                            <Camera size={18} />
                        </button>
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left text-white">
                        {isEditing ? (
                            <div className="space-y-3 max-w-md">
                                <input
                                    type="text"
                                    value={patient.name || ''}
                                    onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                    placeholder="Nome completo"
                                    className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 text-xl font-bold"
                                />
                                <input
                                    type="text"
                                    value={patient.nickname || ''}
                                    onChange={(e) => setPatient({ ...patient, nickname: e.target.value })}
                                    placeholder="Apelido carinhoso"
                                    className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60"
                                />
                                <input
                                    type="date"
                                    value={patient.birthDate || ''}
                                    onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'white' }}>
                                    {patient.name || 'Cadastre seu filho'}
                                </h1>
                                {patient.nickname && (
                                    <p className="text-lg text-white/80 mb-3">"{patient.nickname}"</p>
                                )}
                                {patient.birthDate && (
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                                        <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
                                            <Cake size={16} />
                                            {calculateAge(patient.birthDate)}
                                        </span>
                                        <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
                                            <Calendar size={16} />
                                            {format(new Date(patient.birthDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        loadData();
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2.5 rounded-xl bg-white text-primary-600 font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Save size={16} />
                                    Salvar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Edit2 size={16} />
                                Editar
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                {stats && (
                    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                            <p className="text-white/70 text-xs">Sessões Realizadas</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-white">{stats.totalTrials}</p>
                            <p className="text-white/70 text-xs">Tentativas Totais</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-white">{stats.weekAccuracy}%</p>
                            <p className="text-white/70 text-xs">Acurácia Semanal</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold text-white">{getPrograms().filter(p => p.status === 'active').length}</p>
                            <p className="text-white/70 text-xs">Programas Ativos</p>
                        </div>
                    </div>
                )}
            </motion.div>

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

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'profile' && (
                        <>
                            {/* Developmental Assessment CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="chart-container bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-500"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Baby className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="font-bold text-purple-800 dark:text-purple-200">
                                            Avaliação de Marco do Desenvolvimento
                                        </h3>
                                        <p className="text-sm text-purple-600 dark:text-purple-300">
                                            Identifique o nível de desenvolvimento e receba os programas ideais automaticamente.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDevelopmentAssessment(true)}
                                        className="btn-primary whitespace-nowrap bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                                    >
                                        <Sparkles size={18} />
                                        Iniciar Avaliação
                                    </button>
                                </div>
                            </motion.div>

                            {/* Diagnosis Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-500" />
                                    Diagnóstico
                                </h2>

                                {isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="input-label">Diagnóstico</label>
                                            <input
                                                type="text"
                                                value={patient.diagnosis || ''}
                                                onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                                                placeholder="Ex: Transtorno do Espectro Autista"
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Nível (se aplicável)</label>
                                            <select
                                                value={patient.diagnosisLevel || ''}
                                                onChange={(e) => setPatient({ ...patient, diagnosisLevel: e.target.value })}
                                                className="input-field"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="1">Nível 1 - Requer Suporte</option>
                                                <option value="2">Nível 2 - Requer Suporte Substancial</option>
                                                <option value="3">Nível 3 - Requer Suporte Muito Substancial</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="input-label">Data do Diagnóstico</label>
                                            <input
                                                type="date"
                                                value={patient.diagnosisDate || ''}
                                                onChange={(e) => setPatient({ ...patient, diagnosisDate: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Estilo de Comunicação</label>
                                            <select
                                                value={patient.communicationStyle || ''}
                                                onChange={(e) => setPatient({ ...patient, communicationStyle: e.target.value })}
                                                className="input-field"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="verbal">Verbal</option>
                                                <option value="partially_verbal">Parcialmente Verbal</option>
                                                <option value="non_verbal">Não Verbal</option>
                                                <option value="aac">Usa CAA (Comunicação Alternativa)</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                            <p className="text-sm text-neutral-500 mb-1">Diagnóstico</p>
                                            <p className="font-semibold">{patient.diagnosis || 'Não informado'}</p>
                                        </div>
                                        {patient.diagnosisLevel && (
                                            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                                <p className="text-sm text-neutral-500 mb-1">Nível</p>
                                                <p className="font-semibold">Nível {patient.diagnosisLevel}</p>
                                            </div>
                                        )}
                                        {patient.diagnosisDate && (
                                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                                <p className="text-sm text-neutral-500 mb-1">Data do Diagnóstico</p>
                                                <p className="font-semibold">{format(new Date(patient.diagnosisDate), "dd/MM/yyyy")}</p>
                                            </div>
                                        )}
                                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                            <p className="text-sm text-neutral-500 mb-1">Comunicação</p>
                                            <p className="font-semibold">
                                                {patient.communicationStyle === 'verbal' ? 'Verbal' :
                                                    patient.communicationStyle === 'partially_verbal' ? 'Parcialmente Verbal' :
                                                        patient.communicationStyle === 'non_verbal' ? 'Não Verbal' :
                                                            patient.communicationStyle === 'aac' ? 'Usa CAA' : 'Não informado'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Notes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary-500" />
                                    Observações Gerais
                                </h2>

                                {isEditing ? (
                                    <textarea
                                        value={patient.notes || ''}
                                        onChange={(e) => setPatient({ ...patient, notes: e.target.value })}
                                        placeholder="Informações importantes sobre o paciente..."
                                        className="input-field resize-none"
                                        rows={4}
                                    />
                                ) : (
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        {patient.notes || 'Nenhuma observação registrada.'}
                                    </p>
                                )}
                            </motion.div>
                        </>
                    )}

                    {activeTab === 'health' && (
                        <>
                            {/* Medications */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-error-500" />
                                    Medicamentos
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(patient.medications || []).map((med, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-error flex items-center gap-2"
                                        >
                                            {med}
                                            {isEditing && (
                                                <button onClick={() => removeListItem('medications', index)}>
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {(patient.medications || []).length === 0 && !isEditing && (
                                        <p className="text-neutral-500">Nenhum medicamento registrado.</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMedication}
                                            onChange={(e) => setNewMedication(e.target.value)}
                                            placeholder="Adicionar medicamento..."
                                            className="input-field flex-1"
                                            onKeyPress={(e) => e.key === 'Enter' && addListItem('medications', newMedication, setNewMedication, 'medications')}
                                        />
                                        <button
                                            onClick={() => addListItem('medications', newMedication, setNewMedication, 'medications')}
                                            className="btn-primary"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Allergies */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-warning-500" />
                                    Alergias e Restrições
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(patient.allergies || []).map((allergy, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-warning flex items-center gap-2"
                                        >
                                            {allergy}
                                            {isEditing && (
                                                <button onClick={() => removeListItem('allergies', index)}>
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {(patient.allergies || []).length === 0 && !isEditing && (
                                        <p className="text-neutral-500">Nenhuma alergia registrada.</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newAllergy}
                                            onChange={(e) => setNewAllergy(e.target.value)}
                                            placeholder="Adicionar alergia..."
                                            className="input-field flex-1"
                                            onKeyPress={(e) => e.key === 'Enter' && addListItem('allergies', newAllergy, setNewAllergy, 'allergies')}
                                        />
                                        <button
                                            onClick={() => addListItem('allergies', newAllergy, setNewAllergy, 'allergies')}
                                            className="btn-primary"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Emergency Contact */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-success-500" />
                                    Contato de Emergência
                                </h2>

                                {isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            value={patient.emergencyContact?.name || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                emergencyContact: { ...patient.emergencyContact, name: e.target.value }
                                            })}
                                            placeholder="Nome"
                                            className="input-field"
                                        />
                                        <input
                                            type="text"
                                            value={patient.emergencyContact?.phone || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                emergencyContact: { ...patient.emergencyContact, phone: e.target.value }
                                            })}
                                            placeholder="Telefone"
                                            className="input-field"
                                        />
                                        <input
                                            type="text"
                                            value={patient.emergencyContact?.relationship || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                emergencyContact: { ...patient.emergencyContact, relationship: e.target.value }
                                            })}
                                            placeholder="Parentesco"
                                            className="input-field"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        {patient.emergencyContact?.name ? (
                                            <>
                                                <div className="avatar">
                                                    {patient.emergencyContact.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{patient.emergencyContact.name}</p>
                                                    <p className="text-sm text-neutral-500">
                                                        {patient.emergencyContact.relationship} • {patient.emergencyContact.phone}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-neutral-500">Nenhum contato de emergência registrado.</p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}

                    {activeTab === 'preferences' && (
                        <>
                            {/* Interests */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-warning-500" />
                                    Interesses e Hiperfoco
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(patient.interests || []).map((interest, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-warning flex items-center gap-2"
                                        >
                                            ⭐ {interest}
                                            {isEditing && (
                                                <button onClick={() => removeListItem('interests', index)}>
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {(patient.interests || []).length === 0 && !isEditing && (
                                        <p className="text-neutral-500">Nenhum interesse registrado.</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newInterest}
                                            onChange={(e) => setNewInterest(e.target.value)}
                                            placeholder="Adicionar interesse..."
                                            className="input-field flex-1"
                                            onKeyPress={(e) => e.key === 'Enter' && addListItem('interests', newInterest, setNewInterest, 'interests')}
                                        />
                                        <button
                                            onClick={() => addListItem('interests', newInterest, setNewInterest, 'interests')}
                                            className="btn-primary"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Strengths */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-success-500" />
                                    Pontos Fortes
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(patient.strengths || []).map((strength, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-success flex items-center gap-2"
                                        >
                                            💪 {strength}
                                            {isEditing && (
                                                <button onClick={() => removeListItem('strengths', index)}>
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {(patient.strengths || []).length === 0 && !isEditing && (
                                        <p className="text-neutral-500">Nenhum ponto forte registrado.</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newStrength}
                                            onChange={(e) => setNewStrength(e.target.value)}
                                            placeholder="Adicionar ponto forte..."
                                            className="input-field flex-1"
                                            onKeyPress={(e) => e.key === 'Enter' && addListItem('strengths', newStrength, setNewStrength, 'strengths')}
                                        />
                                        <button
                                            onClick={() => addListItem('strengths', newStrength, setNewStrength, 'strengths')}
                                            className="btn-primary"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>

                            {/* Challenges */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="chart-container"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary-500" />
                                    Desafios e Áreas de Desenvolvimento
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(patient.challenges || []).map((challenge, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-primary flex items-center gap-2"
                                        >
                                            🎯 {challenge}
                                            {isEditing && (
                                                <button onClick={() => removeListItem('challenges', index)}>
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {(patient.challenges || []).length === 0 && !isEditing && (
                                        <p className="text-neutral-500">Nenhum desafio registrado.</p>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newChallenge}
                                            onChange={(e) => setNewChallenge(e.target.value)}
                                            placeholder="Adicionar desafio..."
                                            className="input-field flex-1"
                                            onKeyPress={(e) => e.key === 'Enter' && addListItem('challenges', newChallenge, setNewChallenge, 'challenges')}
                                        />
                                        <button
                                            onClick={() => addListItem('challenges', newChallenge, setNewChallenge, 'challenges')}
                                            className="btn-primary"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}

                    {activeTab === 'team' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="chart-container"
                        >
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-primary-500" />
                                Profissionais de Saúde
                            </h2>

                            <div className="space-y-4 mb-4">
                                {(patient.doctors || []).map((doctor, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="avatar">
                                                {doctor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{doctor.name}</p>
                                                <p className="text-sm text-neutral-500">{doctor.specialty}</p>
                                                {doctor.phone && (
                                                    <p className="text-sm text-neutral-400 flex items-center gap-1">
                                                        <Phone size={12} /> {doctor.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <button
                                                onClick={() => removeDoctor(index)}
                                                className="btn-icon text-error-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {(patient.doctors || []).length === 0 && !isEditing && (
                                    <p className="text-neutral-500 text-center py-8">
                                        Nenhum profissional cadastrado.
                                    </p>
                                )}
                            </div>

                            {isEditing && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input
                                        type="text"
                                        value={newDoctor.name}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                        placeholder="Nome"
                                        className="input-field"
                                    />
                                    <input
                                        type="text"
                                        value={newDoctor.specialty}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                                        placeholder="Especialidade"
                                        className="input-field"
                                    />
                                    <input
                                        type="text"
                                        value={newDoctor.phone}
                                        onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                                        placeholder="Telefone"
                                        className="input-field"
                                    />
                                    <button onClick={addDoctor} className="btn-primary">
                                        <Plus size={18} />
                                        Adicionar
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="chart-container">
                        <h3 className="font-semibold mb-4">Ações Rápidas</h3>
                        <div className="space-y-2">
                            <Link href="/session" className="btn-primary w-full justify-start">
                                <Activity size={18} />
                                Nova Sessão
                            </Link>
                            <Link href="/reports" className="btn-secondary w-full justify-start">
                                <TrendingUp size={18} />
                                Ver Relatórios
                            </Link>
                            <Link href="/insights" className="btn-secondary w-full justify-start">
                                <Sparkles size={18} />
                                Insights IA
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="chart-container">
                        <h3 className="font-semibold mb-4">Atividade Recente</h3>
                        <div className="space-y-3">
                            {getSessions().slice(0, 5).map((session, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-success-500' : 'bg-warning-500'
                                        }`} />
                                    <div>
                                        <p className="font-medium">
                                            {session.status === 'completed' ? 'Sessão concluída' : 'Sessão em andamento'}
                                        </p>
                                        <p className="text-neutral-500 text-xs">
                                            {format(new Date(session.startTime), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {getSessions().length === 0 && (
                                <p className="text-neutral-500 text-sm text-center py-4">
                                    Nenhuma sessão ainda.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Upload Modal */}
            <AnimatePresence>
                {showPhotoModal && (
                    <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-6">Foto do Perfil</h2>

                            {patient.photo ? (
                                <div className="mb-6">
                                    <img
                                        src={patient.photo}
                                        alt="Foto atual"
                                        className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-neutral-200"
                                    />
                                </div>
                            ) : (
                                <div className="w-40 h-40 rounded-full mx-auto mb-6 bg-neutral-100 flex items-center justify-center">
                                    <ImageIcon className="w-16 h-16 text-neutral-400" />
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn-primary w-full"
                                >
                                    <Camera size={18} />
                                    {patient.photo ? 'Alterar Foto' : 'Escolher Foto'}
                                </button>

                                {patient.photo && (
                                    <button
                                        onClick={handleRemovePhoto}
                                        className="btn-secondary w-full text-error-600"
                                    >
                                        <Trash2 size={18} />
                                        Remover Foto
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowPhotoModal(false)}
                                    className="btn-secondary w-full"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />

                            <p className="text-xs text-neutral-500 mt-4">
                                Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
