import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPrinciplesSchema, insertPlanSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email is required" });
      }

      // Find or create user
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        const name = email.split('@')[0];
        user = await storage.createUser({ email, name });
      }

      // Set session
      req.session.userId = user.id;
      
      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };

  // Principles
  app.get("/api/principles", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      let principles = await storage.getPrinciples(userId);
      
      // Create default principles if none exist
      if (!principles) {
        principles = await storage.createPrinciples({
          userId,
          content: "# My Life Principles\n\n1. Be honest.\n2. Create value.\n3. Stay curious.",
          habitDefinitions: []
        });
      }

      res.json(principles);
    } catch (error) {
      console.error("Get principles error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/principles", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const updates = req.body;

      const principles = await storage.updatePrinciples(userId, updates);
      res.json(principles);
    } catch (error) {
      console.error("Update principles error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Plans
  app.get("/api/plans", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const plans = await storage.getAllPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error("Get plans error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/plans/:type/:date", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { type, date } = req.params;

      let plan = await storage.getPlan(userId, date, type);

      // Create plan if it doesn't exist
      if (!plan) {
        plan = await storage.createPlan({
          userId,
          type,
          date,
          tasks: [],
          unfinishedTasks: [],
          habits: {},
          notes: "",
          direction: "",
          reflection: ""
        });
      }

      res.json(plan);
    } catch (error) {
      console.error("Get plan error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/plans/:planId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { planId } = req.params;
      const updates = req.body;

      const plan = await storage.updatePlan(planId, userId, updates);
      res.json(plan);
    } catch (error) {
      console.error("Update plan error:", error);
      if (error instanceof Error && error.message === "Plan not found") {
        return res.status(404).json({ error: "Plan not found" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/plans/:planId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const { planId } = req.params;

      await storage.deletePlan(planId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete plan error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
