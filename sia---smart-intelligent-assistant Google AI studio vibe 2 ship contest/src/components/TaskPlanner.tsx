import React, { useState } from 'react';
import { Task, UrgencyType } from '../types';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Check, 
  X, 
  ListTodo,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  CalendarDays,
  Loader2
} from 'lucide-react';

interface TaskPlannerProps {
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
  triggerPrioritize: () => Promise<void>;
  isPrioritizing: boolean;
}

export default function TaskPlanner({
  tasks,
  onUpdateTasks,
  triggerPrioritize,
  isPrioritizing
}: TaskPlannerProps) {
  // New Task input form states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [urgency, setUrgency] = useState<UrgencyType>('MEDIUM');
  const [category, setCategory] = useState('Work');
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  // New task submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      dueDate,
      urgency,
      category,
      completed: false,
      estimatedHours: Number(estimatedHours) || 1,
      scheduledTime: 'Flexible',
      priorityScore: urgency === 'CRITICAL' ? 85 : urgency === 'HIGH' ? 70 : urgency === 'MEDIUM' ? 50 : 25,
      notes: notes.trim() || undefined
    };

    onUpdateTasks([newTask, ...tasks]);
    setTitle('');
    setNotes('');
    // Scroll list or notify
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  const handleToggleCompleted = (id: string) => {
    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const categories = ['Work', 'Personal', 'Learning', 'Health', 'Finance', 'Admin', 'Other'];

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'All' || t.urgency === urgencyFilter;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  return (
    <div className="space-y-6" id="sia-task-planner-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create Task Form */}
        <div className="glass-panel rounded-2xl p-6 h-fit" id="create-task-panel">
          <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase font-mono block mb-1">Schedule Sprint</span>
          <h2 className="text-xl font-bold font-display text-white mb-4">Add Task to Planner</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Task Title *</label>
              <input
                type="text"
                required
                placeholder="Review API design specification"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                id="task-title-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Est. Hours</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">SIA Brief / Notes (Optional)</label>
              <textarea
                placeholder="Include database tables and endpoints to verify..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold p-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
              id="submit-task-btn"
            >
              <Plus size={16} />
              Add Task to Sprint
            </button>
          </form>
        </div>

        {/* Right Column: Search, Filter & List Tasks */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* List Operations & Filters bar */}
          <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center" id="task-filter-panel">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search tasks or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-[11px] rounded-lg py-2 px-3 text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-[11px] rounded-lg py-2 px-3 text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="All">All Urgency</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <button 
                onClick={triggerPrioritize}
                disabled={isPrioritizing}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                id="ai-prioritize-list-btn"
              >
                {isPrioritizing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                AI Prioritization
              </button>
            </div>
          </div>

          {/* Actual Tasks List */}
          <div className="space-y-3" id="tasks-list">
            {filteredTasks.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-slate-800">
                <ListTodo size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-medium">No matching tasks found.</p>
                <p className="text-xs text-slate-500 mt-1">Clear filters or schedule a new task to get started.</p>
              </div>
            ) : (
              filteredTasks.map((t) => {
                let urgencyBadge = "text-slate-400 bg-slate-800";
                if (t.urgency === 'CRITICAL') urgencyBadge = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                if (t.urgency === 'HIGH') urgencyBadge = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                if (t.urgency === 'MEDIUM') urgencyBadge = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";

                return (
                  <div 
                    key={t.id} 
                    className={`glass-panel rounded-xl p-5 hover:bg-slate-900/60 transition-all border-l-4 ${t.completed ? 'border-l-slate-700 opacity-60' : t.urgency === 'CRITICAL' ? 'border-l-rose-500' : t.urgency === 'HIGH' ? 'border-l-amber-500' : 'border-l-cyan-500'}`}
                    id={`task-card-${t.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Completion check */}
                      <button 
                        onClick={() => handleToggleCompleted(t.id)}
                        className={`p-1.5 rounded-lg border mt-1 transition ${t.completed ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-700 text-transparent hover:border-cyan-400'}`}
                        id={`task-toggle-${t.id}`}
                      >
                        <Check size={14} className={t.completed ? 'block' : 'opacity-0 hover:opacity-100 text-slate-500'} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h3 className={`text-base font-semibold leading-tight ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {t.title}
                            </h3>
                            <div className="flex flex-wrap gap-2.5 items-center mt-2 text-xs text-slate-500 font-mono">
                              <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded uppercase text-[10px] font-semibold">
                                {t.category}
                              </span>
                              <span className={`border px-2 py-0.5 rounded text-[10px] font-semibold ${urgencyBadge}`}>
                                {t.urgency}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays size={12} /> {t.dueDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> {t.estimatedHours} Hours
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {t.priorityScore > 0 && (
                              <div className="text-right">
                                <div className="text-xs font-semibold text-cyan-400 font-mono">Score {t.priorityScore}</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-widest">Priority</div>
                              </div>
                            )}
                            <button 
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1.5 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition"
                              id={`delete-task-${t.id}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Optional Notes/Description */}
                        {t.notes && (
                          <div className="mt-3 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-slate-300">
                            <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Notes:</span>
                            <p>{t.notes}</p>
                          </div>
                        )}

                        {/* Dynamic AI strategic insights */}
                        {t.aiReasoning && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-cyan-950/10 to-slate-950 border border-cyan-500/10 rounded-lg text-xs">
                            <p className="text-slate-300 italic leading-relaxed font-mono">
                              <span className="text-cyan-400 font-semibold uppercase tracking-wider text-[10px] not-italic mr-1.5">SIA Brain:</span> 
                              {t.aiReasoning}
                            </p>
                            {t.suggestedAction && !t.completed && (
                              <div className="mt-1.5 flex gap-1 items-start text-amber-400 font-mono">
                                <span className="font-bold text-[10px] uppercase tracking-wider mt-0.5">Advice:</span>
                                <span className="text-slate-300">{t.suggestedAction}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
