import { Task, Habit, GoalPlan, ProactiveInsight } from '../types';

export interface UserAccount {
  email: string;
  passwordHash: string; // Simple local password storage
  name: string;
}

// Seed tasks to make a new user's interface beautiful and populated on first signup
const SEED_TASKS = (email: string): Task[] => [
  {
    id: `task-1-${email}`,
    title: 'Review Engineering Team Sprint Deliverables',
    dueDate: new Date().toISOString().split('T')[0], // Today
    urgency: 'HIGH',
    category: 'Work',
    completed: false,
    estimatedHours: 1.5,
    scheduledTime: '10:00 AM - 11:30 AM',
    priorityScore: 85,
    aiReasoning: 'Critical dependency for the upcoming production deploy scheduled tonight.',
    suggestedAction: 'Review the closed PRs and leave comments before the standup.',
    notes: 'Make sure to check database migration scripts.'
  },
  {
    id: `task-2-${email}`,
    title: 'Bi-annual Performance Review Preparation',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    urgency: 'MEDIUM',
    category: 'Work',
    completed: false,
    estimatedHours: 2,
    scheduledTime: '2:00 PM - 4:00 PM',
    priorityScore: 68,
    aiReasoning: 'Impacts upcoming promotion cycle. Early preparation minimizes last-minute stress.',
    suggestedAction: 'Write down key accomplishments from last quarter and self-evaluation.',
    notes: 'Reference feedback from engineering partners.'
  },
  {
    id: `task-3-${email}`,
    title: 'SIA Dashboard UI Component Optimization',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // In 2 days
    urgency: 'CRITICAL',
    category: 'Work',
    completed: true,
    estimatedHours: 3,
    scheduledTime: '09:00 AM - 12:00 PM',
    priorityScore: 92,
    aiReasoning: 'Completed ahead of schedule to unblock the client review team.',
    suggestedAction: 'Excellent job finishing this critical item. Collect metrics for performance analysis.',
    notes: 'Refactored canvas listeners and reduced re-renders.'
  },
  {
    id: `task-4-${email}`,
    title: 'Prepare Presentation Slides on AI Product Strategy',
    dueDate: new Date().toISOString().split('T')[0], // Today
    urgency: 'CRITICAL',
    category: 'Work',
    completed: false,
    estimatedHours: 2,
    scheduledTime: '1:30 PM - 3:30 PM',
    priorityScore: 95,
    aiReasoning: 'High-impact presentation to the VP of Product in less than 4 hours.',
    suggestedAction: 'Refine the core three pillars first, then polish the visuals.',
    notes: 'Incorporate latest customer engagement statistics.'
  },
  {
    id: `task-5-${email}`,
    title: 'Cardio Training & Mindfulness Practice',
    dueDate: new Date().toISOString().split('T')[0], // Today
    urgency: 'LOW',
    category: 'Health',
    completed: false,
    estimatedHours: 1,
    scheduledTime: '5:30 PM - 6:30 PM',
    priorityScore: 40,
    aiReasoning: 'Sustained cognitive capacity requires physical and mental health alignment.',
    suggestedAction: 'Plan a solid 30-minute run followed by 10 minutes of deep breathing.',
    notes: 'Gym clothes are packed.'
  }
];

const SEED_HABITS = (email: string): Habit[] => [
  {
    id: `habit-1-${email}`,
    title: 'Deep Work Session (90 Mins)',
    category: 'Work',
    frequency: 'daily',
    completedDates: [
      new Date(Date.now() - 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    ],
    streak: 3
  },
  {
    id: `habit-2-${email}`,
    title: 'Read Technical Book (30 Mins)',
    category: 'Learning',
    frequency: 'daily',
    completedDates: [
      new Date(Date.now() - 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    ],
    streak: 2
  },
  {
    id: `habit-3-${email}`,
    title: 'Review Financial & Budget Logs',
    category: 'Finance',
    frequency: 'weekly',
    completedDates: [
      new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    ],
    streak: 1
  }
];

const SEED_GOAL_PLANS = (email: string): GoalPlan[] => [
  {
    id: `goal-1-${email}`,
    goalTitle: 'Learn and Implement Rust Web Server',
    targetDays: 7,
    subtasks: [
      {
        title: 'Understand Rust Ownership and Lifetimes basics',
        durationHours: 3,
        timeBlockSuggestion: 'Morning Focus Block',
        phase: 'Phase 1: Basic Mastery',
        reasoning: 'Essential foundation before building asynchronous networking components.',
        completed: true
      },
      {
        title: 'Set up Actix-web server structure with simple endpoints',
        durationHours: 2.5,
        timeBlockSuggestion: 'Afternoon Lab Session',
        phase: 'Phase 2: Core Skeleton',
        reasoning: 'Creates the boilerplate structure for query handling and response routing.',
        completed: false
      },
      {
        title: 'Integrate PostgreSQL connection pool (SQLx)',
        durationHours: 4,
        timeBlockSuggestion: 'Midday deep block',
        phase: 'Phase 3: Data Integration',
        reasoning: 'Enables durable state preservation and basic entity modeling with compile-time checks.',
        completed: false
      }
    ],
    timelineAdvice: 'Keep milestones granular. As Rust compiler feedback can be intense, focus on small compiling blocks before building large architectural patterns.',
    createdAt: new Date().toISOString()
  }
];

const SEED_INSIGHTS = (email: string): ProactiveInsight[] => [
  {
    id: `insight-1-${email}`,
    type: 'WARNING',
    title: 'High-Impact Deliverable Approaching',
    message: 'Your high-impact presentation on "AI Product Strategy" is today at 1:30 PM. Focus entirely on refining your visual slides before midday meetings drain your energy.',
    targetTaskId: `task-4-${email}`
  },
  {
    id: `insight-2-${email}`,
    type: 'PREPARATION',
    title: 'Review Talking Points Ahead',
    message: 'Engineering Team standup begins soon. Spend 5 minutes verifying current blockers so you can lead the discussion with confidence and support team needs.',
    targetTaskId: `task-1-${email}`
  },
  {
    id: `insight-3-${email}`,
    type: 'HABIT',
    title: 'Deep Work Consistency Tracker',
    message: 'You have maintained a 3-day streak on your "Deep Work Session (90 Mins)" habit. Block off 9:00 AM tomorrow to secure day 4 and solidify your workflow rhythm.',
    targetTaskId: `habit-1-${email}`
  }
];

// USER ACCOUNTS HANDLERS
export function getUsers(): UserAccount[] {
  const usersJson = localStorage.getItem('sia_users');
  if (usersJson) {
    try {
      return JSON.parse(usersJson);
    } catch (e) {
      return [];
    }
  }
  // Let's seed one default demo user account: demo@sia.ai / password
  const defaultUsers: UserAccount[] = [
    { email: 'demo@sia.ai', passwordHash: 'password', name: 'Visionary Demo User' }
  ];
  localStorage.setItem('sia_users', JSON.stringify(defaultUsers));
  return defaultUsers;
}

export function saveUser(user: UserAccount): boolean {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    return false; // User already exists
  }
  users.push(user);
  localStorage.setItem('sia_users', JSON.stringify(users));
  return true;
}

export function getCurrentUser(): UserAccount | null {
  const email = localStorage.getItem('sia_current_user_email');
  if (!email) return null;
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function setCurrentUser(email: string | null) {
  if (email) {
    localStorage.setItem('sia_current_user_email', email);
  } else {
    localStorage.removeItem('sia_current_user_email');
  }
}

// SEGMENTED DATA RETRIEVALS
export function getTasksForUser(email: string): Task[] {
  const key = `sia_tasks_${email}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* fallback */ }
  }
  const isDemo = email.toLowerCase() === 'demo@sia.ai';
  const seeded = isDemo ? SEED_TASKS(email) : [];
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function saveTasksForUser(email: string, tasks: Task[]) {
  localStorage.setItem(`sia_tasks_${email}`, JSON.stringify(tasks));
}

export function getHabitsForUser(email: string): Habit[] {
  const key = `sia_habits_${email}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* fallback */ }
  }
  const isDemo = email.toLowerCase() === 'demo@sia.ai';
  const seeded = isDemo ? SEED_HABITS(email) : [];
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function saveHabitsForUser(email: string, habits: Habit[]) {
  localStorage.setItem(`sia_habits_${email}`, JSON.stringify(habits));
}

export function getGoalPlansForUser(email: string): GoalPlan[] {
  const key = `sia_goals_${email}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* fallback */ }
  }
  const isDemo = email.toLowerCase() === 'demo@sia.ai';
  const seeded = isDemo ? SEED_GOAL_PLANS(email) : [];
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function saveGoalPlansForUser(email: string, goals: GoalPlan[]) {
  localStorage.setItem(`sia_goals_${email}`, JSON.stringify(goals));
}

export function getInsightsForUser(email: string): ProactiveInsight[] {
  const key = `sia_insights_${email}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* fallback */ }
  }
  const isDemo = email.toLowerCase() === 'demo@sia.ai';
  const seeded = isDemo ? SEED_INSIGHTS(email) : [];
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

export function saveInsightsForUser(email: string, insights: ProactiveInsight[]) {
  localStorage.setItem(`sia_insights_${email}`, JSON.stringify(insights));
}

export function getMissionForUser(email: string): string {
  const key = `sia_mission_${email}`;
  const saved = localStorage.getItem(key);
  if (saved) return saved;
  const isDemo = email.toLowerCase() === 'demo@sia.ai';
  const defaultMission = isDemo 
    ? 'Optimize deep engineering focus and deliver high-impact AI strategy slides with strategic precision.'
    : 'Establish my daily mission and prioritize today\'s objectives with strategic focus.';
  localStorage.setItem(key, defaultMission);
  return defaultMission;
}

export function saveMissionForUser(email: string, mission: string) {
  localStorage.setItem(`sia_mission_${email}`, mission);
}
