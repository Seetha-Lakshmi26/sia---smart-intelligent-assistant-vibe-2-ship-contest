export type UrgencyType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  urgency: UrgencyType;
  category: string; // Work, Personal, Learn, Health, etc.
  completed: boolean;
  estimatedHours: number;
  scheduledTime: string; // e.g. "09:00" or time block suggestion
  priorityScore: number; // 1-100 assigned by Gemini
  aiReasoning?: string; // SIA explanation
  suggestedAction?: string; // Action microstep suggested by SIA
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[]; // List of YYYY-MM-DD strings
  streak: number;
}

export interface GoalSubtask {
  title: string;
  durationHours: number;
  timeBlockSuggestion: string;
  phase: string;
  reasoning: string;
  completed: boolean;
}

export interface GoalPlan {
  id: string;
  goalTitle: string;
  targetDays: number;
  subtasks: GoalSubtask[];
  timelineAdvice: string;
  createdAt: string;
}

export interface ProactiveInsight {
  id: string;
  type: 'INSIGHT' | 'PREPARATION' | 'HABIT' | 'WARNING';
  title: string;
  message: string;
  targetTaskId?: string;
}
