
import React, { useState, useEffect } from 'react';
import { ViewState, Subject, Infraction, StoreItem, Language, UserLevel } from './types';
import Sidebar from './components/Sidebar';

// Lazy Load Heavy Components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Curriculum = React.lazy(() => import('./components/Curriculum'));
const AIConsultant = React.lazy(() => import('./components/AIConsultant'));
const Metrics = React.lazy(() => import('./components/Metrics'));
const Progress = React.lazy(() => import('./components/Progress'));
const Flashcards = React.lazy(() => import('./components/Flashcards'));
const SocialHub = React.lazy(() => import('./components/SocialHub'));
const RewardsStore = React.lazy(() => import('./components/RewardsStore'));
import { LoginScreen } from './components/LoginScreen';
const Settings = React.lazy(() => import('./components/Settings'));
const TestingCenter = React.lazy(() => import('./components/TestingCenter'));
const ParentAgreement = React.lazy(() => import('./components/ParentAgreement'));
const OnboardingTour = React.lazy(() => import('./components/OnboardingTour'));
const DiagnosticTest = React.lazy(() => import('./components/DiagnosticTest'));
const PricingPlan = React.lazy(() => import('./components/PricingPlan'));
const Repository = React.lazy(() => import('./components/Repository'));
const DualWhiteboard = React.lazy(() => import('./components/DualWhiteboard'));
const SupportWidget = React.lazy(() => import('./components/SupportWidget'));
const TeacherReport = React.lazy(() => import('./components/TeacherReport'));
const PaymentView = React.lazy(() => import('./components/PaymentView'));
const ResearchHub = React.lazy(() => import('./components/ResearchHub'));
import {
    loginWithSupabase,
    logoutSupabase,
    getUserEconomy,
    fetchStoreItems,
    logStudentInfraction,
    saveStoreItemToDb,
    deleteStoreItemFromDb,
    fetchStudentAcademicResults,
    fetchStudentAllowedViews,
    adminAwardCoins,
    isOffline,
    subscribeToEconomy,
    getAllStudents
} from './services/supabase';
import { Brain, Lock, Zap, ArrowRight, ShieldCheck, Activity, Smartphone, Mail, AtSign, Phone, Globe } from 'lucide-react';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isTourOpen, setTourOpen] = useState(true) // Skip ParentAgreement;
    const [isTestingCenterOpen, setTestingCenterOpen] = useState(true) // Skip ParentAgreement;
    const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

    // LANGUAGE & AGE STATE
    const [language, setLanguage] = useState<Language>('es');
    const [studentAge, setStudentAge] = useState<number>(8);

    const [studentForm, setStudentForm] = useState({ email: '', guardianPhone: '', password: '' });
    const [adminForm, setAdminForm] = useState({ email: '', password: '' });

    const [isAuthenticated, setIsAuthenticated] = useState(false) // Skip ParentAgreement;
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
    const [userLevel, setUserLevel] = useState<UserLevel>('bachillerato');
    const [loginLevel, setLoginLevel] = useState<UserLevel>('bachillerato');
    const [agreementAccepted, setAgreementAccepted] = useState(true) // Skip ParentAgreement;
    const [isMockSession, setIsMockSession] = useState(true) // Skip ParentAgreement;

    const [remedialSubject, setRemedialSubject] = useState<Subject | undefined>(undefined);
    const [dailyInfractions, setDailyInfractions] = useState<Infraction[]>([]);
    const [coins, setCoins] = useState(0);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [studentMenuConfig, setStudentMenuConfig] = useState<string[]>([]);
    const [uploadedHomework, setUploadedHomework] = useState<File[]>([]);
    const [isSimulationMode, setIsSimulationMode] = useState(true) // Skip ParentAgreement;

    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [studentsList, setStudentsList] = useState<{ uid: string, name: string, email: string }[]>([]);
    const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<string>(''); // For Payment Flow

    useEffect(() => {
        if (isAuthenticated) {
            loadUserData(userId);
            loadMenuConfig(userId);

            if (userRole === 'ADMIN') {
                loadStudentsList();
            }

            if (userRole === 'STUDENT') {
                const unsubEconomy = subscribeToEconomy(userId, (newCoins) => {
                    setCoins(newCoins);
                });
                return () => { unsubEconomy(); };
            }
        }
    }, [isAuthenticated, userId, userRole]);

    const loadStudentsList = async () => {
        const students = await getAllStudents();
        setStudentsList(students);
        if (students.length > 0) {
            setSelectedStudentId(students[0].uid);
        }
    };

    const loadMenuConfig = async (uid: string) => {
        const allowedViews = await fetchStudentAllowedViews(uid);
        if (allowedViews && allowedViews.length > 0) {
            setStudentMenuConfig(allowedViews);
        } else {
            setStudentMenuConfig([ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.AI_CONSULTANT, ViewState.PROGRESS, ViewState.REWARDS]);
        }
    };

    const loadUserData = async (uid: string) => {
        const economy = await getUserEconomy(uid);
        setCoins(economy.coins);
        const items = await fetchStoreItems();
        setStoreItems(items.length > 0 ? items : [
            { id: 't1', name: 'Tema Oscuro', cost: 150, category: 'theme', owned: false },
            { id: 'a1', name: 'Avatar Robot', cost: 300, category: 'avatar', owned: false },
            { id: 'c1', name: 'Cupón Cine 2x1', cost: 500, category: 'coupon', owned: false },
            { id: 'r1', name: 'Pizza Party', cost: 1000, category: 'real', owned: false },
        ]);
    };

    const loadRemedialPlan = async (uid: string) => {
        const results = await fetchStudentAcademicResults(uid);
        const mathResult = results.find((r: any) => r.subject === 'Math' || (r.remedial_plan && r.remedial_plan.length > 0));
        if (mathResult && mathResult.remedial_plan) {
            const subject: Subject = {
                id: 'remedial-math', name: 'NIVELACION: Matematicas', icon: <Zap className="w-6 h-6" />,
                description: 'Curso intensivo personalizado.', colorTheme: 'rose',
                tracks: [{
                    id: 'rem-1', name: 'Plan de Choque', overview: 'Recuperacion de bases.',
                    modules: [{
                        id: 1, name: 'Modulos de Recuperacion', level: 'Prioridad Alta', focus: 'Cerrar brechas.',
                        classes: mathResult.remedial_plan.map((c: any, idx: number) => ({
                            id: 700 + idx, title: c.title, duration: c.duration || '25 min', topic: c.topic,
                            isRemedial: true, blueprint: { hook: '', development: '', practice: '', closure: '', differentiation: '' }
                        }))
                    }]
                }]
            };
            setRemedialSubject(subject);
            return true;
        }
        return false;
    };

    const handleLogin = async (e: React.FormEvent, modeOverride?: 'STUDENT' | 'ADMIN', dataOverride?: any) => {
        e.preventDefault();
        const mode = modeOverride || loginMode;
        const data = dataOverride || (mode === 'STUDENT' ? studentForm : adminForm);

        let emailToAuth = data.email;
        let passwordToAuth = data.password;

        if (mode === 'STUDENT' && (!data.guardianPhone || !data.guardianPhone.trim())) {
            alert("Por favor ingresa el WhatsApp del acudiente.");
            return;
        }

        try {
            const user = await loginWithSupabase(emailToAuth, passwordToAuth, mode);
            setUserId(user.uid);
            setUserName(user.name);
            setUserRole(user.role as any);
            setUserLevel(loginLevel); // Use the selected level for now as DB mock might not have it
            setIsMockSession(false);
            setIsAuthenticated(true);

            if (mode === 'STUDENT' && data.guardianPhone) {
                const { saveGuardianPhone } = await import('./services/supabase');
                await saveGuardianPhone(user.uid, data.guardianPhone);
            }

            const hasRemedial = await loadRemedialPlan(user.uid);
            setAgreementAccepted(user.role === 'ADMIN' || hasRemedial);

            if (user.role === 'ADMIN') setCurrentView(ViewState.PROGRESS);
            else if (hasRemedial) setCurrentView(ViewState.CURRICULUM);
            else setCurrentView(ViewState.DASHBOARD);
        } catch (error) {
            alert("Login fallido. Verifica tus credenciales.");
        }
    };

    const handleLogout = async () => {
        await logoutSupabase();
        setIsAuthenticated(false);
        setUserId('');
        setUserName('');
        setStudentForm({ email: '', guardianPhone: '', password: '' });
        setAdminForm({ email: '', password: '' });
        setAgreementAccepted(false);
        setIsSimulationMode(false);
        setIsMockSession(false);
        setRemedialSubject(undefined);
        setUploadedHomework([]);
        setCurrentView(ViewState.DASHBOARD);
        setSelectedStudentId('');
        setStudentsList([]);
    };

    const handleSimulatePersona = async (name: string, role: 'STUDENT' | 'ADMIN', level: UserLevel) => {
        setIsSimulationMode(true);
        setUserName(name);
        setUserRole(role);
        setUserLevel(level);
        setIsAuthenticated(true);
        setAgreementAccepted(true);
        setTestingCenterOpen(false);
        setIsMockSession(true);
        if (role === 'ADMIN') setCurrentView(ViewState.PROGRESS);
        else setCurrentView(ViewState.DASHBOARD);
    };

    const handleLogInfraction = (type: Infraction['type'], description: string) => {
        const newInfraction: Infraction = { id: Date.now().toString(), type, description, timestamp: new Date().toISOString(), severity: 'MEDIUM' };
        setDailyInfractions(prev => [newInfraction, ...prev]);
        if (userId) logStudentInfraction(userId, newInfraction);
    };

    const handleTriggerAction = (action: 'ROOM_CHECK' | 'ADD_COINS' | 'INFRACTION' | 'TOUR') => {
        switch (action) {
            case 'ROOM_CHECK': alert("Room Check forzado iniciado..."); break;
            case 'ADD_COINS': setCoins(prev => prev + 1000); break;
            case 'INFRACTION': handleLogInfraction('ACADEMIC_DISHONESTY', 'Simulated infraction via DevTools'); break;
            case 'TOUR': setTourOpen(true); break;
        }
    };

    const handleAdminAddCoins = async (amount: number) => {
        if (!selectedStudentId) {
            alert("Por favor selecciona un estudiante primero.");
            return;
        }
        console.log('Admin enviando', amount, 'coins a estudiante:', selectedStudentId);
        const success = await adminAwardCoins(selectedStudentId, amount);
        if (success) {
            const student = studentsList.find(s => s.uid === selectedStudentId);
            alert('Enviados ' + amount + ' Nova Coins a ' + (student?.name || 'estudiante') + '.');
        } else {
            alert("Error enviando coins. Revisa la consola.");
        }
    };

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentId(studentId);
        console.log('Estudiante seleccionado:', studentId);
    };

    if (!isAuthenticated) {
        return (
            <>
                <LoginScreen
                    onLogin={(e, mode, data) => {
                        // Adapt existing handleLogin logic
                        e.preventDefault();
                        if (mode === 'STUDENT') {
                            setLoginMode('STUDENT');
                            setStudentForm({ ...studentForm, email: data.email, password: data.password, guardianPhone: data.guardianPhone || '' });
                            // Trigger the actual login in the next tick or call handleLogin directly if adapted
                            // For now, we reuse the state and call handleLogin manually or refactor handleLogin to accept args
                            // Let's refactor handleLogin to take args or set state then call it.
                            handleLogin(e, mode, data);
                        } else {
                            setLoginMode('ADMIN');
                            setAdminForm({ ...adminForm, email: data.email, password: data.password });
                            handleLogin(e, mode, data);
                        }
                    }}
                    language={language}
                    setLanguage={setLanguage}
                />

                {/* Dev Tools Trigger (Hidden) */}
                <div className="fixed bottom-4 left-4 z-50">
                    <button onClick={() => setTestingCenterOpen(true)} className="opacity-0 hover:opacity-50 text-white text-xs">🛠️</button>
                </div>
                <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
            </>
        );
    }

    if (!agreementAccepted && userRole === 'STUDENT') {
        return (
            <React.Suspense fallback={<div className="h-screen flex items-center justify-center text-white">Loading Agreement...</div>}>
                <ParentAgreement studentName={userName} onAccept={() => setAgreementAccepted(true)} onLogout={handleLogout} />
            </React.Suspense>
        );
    }

    return (
        <div className="flex bg-white min-h-screen font-sans text-slate-900 overflow-hidden">
            <Sidebar currentView={currentView} onViewChange={setCurrentView} onStartTour={() => setTourOpen(true)} onLogout={handleLogout} userName={userName} userRole={userRole} isSimulationMode={isSimulationMode} onExitSimulation={() => { setIsSimulationMode(false); handleLogout(); }} restrictedMode={!!remedialSubject} studentMenuConfig={studentMenuConfig} isMock={isMockSession} language={language} setLanguage={setLanguage} userLevel={userLevel} />
            <main className={`flex-1 overflow-y-auto h-screen relative md:ml-64 bg-[#050505]`}>
                {isAuthenticated && <React.Suspense fallback={null}><SupportWidget userId={userId} userName={userName} userRole={userRole} /></React.Suspense>}
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
                    <React.Suspense fallback={
                        <div className="flex h-96 items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                        </div>
                    }>
                        {currentView === ViewState.DASHBOARD && <Dashboard onNavigate={setCurrentView} onStartTour={() => setTourOpen(true)} language={language} />}
                        {currentView === ViewState.REPOSITORY && <Repository studentName={userName} userRole={userRole} onUploadHomework={(file) => setUploadedHomework(prev => [...prev, file])} />}
                        {currentView === ViewState.CURRICULUM && <Curriculum userName={userName} userRole={userRole} remedialSubject={remedialSubject} onLogInfraction={handleLogInfraction} onLogout={handleLogout} guardianPhone={studentForm.guardianPhone} uploadedHomework={uploadedHomework} userId={userId} language={language} />}
                        {currentView === ViewState.RESEARCH && <ResearchHub userId={userId} language={language} ageGroup={studentAge} />}
                        {currentView === ViewState.AI_CONSULTANT && <AIConsultant />}
                        {currentView === ViewState.METRICS && <Metrics />}
                        {currentView === ViewState.PROGRESS && <Progress userRole={userRole} userId={userId} userName={userName} dailyInfractions={dailyInfractions} onAwardCoins={(amt) => setCoins(c => c + amt)} onAddItemToStore={(item) => { setStoreItems(prev => [...prev, item]); saveStoreItemToDb(item); }} onMenuConfigUpdate={() => loadMenuConfig(userId)} studentsList={studentsList} selectedStudentId={selectedStudentId} onSelectStudent={handleSelectStudent} />}
                        {currentView === ViewState.DIAGNOSTIC && <DiagnosticTest studentName={userName} onFinish={async (view, data) => {
                            if (data?.remedialSubject) {
                                setRemedialSubject(data.remedialSubject);
                                if (userId && data.rawResult?.remedialClasses) {
                                    const { assignRemedialPlan } = await import('./services/supabase');
                                    const planForDB = data.rawResult.remedialClasses.map((c: any, idx: number) => ({
                                        title: c.title || `Sesión ${idx + 1}`,
                                        topic: c.topic || 'Refuerzo General',
                                        duration: '25 min',
                                        status: 'pending'
                                    }));
                                    await assignRemedialPlan(userId, 'Math', planForDB);
                                    console.log('✅ Plan de nivelación guardado automáticamente en DB');
                                }
                            }
                            setCurrentView(view);
                        }} />}
                        {currentView === ViewState.WHITEBOARD && <DualWhiteboard language={language} studentAge={userLevel === 'primary' ? 8 : 15} />}
                        {currentView === ViewState.FLASHCARDS && <Flashcards />}
                        {currentView === ViewState.SOCIAL && <SocialHub />}
                        {currentView === ViewState.REWARDS && <RewardsStore userLevel={userLevel === 'primary' ? 'KIDS' : 'TEEN'} currentCoins={coins} items={storeItems} onPurchase={(item) => { if (coins >= item.cost) { setCoins(c => c - item.cost); setStoreItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i)); alert('Compraste ' + item.name + '!'); } }} isEditable={userRole === 'ADMIN'} onDelete={(id) => { setStoreItems(prev => prev.filter(i => i.id !== id)); deleteStoreItemFromDb(id); }} onUpdate={(item) => { setStoreItems(prev => prev.map(i => i.id === item.id ? item : i)); saveStoreItemToDb(item); }} onAddCoins={handleAdminAddCoins} selectedStudentId={selectedStudentId} selectedStudentName={studentsList.find(s => s.uid === selectedStudentId)?.name || ''} studentsList={studentsList} onSelectStudent={handleSelectStudent} />}
                        {currentView === ViewState.PRICING && <PricingPlan onPlanSelect={(id) => { setSelectedCheckoutPlan(id); setCurrentView(ViewState.PAYMENTS); }} />}
                        {currentView === ViewState.PAYMENTS && <PaymentView planId={selectedCheckoutPlan} onBack={() => setCurrentView(ViewState.PRICING)} />}
                        {currentView === ViewState.TEACHER_REPORT && <TeacherReport onAssignPlan={(plan) => { setRemedialSubject(plan); setCurrentView(ViewState.CURRICULUM); alert("Plan asignado correctamente."); }} />}
                        {currentView === ViewState.SETTINGS && <Settings userId={userId} userName={userName} userRole={userRole} onUpdateUser={setUserName} onLogout={handleLogout} language={language} onLanguageChange={setLanguage} studentAge={studentAge} onAgeChange={setStudentAge} isPrimary={userLevel === 'primary'} />}
                    </React.Suspense>
                </div>
                {userRole === 'ADMIN' && <button className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg opacity-30 hover:opacity-100" onClick={() => setTestingCenterOpen(true)}>🛠️</button>}
                <React.Suspense fallback={null}>
                    <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
                    <OnboardingTour isOpen={isTourOpen} onClose={() => setTourOpen(false)} currentView={currentView} onNavigate={setCurrentView} />
                </React.Suspense>
            </main>
        </div>
    );
};

export default App;
