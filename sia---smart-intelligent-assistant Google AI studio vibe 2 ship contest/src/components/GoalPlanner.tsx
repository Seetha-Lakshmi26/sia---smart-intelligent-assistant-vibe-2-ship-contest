import React, { useState } from 'react';
import { GoalPlan, GoalSubtask } from '../types';
import { 
  Sparkles, 
  Layers, 
  Clock, 
  Trash2, 
  Play, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Check, 
  CheckCircle2,
  Bookmark,
  CalendarDays,
  Loader2
} from 'lucide-react';

interface GoalPlannerProps {
  goalPlans: GoalPlan[];
  onUpdateGoalPlans: (plans: GoalPlan[]) => void;
  onAddTask: (task: any) => void;
}

export default function GoalPlanner({
  goalPlans,
  onUpdateGoalPlans,
  onAddTask
}: GoalPlannerProps) {
  const [goalTitle, setGoalTitle] = useState('');
  const [targetDays, setTargetDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/plan-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalTitle.trim(), targetedDays: targetDays })
      });

      if (!res.ok) {
        throw new Error('Failed to generate plan with SIA Brain.');
      }

      const data = await res.json();
      
      const newPlan: GoalPlan = {
        id: `goal-${Date.now()}`,
        goalTitle: goalTitle.trim(),
        targetDays,
        subtasks: (data.subtasks || []).map((st: any) => ({
          ...st,
          completed: false
        })),
        timelineAdvice: data.timelineAdvice || 'Stay consistent and focus on incremental steps.',
        createdAt: new Date().toISOString()
      };

      onUpdateGoalPlans([newPlan, ...goalPlans]);
      setGoalTitle('');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error communicating with SIA Brain.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePlan = (id: string) => {
    onUpdateGoalPlans(goalPlans.filter(p => p.id !== id));
  };

  const handleToggleSubtask = (planId: string, subtaskIndex: number) => {
    onUpdateGoalPlans(goalPlans.map(plan => {
      if (plan.id !== planId) return plan;
      const updatedSubtasks = plan.subtasks.map((st, idx) => 
        idx === subtaskIndex ? { ...st, completed: !st.completed } : st
      );
      return { ...plan, subtasks: updatedSubtasks };
    }));
  };

  const handleScheduleAsTask = (plan: GoalPlan, subtask: GoalSubtask) => {
    // Schedule a subtask as an actual daily task
    const newTask = {
      id: `task-${Date.now()}`,
      title: `${plan.goalTitle}: ${subtask.title}`,
      dueDate: new Date().toISOString().split('T')[0], // Schedule for today
      urgency: 'HIGH',
      category: 'Learning',
      completed: false,
      estimatedHours: subtask.durationHours || 1,
      scheduledTime: subtask.timeBlockSuggestion || 'Flexible',
      priorityScore: 70,
      aiReasoning: `Goal: "${plan.goalTitle}". Scheduled from autonomous sub-task breakdown.`,
      suggestedAction: subtask.reasoning || 'Execute focus block immediately.'
    };
    onAddTask(newTask);
  };

  // Pre-seed mock goals ideas for simulation
  const handleSimulateGoal = (presetTitle: string, presetDays: number) => {
    setGoalTitle(presetTitle);
    setTargetDays(presetDays);
  };

  return (
    <div className="space-y-6" id="sia-goal-planner-container">
      
      {/* Top section: Interactive form generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel */}
        <div className="glass-panel rounded-2xl p-6 h-fit" id="goal-generator-panel">
          <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase font-mono block mb-1">Autonomous Agent</span>
          <h2 className="text-xl font-bold font-display text-white mb-4">SIA Goal Architect</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Enter any broad, complex aspiration. SIA will dynamically decompose the mountain into hyper-focused micro-actions, schedule blocks, and guide your psychology.
          </p>

          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Target Accomplishment *</label>
              <textarea
                required
                placeholder="Ex: Draft and release full REST API specification in Go, including JWT auth..."
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                rows={3}
                id="goal-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Target Window (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg font-mono">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-semibold p-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
              id="generate-plan-btn"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  SIA is decomposing goal...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Architect Goal Plan
                </>
              )}
            </button>
          </form>

          {/* Quick presets for stimulation */}
          <div className="border-t border-slate-800/80 pt-4 mt-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Goal Inspiration Templates:</span>
            <div className="space-y-1.5">
              <button 
                onClick={() => handleSimulateGoal("Design interactive high-performance portfolio with Tailwind & custom Canvas engine", 5)}
                className="w-full text-left text-[11px] bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg p-2 transition font-mono truncate"
              >
                Portfolio with Canvas engine (5 days)
              </button>
              <button 
                onClick={() => handleSimulateGoal("Write a 5,000-word research publication on AI multi-agent orchestration", 14)}
                className="w-full text-left text-[11px] bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg p-2 transition font-mono truncate"
              >
                Multi-agent orchestration draft (14 days)
              </button>
            </div>
          </div>
        </div>

        {/* Right Active Plans Display */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6" id="goal-plans-list">
            <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-cyan-400" />
              Active Architectural Masterplans
            </h2>

            {goalPlans.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-slate-800 rounded-xl text-slate-400">
                <Layers size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-medium">No masterplans generated yet.</p>
                <p className="text-xs text-slate-500 mt-1">SIA is waiting to dissect your primary ambitions into scheduled microsteps.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {goalPlans.map((plan) => {
                  const completedSubtasks = plan.subtasks.filter(st => st.completed).length;
                  const totalSubtasks = plan.subtasks.length;
                  const completionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                  return (
                    <div 
                      key={plan.id} 
                      className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-900/60 transition-all space-y-4"
                      id={`plan-card-${plan.id}`}
                    >
                      {/* Header info */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-white leading-tight font-display">{plan.goalTitle}</h3>
                          <div className="flex flex-wrap gap-2.5 items-center mt-2 text-xs text-slate-400 font-mono">
                            <span className="bg-slate-950 text-cyan-300 border border-slate-800 px-2 py-0.5 rounded uppercase font-semibold text-[10px]">
                              {plan.targetDays} Days Target
                            </span>
                            <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1.5 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition"
                          id={`delete-plan-${plan.id}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                          <span>Milestone completion rate</span>
                          <span>{completionRate}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="bg-cyan-400 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Timeline strategic advices */}
                      {plan.timelineAdvice && (
                        <div className="p-3 bg-cyan-950/15 border border-cyan-500/15 rounded-lg text-xs leading-relaxed font-mono">
                          <span className="text-cyan-400 font-bold uppercase text-[9px] block mb-0.5">SIA Strategic Alignment:</span>
                          <p className="text-slate-300">{plan.timelineAdvice}</p>
                        </div>
                      )}

                      {/* Subtasks listing */}
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-mono uppercase text-slate-400 font-bold block">Decomposed Micro-steps:</span>
                        
                        <div className="space-y-2">
                          {plan.subtasks.map((st, index) => (
                            <div 
                              key={index} 
                              className={`p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition flex items-start gap-3 justify-between ${st.completed ? 'opacity-55' : ''}`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <button 
                                  onClick={() => handleToggleSubtask(plan.id, index)}
                                  className={`p-1 mt-0.5 rounded border transition ${st.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-800 text-transparent hover:border-cyan-400'}`}
                                >
                                  <Check size={11} className={st.completed ? 'block' : 'opacity-0'} />
                                </button>
                                
                                <div className="min-w-0">
                                  <span className="text-[9px] font-semibold text-cyan-400 tracking-wider uppercase font-mono">{st.phase}</span>
                                  <h4 className={`text-xs font-semibold leading-snug mt-0.5 ${st.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {st.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 mt-1 font-mono">{st.reasoning}</p>
                                  
                                  <div className="flex gap-3 items-center mt-2 text-[10px] text-slate-500 font-mono">
                                    <span className="flex items-center gap-1"><Clock size={11} /> {st.durationHours} hrs</span>
                                    <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">{st.timeBlockSuggestion}</span>
                                  </div>
                                </div>
                              </div>

                              {!st.completed && (
                                <button 
                                  onClick={() => handleScheduleAsTask(plan, st)}
                                  title="Schedule this subtask into today's sprint timeline"
                                  className="text-[10px] bg-slate-900 hover:bg-cyan-500 hover:text-black border border-slate-800 text-slate-300 py-1 px-2.5 rounded transition font-mono whitespace-nowrap flex items-center gap-1 shrink-0"
                                >
                                  <Play size={10} />
                                  Add to Today
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
