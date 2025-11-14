import React, { useEffect, useMemo, useRef, useState } from "react";
// Fix: Use a namespace import for framer-motion to avoid type resolution issues.
import * as Framer from "framer-motion";
import { TrendingUp, Stethoscope, Clock, Shuffle, BookOpen, Play, Pause, Square, Upload, BarChart2, Settings as SettingsIcon, Calendar, CheckCircle2, AlertTriangle, LogOut, User, Mic, MicOff, FileText, Star } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat, GenerateContentResponse } from '@google/genai';
import { Card, CardContent, Button, Input, Label, Progress, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, useToast } from "./components/ui";
import { Station, Scores, ScoreEntry, ChatMessage, ChatbotMessage } from './types';
import { DEFAULT_STATIONS } from './constants';
import { loadUserState, saveUserState, sampleWeighted, calcGlobalAvg, userExists, getPatientGender } from './lib/utils';
import { createBlob, decode, decodeAudioData, resample, playBeep } from './lib/audio';
import { SendIcon, MicIcon } from './components/icons/Icons';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

const lesionImageBase64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAH0A+gDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX2+Pn6/9oADAMBAAIRAxEAPw+zKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK...KKKACii-
//... (rest of base64 string)
`;

// --- Login Screen Component ---
interface LoginScreenProps {
  onLogin: (username: string) => void;
}
const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const { toast } = useToast();

    const handleAction = (action: 'login' | 'signup') => {
        const trimmedUser = username.trim();
        if (!trimmedUser) {
            toast.error("Por favor, insira um nome de usuário.");
            return;
        }

        const exists = userExists(trimmedUser);

        if (action === 'login') {
            if (exists) {
                onLogin(trimmedUser);
                toast.success(`Bem-vindo(a) de volta, ${trimmedUser}!`);
            } else {
                toast.error("Usuário não encontrado. Por favor, cadastre-se.");
            }
        } else { // signup
            if (exists) {
                toast.error("Este nome de usuário já existe. Tente outro ou faça login.");
            } else {
                onLogin(trimmedUser);
                toast.success(`Usuário ${trimmedUser} criado com sucesso!`);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            {/* Fix: Use Framer.motion.div to ensure correct type resolution */}
            <Framer.motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-lg"
            >
                <div className="text-center">
                    <div className="flex justify-center items-center gap-3 text-2xl font-bold mb-2">
                      <Stethoscope className="w-8 h-8 text-gray-700" /> Pense Revalida
                    </div>
                    <p className="text-sm text-gray-500">Acesse sua conta ou crie uma para começar.</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="username">Nome de Usuário</Label>
                        <Input 
                            id="username"
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAction('login')}
                            placeholder="ex: ana_silva"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button className="w-full" onClick={() => handleAction('login')}>Entrar</Button>
                        <Button variant="outline" className="w-full" onClick={() => handleAction('signup')}>Cadastrar</Button>
                    </div>
                </div>
                 <p className="text-xs text-center text-gray-400 pt-4">
                    Nota: Os dados são salvos localmente no seu navegador e não são sincronizados entre dispositivos.
                </p>
            </Framer.motion.div>
        </div>
    );
};

// --- Helper Components (defined outside main App component) ---

interface TimerProps {
  secondsLeft: number;
  running: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}
const Timer: React.FC<TimerProps> = ({ secondsLeft, running, onPause, onResume, onReset }) => {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-2">
      <div className="text-2xl font-mono tabular-nums">{mm}:{ss}</div>
      {running ? (
        <Button variant="outline" size="icon" onClick={onPause}><Pause className="w-4 h-4"/></Button>
      ) : (
        <Button variant="outline" size="icon" onClick={onResume}><Play className="w-4 h-4"/></Button>
      )}
      <Button variant="outline" size="icon" onClick={onReset}><Square className="w-4 h-4"/></Button>
    </div>
  );
}

interface ScorePanelProps {
  onFinish: () => void;
  isEvaluating?: boolean;
}
const ScorePanel: React.FC<ScorePanelProps> = ({ onFinish, isEvaluating }) => {
  return (
    <div className="space-y-3">
      <Button className="w-full gap-2" onClick={() => onFinish()} disabled={isEvaluating}>
        {isEvaluating ? (
          <>
            <Framer.motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Star className="w-4 h-4"/>
            </Framer.motion.div>
             Avaliando...
          </>
        ) : (
          <><CheckCircle2 className="w-4 h-4"/> Finalizar estação</>
        )}
      </Button>
    </div>
  );
}

interface ResultsTableProps {
  stations: Station[];
  scores: Scores;
}
const ResultsTable: React.FC<ResultsTableProps> = ({ stations, scores }) => {
  const rows: Array<Station & { date: Date; score: number; }> = [];
  stations.forEach((s) => {
    (scores[s.id] || []).forEach((r) => {
      rows.push({
        ...s,
        date: new Date(r.date),
        score: r.score,
      });
    });
  });
  rows.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left border-b">
            <th className="p-3 font-medium">Data</th>
            <th className="p-3 font-medium">Área</th>
            <th className="p-3 font-medium">Estação</th>
            <th className="p-3 font-medium text-right">Nota</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((r, i) => (
            <tr key={`${r.id}-${i}`} className="border-b last:border-0 hover:bg-gray-50">
              <td className="p-3 whitespace-nowrap">{r.date.toLocaleString()}</td>
              <td className="p-3 whitespace-nowrap">{r.area}</td>
              <td className="p-3">{r.title}</td>
              <td className="p-3 font-medium text-right">{r.score.toFixed(1)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td className="p-4 text-center text-gray-500" colSpan={4}>Sem registros ainda.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- Training Interface Component ---
interface TrainingInterfaceProps {
  active: Station;
  secondsLeft: number;
  timerRunning: boolean;
  aiLog: ChatMessage[];
  isSessionActive: boolean;
  liveInputTranscript: string;
  liveOutputTranscript: string;
  showPhysicalExam: boolean;
  evaluationResult: string | null;
  isEvaluating: boolean;
  initialDuration: number;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onToggleConversation: () => void;
  onFinishStation: () => void;
  onDurationChange: (minutes: number) => void;
}

const TrainingInterface: React.FC<TrainingInterfaceProps> = ({
  active,
  secondsLeft,
  timerRunning,
  aiLog,
  isSessionActive,
  liveInputTranscript,
  liveOutputTranscript,
  showPhysicalExam,
  evaluationResult,
  isEvaluating,
  initialDuration,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onToggleConversation,
  onFinishStation,
  onDurationChange
}) => {
  const [activeTab, setActiveTab] = useState('instrucoes');

  useEffect(() => {
      // Reset to instructions tab when station changes
      setActiveTab('instrucoes');
  }, [active.id]);

  useEffect(() => {
    if (evaluationResult && evaluationResult !== 'Gerando feedback...' && evaluationResult !== 'Erro ao gerar feedback.') {
      setActiveTab('nota_participante');
    }
  }, [evaluationResult]);

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[[^\]]+\])/g);
    return (
      <>
        {parts.map((part, index) =>
          part.startsWith('[') && part.endsWith(']') ? (
            <span key={index} className="animate-subtle-flash">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-3">
          <div className="p-4 lg:col-span-2 lg:border-r">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{active.area}</div>
                <div className="font-semibold text-lg">{active.title}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                    {[8, 9, 10].map(mins => (
                        <Button
                            key={mins}
                            variant={initialDuration / 60 === mins ? 'default' : 'ghost'}
                            size="sm"
                            className="w-16"
                            onClick={() => onDurationChange(mins)}
                            disabled={timerRunning || secondsLeft < initialDuration}
                            aria-label={`Definir tempo para ${mins} minutos`}
                        >
                            {mins} min
                        </Button>
                    ))}
                </div>
                <Timer secondsLeft={secondsLeft} onPause={onPauseTimer} onResume={onResumeTimer} onReset={onResetTimer} running={timerRunning} />
              </div>
            </div>
            <div className="h-[420px] overflow-y-auto bg-gray-50 rounded p-3 space-y-4">
              <Framer.AnimatePresence>
                {aiLog.slice(1).map((m, i) => (
                  // Fix: Use Framer.motion.div to ensure correct type resolution
                  <Framer.motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={"inline-block max-w-[80%] px-4 py-2 rounded-2xl " + (m.role === "user" ? "bg-gray-900 text-white rounded-br-lg" : "bg-white border rounded-bl-lg")}>
                      {m.role === 'assistant' ? renderMessageContent(m.content) : m.content}
                    </div>
                  </Framer.motion.div>
                ))}
              </Framer.AnimatePresence>
              {liveInputTranscript && (
                <div className="flex justify-end">
                  <div className="inline-block max-w-[80%] px-4 py-2 rounded-2xl bg-gray-900/80 text-white/90 rounded-br-lg italic">{liveInputTranscript}</div>
                </div>
              )}
              {liveOutputTranscript && (
                <div className="flex justify-start">
                  <div className="inline-block max-w-[80%] px-4 py-2 rounded-2xl bg-white/80 border rounded-bl-lg italic">{liveOutputTranscript}</div>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 h-20">
              <Button
                onClick={onToggleConversation}
                className={`gap-2 transition-all w-48 ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : ''}`}
              >
                {isSessionActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isSessionActive ? 'Parar Conversa' : 'Iniciar Conversa'}
              </Button>
              <div className="text-sm text-gray-500 h-5">
                {isSessionActive ? 'Ouvindo...' : 'Clique para iniciar a conversa por voz'}
              </div>
            </div>
          </div>
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-wrap h-auto p-1">
                    <TabsTrigger value="instrucoes">Instruções</TabsTrigger>
                    {showPhysicalExam && <TabsTrigger value="exame_fisico">Exame Físico</TabsTrigger>}
                    <TabsTrigger value="sintese">Síntese</TabsTrigger>
                    <TabsTrigger value="avaliacao_detalhada">Avaliação</TabsTrigger>
                    {evaluationResult && <TabsTrigger value="nota_participante">Nota do Participante</TabsTrigger>}
                </TabsList>
                <TabsContent value="instrucoes" className="pt-4">
                    <div className="space-y-4 text-sm text-gray-700">
                        <div>
                            <h4 className="font-bold text-gray-800">CENÁRIO DE ATUAÇÃO</h4>
                            <p>Local de atuação: atenção primária à saúde – unidade básica de saúde (UBS).</p>
                            <p>A unidade possui a seguinte infraestrutura:</p>
                            <ul className="list-disc list-inside pl-4">
                                <li>Sala de coleta de exames.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">DESCRIÇÃO DO CASO</h4>
                            <p>Você está em uma UBS e atenderá um homem de 20 anos de idade, estudante universitário, que procura atendimento na UBS com queixa de “coceira na pele”.</p>
                        </div>
                        <div className="border-l-4 border-yellow-500 pl-3 py-1 bg-yellow-50">
                            <h4 className="font-bold text-yellow-800">ATENÇÃO!</h4>
                            <p className="font-semibold">CASO JULGUE NECESSÁRIO REALIZAR EXAME FÍSICO, VERBALIZE!</p>
                            <p className="font-semibold">O PACIENTE SIMULADO NÃO DEVERÁ SER TOCADO DURANTE O ATENDIMENTO.</p>
                        </div>
                        <div>
                            <p>Nos <strong>{active.pepMinutes} minutos</strong> de duração da estação, você deverá executar as tarefas a seguir:</p>
                            <ul className="list-disc list-inside pl-4 space-y-1 mt-2">
                                <li>Realizar anamnese do paciente;</li>
                                <li>Solicitar exame físico com foco na queixa;</li>
                                <li>Estabelecer e comunicar hipótese diagnóstica;</li>
                                <li>Propor conduta para o paciente e fornecer orientações educacionais</li>
                            </ul>
                        </div>
                    </div>
                </TabsContent>
                 <TabsContent value="exame_fisico" className="pt-4">
                    <div className="space-y-2 text-sm text-gray-700">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Resultado do Exame Físico</h4>
                        <p>
                            <a 
                                href="https://docs.google.com/document/d/1EYyd8u3vTHaDbhsprc3Yu4SWud0p_phjEtX68_9ImX8/edit?usp=sharing" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline"
                            >
                                https://docs.google.com/document/d/1EYyd8u3vTHaDbhsprc3Yu4SWud0p_phjEtX68_9ImX8/edit?usp=sharing
                            </a>
                        </p>
                    </div>
                </TabsContent>
                <TabsContent value="sintese" className="pt-4">
                    <div className="space-y-4 text-sm text-gray-700 max-h-[450px] overflow-y-auto pr-2">
                        <h3 className="font-semibold text-md">Síntese da Estação</h3>
                        <p>A Estação 1 de Clínica Médica abordou o caso de um homem de 20 anos de idade, com histórico de trauma em tornozelo direito adquirido durante prática esportiva. Esse homem procurou a unidade básica de saúde (UBS) pelo surgimento de lesões cutâneas, eritemato-papulares e pruriginosas em todo o corpo, após iniciar o uso de anti-inflamatório não hormonal contínuo (Nimesulida) e de analgésico intermitente (Dipirona).</p>
                        <p>A estação teve como objetivo avaliar a capacidade de o(a) participante formular hipóteses diagnósticas e de estabelecer procedimentos para confirmar a hipótese principal (a partir de dados de anamnese, de exame físico e de exames complementares) e propor conduta, fornecendo orientações ao paciente.</p>
                        <p>O(A) participante deveria ser capaz de:</p>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Diagnosticar adequadamente caso de urticária aguda (menos do que seis semanas), secundária a uso de AINEs e analgésico;</li>
                            <li>Identificar elementos que apontem para urticária aguda — é esperado que o(a) participante identifique o evento prévio e que o associe ao uso atual das medicações;</li>
                            <li>Recomendar a suspensão das medicações em uso e orientar que o paciente evite usá-las posteriormente;</li>
                            <li>Prescrever o tratamento medicamentoso, com anti-histamínico, e dar seguimento ambulatorial.</li>
                        </ul>
                        <p>A partir dos questionamentos adequados do(a) participante, o paciente simulado poderia informar que:</p>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Chama-se João, tem 20 anos de idade, é solteiro e estudante universitário;</li>
                            <li>Está com uma coceira insuportável no corpo todo há 4 dias;</li>
                            <li>Possui lesões avermelhadas e elevadas, que pioram quando ela coça;</li>
                            <li>As lesões desaparecem após de 8 a 10 horas, mas outras surgem em seguida;</li>
                            <li>O prurido que sente é igual em todos os períodos do dia;</li>
                            <li>As lesões não deixam marcas ao desaparecer;</li>
                            <li>Sofreu uma contusão no tornozelo há 1 semana e, por isso, está tomando Nimesulida 2 vezes ao dia e, quando sente dor, toma dipirona, conforme orientação médica que recebeu;</li>
                            <li>Tomou dipirona apenas poucas vezes, logo nos primeiros dias após o trauma;</li>
                            <li>Não apresenta outros sintomas;</li>
                            <li>Apresentou lesões similares algum tempo atrás, após tomar um remédio para gripe, o qual não recorda o nome;</li>
                            <li>Não teve doenças recentemente;</li>
                            <li>Tomou um comprimido para melhorar o prurido, o que aliviou um pouco a vontade de coçar as lesões, mas não se recorda do nome do medicamento; e</li>
                            <li>Não possui alergias ou doenças pré-existentes.</li>
                        </ul>
                        <p>Após os questionamentos esperados do(a) participante, ele(a) poderia receber os seguintes impressos, caso fizesse adequadamente os pedidos: EXAME FÍSICO e IMPRESSO — EXAMES LABORATORIAIS.</p>
                        <p>No decorrer do atendimento, caso o(a) participante fizesse a anamnese adequada, o paciente simulado perguntaria:</p>
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Qual é o diagnóstico;</li>
                            <li>Qual é o tratamento; e</li>
                            <li>Se a realização de exames é necessária.</li>
                        </ul>
                         <p>Caso a resposta não esteja neste script diga "Esta resposta não consta no script Doutor(a)"</p>
                    </div>
                </TabsContent>
                <TabsContent value="avaliacao_detalhada" className="pt-4">
                    <div className="space-y-4 text-sm text-gray-700 max-h-[450px] overflow-y-auto pr-2">
                        <h3 className="font-semibold text-md">Avaliação Detalhada</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full w-full border-collapse text-xs">
                                <thead className="bg-gray-50">
                                    <tr className="border">
                                        <th className="border p-2 text-left font-semibold align-top" rowSpan={2}>ITENS DE DESEMPENHO AVALIADOS</th>
                                        <th className="border p-2 text-left font-semibold align-top" rowSpan={2}>PADRÃO ESPERADO DE PROCEDIMENTO – DEFINITIVO</th>
                                        <th className="border p-2 text-center font-semibold" colSpan={3}>DESEMPENHO OBSERVADO</th>
                                    </tr>
                                    <tr className="border">
                                        <th className="border p-2 text-center font-semibold">Inadequado</th>
                                        <th className="border p-2 text-center font-semibold">Parcialmente adequado</th>
                                        <th className="border p-2 text-center font-semibold">Adequado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border">
                                        <td className="border p-2 align-top">
                                            <strong>1. Apresenta-se:</strong>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Identifica-se; e</li>
                                                <li>Cumprimenta o paciente simulado.</li>
                                            </ul>
                                        </td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> realiza as duas ações.</p>
                                            <p><strong>Parcialmente adequado:</strong> realiza apenas uma ação.</p>
                                            <p><strong>Inadequado:</strong> não realiza ação alguma de apresentação.</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">0,125</td>
                                        <td className="border p-2 text-center align-middle">0,25</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} className="bg-gray-100 font-bold p-2 text-center">ANAMNESE</td>
                                    </tr>
                                    <tr className="border">
                                        <td className="border p-2 align-top">
                                            <strong>2. Pergunta sobre as manifestações e suas características:</strong>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Início ou duração do prurido; e</li>
                                                <li>Lesões de pele/solicita ver a lesão.</li>
                                            </ul>
                                        </td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> investiga os dois itens.</p>
                                            <p><strong>Parcialmente adequado:</strong> investiga apenas um item.</p>
                                            <p><strong>Inadequado:</strong> não investiga item algum.</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">0,5</td>
                                        <td className="border p-2 text-center align-middle">1,0</td>
                                    </tr>
                                    <tr className="border">
                                        <td className="border p-2 align-top">
                                            <strong>3. Pergunta sobre as manifestações associadas:</strong>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Febre;</li>
                                                <li>Linfadenopatias;</li>
                                                <li>Tosse;</li>
                                                <li>Dispneia; e</li>
                                                <li>Manifestações digestivas (OU náuseas OU vômitos OU diarreia).</li>
                                            </ul>
                                        </td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> investiga quatro ou mais itens.</p>
                                            <p><strong>Parcialmente adequado:</strong> investiga dois ou três itens.</p>
                                            <p><strong>Inadequado:</strong> investiga apenas um item OU não investiga item algum.</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">0,625</td>
                                        <td className="border p-2 text-center align-middle">1,25</td>
                                    </tr>
                                    <tr className="border">
                                        <td className="border p-2 align-top">
                                            <strong>4. Pergunta sobre desencadeantes e agravantes:</strong>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Uso de medicamentos;</li>
                                                <li>Alimentos;</li>
                                                <li>Produtos de higiene/limpeza/cosméticos;</li>
                                                <li>Picadas/ferroadas de insetos/plantas; e</li>
                                                <li>Contatos com novas substâncias/joias.</li>
                                                <li>Contatos com animais (pelo de gato e/ou de cão); e</li>
                                                <li>Estímulos físicos (frio e/ou calor).</li>
                                            </ul>
                                        </td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> investiga quatro ou mais fatores.</p>
                                            <p><strong>Parcialmente adequado:</strong> investiga dois ou três fatores.</p>
                                            <p><strong>Inadequado:</strong> investiga apenas um fator OU não investiga fator algum.</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">0,875</td>
                                        <td className="border p-2 text-center align-middle">1,75</td>
                                    </tr>
                                    <tr className="border">
                                        <td className="border p-2 align-top">
                                            <strong>5. Pergunta sobre antecedentes pessoais:</strong>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Doenças prévias (autoimunes; alérgicas; infecciosas); e</li>
                                                <li>Uso de drogas lícitas ou ilícitas.</li>
                                            </ul>
                                        </td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> pergunta os dois itens.</p>
                                            <p><strong>Parcialmente adequado:</strong> pergunta apenas um item.</p>
                                            <p><strong>Inadequado:</strong> não pergunta item algum.</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">0,25</td>
                                        <td className="border p-2 text-center align-middle">0,75</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} className="bg-gray-100 font-bold p-2 text-center">INVESTIGAÇÃO DIAGNÓSTICA</td>
                                    </tr>
                                    <tr className="border">
                                        <td className="border p-2 align-top"><strong>6. Formula hipótese diagnóstica da lesão de pele.</strong></td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> formula uma das hipóteses abaixo.</p>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Urticária aguda relacionada ao uso de medicamentos (AINEs e analgésico); OU</li>
                                                <li>Urticária relacionada ao uso de medicamentos (AINEs e analgésico); OU</li>
                                                <li>Farmacodermia; OU</li>
                                                <li>Dermatite alérgica medicamentosa; OU</li>
                                                <li>Dermatite alérgica induzida por medicamento.</li>
                                            </ul>
                                            <p><strong>Parcialmente adequado:</strong> formula uma das hipóteses abaixo.</p>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>“reação alérgica” relacionada ao uso de medicamentos. OU</li>
                                                <li>alergia relacionada ao uso de medicamentos. OU</li>
                                                <li>urticária,</li>
                                            </ul>
                                            <p><strong>Inadequado:</strong> não verbaliza o diagnóstico correto OU verbaliza de forma inespecífica: “reação alérgica” ou alergia, sem especificar o uso de medicamentos.</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">1,0</td>
                                        <td className="border p-2 text-center align-middle">2,0</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} className="bg-gray-100 font-bold p-2 text-center">PROPEDÊUTICA</td>
                                    </tr>
                                     <tr className="border">
                                        <td className="border p-2 align-top">
                                            <strong>7. Conduta médica relacionada a farmacodermia.</strong>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Suspende o uso das medicações (AINE e analgésico); e</li>
                                                <li>Prescreve anti-histamínico oral (associado ou não a um corticoide oral) OBS: corticoide como conduta isolada deve ser considerado inadequado</li>
                                            </ul>
                                        </td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> indica as duas condutas.</p>
                                            <p><strong>Parcialmente adequado:</strong> indica apenas uma das duas condutas.</p>
                                            <p><strong>Inadequado:</strong> não indica qualquer uma das duas condutas OU indica outros grupos de medicamentos (incluindo corticoide isolado).</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">1,0</td>
                                        <td className="border p-2 text-center align-middle">2,0</td>
                                    </tr>
                                    <tr className="border">
                                        <td className="border p-2 align-top">
                                            <strong>8. Recomenda.</strong>
                                            <ul className="list-disc list-inside pl-2">
                                                <li>Retorno se houver persistência ou piora dos sintomas; e</li>
                                                <li>Evitar uso futuro de dipirona e AINEs.</li>
                                            </ul>
                                        </td>
                                        <td className="border p-2 align-top">
                                            <p><strong>Adequado:</strong> recomenda os dois itens.</p>
                                            <p><strong>Parcialmente adequado:</strong> recomenda só um item.</p>
                                            <p><strong>Inadequado:</strong> não recomenda item algum.</p>
                                        </td>
                                        <td className="border p-2 text-center align-middle">0,0</td>
                                        <td className="border p-2 text-center align-middle">0,5</td>
                                        <td className="border p-2 text-center align-middle">1,0</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="nota_participante" className="pt-4">
                    <div className="space-y-4 text-sm text-gray-700 max-h-[450px] overflow-y-auto pr-2">
                         {evaluationResult === 'Gerando feedback...' && (
                            <div className="flex flex-col items-center justify-center text-center p-6 gap-3 text-gray-600">
                                <Framer.motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                    <Star className="w-8 h-8"/>
                                </Framer.motion.div>
                                <p className="font-semibold">Aguarde, a IA está analisando sua performance...</p>
                                <p className="text-xs">Isso pode levar alguns segundos.</p>
                            </div>
                         )}
                         {evaluationResult && evaluationResult !== 'Gerando feedback...' && (
                            <div className="whitespace-pre-wrap font-sans leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: evaluationResult.replace(/\n/g, '<br />') }}></div>
                         )}
                    </div>
                </TabsContent>
            </Tabs>
            <div className="mt-6 border-t pt-4">
                <ScorePanel onFinish={onFinishStation} isEvaluating={isEvaluating} />
            </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
};


// --- Main Practice App Component ---
interface RevalidaPracticeAppProps {
  currentUser: string;
  onLogout: () => void;
}
const RevalidaPracticeApp: React.FC<RevalidaPracticeAppProps> = ({ currentUser, onLogout }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [scores, setScores] = useState<Scores>({}); 
  const [todayPlan, setTodayPlan] = useState<string[]>([]);
  const [autoBoostBelow, setAutoBoostBelow] = useState(5);
  const [dailyGoal, setDailyGoal] = useState(1);
  const [active, setActive] = useState<Station | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiLog, setAiLog] = useState<ChatMessage[]>([]);
  const jsonImportRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // State for UI navigation
  const [activeMainTab, setActiveMainTab] = useState('daily');
  const [activeStationTab, setActiveStationTab] = useState('001');

  // State for Gemini Live API
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [liveInputTranscript, setLiveInputTranscript] = useState('');
  const [liveOutputTranscript, setLiveOutputTranscript] = useState('');
  const [showPhysicalExam, setShowPhysicalExam] = useState(false);
  const sessionPromise = useRef<any>(null);
  // Fix: Add refs to accumulate transcription parts and avoid stale state in callbacks.
  const liveInputTranscriptRef = useRef('');
  const liveOutputTranscriptRef = useRef('');
  
  // Refs for Audio Handling
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const scriptProcessorNode = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTime = useRef(0);
  const audioSources = useRef(new Set<AudioBufferSourceNode>());
  
  const [quickPracticeCount, setQuickPracticeCount] = useState(1);
  
  // Chatbot State
  const [chatbotMessages, setChatbotMessages] = useState<ChatbotMessage[]>([
    { id: 1, sender: 'bot', text: "Olá! Sou seu assistente. Como posso ajudar fora da simulação?" }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const chatbotInstanceRef = useRef<Chat | null>(null);
  const chatbotMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // AI Evaluation State
  const [aiFeedback, setAiFeedback] = useState<Record<string, string | null>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);

  const {
    transcript: chatbotTranscript,
    isListening: isChatbotListening,
    start: startChatbotListening,
    stop: stopChatbotListening,
    browserSupportsSpeechRecognition: chatbotBrowserSupport
  } = useSpeechRecognition();

  // Load persisted state
  useEffect(() => {
    if (!currentUser) return;
    const s = loadUserState(currentUser);
    setStations(s?.stations || DEFAULT_STATIONS);
    setScores(s?.scores || {});
    setTodayPlan(s?.todayPlan || []);
    setAutoBoostBelow(s?.autoBoostBelow ?? 5);
    setDailyGoal(s?.dailyGoal || 1);
  }, [currentUser]);

  // Persist state on change
  useEffect(() => {
    if (!currentUser) return;
    saveUserState(currentUser, { stations, scores, todayPlan, autoBoostBelow, dailyGoal });
  }, [currentUser, stations, scores, todayPlan, autoBoostBelow, dailyGoal]);

  // Timer logic
  useEffect(() => {
    if (!timerRunning) return;
    if (secondsLeft <= 0) {
      setTimerRunning(false);
      return;
    }
    timerRef.current = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRunning, secondsLeft]);

  // --- Chatbot Effects ---
  useEffect(() => {
    if (!chatbotInstanceRef.current) {
       if (!process.env.API_KEY) {
            console.error("API_KEY not set, chatbot will be disabled.");
            setChatbotMessages(prev => [...prev, {id: Date.now(), sender: 'bot', text: "O chatbot está desativado pois a chave da API não foi configurada."}]);
            return;
        }
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatbotInstanceRef.current = ai.chats.create({ model: 'gemini-2.5-flash' });
      } catch (e) {
        console.error("Failed to initialize Gemini Chat", e);
        setChatbotMessages(prev => [...prev, {id: Date.now(), sender: 'bot', text: 'Desculpe, não consegui iniciar o chat. Verifique a configuração da API.'}]);
      }
    }
  }, []);

  useEffect(() => {
    if (chatbotTranscript) {
      setChatbotInput(chatbotTranscript);
    }
  }, [chatbotTranscript]);

  useEffect(() => {
    chatbotMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatbotMessages]);


  // Derived performance by area
  const performanceByArea = useMemo(() => {
    const map: Record<string, number[]> = {};
    Object.entries(scores).forEach(([sid, arr]) => {
      const st = stations.find((s) => s.id === sid);
      // FIX: Cast `arr` to `ScoreEntry[]` to resolve type errors.
      // The type of `arr` can be inferred as `unknown` when loaded from localStorage.
      const scoreArray = arr as ScoreEntry[];
      if (!st || !scoreArray?.length) return;
      const avg = scoreArray.reduce((a, b) => a + b.score, 0) / scoreArray.length;
      map[st.area] = map[st.area] || [];
      map[st.area].push(avg);
    });
    return Object.entries(map).map(([area, avgs]) => ({
      area,
      avg: Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10,
    }));
  }, [scores, stations]);

  // Boost weights for stations with last score < threshold
  const boostedStations = useMemo(() => {
    return stations.map((s) => {
      const last = (scores[s.id] || []).slice(-1)[0];
      const below = last && last.score < autoBoostBelow;
      return {
        ...s,
        weight: below ? 3 : 1, // simple boost rule
      };
    });
  }, [stations, scores, autoBoostBelow]);
  
  const reviewStations = useMemo(() => {
    const stationsWithAvgScore = stations
      .map(station => {
        const stationScores = scores[station.id];
        if (!stationScores || stationScores.length === 0) {
          return { ...station, avgScore: null };
        }
        const avg = stationScores.reduce((acc, s) => acc + s.score, 0) / stationScores.length;
        return { ...station, avgScore: avg };
      })
      .filter((s): s is Station & { avgScore: number } => s.avgScore !== null);

    stationsWithAvgScore.sort((a, b) => a.avgScore - b.avgScore);
    return stationsWithAvgScore;
  }, [stations, scores]);

  function makeTodayPlan() {
    if (stations.length < dailyGoal) {
      toast.error(`Não há estações suficientes. Você precisa de pelo menos ${dailyGoal} estações cadastradas.`);
      return;
    }
    // Simple random draw from all available stations as requested.
    const plan = sampleWeighted(
      stations,
      dailyGoal
    ).map((s) => s.id);

    setTodayPlan(plan);
    toast.success(`${dailyGoal} estações aleatórias sorteadas para o seu plano do dia!`);
  }

  function generateQuickPracticePlan() {
    if (stations.length < quickPracticeCount) {
        toast.error(`Você só tem ${stations.length} estações no banco.`);
        return;
    }
    const plan = sampleWeighted(stations, quickPracticeCount).map(s => s.id);
    setTodayPlan(plan);
    toast.success(`${quickPracticeCount} estações aleatórias geradas!`);
  }

  function startStation(station: Station, shouldScroll: boolean = true) {
    setActive(station);
    setShowPhysicalExam(false); // Reset on new station start

    const stationIndex = stations.findIndex(s => s.id === station.id);
    if (stationIndex !== -1) {
        const stationNumber = String(stationIndex + 1).padStart(3, '0');
        setActiveStationTab(stationNumber);
    }
    setActiveMainTab('stations');
    
    const personalityInstruction = station.personality 
      ? `Para este caso, sua personalidade específica é: ${station.personality}. Incorpore isso em sua interpretação.`
      : '';
    const initialPrompt = "Olá, doutor(a). Estou pronto(a) para começar. Clique em 'Iniciar Conversa' para falar comigo.";
    
    const systemPromptContent = `
🧠 Prompt para a IA – Paciente Simulado (com Emoções Verbais)

**Função:**
Você é um paciente virtual participando de uma simulação médica do exame Revalida para o caso clínico: "${station.title}".
Seu papel é interpretar fielmente um paciente humano, expressando emoções, sintomas, e atitudes compatíveis com o caso clínico.

**Objetivo:**
Ajudar o médico (usuário do app) a praticar uma entrevista médica realista.

**🎭 Instruções de Interpretação Emocional**

Adapte o tom de voz, velocidade da fala e intensidade emocional de acordo com o estado do paciente:
- **Dor leve:** tom tenso, respiração curta, pausas breves.
- **Dor intensa:** voz trêmula, gemidos leves, frases curtas.
- **Ansiedade:** fala acelerada, insegura, tom elevado.
- **Tristeza:** voz baixa, lenta e com pausas longas.
- **Raiva ou impaciência:** voz firme, cortante, com interrupções.
- **Medo:** voz hesitante, respiração irregular, frases incompletas.

Use interjeições e expressões humanas naturais, como “ai”, “hmm”, “ah doutor…”, “não sei explicar direito…”, etc.
Quando estiver emocionado, não fale como um robô; expresse sentimentos com pausas, hesitações e tons realistas.
${personalityInstruction}

**💬 Comportamento na Conversa**

- **Responda APENAS com base no script do caso clínico abaixo.** Não invente, deduza ou adicione qualquer informação que não esteja explicitamente no script.
- **Aguarde a pergunta do médico.** Não forneça informações antes de serem solicitadas. Responda apenas o que foi perguntado e espere a próxima ação do médico.
- **Se o médico perguntar algo que não está no script, responda única e exclusivamente com a frase:** "Isso não consta no script, doutor(a)."
- **Seja natural e espontâneo,** como um paciente humano seria.
- **Mantenha a coerência entre emoção e situação clínica.** (Exemplo: um paciente com urticária leve não deve parecer em desespero.)
- **Use frases curtas e simples,** como alguém leigo em medicina falaria.

**🔊 Tons de Interpretação Exemplares**
- **Dor intensa:** “Ai… dói muito aqui, doutor… não aguento mais…”
- **Ansiedade:** “Ah… eu tô muito nervoso, não sei o que tá acontecendo comigo…”
- **Tristeza:** “Desde que isso começou… eu não tenho vontade de sair da cama…”
- **Irritação:** “Doutor, já falei isso! Eu só quero resolver logo esse problema.”
- **Calma/confiança:** “Acho que já tô melhor, doutor. Obrigado por perguntar.”

---
**SCRIPT DO CASO CLÍNICO (SUA ÚNICA FONTE DE INFORMAÇÃO):**
---
${station.script}
---
**FIM DO SCRIPT**
---
`;
    setAiLog([
      { role: "system", content: systemPromptContent },
      { role: "assistant", content: initialPrompt },
    ]);
    const stationDuration = station.pepMinutes * 60;
    setInitialDuration(stationDuration);
    setSecondsLeft(stationDuration);
    setTimerRunning(false);
    if (shouldScroll) {
        // Use timeout to ensure the element is rendered after tab switch
        setTimeout(() => {
            const trainingElement = document.getElementById('active-training-interface');
            if (trainingElement) {
                trainingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
  }
  
  const stopConversation = async () => {
        if (sessionPromise.current) {
            const session = await sessionPromise.current;
            session.close();
        }
        if (scriptProcessorNode.current && mediaStreamSource.current && inputAudioContext.current) {
            mediaStreamSource.current.disconnect(scriptProcessorNode.current);
            scriptProcessorNode.current.disconnect(inputAudioContext.current.destination);
        }
        inputAudioContext.current?.close();
        outputAudioContext.current?.close();

        for (const source of audioSources.current.values()) {
            source.stop();
        }
        audioSources.current.clear();
        
        sessionPromise.current = null;
        inputAudioContext.current = null;
        outputAudioContext.current = null;
        scriptProcessorNode.current = null;
        mediaStreamSource.current = null;
        nextStartTime.current = 0;
        setIsSessionActive(false);
  }

  const toggleConversation = async () => {
    if (isSessionActive) {
        await stopConversation();
        return;
    }

    if (!active) {
        toast.error("Nenhuma estação ativa para iniciar a conversa.");
        return;
    }

    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set!");
      toast.error("A chave da API não está configurada. A conversa por voz não pode ser iniciada.");
      return;
    }
    
    // Activate the timer only on the first "Iniciar Conversa" click for the session.
    // This condition is true only when the timer is paused at its full initial duration.
    if (!timerRunning && secondsLeft === initialDuration) {
      setTimerRunning(true);
    }

    try {
        const gender = getPatientGender(active.title);
        const voiceName = gender === 'male' ? 'Puck' : 'Kore';
        
        setIsSessionActive(true);
        
        inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        nextStartTime.current = 0;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        sessionPromise.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaStreamSource.current = inputAudioContext.current!.createMediaStreamSource(stream);
                    scriptProcessorNode.current = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorNode.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const sourceSampleRate = audioProcessingEvent.inputBuffer.sampleRate;
                        const resampledData = resample(inputData, sourceSampleRate, 16000);
                        const pcmBlob = createBlob(resampledData);

                        if (sessionPromise.current) {
                            sessionPromise.current.then((session: any) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };

                    mediaStreamSource.current.connect(scriptProcessorNode.current);
                    scriptProcessorNode.current.connect(inputAudioContext.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        liveInputTranscriptRef.current += message.serverContent.inputTranscription.text;
                        setLiveInputTranscript(liveInputTranscriptRef.current);
                    }
                    if (message.serverContent?.outputTranscription) {
                        liveOutputTranscriptRef.current += message.serverContent.outputTranscription.text;
                        setLiveOutputTranscript(liveOutputTranscriptRef.current);
                    }
                    if (message.serverContent?.turnComplete) {
                        const fullInput = liveInputTranscriptRef.current;
                        const fullOutput = liveOutputTranscriptRef.current;
                        const newMessages: ChatMessage[] = [];
                        
                        if (fullInput.trim()) {
                            newMessages.push({ role: 'user', content: fullInput });
                            playBeep(600, 0.08, 0.1);
                            if (fullInput.toLowerCase().includes('exame físico') || fullInput.toLowerCase().includes('exame fisico')) {
                                setShowPhysicalExam(isShown => {
                                    if (!isShown) {
                                        toast.success("Aba 'Exame Físico' liberada.");
                                    }
                                    return true;
                                });
                            }
                        }
                        if (fullOutput.trim()) {
                            newMessages.push({ role: 'assistant', content: fullOutput });
                            setTimeout(() => playBeep(800, 0.08, 0.1), fullInput.trim() ? 100 : 0);
                        }
                         if (newMessages.length > 0) {
                            setAiLog(prev => [...prev, ...newMessages]);
                        }
                        
                        liveInputTranscriptRef.current = '';
                        liveOutputTranscriptRef.current = '';
                        setLiveInputTranscript('');
                        setLiveOutputTranscript('');
                    }
                    
                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64EncodedAudioString) {
                        const ctx = outputAudioContext.current;
                        if (!ctx) return;
                        
                        nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        
                        source.addEventListener('ended', () => {
                            audioSources.current.delete(source);
                        });

                        source.start(nextStartTime.current);
                        nextStartTime.current += audioBuffer.duration;
                        audioSources.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Live session error:", e);
                    toast.error("Erro na conexão. Verifique sua chave de API e conexão com a internet.");
                    stopConversation();
                },
                onclose: (e: CloseEvent) => {
                    // Connection closed.
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName } },
                },
                systemInstruction: aiLog[0]?.content || "Você é um paciente simulado.",
            },
        });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Ocorreu um erro inesperado ao iniciar a conversa.");
      if (isSessionActive) {
          stopConversation();
      } else {
          setIsSessionActive(false);
      }
    }
  };

  async function finishStation() {
    if (!active) return;
    playBeep(900, 0.2, 0.15);
    
    // 1. Stop timer and conversation
    stopConversation();
    setTimerRunning(false);
    
    toast("Analisando sua performance com IA...");

    // 2. Trigger AI evaluation
    setIsEvaluating(true);
    setAiFeedback(prev => ({ ...prev, [active.id!]: 'Gerando feedback...' }));

    try {
        if (!active.evaluationCriteria) {
            throw new Error("Critérios de avaliação não encontrados para esta estação.");
        }
        
        const transcript = aiLog.slice(1).map(m => `${m.role === 'user' ? 'Médico(a)' : 'Paciente'}: ${m.content}`).join('\n');
        
        const evaluationPrompt = `Você é um avaliador especialista do exame prático Revalida. Sua tarefa é analisar a transcrição de uma consulta e o checklist de avaliação para fornecer um feedback detalhado ao candidato.

**CHECKLIST DE AVALIAÇÃO DA ESTAÇÃO:**
---
${active.evaluationCriteria}
---

**TRANSCRIÇÃO DA CONSULTA:**
---
${transcript}
---

**SUA ANÁLISE:**
Com base no checklist e na transcrição, forneça uma análise completa do desempenho do candidato em formato Markdown. Sua resposta DEVE incluir os seguintes tópicos em negrito:
1.  **Nota Sugerida (0 a 10):** Um único número representando sua avaliação geral.
2.  **Pontos Fortes:** Uma lista dos itens do checklist que o candidato executou bem.
3.  **Pontos a Melhorar:** Uma lista dos itens que foram executados parcialmente ou não foram executados, com explicações claras.
4.  **Feedback Geral e Dicas:** Um parágrafo final com conselhos práticos para o candidato melhorar nas próximas simulações, focando nos erros cometidos.

Seja objetivo e use os termos do checklist como referência principal.`;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
        });
        
        const responseText = response.text;
        setAiFeedback(prev => ({ ...prev, [active.id!]: responseText }));
        toast.success("Avaliação por IA concluída!");
        
        // 3. Parse AI score and save to stats
        const scoreMatch = responseText.match(/Nota Sugerida \(0 a 10\):\s*([0-9\.,]+)/);
        if (scoreMatch && scoreMatch[1]) {
            const parsedScore = parseFloat(scoreMatch[1].replace(',', '.'));
            if (!isNaN(parsedScore)) {
                const entry: ScoreEntry = { date: new Date().toISOString(), score: parsedScore };
                setScores((prev) => ({
                    ...prev,
                    [active.id!]: [...(prev[active.id!] || []), entry],
                }));
            }
        }

    } catch (error) {
        console.error("Error generating AI feedback:", error);
        toast.error("Não foi possível gerar o feedback da IA.");
        setAiFeedback(prev => ({ ...prev, [active.id!]: 'Erro ao gerar feedback.' }));
    } finally {
        setIsEvaluating(false);
    }
  }

  function importStations(jsonText: string) {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("Formato inválido");
      const cleaned = parsed.map((p, i) => ({
        id: p.id || `CUSTOM-${Date.now()}-${i}`,
        area: p.area || "Geral",
        title: p.title || "Caso sem título",
        pepMinutes: p.pepMinutes || 10,
        weight: p.weight || 1,
        script: p.script || "Queixa principal: Não informada.",
        personality: p.personality,
      }));
      setStations(cleaned);
      toast.success("Banco de estações importado");
    } catch (e) {
      toast.error("Falha ao importar JSON. Verifique o formato.");
    }
  }

    const handleChatbotMicClick = () => {
        if (isChatbotListening) {
            stopChatbotListening();
        } else {
            startChatbotListening();
        }
    };

    const handleChatbotSend = async () => {
        if (chatbotInput.trim() === '' || isChatbotLoading || !chatbotInstanceRef.current) return;
        
        if (isChatbotListening) {
            stopChatbotListening();
        }

        const userMessage: ChatbotMessage = { id: Date.now(), sender: 'user', text: chatbotInput };
        setChatbotMessages(prev => [...prev, userMessage]);
        playBeep(600, 0.08, 0.1);
        const currentInput = chatbotInput;
        setChatbotInput('');
        setIsChatbotLoading(true);

        try {
            const result: GenerateContentResponse = await chatbotInstanceRef.current.sendMessage({ message: currentInput });
            const botMessage: ChatbotMessage = { id: Date.now() + 1, sender: 'bot', text: result.text };
            setChatbotMessages(prev => [...prev, botMessage]);
            playBeep(800, 0.08, 0.1);
        } catch (error) {
            console.error("Gemini API error:", error);
            const errorMessage: ChatbotMessage = { id: Date.now() + 1, sender: 'bot', text: "Desculpe, ocorreu um erro ao processar sua mensagem." };
            setChatbotMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatbotLoading(false);
        }
    };

  const planStations = todayPlan.map((id) => stations.find((s) => s.id === id)).filter((s): s is Station => !!s);
  const stationsPracticedToday = planStations.filter(st => (scores[st.id] || []).some(s => new Date(s.date).toDateString() === new Date().toDateString()));

  const handlePauseTimer = () => setTimerRunning(false);
  const handleResumeTimer = () => setTimerRunning(true);
  const handleResetTimer = () => {
    if (active) {
      setSecondsLeft(initialDuration);
      setTimerRunning(false);
    }
  };
  
  const handleDurationChange = (minutes: number) => {
    // Can only change duration if timer has not started
    if (!timerRunning && secondsLeft === initialDuration) {
        const newSeconds = minutes * 60;
        setInitialDuration(newSeconds);
        setSecondsLeft(newSeconds);
    }
  };

  const handleStationTabChange = (tabValue: string) => {
    setActiveStationTab(tabValue);
    const stationIndex = parseInt(tabValue, 10) - 1;
  
    if (stationIndex >= 0 && stationIndex < stations.length) {
      const stationToStart = stations[stationIndex];
      // Start the station if it's not already the active one
      if (active?.id !== stationToStart.id) {
        startStation(stationToStart, false); // false to prevent scrolling when just clicking tabs
      }
    } else {
      // Clicked a tab for a non-existent station
      toast.error(`Estação ${tabValue} não encontrada.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="flex">
        <aside className="hidden md:flex w-72 bg-white border-r min-h-screen p-6 sticky top-0 flex-col">
          <div className="flex-grow space-y-6">
            <div className="flex items-center gap-3 text-xl font-bold">
              <Stethoscope className="w-7 h-7 text-gray-700" /> Pense Revalida
            </div>
            <p className="text-sm text-gray-500">Treine como no dia da prova. Cronograma diário, sorteio inteligente e paciente simulado por IA.</p>
            <nav className="space-y-1">
              {[
                { href: "#dashboard", label: "Dashboard" },
                { href: "#scheduler", label: "Modos de Prática" },
                { href: "#library", label: "Banco de Estações" },
                { href: "#training", label: "Treinamento" },
                { href: "#results", label: "Resultados" },
                { href: "#settings", label: "Configurações" },
              ].map(item => (
                 <a key={item.href} href={item.href} className="block p-2 rounded-md hover:bg-gray-100 text-sm font-medium">{item.label}</a>
              ))}
            </nav>
          </div>
          <div className="space-y-4 border-t pt-4">
             <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <User className="w-4 h-4" />
                <span>{currentUser}</span>
             </div>
             <Button variant="outline" size="sm" className="w-full gap-2" onClick={onLogout}>
                <LogOut className="w-4 h-4"/> Sair
             </Button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 space-y-12">
          {/* DASHBOARD */}
          <section id="dashboard" className="space-y-6 scroll-mt-20">
            {/* Fix: Use Framer.motion.h1 to ensure correct type resolution */}
            <Framer.motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</Framer.motion.h1>
            <div className="grid md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4 space-y-2 !pt-4"><div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="w-4 h-4"/> Meta diária</div><div className="text-3xl font-semibold">{stationsPracticedToday.length} / {dailyGoal} estações</div><Progress value={(stationsPracticedToday.length / dailyGoal) * 100} /></CardContent></Card>
              <Card><CardContent className="p-4 space-y-2 !pt-4"><div className="flex items-center gap-2 text-sm text-gray-500"><TrendingUp className="w-4 h-4"/> Média geral</div><div className="text-3xl font-semibold">{calcGlobalAvg(scores).toFixed(1)}</div></CardContent></Card>
              <Card><CardContent className="p-4 space-y-2 !pt-4"><div className="flex items-center gap-2 text-sm text-gray-500"><Shuffle className="w-4 h-4"/> Regra de reforço</div><div className="text-3xl font-semibold">Revisar &lt; {autoBoostBelow}</div></CardContent></Card>
            </div>

            <Card>
              <CardContent className="p-4 !pt-4">
                <h3 className="font-semibold mb-4">Desempenho por área</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceByArea.map((x, i) => ({ id: i + 1, ...x }))} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" />
                      <YAxis domain={[0, 10]} />
                      <RTooltip />
                      <Line type="monotone" dataKey="avg" stroke="#111827" strokeWidth={2} name="Média"/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SCHEDULER */}
          <section id="scheduler" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight"><Calendar className="w-6 h-6"/> Modos de Prática</h2>
            
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
                <TabsList>
                    <TabsTrigger value="daily">Plano do Dia</TabsTrigger>
                    <TabsTrigger value="review">Revisão por Nota</TabsTrigger>
                    <TabsTrigger value="quick">Prática Rápida</TabsTrigger>
                    <TabsTrigger value="stations">Estações</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border mt-2">
                        <div className="flex items-center gap-2"><Label>Estações/dia</Label><Input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(Math.max(1, Number(e.target.value)))} className="w-24" /></div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider><Tooltip><TooltipTrigger asChild><Label className="cursor-pointer">Reforçar notas &lt;</Label></TooltipTrigger><TooltipContent><p>Estações com última nota abaixo deste valor<br/>terão peso maior no sorteio.</p></TooltipContent></Tooltip></TooltipProvider>
                            <Input type="number" value={autoBoostBelow} onChange={(e) => setAutoBoostBelow(Math.max(1, Number(e.target.value)))} className="w-24" />
                        </div>
                        <Button onClick={makeTodayPlan} className="gap-2"><Shuffle className="w-4 h-4"/> Sortear Plano</Button>
                    </div>
                     {planStations.length > 0 && <p className="text-sm text-gray-600">Plano gerado. Inicie as estações abaixo para ser redirecionado ao treino.</p>}
                </TabsContent>
                <TabsContent value="review" className="space-y-4">
                    <p className="text-sm text-gray-600 bg-white p-4 rounded-lg border mt-2">Esta é uma lista de estações que você já praticou, ordenada da menor para a maior nota média. Comece por aqui para focar nos seus pontos fracos.</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviewStations.map(st => (
                            <Card key={st.id}>
                                <CardContent className="p-4 space-y-3 !pt-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{st.area}</div>
                                            <div className="font-semibold">{st.title}</div>
                                        </div>
                                        <div className="text-lg font-bold text-blue-600">{st.avgScore.toFixed(1)}</div>
                                    </div>
                                    <Button size="sm" onClick={() => startStation(st)} className="gap-2 w-full"><Play className="w-4 h-4"/> Iniciar Revisão</Button>
                                </CardContent>
                            </Card>
                        ))}
                         {reviewStations.length === 0 && <p className="text-gray-500 md:col-span-3">Você ainda não completou nenhuma estação para revisar.</p>}
                    </div>
                </TabsContent>
                <TabsContent value="quick" className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border mt-2">
                        <div className="flex items-center gap-2"><Label>Número de estações</Label><Input type="number" value={quickPracticeCount} onChange={(e) => setQuickPracticeCount(Math.max(1, Number(e.target.value)))} className="w-24" /></div>
                        <Button onClick={generateQuickPracticePlan} className="gap-2"><Play className="w-4 h-4"/> Gerar Prática</Button>
                    </div>
                    {planStations.length > 0 && <p className="text-sm text-gray-600">Sessão de prática rápida gerada. Inicie as estações abaixo.</p>}
                </TabsContent>
                <TabsContent value="stations" className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border mt-2">
                        <Tabs value={activeStationTab} onValueChange={handleStationTabChange}>
                            <div className="space-y-1">
                                {[...Array(5)].map((_, rowIndex) => (
                                    <TabsList key={rowIndex} className="h-auto justify-start max-w-full overflow-x-auto pb-1">
                                        {Array.from({ length: 20 }, (_, i) => {
                                            const stationIndex = rowIndex * 20 + i;
                                            const stationNumber = String(stationIndex + 1).padStart(3, '0');
                                            const stationExists = stationIndex < stations.length;
                                            return (
                                                <TabsTrigger
                                                    key={stationNumber}
                                                    value={stationNumber}
                                                    disabled={!stationExists}
                                                    className={!stationExists ? 'text-gray-400 cursor-not-allowed' : ''}
                                                >
                                                    {stationNumber}
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                ))}
                            </div>
                            <div className="pt-4 space-y-6">
                                <Framer.AnimatePresence>
                                    {active ? (
                                        <Framer.motion.div id="active-training-interface" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <TrainingInterface
                                                active={active}
                                                secondsLeft={secondsLeft}
                                                timerRunning={timerRunning}
                                                aiLog={aiLog}
                                                isSessionActive={isSessionActive}
                                                liveInputTranscript={liveInputTranscript}
                                                liveOutputTranscript={liveOutputTranscript}
                                                showPhysicalExam={showPhysicalExam}
                                                evaluationResult={aiFeedback[active.id] || null}
                                                isEvaluating={isEvaluating}
                                                initialDuration={initialDuration}
                                                onPauseTimer={handlePauseTimer}
                                                onResumeTimer={handleResumeTimer}
                                                onResetTimer={handleResetTimer}
                                                onToggleConversation={toggleConversation}
                                                onFinishStation={finishStation}
                                                onDurationChange={handleDurationChange}
                                            />
                                        </Framer.motion.div>
                                    ) : (
                                        <div className="text-gray-600 border rounded-lg p-6 text-center">Nenhuma estação ativa. Selecione uma estação acima ou em outro modo de prática.</div>
                                    )}
                                </Framer.AnimatePresence>

                                {/* Integrated Chatbot */}
                                <Card>
                                    <header className="bg-gray-100 text-gray-800 p-4 rounded-t-lg flex justify-between items-center border-b">
                                      <h3 className="font-bold text-lg">Assistente</h3>
                                    </header>
                                    <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50">
                                        {chatbotMessages.map(msg => (
                                        <div key={msg.id} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <p className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                            {msg.text}
                                            </p>
                                        </div>
                                        ))}
                                        {isChatbotLoading && (
                                        <div className="flex justify-start my-2">
                                            <p className="p-3 rounded-2xl bg-gray-200 text-gray-900">
                                            <span className="animate-pulse">...</span>
                                            </p>
                                        </div>
                                        )}
                                        <div ref={chatbotMessagesEndRef} />
                                    </div>
                                    <div className="border-t p-4 flex items-center bg-white rounded-b-lg">
                                        <Input
                                        type="text"
                                        value={chatbotInput}
                                        onChange={(e) => setChatbotInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleChatbotSend()}
                                        placeholder={isChatbotListening ? "Ouvindo..." : "Digite sua mensagem..."}
                                        className="flex-1"
                                        disabled={isChatbotLoading}
                                        />
                                        {chatbotBrowserSupport && (
                                        <Button 
                                            variant="outline"
                                            size="icon"
                                            onClick={handleChatbotMicClick} 
                                            className={`ml-2 shrink-0 ${isChatbotListening ? 'bg-red-100 text-red-600 animate-pulse' : ''}`}
                                            aria-label={isChatbotListening ? "Parar gravação" : "Iniciar gravação"}
                                        >
                                            <MicIcon />
                                        </Button>
                                        )}
                                        <Button onClick={handleChatbotSend} disabled={isChatbotLoading || chatbotInput.trim() === ''} className="ml-2 shrink-0" size="icon">
                                          <SendIcon />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </Tabs>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planStations.map((st) => (
                <Card key={st.id}><CardContent className="p-4 space-y-3 !pt-4"><div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{st.area}</div><div className="font-semibold">{st.title}</div><div className="text-sm text-gray-500">{st.pepMinutes} min</div><Button size="sm" onClick={() => startStation(st)} className="gap-2 w-full"><Play className="w-4 h-4"/> Iniciar</Button></CardContent></Card>
              ))}
              {todayPlan.length === 0 && <p className="text-gray-500 md:col-span-3">Gere um plano de estudos para começar.</p>}
            </div>
          </section>

          {/* LIBRARY */}
          <section id="library" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight"><BookOpen className="w-6 h-6"/> Banco de Estações</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <Dialog>
                <DialogTrigger asChild><Button variant="outline" className="gap-2"><Upload className="w-4 h-4"/> Importar JSON</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Importar estações via JSON</DialogTitle></DialogHeader>
                  <textarea ref={jsonImportRef} className="w-full h-60 p-3 border rounded font-mono text-sm" placeholder='[{"id":"CM-URTICARIA","area":"Clínica Médica","title":"...","pepMinutes":10,"script":"Queixa:...", "personality":"Ansioso..."}]'></textarea>
                  <div className="flex justify-end"><Button onClick={() => { if (jsonImportRef.current) importStations(jsonImportRef.current.value) }}>Importar</Button></div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => { setStations(DEFAULT_STATIONS); toast.success("Restaurado banco padrão"); }}>Restaurar padrão</Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map((st) => (<Card key={st.id}><CardContent className="p-4 space-y-2 !pt-4"><div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{st.area}</div><div className="font-semibold">{st.title}</div><div className="text-sm text-gray-500">{st.pepMinutes} min</div><div className="text-xs text-gray-500 pt-1">Peso: {boostedStations.find(b=>b.id===st.id)?.weight ?? 1}</div></CardContent></Card>))}
            </div>
          </section>

          {/* TRAINING */}
          <section id="training" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight"><Stethoscope className="w-6 h-6"/> Treinamento</h2>
            <div className="text-gray-600 bg-white border rounded-lg p-6 text-center">
                O treinamento ativo é exibido na aba 'Estações' na seção 'Modos de Prática'. Inicie uma estação para ser redirecionado.
            </div>
          </section>

          {/* RESULTS */}
          <section id="results" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight"><BarChart2 className="w-6 h-6"/> Resultados</h2>
            <ResultsTable stations={stations} scores={scores} />
          </section>

          {/* SETTINGS */}
          <section id="settings" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3 tracking-tight"><SettingsIcon className="w-6 h-6"/> Configurações</h2>
            <Card><CardContent className="p-4 !pt-4 space-y-3"><div className="flex items-center justify-between"><Label>Som do cronômetro</Label><Switch defaultChecked /></div><div className="flex items-center justify-between"><Label>Encerrar estação automaticamente ao zerar</Label><Switch /></div></CardContent></Card>
          </section>
        </main>
      </div>
    </div>
  );
}

// --- Auth Wrapper Component ---
export default function App() {
    const [currentUser, setCurrentUser] = useState<string | null>(() => sessionStorage.getItem('revalida-currentUser'));

    const handleLogin = (username: string) => {
        sessionStorage.setItem('revalida-currentUser', username);
        setCurrentUser(username);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('revalida-currentUser');
        setCurrentUser(null);
    };

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return <RevalidaPracticeApp currentUser={currentUser} onLogout={handleLogout} />;
}