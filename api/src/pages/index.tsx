import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-300 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-white">Nova Schola</h1>
                <button
                    onClick={logout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    Cerrar Sesión
                </button>
            </header>

            <main className="bg-white rounded-xl p-6 shadow-lg max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Bienvenido, {user.name}!</h2>
                <p className="mb-6">Selecciona una opción para comenzar tu aprendizaje:</p>

                <div className="grid grid-cols-2 gap-6">
                    <button className="bg-cyan-500 text-white rounded-lg py-4 font-bold hover:bg-cyan-600 transition">
                        Tutoría Inteligente
                    </button>
                    <button className="bg-pink-500 text-white rounded-lg py-4 font-bold hover:bg-pink-600 transition">
                        Mi Repositorio
                    </button>
                    <button className="bg-yellow-400 text-white rounded-lg py-4 font-bold hover:bg-yellow-500 transition">
                        Flashcards IA
                    </button>
                    <button className="bg-green-500 text-white rounded-lg py-4 font-bold hover:bg-green-600 transition">
                        Progreso Estudiante
                    </button>
                </div>
            </main>
        </div>
    );
}