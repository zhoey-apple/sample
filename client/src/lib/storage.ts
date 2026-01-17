import { Plan, PlanType, Principles, Task, User, HabitDefinition } from "./types";
import { format, addDays, subDays, parseISO, isSameDay, getISOWeek, startOfISOWeek, getYear, getMonth } from "date-fns";

// Mock Data Store
class MockStorage {
  private users: User[] = [
    { id: "1", email: "demo@example.com", name: "Demo User" }
  ];
  
  private plans: Plan[] = [];
  private principles: Principles[] = [];
  
  constructor() {
    // Load from localStorage if available to persist across reloads for the user
    if (typeof window !== "undefined") {
      const savedPlans = localStorage.getItem("plans");
      const savedPrinciples = localStorage.getItem("principles");
      
      if (savedPlans) this.plans = JSON.parse(savedPlans);
      if (savedPrinciples) this.principles = JSON.parse(savedPrinciples);
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      localStorage.setItem("plans", JSON.stringify(this.plans));
      localStorage.setItem("principles", JSON.stringify(this.principles));
    }
  }

  // Auth
  async login(email: string): Promise<User | null> {
    let user = this.users.find(u => u.email === email);
    if (!user) {
      user = { id: Math.random().toString(36).substr(2, 9), email, name: email.split('@')[0] };
      this.users.push(user);
    }
    return user;
  }

  // Principles
  async getPrinciples(userId: string): Promise<Principles> {
    let p = this.principles.find(p => p.userId === userId);
    if (!p) {
      p = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        content: "# My Life Principles\n\n1. Be honest.\n2. Create value.\n3. Stay curious.",
        habitDefinitions: [],
        updatedAt: new Date().toISOString()
      };
      this.principles.push(p);
      this.save();
    } else if (!p.habitDefinitions) {
      // Migration for existing data
      p.habitDefinitions = [];
      this.save();
    }
    return p;
  }

  async updatePrinciples(userId: string, updates: Partial<Principles>): Promise<Principles> {
    const p = await this.getPrinciples(userId);
    Object.assign(p, updates);
    p.updatedAt = new Date().toISOString();
    this.save();
    return p;
  }

  // Plans
  async getPlan(userId: string, date: string, type: PlanType): Promise<Plan | null> {
    return this.plans.find(p => p.userId === userId && p.date === date && p.type === type) || null;
  }

  async getAllPlans(userId: string): Promise<Plan[]> {
    return this.plans.filter(p => p.userId === userId);
  }

  async createPlan(userId: string, date: string, type: PlanType): Promise<Plan> {
    // Inheritance Logic
    let unfinishedTasks: Task[] = [];
    
    // For daily plans, we no longer copy unfinished tasks. 
    // They are now referenced dynamically in the UI.
    if (type === 'day') {
       // logic removed as per new requirement
    } else if (type === 'week') {
        // Week plan inheritance
        const dateObj = parseISO(date);
        const lastWeek = format(subDays(dateObj, 7), 'yyyy-MM-dd');
        const lastWeekPlan = this.plans.find(p => p.userId === userId && p.date === lastWeek && p.type === 'week');
        if (lastWeekPlan) {
            const pending = lastWeekPlan.tasks.filter(t => !t.completed);
            const inherited = lastWeekPlan.unfinishedTasks.filter(t => !t.completed);
            unfinishedTasks = [...inherited, ...pending].map(t => ({ ...t, id: Math.random().toString(36).substr(2, 9) }));
        }
    }

    const newPlan: Plan = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      type,
      date,
      tasks: [],
      unfinishedTasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      habits: {},
      notes: '',
      direction: ''
    };
    
    this.plans.push(newPlan);
    this.save();
    return newPlan;
  }
  
  async getOrCreatePlan(userId: string, date: string, type: PlanType): Promise<Plan> {
    const existing = await this.getPlan(userId, date, type);
    if (existing) return existing;
    return this.createPlan(userId, date, type);
  }

  async updatePlan(userId: string, planId: string, updates: Partial<Plan>): Promise<Plan> {
    const plan = this.plans.find(p => p.id === planId && p.userId === userId);
    if (!plan) throw new Error("Plan not found");
    
    Object.assign(plan, updates);
    plan.updatedAt = new Date().toISOString();
    this.save();
    return plan;
  }
}

export const storage = new MockStorage();
