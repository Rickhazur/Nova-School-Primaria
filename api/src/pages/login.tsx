import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'STUDENT' | 'PARENT'>('STUDENT');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí iría la validación y llamada a backend real
        if (isLogin) {
            // Simula login exitoso
            login({ name: 'Usuario', email, role });
        } else {
            // Simula registro exitoso
            login({ name, email, role });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
                    {isLogin ? '¡Bienvenido de vuelta!' : 'Crea tu cuenta'}
                </h1>

                <div className="flex justify-center mb-6 space-x-4">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`px-6 py-2 rounded-full font-semibold transition ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-200 text-indigo-700'
                            }`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`px-6 py-2 rounded-full font-semibold transition ${!isLogin ? 'bg-pink-600 text-white shadow-lg' : 'bg-pink-200 text-pink-700'
                            }`}
                    >
                        Crear Cuenta
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <>
                            <label className="block">
                                <span className="text-gray-700 font-semibold">Nombre completo</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                                    placeholder="Tu nombre"
                                />
                            </label>

                            <label className="block">
                                <span className="text-gray-700 font-semibold">Tipo de cuenta</span>
                                <div className="mt-1 flex space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="STUDENT"
                                            checked={role === 'STUDENT'}
                                            onChange={() => setRole('STUDENT')}
                                            className="accent-pink-500"
                                        />
                                        <span>Estudiante</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="PARENT"
                                            checked={role === 'PARENT'}
                                            onChange={() => setRole('PARENT')}
                                            className="accent-pink-500"
                                        />
                                        <span>Acudiente</span>
                                    </label>
                                </div>
                            </label>
                        </>
                    )}

                    <label className="block">
                        <span className="text-gray-700 font-semibold">Correo electrónico</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="correo@ejemplo.com"
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 font-semibold">Contraseña</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="********"
                        />
                    </label>

                    <button
                        type="submit"
                        className={`w-full py-3 rounded-full font-bold text-white transition ${isLogin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-pink-600 hover:bg-pink-700'
                            }`}
                    >
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
}