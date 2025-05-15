import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import session from "express-session";
import MemoryStore from "memorystore";
import { configurePassport, isAuthenticated, isAdmin, registerUser } from "./authService";
import Stripe from "stripe";
// Import PayPal service for handling payment operations
import { handlePayPalSetup, handleCreatePayPalOrder, handleCapturePayPalOrder } from "./paypalService";
import { WebSocketServer } from "ws";
import { registerAIBridgeRoutes } from "./aiBridge";

// Initialize Stripe if key is provided
const stripeClient = process.env.STRIPE_SECRET_KEY ? 
  new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" }) : 
  undefined;

// Create session store
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up session management
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "omnidevsecret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 // 1 day
      },
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );
  
  // Configure authentication
  configurePassport(app);
  
  // Register AI Bridge routes with self-learning and internet search functionality
  registerAIBridgeRoutes(app);
  
  // Set up WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer });
  
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different message types
        if (data.type === "editor_change") {
          // Broadcast to other clients working on the same file
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: "editor_change",
                projectId: data.projectId,
                fileId: data.fileId,
                changes: data.changes
              }));
            }
          });
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });
  });
  
  // API Routes
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = await registerUser(email, username, password);
      
      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to login after registration" });
        }
        return res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus
      } 
    });
  });
  
  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/github", passport.authenticate("github"));
  
  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { 
      failureRedirect: "/login" 
    }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );
  
  app.get("/api/auth/google", passport.authenticate("google"));
  
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/login" 
    }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );
  
  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus
      } 
    });
  });
  
  // Subscription plans routes
  app.get("/api/subscription/plans", async (req, res) => {
    const plans = await storage.getAllSubscriptionPlans(true);
    res.json({ plans });
  });
  
  // AI Models routes
  app.get("/api/models", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    // Get subscription level
    let subscriptionLevel = 0;
    if (user.subscriptionPlanId) {
      const plan = await storage.getSubscriptionPlan(user.subscriptionPlanId);
      subscriptionLevel = plan ? plan.id : 0;
    }
    
    // Get models available for user's subscription level
    const models = await storage.getModelsBySubscriptionLevel(subscriptionLevel);
    res.json({ models });
  });
  
  // Projects routes
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const projects = await storage.getUserProjects(user.id);
    res.json({ projects });
  });
  
  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const projectData = {
        ...req.body,
        userId: user.id
      };
      
      const project = await storage.createProject(projectData);
      res.status(201).json({ project });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const user = req.user as any;
    if (project.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    
    const files = await storage.getProjectFiles(projectId);
    res.json({ project, files });
  });
  
  app.put("/api/projects/:id", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const user = req.user as any;
    if (project.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    
    const updatedProject = await storage.updateProject(projectId, req.body);
    res.json({ project: updatedProject });
  });
  
  app.delete("/api/projects/:id", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const user = req.user as any;
    if (project.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    
    await storage.deleteProject(projectId);
    res.status(204).end();
  });
  
  // Project files routes
  app.post("/api/projects/:id/files", isAuthenticated, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const user = req.user as any;
    if (project.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    
    const fileData = {
      ...req.body,
      projectId
    };
    
    const file = await storage.createProjectFile(fileData);
    res.status(201).json({ file });
  });
  
  app.put("/api/files/:id", isAuthenticated, async (req, res) => {
    const fileId = parseInt(req.params.id);
    const file = await storage.getProjectFile(fileId);
    
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    
    const project = await storage.getProject(file.projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const user = req.user as any;
    if (project.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    
    const updatedFile = await storage.updateProjectFile(fileId, req.body);
    res.json({ file: updatedFile });
  });
  
  app.delete("/api/files/:id", isAuthenticated, async (req, res) => {
    const fileId = parseInt(req.params.id);
    const file = await storage.getProjectFile(fileId);
    
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    
    const project = await storage.getProject(file.projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const user = req.user as any;
    if (project.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    
    await storage.deleteProjectFile(fileId);
    res.status(204).end();
  });
  
  // Payment routes
  
  // Stripe payment
  if (stripeClient) {
    app.post("/api/payment/stripe", isAuthenticated, async (req, res) => {
      try {
        const user = req.user as any;
        const { planId } = req.body;
        
        const plan = await storage.getSubscriptionPlan(planId);
        if (!plan) {
          return res.status(404).json({ message: "Subscription plan not found" });
        }
        
        // Create or retrieve customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripeClient.customers.create({
            email: user.email,
            name: user.username,
          });
          customerId = customer.id;
          await storage.updateStripeCustomerId(user.id, customerId);
        }
        
        // Create payment intent
        const paymentIntent = await stripeClient.paymentIntents.create({
          amount: plan.price,
          currency: "usd",
          customer: customerId,
          metadata: {
            userId: user.id.toString(),
            planId: planId.toString()
          }
        });
        
        // Record payment
        await storage.createPayment({
          userId: user.id,
          planId,
          amount: plan.price,
          currency: "usd",
          provider: "stripe",
          paymentIntentId: paymentIntent.id,
          status: "pending"
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    });
    
    app.post("/api/payment/stripe/webhook", async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ message: "Stripe webhook secret not configured" });
      }
      
      try {
        const event = stripeClient.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        
        if (event.type === "payment_intent.succeeded") {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Update payment status
          const payment = await storage.getPayment(parseInt(paymentIntent.metadata.userId));
          if (payment) {
            await storage.updatePaymentStatus(payment.id, "completed");
            
            // Update user subscription
            await storage.updateUser(payment.userId, {
              subscriptionStatus: "active",
              subscriptionPlanId: payment.planId
            });
          }
        }
        
        res.json({ received: true });
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    });
  }
  
  // PayPal payment routes
  app.get("/paypal/setup", async (req, res) => {
    await handlePayPalSetup(req, res);
  });

  app.post("/paypal/order", isAuthenticated, async (req, res) => {
    // Record payment intent in database before creating PayPal order
    const user = req.user as any;
    const { planId, amount, currency } = req.body;
    
    try {
      if (planId) {
        const plan = await storage.getSubscriptionPlan(parseInt(planId));
        if (!plan) {
          return res.status(404).json({ message: "Subscription plan not found" });
        }
        
        // Create payment record
        await storage.createPayment({
          userId: user.id,
          planId: parseInt(planId),
          amount: plan.price,
          currency: currency || "usd",
          provider: "paypal",
          status: "pending"
        });
      }
      
      // Create PayPal order
      await handleCreatePayPalOrder(req, res);
    } catch (error: any) {
      // If PayPal fails, suggest manual payment
      res.status(500).json({ 
        message: error.message,
        suggestion: "Please try the manual payment option instead."
      });
    }
  });

  app.post("/paypal/order/:orderID/capture", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Capture the PayPal order
      await handleCapturePayPalOrder(req, res);
      
      // Note: Payment status update is handled by response from handleCapturePayPalOrder
      // so we don't need to check result.statusCode here anymore
      
      // Find the pending payment for this user
      const payments = await storage.getUserPayments(user.id);
      const pendingPayment = payments.find(p => p.provider === "paypal" && p.status === "pending");
      
      if (pendingPayment) {
        await storage.updatePaymentStatus(pendingPayment.id, "completed");
        
        // Update user subscription
        await storage.updateUser(user.id, {
          subscriptionStatus: "active",
          subscriptionPlanId: pendingPayment.planId
        });
      }
    } catch (error: any) {
      console.error("PayPal capture error:", error);
      // If PayPal fails, suggest manual payment
      res.status(500).json({ 
        message: "Failed to process PayPal payment",
        suggestion: "Please try the manual payment option instead."
      });
    }
  });
  
  // Manual payment routes
  app.post("/api/payment/manual", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { planId, amount, currency, details } = req.body;
      
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Create manual payment record
      const payment = await storage.createPayment({
        userId: user.id,
        planId,
        amount: plan.price,
        currency: currency || "usd",
        provider: "manual",
        status: "pending"
      });
      
      res.json({ 
        payment, 
        message: "Manual payment recorded. An admin will review and approve it." 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin routes
  
  // Get all users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // Get all users from storage interface
      const allUsers = await storage.getAllUsers();
      res.json({ users: allUsers });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin subscription plan management
  app.post("/api/admin/plans", isAdmin, async (req, res) => {
    try {
      const plan = await storage.createSubscriptionPlan(req.body);
      res.status(201).json({ plan });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/admin/plans/:id", isAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.updateSubscriptionPlan(planId, req.body);
      res.json({ plan });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/admin/plans/:id", isAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      await storage.deleteSubscriptionPlan(planId);
      res.status(204).end();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Admin AI model management
  app.post("/api/admin/models", isAdmin, async (req, res) => {
    try {
      const model = await storage.createAiModel(req.body);
      res.status(201).json({ model });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/admin/models/:id", isAdmin, async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const model = await storage.updateAiModel(modelId, req.body);
      res.json({ model });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/admin/models/:id/toggle", isAdmin, async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const { active } = req.body;
      const model = await storage.toggleModelStatus(modelId, active);
      res.json({ model });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Admin payment management
  app.get("/api/admin/payments", isAdmin, async (req, res) => {
    try {
      // Get payment statistics for admin dashboard
      const stats = await storage.getAdminPaymentStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/admin/payments/:id/approve", isAdmin, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const user = req.user as any;
      
      const payment = await storage.approveManualPayment(paymentId, user.id);
      
      // Update user subscription
      if (payment.planId) {
        await storage.updateUser(payment.userId, {
          subscriptionStatus: "active",
          subscriptionPlanId: payment.planId
        });
      }
      
      res.json({ payment, message: "Payment approved successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  return httpServer;
}
