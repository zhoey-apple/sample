// Reference: blueprint:javascript_database
import { users, principles, plans, type User, type InsertUser, type Principles, type InsertPrinciples, type Plan, type InsertPlan } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Principles
  getPrinciples(userId: string): Promise<Principles | undefined>;
  createPrinciples(data: InsertPrinciples): Promise<Principles>;
  updatePrinciples(userId: string, updates: Partial<Principles>): Promise<Principles>;
  
  // Plans
  getPlan(userId: string, date: string, type: string): Promise<Plan | undefined>;
  getAllPlans(userId: string): Promise<Plan[]>;
  createPlan(data: InsertPlan): Promise<Plan>;
  updatePlan(planId: string, userId: string, updates: Partial<Plan>): Promise<Plan>;
  deletePlan(planId: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Principles
  async getPrinciples(userId: string): Promise<Principles | undefined> {
    const [result] = await db.select().from(principles).where(eq(principles.userId, userId));
    return result || undefined;
  }

  async createPrinciples(data: InsertPrinciples): Promise<Principles> {
    const [result] = await db
      .insert(principles)
      .values(data)
      .returning();
    return result;
  }

  async updatePrinciples(userId: string, updates: Partial<Principles>): Promise<Principles> {
    const [result] = await db
      .update(principles)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(principles.userId, userId))
      .returning();
    
    if (!result) {
      throw new Error("Principles not found");
    }
    
    return result;
  }

  // Plans
  async getPlan(userId: string, date: string, type: string): Promise<Plan | undefined> {
    const [plan] = await db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.userId, userId),
          eq(plans.date, date),
          eq(plans.type, type)
        )
      );
    return plan || undefined;
  }

  async getAllPlans(userId: string): Promise<Plan[]> {
    return await db.select().from(plans).where(eq(plans.userId, userId));
  }

  async createPlan(data: InsertPlan): Promise<Plan> {
    const [plan] = await db
      .insert(plans)
      .values(data)
      .returning();
    return plan;
  }

  async updatePlan(planId: string, userId: string, updates: Partial<Plan>): Promise<Plan> {
    const [plan] = await db
      .update(plans)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(
        and(
          eq(plans.id, planId),
          eq(plans.userId, userId)
        )
      )
      .returning();
    
    if (!plan) {
      throw new Error("Plan not found");
    }
    
    return plan;
  }

  async deletePlan(planId: string, userId: string): Promise<void> {
    await db
      .delete(plans)
      .where(
        and(
          eq(plans.id, planId),
          eq(plans.userId, userId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
