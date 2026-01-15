import SessionController from '@/components/SessionController';

export const metadata = {
    title: 'Sessão - Dom TEA',
    description: 'Inicie e gerencie sessões de terapia ABA com registro de tentativas e comportamentos.',
};

export default function SessionPage() {
    return <SessionController />;
}
