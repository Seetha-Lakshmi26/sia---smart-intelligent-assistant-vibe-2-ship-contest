import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Define SIA System Prompt as a proactive, encouraging, and highly organized executive assistant
const SIA_SYSTEM_PROMPT = `You are SIA (Smart Intelligent Assistant), an advanced, highly proactive, encouraging, and organized AI executive assistant. 
Your core mission is to help the user act before deadlines are missed. You do not just list tasks—you advise strategically, break down overwhelming goals into clear micro-steps, suggest specific focus blocks, and provide context-aware, calming but urgent advice. 
Always speak with a premium, encouraging, and clear tone. You are here to empower the user to achieve their absolute best, optimize their energy levels, and remain calm.`;

const USER_PROVIDED_KEY = "";

if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = USER_PROVIDED_KEY;
}

// Lazy-loaded Gemini Client proxy for dynamic context resolution on every request
const ai = {
  get models() {
    const currentKey = process.env.GEMINI_API_KEY || USER_PROVIDED_KEY;
    const sdk = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return sdk.models;
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check key health
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!process.env.GEMINI_API_KEY,
      message: process.env.GEMINI_API_KEY ? "SIA Brain is fully functional." : "SIA is running in demo mode (Configure GEMINI_API_KEY in Secrets for full AI capabilities)."
    });
  });

  // 1. Prioritize Tasks
  app.post("/api/prioritize", async (req, res) => {
    try {
      const { tasks, currentDate } = req.body;
      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({ error: "Invalid tasks input" });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Return a structured demo response if no API key is provided
        return res.json({
          prioritizedTasks: tasks.map((t, index) => ({
            id: t.id,
            priorityScore: Math.max(10, 100 - index * 15),
            urgencyCategory: index === 0 ? "CRITICAL" : index === 1 ? "HIGH" : "MEDIUM",
            aiReasoning: "SIA [DEMO MODE]: Priorities calculated locally. Add your Gemini API key in the Secrets panel to activate full strategic analysis.",
            suggestedAction: "Focus on this task to maintain steady momentum today."
          })),
          generalInsights: "Welcome to SIA! Configure your Gemini API key in Settings > Secrets to unlock full AI task prioritization, goal planning, and real-time notification warnings."
        });
      }

      const prompt = `Analyze the following task list of the user based on deadlines and task descriptions. The current local date/time is: ${currentDate || new Date().toISOString()}.
Rank each task by a combination of urgency and potential impact. Provide a strategic daily brief.

Task list to analyze:
${JSON.stringify(tasks, null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SIA_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prioritizedTasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "The original task ID" },
                    priorityScore: { type: Type.INTEGER, description: "Calculated score from 1 to 100 based on deadline proximity and strategic impact" },
                    urgencyCategory: { type: Type.STRING, description: "CRITICAL, HIGH, MEDIUM, or LOW" },
                    aiReasoning: { type: Type.STRING, description: "A highly concise sentence explaining why this task is prioritized this way." },
                    suggestedAction: { type: Type.STRING, description: "Immediate physical or mental micro-step to start right away." }
                  },
                  required: ["id", "priorityScore", "urgencyCategory", "aiReasoning", "suggestedAction"]
                }
              },
              generalInsights: {
                type: Type.STRING,
                description: "A motivating executive summary. Summarize focus for the day, highlight critical bottlenecks, and offer warm guidance."
              }
            },
            required: ["prioritizedTasks", "generalInsights"]
          }
        }
      });

      const resultText = response.text || "{}";
      const resultJson = JSON.parse(resultText.trim());
      res.json(resultJson);
    } catch (error: any) {
      console.error("Prioritization error:", error);
      res.status(500).json({ error: error.message || "Failed to prioritize tasks." });
    }
  });

  // 2. Autonomous Planning (Goal Breakdown)
  app.post("/api/plan-goal", async (req, res) => {
    try {
      const { goal, targetedDays } = req.body;
      if (!goal) {
        return res.status(400).json({ error: "Goal is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          subtasks: [
            {
              title: "Analyze and plan requirements for " + goal,
              durationHours: 2,
              timeBlockSuggestion: "Morning Focus block (9:00 AM)",
              phase: "Phase 1: Foundations",
              reasoning: "SIA [DEMO]: Start by listing all prerequisites."
            },
            {
              title: "Execute key tasks and milestones",
              durationHours: 4,
              timeBlockSuggestion: "Midday Action block (1:00 PM)",
              phase: "Phase 2: Core Execution",
              reasoning: "SIA [DEMO]: Put in focused blocks of deep work."
            },
            {
              title: "Review progress and iterate",
              durationHours: 1.5,
              timeBlockSuggestion: "Late Afternoon (4:30 PM)",
              phase: "Phase 3: Refinement",
              reasoning: "SIA [DEMO]: Review output and refine as needed."
            }
          ],
          timelineAdvice: "SIA [DEMO MODE ENABLED]. Add your Gemini API key in Secrets to get high-fidelity structured autonomous planning and dynamic task breakdowns."
        });
      }

      const prompt = `The user has a major goal they want to accomplish: "${goal}".
Targeted days to complete: ${targetedDays || "unspecified"}.
Break down this major goal into highly actionable, atomic sub-tasks that can be scheduled immediately. Suggest duration (in hours) and exact time blocks or schedules.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SIA_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Descriptive, action-oriented title starting with a verb" },
                    durationHours: { type: Type.NUMBER, description: "Estimated duration in hours (decimal is fine)" },
                    timeBlockSuggestion: { type: Type.STRING, description: "Suggested time or block of day, e.g. 'Deep Work Session (90 min)', 'Evening review'" },
                    phase: { type: Type.STRING, description: "Project phase, e.g., 'Phase 1: Initial Research', 'Phase 2: MVP Development'" },
                    reasoning: { type: Type.STRING, description: "Why this sub-task is critical and a quick tip on execution." }
                  },
                  required: ["title", "durationHours", "timeBlockSuggestion", "phase", "reasoning"]
                }
              },
              timelineAdvice: {
                type: Type.STRING,
                description: "Proactive strategic guidance on how to manage the timeline, avoid bottlenecks, and maintain energy levels."
              }
            },
            required: ["subtasks", "timelineAdvice"]
          }
        }
      });

      const resultText = response.text || "{}";
      const resultJson = JSON.parse(resultText.trim());
      res.json(resultJson);
    } catch (error: any) {
      console.error("Planning error:", error);
      res.status(500).json({ error: error.message || "Failed to generate autonomous plan." });
    }
  });

  // 3. Proactive Reminders & Insights
  app.post("/api/proactive-insights", async (req, res) => {
    try {
      const { tasks, habits, currentDate } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          insights: [
            {
              id: "demo-1",
              type: "PREPARATION",
              title: "Ready to Start?",
              message: "SIA [DEMO]: Start your day with a focused, deep-work block for your highest priority task."
            },
            {
              id: "demo-2",
              type: "HABIT",
              title: "Consistency pays off",
              message: "SIA [DEMO]: Habits are won in daily small victories. Choose one micro-habit and perform it now."
            }
          ]
        });
      }

      const prompt = `Current Local Time: ${currentDate || new Date().toISOString()}
User's Tasks: ${JSON.stringify(tasks || [])}
User's Habits: ${JSON.stringify(habits || [])}

Provide exactly 2 to 4 proactive, context-aware advice alerts or strategic notifications. Focus on high urgency tasks coming up soon, preparing ahead of time, or encouraging habit streaks.
Keep messages highly actionable, realistic, and written as if an assistant is watching over the user's shoulder and whispering wisdom right now. Avoid generic advice. Give hyper-specific preparation hints based on the actual tasks and deadlines provided.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SIA_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "A unique slug, e.g. 'prep-interview-insights'" },
                    type: { type: Type.STRING, description: "INSIGHT (general strategies), PREPARATION (task-specific action hints), HABIT (habit warnings/encouragement), WARNING (critical deadline closeby)" },
                    title: { type: Type.STRING, description: "Brief header (e.g., 'Actionable Interview Prep', 'Habit Block Warning')" },
                    message: { type: Type.STRING, description: "The actual proactive, specific alert message." },
                    targetTaskId: { type: Type.STRING, description: "ID of the specific task associated with this advice, if applicable" }
                  },
                  required: ["id", "type", "title", "message"]
                }
              }
            },
            required: ["insights"]
          }
        }
      });

      const resultText = response.text || "{}";
      const resultJson = JSON.parse(resultText.trim());
      res.json(resultJson);
    } catch (error: any) {
      console.error("Insights error:", error);
      res.status(500).json({ error: error.message || "Failed to generate context-aware reminders." });
    }
  });

  // 4. Voice Command Dictation Parse
  app.post("/api/parse-voice", async (req, res) => {
    try {
      const { text, currentDate } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No voice text provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Mock parsing in demo mode
        const isCritical = text.toLowerCase().includes("urgent") || text.toLowerCase().includes("soon") || text.toLowerCase().includes("today");
        return res.json({
          task: {
            title: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            urgency: isCritical ? "HIGH" : "MEDIUM",
            estimatedHours: 1,
            category: "General",
            aiSuggestion: "SIA [DEMO]: Parsed voice task locally. Add your Gemini key to get intelligent scheduling classification."
          }
        });
      }

      const prompt = `The user dictated a task using voice-to-text. Extract the core task details, categorize it, and schedule it intelligently. 
Current Date/Time reference: ${currentDate || new Date().toISOString()}

Voice Input: "${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SIA_SYSTEM_PROMPT + "\nYour task is to parse dictated conversational descriptions of tasks into clean, structured task items.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              task: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "The refined, professional name of the task. Exclude conversational filler." },
                  dueDate: { type: Type.STRING, description: "Best estimated due date in YYYY-MM-DD format based on conversational terms (like 'tomorrow', 'next Monday', or today if urgent)" },
                  urgency: { type: Type.STRING, description: "CRITICAL, HIGH, MEDIUM, or LOW" },
                  estimatedHours: { type: Type.NUMBER, description: "Best estimate of time needed in hours" },
                  category: { type: Type.STRING, description: "Categorization: Work, Personal, Finance, Learning, Health, or Admin" },
                  aiSuggestion: { type: Type.STRING, description: "A quick, encouraging comment from SIA about when to schedule this based on your advice." }
                },
                required: ["title", "dueDate", "urgency", "estimatedHours", "category", "aiSuggestion"]
              }
            },
            required: ["task"]
          }
        }
      });

      const resultText = response.text || "{}";
      const resultJson = JSON.parse(resultText.trim());
      res.json(resultJson);
    } catch (error: any) {
      console.error("Voice parse error:", error);
      res.status(500).json({ error: error.message || "Failed to parse dictation." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
