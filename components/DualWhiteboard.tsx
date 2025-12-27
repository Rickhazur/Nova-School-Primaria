
import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Download, MousePointer, PenTool, Undo, Palette, CheckCircle, XCircle, Loader, ArrowRight, Lightbulb } from 'lucide-react';
import { Language } from '../types';
import TTSControls from './TTSControls';

const COLORS = [
    '#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#FFFFFF'
];

const BRUSH_SIZES = [2, 4, 8, 12, 20];

interface DualWhiteboardProps {
    language: Language;
    studentAge?: number;
}

interface StepValidation {
    isValid: boolean;
    feedback: string;
    hints?: string[];
}

const DualWhiteboard: React.FC<DualWhiteboardProps> = ({ language, studentAge = 8 }) => {
    // Student board refs
    const studentCanvasRef = useRef<HTMLCanvasElement>(null);
    const [studentContext, setStudentContext] = useState<CanvasRenderingContext2D | null>(null);
    const [studentDrawing, setStudentDrawing] = useState(false);

    // Nova's board refs
    const novaCanvasRef = useRef<HTMLCanvasElement>(null);
    const [novaContext, setNovaContext] = useState<CanvasRenderingContext2D | null>(null);

    // Drawing tools
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    // Step validation
    const [currentStep, setCurrentStep] = useState(1);
    const [validating, setValidating] = useState(false);
    const [validation, setValidation] = useState<StepValidation | null>(null);
    const [problemSteps, setProblemSteps] = useState<string[]>([
        'Understand the problem',
        'Plan your solution',
        'Solve step by step',
        'Check your answer'
    ]);

    // Translations
    const t = {
        es: {
            studentBoard: '📝 Tu Pizarra',
            novaBoard: '🤖 Pizarra de Nova',
            step: 'Paso',
            of: 'de',
            validateStep: 'Validar Paso',
            nextStep: 'Siguiente Paso',
            clear: 'Limpiar',
            download: 'Descargar',
            pen: 'Lápiz',
            eraser: 'Borrador',
            checking: 'Revisando...',
            correct: '¡Correcto!',
            incorrect: 'Intenta de nuevo',
            hint: 'Pista',
            great: '¡Excelente trabajo!',
            tryAgain: 'Vamos a intentarlo de nuevo',
            problemSteps: [
                'Entender el problema',
                'Planear tu solución',
                'Resolver paso a paso',
                'Verificar tu respuesta'
            ]
        },
        en: {
            studentBoard: '📝 Your Board',
            novaBoard: '🤖 Nova\'s Board',
            step: 'Step',
            of: 'of',
            validateStep: 'Validate Step',
            nextStep: 'Next Step',
            clear: 'Clear',
            download: 'Download',
            pen: 'Pen',
            eraser: 'Eraser',
            checking: 'Checking...',
            correct: 'Correct!',
            incorrect: 'Try again',
            hint: 'Hint',
            great: 'Great work!',
            tryAgain: 'Let\'s try again',
            problemSteps: [
                'Understand the problem',
                'Plan your solution',
                'Solve step by step',
                'Check your answer'
            ]
        },
        bilingual: {
            studentBoard: '📝 Tu Pizarra / Your Board',
            novaBoard: '🤖 Pizarra de Nova / Nova\'s Board',
            step: 'Paso / Step',
            of: 'de / of',
            validateStep: 'Validar Paso / Validate Step',
            nextStep: 'Siguiente Paso / Next Step',
            clear: 'Limpiar / Clear',
            download: 'Descargar / Download',
            pen: 'Lápiz / Pen',
            eraser: 'Borrador / Eraser',
            checking: 'Revisando... / Checking...',
            correct: '¡Correcto! / Correct!',
            incorrect: 'Intenta de nuevo / Try again',
            hint: 'Pista / Hint',
            great: '¡Excelente trabajo! / Great work!',
            tryAgain: 'Vamos a intentarlo de nuevo / Let\'s try again',
            problemSteps: [
                'Entender el problema / Understand the problem',
                'Planear tu solución / Plan your solution',
                'Resolver paso a paso / Solve step by step',
                'Verificar tu respuesta / Check your answer'
            ]
        }
    };

    const labels = t[language] || t.es;

    // Initialize canvases
    useEffect(() => {
        initializeCanvas(studentCanvasRef, setStudentContext);
        initializeCanvas(novaCanvasRef, setNovaContext);
        setProblemSteps(labels.problemSteps);
    }, []);

    const initializeCanvas = (
        canvasRef: React.RefObject<HTMLCanvasElement>,
        setContext: (ctx: CanvasRenderingContext2D | null) => void
    ) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                setContext(ctx);
            }
        }
    };

    // Drawing handlers for student board
    useEffect(() => {
        if (studentContext) {
            studentContext.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            studentContext.lineWidth = brushSize;
        }
    }, [color, brushSize, tool, studentContext]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!studentContext) return;
        setStudentDrawing(true);
        const { x, y } = getCoordinates(e, studentCanvasRef);
        studentContext.beginPath();
        studentContext.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!studentDrawing || !studentContext) return;
        const { x, y } = getCoordinates(e, studentCanvasRef);
        studentContext.lineTo(x, y);
        studentContext.stroke();
    };

    const stopDrawing = () => {
        if (!studentContext) return;
        studentContext.closePath();
        setStudentDrawing(false);
    };

    const getCoordinates = (
        e: React.MouseEvent | React.TouchEvent,
        canvasRef: React.RefObject<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const clearBoard = (
        canvasRef: React.RefObject<HTMLCanvasElement>,
        context: CanvasRenderingContext2D | null
    ) => {
        if (!context || !canvasRef.current) return;
        const canvas = canvasRef.current;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadBoard = (canvasRef: React.RefObject<HTMLCanvasElement>, boardName: string) => {
        if (!canvasRef.current) return;
        const url = canvasRef.current.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${boardName}_${new Date().getTime()}.png`;
        a.click();
    };

    // Step validation (simulated - in real app, this would call AI)
    const validateCurrentStep = async () => {
        setValidating(true);
        setValidation(null);

        // Simulate AI validation with timeout
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock validation result (in production, analyze canvas content with AI)
        const isValid = Math.random() > 0.3; // 70% success rate for demo

        const feedback = isValid
            ? studentAge <= 7 ? labels.great : labels.correct
            : labels.tryAgain;

        const hints = !isValid ? [
            language === 'es' ? 'Revisa tu operación' : 'Check your operation',
            language === 'es' ? 'Recuerda llevar las unidades' : 'Remember to carry the units'
        ] : undefined;

        setValidation({ isValid, feedback, hints });
        setValidating(false);

        if (isValid && currentStep < problemSteps.length) {
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
                setValidation(null);
                drawNovaGuidance(currentStep + 1);
            }, 2000);
        }
    };

    // Draw Nova's guidance on her board
    const drawNovaGuidance = (step: number) => {
        if (!novaContext || !novaCanvasRef.current) return;

        const canvas = novaCanvasRef.current;
        const ctx = novaContext;

        // Clear Nova's board
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw example guidance based on step
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#4f46e5';
        ctx.textAlign = 'center';
        ctx.fillText(`${labels.step} ${step}: ${problemSteps[step - 1]}`, canvas.width / 2, 60);

        // Draw example visual guide (simplified)
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.stroke();
    };

    return (
        <div className="h-full flex flex-col space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-in">
            {/* Header with Step Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-purple-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                            {currentStep}
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-purple-800">
                                {labels.step} {currentStep} {labels.of} {problemSteps.length}
                            </h3>
                            <p className="text-purple-600 font-bold">{problemSteps[currentStep - 1]}</p>
                        </div>
                    </div>

                    {/* Validation Status */}
                    {validation && (
                        <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-lg ${
                            validation.isValid
                                ? 'bg-green-100 text-green-700 border-4 border-green-300'
                                : 'bg-orange-100 text-orange-700 border-4 border-orange-300'
                        }`}>
                            {validation.isValid ? (
                                <>
                                    <CheckCircle className="w-6 h-6" />
                                    {validation.feedback}
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-6 h-6" />
                                    {validation.feedback}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* TTS Controls for Step Instructions */}
                <div className="mt-4 flex justify-center">
                    <TTSControls
                        text={problemSteps[currentStep - 1]}
                        language={language}
                        studentAge={studentAge}
                        autoPlay={false}
                    />
                </div>

                {/* Validation Feedback TTS */}
                {validation && (
                    <div className="mt-4 flex justify-center">
                        <TTSControls
                            text={validation.feedback}
                            language={language}
                            studentAge={studentAge}
                            autoPlay={true}
                        />
                    </div>
                )}

                {/* Hints */}
                {validation && !validation.isValid && validation.hints && (
                    <div className="mt-4 bg-yellow-50 border-4 border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-black text-yellow-800 mb-2">{labels.hint}:</h4>
                                <ul className="space-y-1">
                                    {validation.hints.map((hint, idx) => (
                                        <li key={idx} className="text-yellow-700 font-bold">• {hint}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dual Boards Container */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Student Board */}
                <div className="flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-blue-200">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 font-black text-lg">
                        {labels.studentBoard}
                    </div>
                    <div className="flex-1 relative">
                        <canvas
                            ref={studentCanvasRef}
                            className="absolute inset-0 w-full h-full cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>
                </div>

                {/* Nova's Board */}
                <div className="flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-purple-200">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 font-black text-lg">
                        {labels.novaBoard}
                    </div>
                    <div className="flex-1 relative bg-gradient-to-br from-purple-50 to-pink-50">
                        <canvas
                            ref={novaCanvasRef}
                            className="absolute inset-0 w-full h-full"
                        />
                    </div>
                </div>
            </div>

            {/* Tools & Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-purple-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Drawing Tools */}
                    <div className="flex items-center gap-2">
                        {/* Tool Selector */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTool('pen')}
                                className={`p-3 rounded-xl font-bold transition-all ${
                                    tool === 'pen'
                                        ? 'bg-blue-500 text-white shadow-lg scale-110'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={labels.pen}
                            >
                                <PenTool className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`p-3 rounded-xl font-bold transition-all ${
                                    tool === 'eraser'
                                        ? 'bg-blue-500 text-white shadow-lg scale-110'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                title={labels.eraser}
                            >
                                <Eraser className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Color Palette */}
                        <div className="flex gap-1 px-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${
                                        color === c ? 'ring-4 ring-purple-500 scale-125' : 'hover:scale-110'
                                    }`}
                                    style={{
                                        backgroundColor: c,
                                        border: c === '#FFFFFF' ? '2px solid #ddd' : 'none',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Brush Size */}
                        <div className="flex gap-1 px-2 border-l-2 border-gray-200">
                            {BRUSH_SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setBrushSize(size)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                        brushSize === size
                                            ? 'bg-purple-500 text-white scale-110'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <div
                                        className="rounded-full bg-current"
                                        style={{ width: size * 2, height: size * 2 }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => clearBoard(studentCanvasRef, studentContext)}
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            {labels.clear}
                        </button>
                        <button
                            onClick={() => downloadBoard(studentCanvasRef, 'student_work')}
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {labels.download}
                        </button>

                        {/* Step Validation Button */}
                        <button
                            onClick={validateCurrentStep}
                            disabled={validating}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-black text-lg transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                        >
                            {validating ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    {labels.checking}
                                </>
                            ) : validation?.isValid ? (
                                <>
                                    <ArrowRight className="w-5 h-5" />
                                    {labels.nextStep}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    {labels.validateStep}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DualWhiteboard;
