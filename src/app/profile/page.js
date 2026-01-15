import PatientProfile from '@/components/PatientProfile';

export const metadata = {
    title: 'Perfil do Paciente - Dom TEA',
    description: 'Cadastre e gerencie o perfil completo do paciente com foto, diagnóstico, medicamentos e preferências.',
};

export default function ProfilePage() {
    return <PatientProfile />;
}
