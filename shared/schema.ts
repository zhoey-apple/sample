import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Task type for JSON storage
const taskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  indentLevel: z.number().optional(),
});

// Habit definition type
const habitDefinitionSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

export const principles = pgTable("principles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull().default(""),
  habitDefinitions: jsonb("habit_definitions").$type<z.infer<typeof habitDefinitionSchema>[]>().notNull().default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPrinciplesSchema = createInsertSchema(principles).omit({
  id: true,
  updatedAt: true,
});

export type InsertPrinciples = z.infer<typeof insertPrinciplesSchema>;
export type Principles = typeof principles.$inferSelect;

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 10 }).notNull(), // 'year' | 'month' | 'week' | 'day'
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  
  // Content fields
  direction: text("direction").default(""),
  reflection: text("reflection").default(""),
  notes: text("notes").default(""),
  
  // Structured data
  tasks: jsonb("tasks").$type<z.infer<typeof taskSchema>[]>().notNull().default(sql`'[]'::jsonb`),
  unfinishedTasks: jsonb("unfinished_tasks").$type<z.infer<typeof taskSchema>[]>().notNull().default(sql`'[]'::jsonb`),
  habits: jsonb("habits").$type<Record<string, boolean>>().notNull().default(sql`'{}'::jsonb`),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
