import { 
  users, projects, projectFiles, subscriptionPlans, aiModels, payments,
  type User, type InsertUser, 
  type Project, type InsertProject,
  type ProjectFile, type InsertProjectFile,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type AiModel, type InsertAiModel,
  type Payment, type InsertPayment
} from "@shared/schema";

import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateStripeCustomerId(id: number, customerId: string): Promise<User>;
  updateUserStripeInfo(id: number, data: { customerId: string, subscriptionId: string }): Promise<User>;

  // Subscription Plan operations
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;

  // AI Model operations
  getAiModel(id: number): Promise<AiModel | undefined>;
  getAllAiModels(activeOnly?: boolean): Promise<AiModel[]>;
  getModelsBySubscriptionLevel(level: number): Promise<AiModel[]>;
  createAiModel(model: InsertAiModel): Promise<AiModel>;
  updateAiModel(id: number, data: Partial<AiModel>): Promise<AiModel>;
  toggleModelStatus(id: number, active: boolean): Promise<AiModel>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getUserProjects(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;

  // Project File operations
  getProjectFile(id: number): Promise<ProjectFile | undefined>;
  getProjectFiles(projectId: number): Promise<ProjectFile[]>;
  createProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  updateProjectFile(id: number, data: Partial<ProjectFile>): Promise<ProjectFile>;
  deleteProjectFile(id: number): Promise<boolean>;

  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getUserPayments(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  approveManualPayment(id: number, adminId: number): Promise<Payment>;
  getAdminPaymentStats(): Promise<any>;
}

// Implementation using Drizzle ORM with PostgreSQL
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateStripeCustomerId(id: number, customerId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, data: { customerId: string, subscriptionId: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        stripeCustomerId: data.customerId, 
        stripeSubscriptionId: data.subscriptionId,
        subscriptionStatus: 'active'
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Subscription Plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getAllSubscriptionPlans(activeOnly = true): Promise<SubscriptionPlan[]> {
    if (activeOnly) {
      return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.active, true));
    }
    return db.select().from(subscriptionPlans);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [createdPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return createdPlan;
  }

  async updateSubscriptionPlan(id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return true;
  }

  // AI Model methods
  async getAiModel(id: number): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return model;
  }

  async getAllAiModels(activeOnly = false): Promise<AiModel[]> {
    if (activeOnly) {
      return db.select().from(aiModels).where(eq(aiModels.active, true));
    }
    return db.select().from(aiModels);
  }

  async getModelsBySubscriptionLevel(level: number): Promise<AiModel[]> {
    return db
      .select()
      .from(aiModels)
      .where(
        and(
          eq(aiModels.active, true),
          sql`${aiModels.minSubscriptionLevel} <= ${level}`
        )
      );
  }

  async createAiModel(model: InsertAiModel): Promise<AiModel> {
    const [createdModel] = await db.insert(aiModels).values(model).returning();
    return createdModel;
  }

  async updateAiModel(id: number, data: Partial<AiModel>): Promise<AiModel> {
    const [updatedModel] = await db
      .update(aiModels)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiModels.id, id))
      .returning();
    return updatedModel;
  }

  async toggleModelStatus(id: number, active: boolean): Promise<AiModel> {
    const [updatedModel] = await db
      .update(aiModels)
      .set({ active, updatedAt: new Date() })
      .where(eq(aiModels.id, id))
      .returning();
    return updatedModel;
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    return db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.lastOpened));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [createdProject] = await db.insert(projects).values(project).returning();
    return createdProject;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projectFiles).where(eq(projectFiles.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Project File methods
  async getProjectFile(id: number): Promise<ProjectFile | undefined> {
    const [file] = await db.select().from(projectFiles).where(eq(projectFiles.id, id));
    return file;
  }

  async getProjectFiles(projectId: number): Promise<ProjectFile[]> {
    return db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.projectId, projectId));
  }

  async createProjectFile(file: InsertProjectFile): Promise<ProjectFile> {
    const [createdFile] = await db.insert(projectFiles).values(file).returning();
    return createdFile;
  }

  async updateProjectFile(id: number, data: Partial<ProjectFile>): Promise<ProjectFile> {
    const [updatedFile] = await db
      .update(projectFiles)
      .set({ ...data, lastModified: new Date() })
      .where(eq(projectFiles.id, id))
      .returning();
    return updatedFile;
  }

  async deleteProjectFile(id: number): Promise<boolean> {
    await db.delete(projectFiles).where(eq(projectFiles.id, id));
    return true;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [createdPayment] = await db.insert(payments).values(payment).returning();
    return createdPayment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async approveManualPayment(id: number, adminId: number): Promise<Payment> {
    const [approvedPayment] = await db
      .update(payments)
      .set({ 
        status: 'completed', 
        manuallyApproved: true,
        approvedById: adminId,
        approvedAt: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return approvedPayment;
  }

  async getAdminPaymentStats(): Promise<any> {
    const allPayments = await db.select().from(payments);
    
    // Calculate some basic stats
    const totalRevenue = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const pendingApprovals = allPayments.filter(
      p => p.status === 'pending' && p.provider === 'manual'
    ).length;
    
    const paymentsByProvider = allPayments.reduce((acc: Record<string, number>, p) => {
      acc[p.provider] = (acc[p.provider] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalRevenue,
      pendingApprovals,
      paymentsByProvider,
      recentPayments: allPayments.slice(0, 10)
    };
  }
}

export const storage = new DatabaseStorage();
