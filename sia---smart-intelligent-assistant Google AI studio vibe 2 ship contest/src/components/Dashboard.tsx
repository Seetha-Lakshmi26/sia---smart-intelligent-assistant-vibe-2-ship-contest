import React, { useState, useEffect } from 'react';
import { Task, Habit, ProactiveInsight } from '../types';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Check, 
  Volume2, 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  LogOut,
  User
} from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  habits: Habit[];
  insights: ProactiveInsight[];
  mission: string;
  setMission: (mission: string) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  onUpdateInsights: (insights: ProactiveInsight[]) => void;
  onAddTask: (task: Task) => void;
  apiKeyStatus: { hasApiKey: boolean; message: string };
  triggerPrioritize: () => Promise<void>;
  isPrioritizing: boolean;
  currentUser?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export default function Dashboard({
  tasks,
  habits,
  insights,
  mission,
  setMission,
  onUpdateTasks,
  onUpdateInsights,
  onAddTask,
  apiKeyStatus,
  triggerPrioritize,
  isPrioritizing,
  currentUser,
  onLogout
}: DashboardProps) {
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [tempMission, setTempMission] = useState(mission);
  
  // Voice Dictation state
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionText, setRecognitionText] = useState('');
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const [dictationError, setDictationError] = useState('');
  const [voiceParsedResult, setVoiceParsedResult] = useState<any | null>(null);

  // Manual trigger for voice speech recognition
  let recognition: any = null;
  if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const startVoiceRecording = () => {
    if (!recognition) {
      setDictationError('Web Speech API is not supported in this browser. Please type or use Chrome.');
      return;
    }
    setDictationError('');
    setVoiceParsedResult(null);
    setRecognitionText('');
    setIsRecording(true);
    try {
      recognition.start();
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRecognitionText(transcript);
        setIsRecording(false);
        await handleParseVoiceText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setDictationError(`Voice Input Error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    } catch (e: any) {
      setIsRecording(false);
      setDictationError(`Failed to start recognition: ${e.message}`);
    }
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const handleParseVoiceText = async (text: string) => {
    if (!text.trim()) return;
    setIsParsingVoice(true);
    setDictationError('');
    try {
      const res = await fetch('/api/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, currentDate: new Date().toISOString() })
      });
      if (!res.ok) throw new Error('Failed to parse voice command.');
      const data = await res.json();
      if (data && data.task) {
        setVoiceParsedResult(data.task);
      } else {
        throw new Error('SIA could not extract a valid task from dictation.');
      }
    } catch (e: any) {
      setDictationError(e.message || 'Error processing voice.');
    } finally {
      setIsParsingVoice(false);
    }
  };

  const handleAcceptVoiceTask = () => {
    if (!voiceParsedResult) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: voiceParsedResult.title,
      dueDate: voiceParsedResult.dueDate || new Date().toISOString().split('T')[0],
      urgency: voiceParsedResult.urgency || 'MEDIUM',
      category: voiceParsedResult.category || 'General',
      completed: false,
      estimatedHours: voiceParsedResult.estimatedHours || 1,
      scheduledTime: 'Flexible (Dictated)',
      priorityScore: voiceParsedResult.urgency === 'CRITICAL' ? 90 : voiceParsedResult.urgency === 'HIGH' ? 75 : 50,
      aiReasoning: voiceParsedResult.aiSuggestion || 'SIA Dictated task.',
      suggestedAction: 'Start this item at your next available productivity window.'
    };
    onAddTask(newTask);
    setVoiceParsedResult(null);
    setRecognitionText('');
  };

  // Simulating custom dictation when voice API is unavailable
  const handleSimulateDictation = async (simulatedText: string) => {
    setRecognitionText(simulatedText);
    await handleParseVoiceText(simulatedText);
  };

  // Task list states
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const pendingTasksCount = todayTasks.filter(t => !t.completed).length;
  const completedTasksCount = todayTasks.filter(t => t.completed).length;
  const totalTasksCount = todayTasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Group today's tasks by urgency
  const criticalTasks = todayTasks.filter(t => t.urgency === 'CRITICAL' || t.priorityScore >= 80);
  const otherTasks = todayTasks.filter(t => t.urgency !== 'CRITICAL' && t.priorityScore < 80);

  // Time-of-day greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning, Visionary';
    if (hrs < 18) return 'Good Afternoon, Leader';
    return 'Good Evening, Planner';
  };

  return (
    <div className="space-y-6" id="sia-dashboard-container">
      {/* Top Banner / API Status Alerts */}
      {!apiKeyStatus.hasApiKey && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/20 rounded-xl p-4 glow-amber" id="api-alert-banner">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1 text-sm text-slate-300">
            <span className="font-semibold text-amber-300">Demo Mode Active:</span> SIA needs a Google Gemini API Key to run full predictive planning. Enter your API Key in the <strong className="text-white">Secrets configuration panel</strong> to activate maximum intelligence.
          </div>
        </div>
      )}

      {/* Hero Header with Visionary Mission statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden" id="dashboard-welcome-card">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase font-mono">Mission Control</span>
                <h1 className="text-3xl font-bold font-display mt-1 text-white">{getGreeting()}</h1>
                <p className="text-slate-400 text-sm mt-1">SIA is analyzing your priorities to prevent deadline slippage proactively.</p>
              </div>

              {/* Quick Session Status & Logout directly in the Dashboard */}
              <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 shrink-0 self-start md:self-auto shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <User size={16} />
                </div>
                <div className="text-left">
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Profile Session</div>
                  <div className="text-xs font-semibold text-slate-200 text-ellipsis overflow-hidden max-w-[120px] whitespace-nowrap" title={currentUser?.name}>
                    {currentUser?.name || 'Visionary'}
                  </div>
                </div>
                <div className="h-5 w-px bg-slate-800 mx-1"></div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 hover:bg-rose-500/10 rounded-lg transition"
                  title="Sign out of current account"
                  id="dashboard-logout-btn"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Mission of the Day Editor */}
            <div className="mt-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase font-mono text-cyan-400 tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="animate-pulse" />
                  Today&apos;s Grand Mission
                </span>
                {!isEditingMission ? (
                  <button 
                    onClick={() => { setTempMission(mission); setIsEditingMission(true); }}
                    className="text-xs text-slate-400 hover:text-white transition"
                    id="edit-mission-btn"
                  >
                    Modify
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setMission(tempMission); setIsEditingMission(false); }}
                      className="text-xs text-emerald-400 font-semibold hover:underline"
                      id="save-mission-btn"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditingMission(false)}
                      className="text-xs text-slate-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {!isEditingMission ? (
                <p className="text-slate-200 font-medium italic text-base leading-relaxed">&ldquo;{mission}&rdquo;</p>
              ) : (
                <textarea
                  value={tempMission}
                  onChange={(e) => setTempMission(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  rows={2}
                />
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Completion Widget */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between" id="today-completion-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase font-mono">Today&apos;s Momentum</span>
              <h2 className="text-2xl font-bold font-display mt-1 text-white">
                {completedTasksCount} / {totalTasksCount} Complete
              </h2>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="my-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
              <span>Goal Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <Clock size={12} />
            {pendingTasksCount > 0 ? (
              <span>{pendingTasksCount} critical items remaining for today.</span>
            ) : totalTasksCount > 0 ? (
              <span className="text-emerald-400">Perfect alignment! All target tasks cleared.</span>
            ) : (
              <span>No tasks scheduled for today. Fill your planner.</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Proactive Alerts, Tasks. Right is Voice Dictation & Quick Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Proactive Advice Panel & Urgent Focus Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Proactive Insights / Notification Panel */}
          <div className="glass-panel rounded-2xl p-6" id="sia-insights-panel">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-lg font-bold font-display text-white">SIA Executive Brief &amp; Insights</h3>
              </div>
              <button 
                onClick={triggerPrioritize}
                disabled={isPrioritizing}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-1 px-3 rounded-lg border border-slate-700 transition disabled:opacity-50"
                id="re-prioritize-btn"
              >
                {isPrioritizing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                Prioritize Now
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight) => {
                const isWarning = insight.type === 'WARNING';
                const isPrep = insight.type === 'PREPARATION';
                const isHabit = insight.type === 'HABIT';
                
                let themeClasses = "bg-slate-900 border-slate-800 text-slate-300";
                let badge = "text-cyan-400 bg-cyan-500/10";
                if (isWarning) {
                  themeClasses = "bg-rose-950/20 border-rose-500/20 glow-rose text-slate-200";
                  badge = "text-rose-400 bg-rose-500/10";
                } else if (isPrep) {
                  themeClasses = "bg-cyan-950/10 border-cyan-500/20 glow-cyan text-slate-200";
                  badge = "text-cyan-400 bg-cyan-500/10";
                } else if (isHabit) {
                  themeClasses = "bg-emerald-950/15 border-emerald-500/20 glow-emerald text-slate-200";
                  badge = "text-emerald-400 bg-emerald-500/10";
                }

                return (
                  <div key={insight.id} className={`p-4 border rounded-xl flex flex-col justify-between ${themeClasses}`} id={`insight-${insight.id}`}>
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`text-[10px] font-mono tracking-widest uppercase py-0.5 px-2 rounded-full font-semibold ${badge}`}>
                          {insight.type}
                        </span>
                        {isWarning && <AlertTriangle size={14} className="text-rose-400 animate-pulse" />}
                      </div>
                      <h4 className="font-semibold text-sm text-white leading-snug mb-1">{insight.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgent & Critical Focus Tasks */}
          <div className="glass-panel rounded-2xl p-6" id="sia-today-tasks-container">
            <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              Dynamic Daily Sprint
            </h3>

            {todayTasks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm mb-3">No tasks scheduled for today.</p>
                <button className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-1.5 px-3 rounded-lg transition">
                  Create First Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Critical Tasks Section */}
                {criticalTasks.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-rose-400 font-bold block">
                      🔴 Priority Focus Block (Score &gt;= 80)
                    </span>
                    {criticalTasks.map((t) => (
                      <div 
                        key={t.id} 
                        className={`p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 hover:bg-rose-950/20 transition-all ${t.completed ? 'opacity-60 border-slate-800 bg-slate-900/50' : ''}`}
                        id={`task-item-${t.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => {
                              onUpdateTasks(tasks.map(task => task.id === t.id ? { ...task, completed: !task.completed } : task));
                            }}
                            className={`p-1 mt-0.5 rounded-md border transition ${t.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-700 text-transparent hover:border-cyan-400'}`}
                          >
                            <Check size={14} className={t.completed ? 'block' : 'opacity-0 hover:opacity-100 text-slate-500'} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className={`font-semibold text-sm leading-snug ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {t.title}
                              </h4>
                              <span className="text-xs font-mono text-rose-400 font-bold px-2 py-0.5 bg-rose-500/10 rounded-md">
                                Score {t.priorityScore}
                              </span>
                            </div>
                            
                            {t.aiReasoning && (
                              <p className="text-xs text-slate-400 mt-1.5 italic font-mono leading-relaxed">
                                <span className="text-cyan-400 font-semibold">SIA Analysis:</span> {t.aiReasoning}
                              </p>
                            )}
                            
                            {t.suggestedAction && !t.completed && (
                              <div className="mt-2 text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-0.5">ACTION:</span>
                                <span className="text-slate-300 font-mono">{t.suggestedAction}</span>
                              </div>
                            )}

                            <div className="flex gap-4 items-center mt-3 text-[10px] text-slate-500 font-mono">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md uppercase font-semibold">{t.category}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {t.scheduledTime || 'Unscheduled'}</span>
                              <span>Est: {t.estimatedHours}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Tasks Section */}
                {otherTasks.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold block">
                      ⚪ Standard Priorities
                    </span>
                    {otherTasks.map((t) => (
                      <div 
                        key={t.id} 
                        className={`p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-all ${t.completed ? 'opacity-60 border-slate-900' : ''}`}
                        id={`task-item-${t.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => {
                              onUpdateTasks(tasks.map(task => task.id === t.id ? { ...task, completed: !task.completed } : task));
                            }}
                            className={`p-1 mt-0.5 rounded-md border transition ${t.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-700 text-transparent hover:border-cyan-400'}`}
                          >
                            <Check size={14} className={t.completed ? 'block' : 'opacity-0 hover:opacity-100 text-slate-500'} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className={`font-semibold text-sm leading-snug ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {t.title}
                              </h4>
                              <span className="text-xs font-mono text-slate-400 font-semibold px-2 py-0.5 bg-slate-800 rounded-md">
                                Score {t.priorityScore}
                              </span>
                            </div>
                            
                            {t.aiReasoning && (
                              <p className="text-xs text-slate-400 mt-1.5 italic font-mono leading-relaxed">
                                <span className="text-cyan-400 font-semibold">SIA Analysis:</span> {t.aiReasoning}
                              </p>
                            )}

                            <div className="flex gap-4 items-center mt-2.5 text-[10px] text-slate-500 font-mono">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md uppercase font-semibold">{t.category}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {t.scheduledTime || 'Flexible'}</span>
                              <span>Est: {t.estimatedHours}h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Voice-Enabled Task Input & Day Timeline Calendar */}
        <div className="space-y-6">

          {/* Voice-Enabled Task Dictation Input */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden" id="voice-dictation-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase font-mono block mb-1">Interactive Input</span>
            <h3 className="text-base font-bold font-display text-white mb-3">AI Voice Dictation Parser</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Dictate your task naturally. SIA automatically extracts, schedules, sets priority score, and parses the metadata immediately.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex justify-center py-4 bg-slate-950/80 border border-slate-800 rounded-xl relative">
                {isRecording ? (
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={stopVoiceRecording}
                      className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white cursor-pointer relative animate-pulse"
                      id="voice-mic-active"
                    >
                      <MicOff size={24} />
                      <span className="absolute -inset-2 rounded-full border border-rose-500/30 animate-ping"></span>
                    </button>
                    <span className="text-xs font-mono text-rose-400 mt-3 animate-pulse">SIA is listening carefully...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={startVoiceRecording}
                      className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-black cursor-pointer shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                      id="voice-mic-inactive"
                    >
                      <Mic size={24} />
                    </button>
                    <span className="text-xs font-mono text-slate-400 mt-3">Click to dictate task</span>
                  </div>
                )}
              </div>

              {/* Dictation error prompt */}
              {dictationError && (
                <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg font-mono">
                  {dictationError}
                </div>
              )}

              {/* Recognition Result text area */}
              {recognitionText && (
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Transcribed Text:</span>
                  <p className="text-xs text-slate-200 italic font-mono">&ldquo;{recognitionText}&rdquo;</p>
                </div>
              )}

              {/* Simulating input section for browsers lacking speech recognition in iframe */}
              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1.5">No Mic or Iframe Limit? Simulate voice dictation:</span>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => handleSimulateDictation("Review the production database logs tonight by 8pm because it is urgent")}
                    className="text-left text-[11px] bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg p-2 transition font-mono truncate"
                  >
                    &ldquo;Review production logs tonight at 8pm (urgent)&rdquo;
                  </button>
                  <button 
                    onClick={() => handleSimulateDictation("Plan a cardio run session for tomorrow morning at 7am to clear my mind")}
                    className="text-left text-[11px] bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg p-2 transition font-mono truncate"
                  >
                    &ldquo;Plan a cardio run tomorrow morning at 7am&rdquo;
                  </button>
                </div>
              </div>

              {/* Parsing Loader */}
              {isParsingVoice && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono text-cyan-400">
                  <Loader2 size={14} className="animate-spin" />
                  SIA is parsing metadata and scheduling...
                </div>
              )}

              {/* Voice Parsed Result Modal Container */}
              {voiceParsedResult && (
                <div className="bg-gradient-to-br from-cyan-950/20 to-slate-900 border border-cyan-500/30 p-4 rounded-xl space-y-3 glow-cyan" id="voice-parsed-container">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">✨ SIA extracted details:</span>
                  
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500">Title: </span>
                      <strong className="text-white font-medium">{voiceParsedResult.title}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div><span className="text-slate-500">Due:</span> <span className="text-cyan-300">{voiceParsedResult.dueDate}</span></div>
                      <div><span className="text-slate-500">Urgency:</span> <span className="text-rose-400">{voiceParsedResult.urgency}</span></div>
                      <div><span className="text-slate-500">Category:</span> <span className="text-slate-300">{voiceParsedResult.category}</span></div>
                      <div><span className="text-slate-500">Hours:</span> <span className="text-slate-300">{voiceParsedResult.estimatedHours}h</span></div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] italic text-slate-300 font-mono">
                      <span className="text-cyan-400 font-bold not-italic">Advice:</span> {voiceParsedResult.aiSuggestion}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={handleAcceptVoiceTask}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-1.5 rounded-lg text-xs transition"
                    >
                      Approve &amp; Schedule
                    </button>
                    <button 
                      onClick={() => { setVoiceParsedResult(null); setRecognitionText(''); }}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs transition border border-slate-700"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar timeline of today's schedule */}
          <div className="glass-panel rounded-2xl p-6" id="dashboard-schedule-timeline">
            <h3 className="text-base font-bold font-display text-white mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-cyan-400" />
              Timeline Visualization
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Your optimal linear schedule mapped intelligently for maximum daily cognitive efficiency.</p>

            <div className="space-y-3 font-mono">
              <div className="flex items-start gap-3">
                <div className="text-[10px] text-slate-500 w-16 pt-0.5 text-right">09:00 AM</div>
                <div className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-xs font-semibold text-cyan-400">Deep Work Strategic Focus Block</div>
                  <p className="text-[10px] text-slate-400">Peak energy hour. Minimize notifications, prioritize core coding and architectures.</p>
                </div>
              </div>

              {todayTasks.filter(t => !t.completed).map((t, idx) => (
                <div key={t.id} className="flex items-start gap-3">
                  <div className="text-[10px] text-slate-500 w-16 pt-0.5 text-right">
                    {idx === 0 ? '11:00 AM' : idx === 1 ? '01:30 PM' : '04:00 PM'}
                  </div>
                  <div className="flex-1 bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-200 truncate">{t.title}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{t.urgency}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Est duration: {t.estimatedHours}h</p>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <div className="text-[10px] text-slate-500 w-16 pt-0.5 text-right">05:30 PM</div>
                <div className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-xs font-semibold text-emerald-400">Mindfulness &amp; Recovery Block</div>
                  <p className="text-[10px] text-slate-400">Recharge physiological state. Unwind mental RAM before evening closure.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
