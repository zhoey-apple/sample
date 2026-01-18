import { Plan, PlanType, Principles, Task, User, HabitDefinition } from "./types";
import { format, addDays, subDays, parseISO, isSameDay, getISOWeek, startOfISOWeek, getYear, getMonth } from "date-fns";

// API client for backend communication
class APIStorage {
  private async fetch(url: string, options?: RequestInit) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string): Promise<User | null> {
    const data = await this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data.user;
  }

  async logout(): Promise<void> {
    await this.fetch('/api/auth/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await this.fetch('/api/auth/me');
      return data.user;
    } catch {
      return null;
    }
  }

  // Principles
  async getPrinciples(userId: string): Promise<Principles> {
    return await this.fetch('/api/principles');
  }

  async updatePrinciples(userId: string, updates: Partial<Principles>): Promise<Principles> {
    return await this.fetch('/api/principles', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Plans
  async getPlan(userId: string, date: string, type: PlanType): Promise<Plan | null> {
    try {
      return await this.fetch(`/api/plans/${type}/${date}`);
    } catch {
      return null;
    }
  }

  async getAllPlans(userId: string): Promise<Plan[]> {
    return await this.fetch('/api/plans');
  }

  async createPlan(userId: string, date: string, type: PlanType): Promise<Plan> {
    // The backend automatically creates plans if they don't exist, so we can just fetch
    return await this.fetch(`/api/plans/${type}/${date}`);
  }
  
  async getOrCreatePlan(userId: string, date: string, type: PlanType): Promise<Plan> {
    // Backend auto-creates if missing
    return await this.fetch(`/api/plans/${type}/${date}`);
  }

  async updatePlan(userId: string, planId: string, updates: Partial<Plan>): Promise<Plan> {
    return await this.fetch(`/api/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deletePlan(userId: string, planId: string): Promise<void> {
    await this.fetch(`/api/plans/${planId}`, {
      method: 'DELETE',
    });
  }
}

export const storage = new APIStorage();
