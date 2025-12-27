import React, { useState } from 'react';
import { Brain, Lock, ArrowRight, ShieldCheck, Smartphone, Mail, AtSign, Phone, Eye, EyeOff, Globe } from 'lucide-react';
import { Language, UserLevel } from '../types';

interface LoginScreenProps {
    onLogin: (e: React.FormEvent, mode: 'STUDENT' | 'ADMIN', data: any) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language, setLanguage }) => {
    const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        guardianPhone: '',
        name: '',
        grade: '',
        role: 'STUDENT'
    });

    const t = {
        es: {
            welcome: 'Bienvenido de vuelta',
            subtitle: 'Accede a tu tutoría personalizada',
            createAccount: 'Crea tu cuenta',
            createSubtitle: 'Accede a tu tutoría personalizada',
            student: 'Estudiante',
            admin: 'Administrativo',
            name: 'Nombre completo',
            grade: 'Grado escolar',
            email: 'Correo electrónico',
            guardian: 'WhatsApp del acudiente (opcional)',
            password: 'Contraseña',
            loginBtn: 'Iniciar Sesión',
            registerBtn: 'Crear Cuenta',
            forgot: '¿Olvidaste tu contraseña?',
            noAccount: '¿No tienes cuenta?',
            haveAccount: '¿Ya tienes cuenta?',
            clickRegister: 'Crear cuenta',
            clickLogin: 'Iniciar sesión',
            stats: { students: 'Estudiantes', improvement: 'Mejora' },
            brandSubtitle: 'Academia IA'
        },
        en: {
            welcome: 'Welcome back',
            subtitle: 'Access your personalized tutoring',
            createAccount: 'Create your account',
            createSubtitle: 'Access your personalized tutoring',
            student: 'Student',
            admin: 'Administrative',
            name: 'Full Name',
            grade: 'School Grade',
            email: 'Email address',
            guardian: 'Parent WhatsApp (optional)',
            password: 'Password',
            loginBtn: 'Log In',
            registerBtn: 'Create Account',
            forgot: 'Forgot password?',
            noAccount: 'Don\'t have an account?',
            haveAccount: 'Already have an account?',
            clickRegister: 'Create account',
            clickLogin: 'Log in',
            stats: { students: 'Students', improvement: 'Improvement' },
            brandSubtitle: 'AI Academy'
        }
    };

    const text = t[language === 'bilingual' ? 'en' : language];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(e, loginMode, formData);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex font-sans selection:bg-orange-500/30">

            {/* Left Column - Brand & Aesthetics */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#09090b] items-center justify-center p-12">
                {/* Ambient Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-cyan-900/10 rounded-full blur-[120px]" />
                    <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                    {/* Logo with Glow */}
                    <div className="relative group mb-8">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-400/30 transition-all duration-500" />
                        <div className="w-24 h-24 bg-gradient-to-br from-cyan-900 to-blue-950 border border-cyan-800/50 rounded-2xl flex items-center justify-center shadow-2xl relative">
                            <Brain className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-white tracking-tight mb-2">
                        Nova Schola
                    </h1>
                    <p className="text-xl text-cyan-400 font-medium tracking-widest uppercase mb-12">
                        {text.brandSubtitle}
                    </p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-[#121215] border border-white/5 p-4 rounded-2xl backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                            <div className="text-3xl font-bold text-white mb-1">50K+</div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{text.stats.students}</div>
                        </div>
                        <div className="bg-[#121215] border border-white/5 p-4 rounded-2xl backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
                            <div className="text-3xl font-bold text-white mb-1">95%</div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{text.stats.improvement}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-[#050505]">

                {/* Language Switcher - Absolute Top Right */}
                <div className="absolute top-6 right-6 z-20">
                    <button
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#121215] border border-white/10 rounded-full text-slate-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {language === 'es' ? 'English' : 'Español'}
                    </button>
                </div>

                <div className="w-full max-w-md space-y-8 relative z-10">

                    {/* Mobile Logo (visible only on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-900 to-blue-950 rounded-xl flex items-center justify-center mx-auto mb-4 border border-cyan-800/30">
                            <Brain className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Nova Schola</h2>
                    </div>

                    {/* Role Switcher */}
                    <div className="bg-[#121215] p-1.5 rounded-xl flex relative">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#27272a] rounded-lg transition-all duration-300 ease-out shadow-lg ${loginMode === 'ADMIN' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
                        />
                        <button
                            onClick={() => setLoginMode('STUDENT')}
                            className={`flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${loginMode === 'STUDENT' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Smartphone className="w-4 h-4" /> {text.student}
                        </button>
                        <button
                            onClick={() => setLoginMode('ADMIN')}
                            className={`flex-1 relative z-10 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${loginMode === 'ADMIN' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <ShieldCheck className="w-4 h-4" /> {text.admin}
                        </button>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{isRegistering ? text.createAccount : text.welcome}</h2>
                        <p className="text-slate-400">{isRegistering ? text.createSubtitle : text.subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegistering && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{text.name}</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#121215] border border-white/10 focus:border-cyan-500/50 focus:bg-[#18181b] text-white rounded-xl py-3.5 px-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                {loginMode === 'STUDENT' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{text.grade}</label>
                                        <select
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                            className="w-full bg-[#121215] border border-white/10 focus:border-cyan-500/50 focus:bg-[#18181b] text-white rounded-xl py-3.5 px-4 text-sm outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="3">3° Primaria</option>
                                            <option value="4">4° Primaria</option>
                                            <option value="5">5° Primaria</option>
                                            <option value="6">6° Bachillerato</option>
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{text.email}</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#121215] border border-white/10 focus:border-cyan-500/50 focus:bg-[#18181b] text-white rounded-xl py-3.5 px-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {loginMode === 'STUDENT' && isRegistering && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{text.guardian}</label>
                                <div className="relative group">
                                    <input
                                        type="tel"
                                        value={formData.guardianPhone}
                                        onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                                        className="w-full bg-[#121215] border border-white/10 focus:border-cyan-500/50 focus:bg-[#18181b] text-white rounded-xl py-3.5 px-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                        placeholder="+57 300 123 4567"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{text.password}</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-[#121215] border border-white/10 focus:border-cyan-500/50 focus:bg-[#18181b] text-white rounded-xl py-3.5 px-4 pr-12 text-sm placeholder:text-slate-600 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="text-sm tracking-wider uppercase">{isRegistering ? text.registerBtn : text.loginBtn}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-slate-500 text-sm">
                            {isRegistering ? text.haveAccount : text.noAccount}{' '}
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors"
                            >
                                {isRegistering ? text.clickLogin : text.clickRegister}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
