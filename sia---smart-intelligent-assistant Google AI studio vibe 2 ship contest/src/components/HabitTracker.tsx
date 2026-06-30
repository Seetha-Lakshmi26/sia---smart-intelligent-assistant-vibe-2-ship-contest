import React, { useState } from 'react';
import { Habit } from '../types';
import { 
  Plus, 
  Flame, 
  Check, 
  Trash2, 
  Activity, 
  Award, 
  Sparkles, 
  CalendarDays,
  Target,
  Clock
} from 'lucide-react';

interface HabitTrackerProps {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
}

export default function HabitTracker({
  habits,
  onUpdateHabits
}: HabitTrackerProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      category,
      frequency,
      completedDates: [],
      streak: 0
    };

    onUpdateHabits([...habits, newHabit]);
    setTitle('');
  };

  const handleDeleteHabit = (id: string) => {
    onUpdateHabits(habits.filter(h => h.id !== id));
  };

  const handleToggleDate = (habitId: string, dateStr: string) => {
    const updatedHabits = habits.map(h => {
      if (h.id !== habitId) return h;

      const exists = h.completedDates.includes(dateStr);
      let newDates = [...h.completedDates];

      if (exists) {
        newDates = newDates.filter(d => d !== dateStr);
      } else {
        newDates.push(dateStr);
      }

      // Recalculate streak
      let streak = 0;
      let checkDate = new Date();
      
      // Let's look backwards day-by-day starting today (or yesterday if not done today yet)
      const currentTodayStr = checkDate.toISOString().split('T')[0];
      const currentYesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const doneToday = newDates.includes(currentTodayStr);
      const doneYesterday = newDates.includes(currentYesterdayStr);

      if (doneToday || doneYesterday) {
        let isStreakContinuous = true;
        let dayOffset = doneToday ? 0 : 1;
        
        while (isStreakContinuous) {
          const checkDateStr = new Date(Date.now() - dayOffset * 86400000).toISOString().split('T')[0];
          if (newDates.includes(checkDateStr)) {
            streak++;
            dayOffset++;
          } else {
            isStreakContinuous = false;
          }
        }
      }

      return {
        ...h,
        completedDates: newDates,
        streak
      };
    });

    onUpdateHabits(updatedHabits);
  };

  const habitCategories = ['Health', 'Work', 'Learning', 'Mindset', 'Fitness', 'Routine'];

  // Quick stats
  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const completedTodayCount = habits.filter(h => h.completedDates.includes(todayStr)).length;

  return (
    <div className="space-y-6" id="sia-habit-tracker-container">
      {/* Top Habit Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-rose-400 uppercase font-mono">Consistency Engine</span>
            <h3 className="text-3xl font-bold font-display text-white mt-1 flex items-center gap-2">
              {totalStreaks}
              <Flame className="text-rose-400 fill-rose-500/20 animate-pulse" size={24} />
            </h3>
            <p className="text-xs text-slate-400 mt-1">Combined current streaks across all goals.</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <Flame size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase font-mono">Legendary Record</span>
            <h3 className="text-3xl font-bold font-display text-white mt-1 flex items-center gap-2">
              {bestStreak} Days
            </h3>
            <p className="text-xs text-slate-400 mt-1">Your absolute peak continuous daily record.</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Award size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase font-mono">Today&apos;s Routines</span>
            <h3 className="text-3xl font-bold font-display text-white mt-1">
              {completedTodayCount} / {habits.length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Micro-habits successfully checked in today.</p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Activity size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Habit Form */}
        <div className="glass-panel rounded-2xl p-6 h-fit" id="create-habit-panel">
          <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase font-mono block mb-1">Ritual Building</span>
          <h2 className="text-xl font-bold font-display text-white mb-4">Launch New Habit</h2>

          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Habit Title *</label>
              <input
                type="text"
                required
                placeholder="Diaphragmatic loop breathing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                id="habit-title-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                >
                  {habitCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold p-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
              id="submit-habit-btn"
            >
              <Plus size={16} />
              Anchor Habit
            </button>
          </form>

          {/* Educational Insight for anchor habits */}
          <div className="mt-5 p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1.5 leading-relaxed font-mono">
            <span className="text-cyan-400 font-semibold uppercase text-[10px] block">💡 SIA Habit-Stacking Tip:</span>
            Anchor new rituals to an existing reliable trigger. Example: &ldquo;Immediately after my morning coffee (trigger), I will do 10 minutes of deep meditation (new habit).&rdquo;
          </div>
        </div>

        {/* Right Column: Habit list & Interactive checkboxes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-6" id="habits-list-panel">
            <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
              <Target size={18} className="text-cyan-400" />
              Active Daily Rituals
            </h2>

            {habits.length === 0 ? (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                <Target size={36} className="mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No anchored habits in record yet.</p>
                <p className="text-xs text-slate-500 mt-1">Start small by tracking 1-2 powerful daily anchors.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => {
                  const doneToday = habit.completedDates.includes(todayStr);
                  const doneYesterday = habit.completedDates.includes(yesterdayStr);

                  return (
                    <div 
                      key={habit.id} 
                      className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-900/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      id={`habit-card-${habit.id}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-semibold text-sm text-slate-200 truncate">{habit.title}</h3>
                          <span className="bg-slate-800 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded font-semibold uppercase">
                            {habit.category}
                          </span>
                        </div>
                        
                        {/* Weekly grid map summary representation */}
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500 mr-1.5">Recent 7 Days:</span>
                          {[6, 5, 4, 3, 2, 1, 0].map((offset) => {
                            const date = new Date(Date.now() - offset * 86400000);
                            const checkStr = date.toISOString().split('T')[0];
                            const completed = habit.completedDates.includes(checkStr);
                            const isToday = offset === 0;

                            return (
                              <button
                                key={offset}
                                title={`${date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - ${completed ? 'Completed' : 'Missed'}`}
                                onClick={() => handleToggleDate(habit.id, checkStr)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-all ${
                                  completed 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold' 
                                    : 'bg-slate-950 border border-slate-800 text-slate-600 hover:border-slate-700'
                                } ${isToday ? 'ring-1 ring-cyan-400' : ''}`}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Control Actions & Checkboxes */}
                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800/60 pt-3 md:pt-0">
                        {/* Current Flame Streak */}
                        <div className="flex items-center gap-1.5 font-mono">
                          <Flame className={habit.streak > 0 ? 'text-rose-500 fill-rose-500/10 animate-pulse' : 'text-slate-600'} size={18} />
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-200 block">{habit.streak} days</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">streak</span>
                          </div>
                        </div>

                        {/* Complete Today checkbox */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleDate(habit.id, todayStr)}
                            className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg border font-semibold font-mono transition ${
                              doneToday 
                                ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/10' 
                                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                            id={`habit-today-btn-${habit.id}`}
                          >
                            <Check size={13} />
                            Today
                          </button>

                          <button 
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="p-1.5 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition"
                            id={`delete-habit-${habit.id}`}
                          >
                            <Trash2 size={13} />
                          </button>
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
