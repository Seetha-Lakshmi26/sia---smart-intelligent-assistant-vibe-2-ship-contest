import React, { useState, useEffect } from 'react';
import { Task, Habit, GoalPlan, ProactiveInsight } from './types';
import { 
  getUsers, 
  saveUser, 
  getCurrentUser, 
  setCurrentUser, 
  getTasksForUser, 
  saveTasksForUser, 
  getHabitsForUser, 
  saveHabitsForUser, 
  getGoalPlansForUser, 
  saveGoalPlansForUser, 
  getInsightsForUser, 
  saveInsightsForUser, 
  getMissionForUser, 
  saveMissionForUser,
  UserAccount
} from './utils/storage';
import Dashboard from './components/Dashboard';
import TaskPlanner from './components/TaskPlanner';
import HabitTracker from './components/HabitTracker';
import GoalPlanner from './components/GoalPlanner';
import SIALogo from './components/SIALogo';

import { 
  Sparkles, 
  Layers, 
  Calendar, 
  Target, 
  Cpu, 
  Heart,
  Menu,
  X,
  Lock,
  Mail,
  User,
  LogOut,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [currentUser, setLoggedInUser] = useState<UserAccount | null>(null);
  
  // Auth view states
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Core App states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goalPlans, setGoalPlans] = useState<GoalPlan[]>([]);
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [mission, setMission] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'habits' | 'goal-architect'>('dashboard');
  const [apiKeyStatus, setApiKeyStatus] = useState({ hasApiKey: false, message: 'Verifying SIA connection...' });
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check login state and connection on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setLoggedInUser(user);
      loadUserData(user.email);
    }

    // Check API Key health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiKeyStatus({
          hasApiKey: data.hasApiKey,
          message: data.message
        });
      })
      .catch(err => {
        console.error("Health check error:", err);
        setApiKeyStatus({
          hasApiKey: false,
          message: 'Error communicating with backend service.'
        });
      });
  }, []);

  // Helper to load current user data from segmented namespaces
  const loadUserData = (email: string) => {
    setTasks(getTasksForUser(email));
    setHabits(getHabitsForUser(email));
    setGoalPlans(getGoalPlansForUser(email));
    setInsights(getInsightsForUser(email));
    setMission(getMissionForUser(email));
  };

  // Auth Submit Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!emailInput || !passwordInput) {
      setAuthError('Please fill in all fields.');
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase().trim());
    if (!user || user.passwordHash !== passwordInput) {
      setAuthError('Invalid email or password.');
      return;
    }

    // Success login
    setCurrentUser(user.email);
    setLoggedInUser(user);
    loadUserData(user.email);
    
    // Reset form fields
    setEmailInput('');
    setPasswordInput('');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!emailInput || !passwordInput || !confirmPasswordInput || !nameInput) {
      setAuthError('Please fill in all fields.');
      return;
    }

    if (passwordInput.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match.');
      return;
    }

    const newUser: UserAccount = {
      email: emailInput.toLowerCase().trim(),
      passwordHash: passwordInput,
      name: nameInput.trim()
    };

    const isCreated = saveUser(newUser);
    if (!isCreated) {
      setAuthError('An account with this email already exists.');
      return;
    }

    setAuthSuccess('Account created successfully! Logging you in...');
    
    // Auto Login after short delay
    setTimeout(() => {
      setCurrentUser(newUser.email);
      setLoggedInUser(newUser);
      loadUserData(newUser.email);
      
      // Reset form
      setEmailInput('');
      setPasswordInput('');
      setConfirmPasswordInput('');
      setNameInput('');
      setAuthSuccess('');
    }, 1000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoggedInUser(null);
    setTasks([]);
    setHabits([]);
    setGoalPlans([]);
    setInsights([]);
    setMission('');
    setActiveTab('dashboard');
  };

  // Save changes to localStorage per user namespace automatically
  const handleUpdateTasks = (updatedTasks: Task[]) => {
    if (!currentUser) return;
    setTasks(updatedTasks);
    saveTasksForUser(currentUser.email, updatedTasks);
  };

  const handleUpdateHabits = (updatedHabits: Habit[]) => {
    if (!currentUser) return;
    setHabits(updatedHabits);
    saveHabitsForUser(currentUser.email, updatedHabits);
  };

  const handleUpdateGoalPlans = (updatedPlans: GoalPlan[]) => {
    if (!currentUser) return;
    setGoalPlans(updatedPlans);
    saveGoalPlansForUser(currentUser.email, updatedPlans);
  };

  const handleUpdateInsights = (updatedInsights: ProactiveInsight[]) => {
    if (!currentUser) return;
    setInsights(updatedInsights);
    saveInsightsForUser(currentUser.email, updatedInsights);
  };

  const handleUpdateMission = (updatedMission: string) => {
    if (!currentUser) return;
    setMission(updatedMission);
    saveMissionForUser(currentUser.email, updatedMission);
  };

  const handleAddTask = (newTask: Task) => {
    if (!currentUser) return;
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasksForUser(currentUser.email, updated);
  };

  // Trigger Gemini API to analyze and prioritize user tasks
  const handleTriggerPrioritization = async () => {
    if (!currentUser) return;
    setIsPrioritizing(true);
    try {
      const res = await fetch('/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          currentDate: new Date().toISOString()
        })
      });

      if (!res.ok) throw new Error('Prioritization service failed.');
      
      const data = await res.json();
      
      if (data && Array.isArray(data.prioritizedTasks)) {
        // Map scores back to existing tasks
        const updatedTasks = tasks.map(t => {
          const prioritizedItem = data.prioritizedTasks.find((pt: any) => pt.id === t.id);
          if (prioritizedItem) {
            return {
              ...t,
              priorityScore: prioritizedItem.priorityScore,
              urgency: prioritizedItem.urgencyCategory || t.urgency,
              aiReasoning: prioritizedItem.aiReasoning,
              suggestedAction: prioritizedItem.suggestedAction
            };
          }
          return t;
        });

        // Reorder tasks by priority score descending
        const sortedTasks = [...updatedTasks].sort((a, b) => {
          if (a.completed && !b.completed) return 1;
          if (!a.completed && b.completed) return -1;
          return b.priorityScore - a.priorityScore;
        });

        setTasks(sortedTasks);
        saveTasksForUser(currentUser.email, sortedTasks);

        // Fetch proactive insights automatically based on newly prioritized state
        await handleFetchProactiveInsights(sortedTasks, habits);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPrioritizing(false);
    }
  };

  // Fetch proactive insights alert
  const handleFetchProactiveInsights = async (currentTasks: Task[], currentHabits: Habit[]) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/proactive-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: currentTasks,
          habits: currentHabits,
          currentDate: new Date().toISOString()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.insights)) {
          setInsights(data.insights);
          saveInsightsForUser(currentUser.email, data.insights);
        }
      }
    } catch (e) {
      console.error("Error generating live notifications:", e);
    }
  };

  // IF NOT LOGGED IN: Render Login / Sign Up UI Gate
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-white" id="sia-auth-root">
        {/* Dynamic Top Bar Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400"></div>

        {/* Top bar logo */}
        <header className="px-4 lg:px-8 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/40 backdrop-blur-sm">
          <SIALogo size="md" showText={true} />
          <span className="text-xs font-mono text-slate-500">Secured Node Connection</span>
        </header>

        {/* Middle Auth Card Wrapper */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            {/* Subtle light pulse effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-md"></div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {authMode === 'login' ? 'Access your Productivity Space' : 'Create Autonomous Profile'}
              </h2>
              <p className="text-slate-400 text-xs mt-2">
                {authMode === 'login' 
                  ? 'Sign in to access your separate tasks, personalized habits & AI insights' 
                  : 'Start your customizable workspace with secure client-side database separation'}
              </p>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg flex items-start gap-2.5 text-xs">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success alerts */}
            {authSuccess && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-start gap-2.5 text-xs">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500"><Mail size={16} /></span>
                    <input 
                      type="email"
                      placeholder="e.g. champion@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold">Workspace Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500"><Lock size={16} /></span>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                >
                  Unlock Workspace
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500"><User size={16} /></span>
                    <input 
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500"><Mail size={16} /></span>
                    <input 
                      type="email"
                      placeholder="e.g. sarah@cyberdyne.io"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold">Set Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500"><Lock size={16} /></span>
                    <input 
                      type="password"
                      placeholder="Minimum 4 characters"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono tracking-wider mb-1.5 font-bold">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500"><Lock size={16} /></span>
                    <input 
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
                >
                  Create Separate Account
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* Toggle Switch */}
            <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
              {authMode === 'login' ? (
                <button 
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition"
                >
                  Don't have an account? <span className="text-cyan-400 font-semibold underline underline-offset-4">Sign Up now</span>
                </button>
              ) : (
                <button 
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition"
                >
                  Already registered? <span className="text-cyan-400 font-semibold underline underline-offset-4">Sign In here</span>
                </button>
              )}
            </div>

            {/* Quick Demo Preset Assist */}
            <div className="mt-4 bg-slate-950/80 p-3 rounded-lg border border-slate-800/40 text-center">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">⚡ Quick Tester account</p>
              <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-3">
                <span>Email: <code className="text-cyan-400 select-all">demo@sia.ai</code></span>
                <span className="hidden sm:inline text-slate-700">|</span>
                <span>Password: <code className="text-cyan-400 select-all">password</code></span>
              </div>
            </div>

          </div>
        </main>

        {/* Bottom Footer block */}
        <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500 font-mono">
          <div className="flex justify-center items-center gap-1.5 mb-2">
            <span>Crafted for high performance with</span>
            <Heart size={10} className="text-rose-500 fill-rose-500/20" />
            <span>&bull; Powered by Gemini 3.5 Flash</span>
          </div>
          <p>&copy; 2026 SIA Brain Labs. All Rights Reserved. Stay Proactive.</p>
        </footer>
      </div>
    );
  }

  // APP CORE INTERFACE (ONLY RENDERED FOR LOGGED IN USERS)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white" id="sia-app-root">
      
      {/* Dynamic Top Bar Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400"></div>

      {/* Main Premium Navbar Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <SIALogo size="md" showText={true} />

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white font-bold border-b-2 border-b-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Calendar size={14} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === 'planner' ? 'bg-slate-800 text-white font-bold border-b-2 border-b-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-planner"
          >
            <Layers size={14} />
            Task Planner
          </button>
          <button 
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === 'habits' ? 'bg-slate-800 text-white font-bold border-b-2 border-b-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-habits"
          >
            <Target size={14} />
            Habit Tracker
          </button>
          <button 
            onClick={() => setActiveTab('goal-architect')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === 'goal-architect' ? 'bg-slate-800 text-white font-bold border-b-2 border-b-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            id="tab-btn-goal-architect"
          >
            <Sparkles size={14} />
            Autonomous Planning
          </button>
        </nav>

        {/* Right-aligned user identity and logout actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Active Profile</div>
            <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              {currentUser.name}
            </div>
          </div>
          
          <div className="h-6 w-px bg-slate-800"></div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition"
            title="Log out of current workspace"
          >
            <LogOut size={13} />
            Log Out
          </button>
        </div>

        {/* Mobile Navigation Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white transition"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Backdrop & Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-900 px-4 py-4 space-y-2 flex flex-col">
          <div className="px-4 py-2 border-b border-slate-900 mb-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-500">SIGNED IN AS</div>
              <div className="text-xs text-white font-semibold">{currentUser.name}</div>
            </div>
            <button 
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-rose-400 bg-rose-500/10 rounded"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>

          <button 
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition ${activeTab === 'dashboard' ? 'bg-slate-900 text-cyan-400' : 'text-slate-400'}`}
          >
            <Calendar size={16} />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('planner'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition ${activeTab === 'planner' ? 'bg-slate-900 text-cyan-400' : 'text-slate-400'}`}
          >
            <Layers size={16} />
            Task Planner
          </button>
          <button 
            onClick={() => { setActiveTab('habits'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition ${activeTab === 'habits' ? 'bg-slate-900 text-cyan-400' : 'text-slate-400'}`}
          >
            <Target size={16} />
            Habit Tracker
          </button>
          <button 
            onClick={() => { setActiveTab('goal-architect'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition ${activeTab === 'goal-architect' ? 'bg-slate-900 text-cyan-400' : 'text-slate-400'}`}
          >
            <Sparkles size={16} />
            Autonomous Planning
          </button>
        </div>
      )}

      {/* Main Content Area Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        
        {/* Render Tab Contents Dynamically */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            tasks={tasks}
            habits={habits}
            insights={insights}
            mission={mission}
            setMission={handleUpdateMission}
            onUpdateTasks={handleUpdateTasks}
            onUpdateInsights={handleUpdateInsights}
            onAddTask={handleAddTask}
            apiKeyStatus={apiKeyStatus}
            triggerPrioritize={handleTriggerPrioritization}
            isPrioritizing={isPrioritizing}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'planner' && (
          <TaskPlanner 
            tasks={tasks}
            onUpdateTasks={handleUpdateTasks}
            triggerPrioritize={handleTriggerPrioritization}
            isPrioritizing={isPrioritizing}
          />
        )}

        {activeTab === 'habits' && (
          <HabitTracker 
            habits={habits}
            onUpdateHabits={handleUpdateHabits}
          />
        )}

        {activeTab === 'goal-architect' && (
          <GoalPlanner 
            goalPlans={goalPlans}
            onUpdateGoalPlans={handleUpdateGoalPlans}
            onAddTask={handleAddTask}
          />
        )}

      </main>

      {/* Bottom Footer block */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="flex justify-center items-center gap-1.5 mb-2">
          <span>Crafted for high performance with</span>
          <Heart size={10} className="text-rose-500 fill-rose-500/20" />
          <span>&bull; Powered by Gemini 3.5 Flash</span>
        </div>
        <p>&copy; 2026 SIA Brain Labs. All Rights Reserved. Stay Proactive.</p>
      </footer>

    </div>
  );
}
