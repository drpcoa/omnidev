import { Request, Response } from "express";
import { isAuthenticated } from "./authService";
import { storage } from "./storage";
import path from "path";

/**
 * OmniDev AI Bridge
 * 
 * A unified interface for accessing multiple open-source AI models for:
 * - Code generation
 * - Code refactoring
 * - Architecture planning
 * - UI generation
 * 
 * Supports continuous self-learning through feedback loops and
 * internet search capabilities for latest trends and technologies.
 */

// Model interface
interface AIModel {
  id: string;
  name: string;
  description: string;
  type: "code" | "refactor" | "planning" | "vision" | "debugging";
  parameters: number;
  context: number;
  latency: "low" | "medium" | "high";
  specialization?: string;
  isActive: boolean;
  selfImproving?: boolean;
  errorDetection?: boolean;
}

// Collection of supported open-source models
const SUPPORTED_MODELS: AIModel[] = [
  {
    id: "omnidev-autofix",
    name: "OmniDev AutoFix (32B)",
    description: "Advanced self-improving model with automatic error detection and fixing capabilities",
    type: "debugging",
    parameters: 32000000000,
    context: 16384,
    latency: "low",
    specialization: "error detection and repair",
    isActive: true,
    selfImproving: true,
    errorDetection: true
  },
  {
    id: "starcoder",
    name: "StarCoder (15.5B)",
    description: "Permissively-licensed model trained on 1T tokens across 80+ languages",
    type: "code",
    parameters: 15500000000,
    context: 8192,
    latency: "medium",
    isActive: true
  },
  {
    id: "codegen",
    name: "Salesforce CodeGen (16B)",
    description: "Program-synthesis model trained on TPU-v4 supporting many languages",
    type: "code",
    parameters: 16000000000,
    context: 2048,
    latency: "medium",
    isActive: true
  },
  {
    id: "codellama",
    name: "Meta CodeLlama (34B)",
    description: "Llama 2-based code model with advanced infilling capabilities",
    type: "code",
    parameters: 34000000000,
    context: 16384,
    latency: "high",
    isActive: true
  },
  {
    id: "codet5",
    name: "CodeT5 (220M+)",
    description: "Unified model for code understanding with identifier-aware pretraining",
    type: "code",
    parameters: 220000000,
    context: 512,
    latency: "low",
    specialization: "Python",
    isActive: true
  },
  {
    id: "codeparrot",
    name: "CodeParrot (1.5B)",
    description: "GPT-2–based model focused on Python code generation",
    type: "code",
    parameters: 1500000000,
    context: 1024,
    latency: "low",
    specialization: "Python",
    isActive: true
  },
  {
    id: "polycoder",
    name: "PolyCoder (2.7B)",
    description: "Trained on 249 GB of code in 12 languages, ideal for systems-level code",
    type: "code",
    parameters: 2700000000,
    context: 2048,
    latency: "low",
    specialization: "C",
    isActive: true
  },
  {
    id: "diffcodegen",
    name: "Diff-CodeGen (350M)",
    description: "Diff-based CodeGen variant trained on real GitHub commits",
    type: "refactor",
    parameters: 350000000,
    context: 2048,
    latency: "low",
    isActive: true
  },
  {
    id: "gptj",
    name: "GPT-J-6B",
    description: "6B-parameter model for general NL tasks and architecture planning",
    type: "planning",
    parameters: 6000000000,
    context: 2048,
    latency: "medium",
    isActive: true
  },
  {
    id: "stablediffusion",
    name: "Stable Diffusion",
    description: "Text-to-image model for generating UI assets and mockups",
    type: "vision",
    parameters: 2000000000,
    context: 77,
    latency: "high",
    isActive: true
  },
  {
    id: "sam",
    name: "Segment Anything Model (SAM)",
    description: "Foundation vision model for detecting UI element boundaries",
    type: "vision",
    parameters: 1000000000,
    context: 1024,
    latency: "medium",
    isActive: true
  },
  {
    id: "clip",
    name: "CLIP",
    description: "Vision-language model for matching image regions to text prompts",
    type: "vision",
    parameters: 500000000,
    context: 77,
    latency: "low",
    isActive: true
  }
];

// Learning database to store learned patterns
interface LearningEntry {
  pattern: string;
  solution: string;
  confidence: number;
  votes: number;
  timestamp: Date;
  source: string;
}

// In-memory learning database (would be persisted in production)
let learningDatabase: LearningEntry[] = [
  {
    pattern: "react state management",
    solution: "For complex state management in React, consider using Redux Toolkit or Zustand instead of plain Context API.",
    confidence: 0.92,
    votes: 47,
    timestamp: new Date("2025-05-01"),
    source: "community"
  },
  {
    pattern: "database indexing strategy",
    solution: "Create composite indexes for frequently queried columns, and use covering indexes for read-heavy operations.",
    confidence: 0.89,
    votes: 31,
    timestamp: new Date("2025-04-15"),
    source: "learned"
  },
  {
    pattern: "microservices communication",
    solution: "Consider using an event-driven architecture with a message broker like Kafka for asynchronous communication between microservices.",
    confidence: 0.95,
    votes: 78,
    timestamp: new Date("2025-04-22"),
    source: "community"
  }
];

/**
 * Auto-Error Detection and Repair System
 * Scans code for errors, analyzes patterns, and applies automatic fixes
 */
async function autoDetectAndFixErrors(code: string, language: string): Promise<{
  fixedCode: string,
  detectedIssues: string[],
  performanceImprovements: string[]
}> {
  // In a real implementation, this would use a sophisticated algorithm to detect errors
  // and optimize code performance. This is a simulation of that functionality.
  
  const detectedIssues: string[] = [];
  const performanceImprovements: string[] = [];
  let fixedCode = code;
  
  // Common patterns that might indicate issues
  const errorPatterns = [
    { pattern: /console\.log\(/g, issue: "Debug console statements in production code", fix: (c: string) => c.replace(/console\.log\([^)]*\);?\n?/g, "") },
    { pattern: /=[^=]=/g, issue: "Possible assignment in conditional", fix: (c: string) => c.replace(/([^=!])=[^=]/g, "$1==$2") },
    { pattern: /\/\/\s*TODO/g, issue: "Incomplete implementation (TODO comment)", fix: (c: string) => c },
    { pattern: /catch\s*\([^)]*\)\s*{\s*}/g, issue: "Empty catch block", fix: (c: string) => c.replace(/catch\s*\([^)]*\)\s*{\s*}/g, (m) => m.replace("{}", "{ /* Error handled */ }")) },
  ];
  
  // Performance optimization patterns
  const performancePatterns = [
    { pattern: /for\s*\([^;]*;\s*[^;]*;\s*[^)]*\)/g, improvement: "Consider using array methods instead of for loops", fix: (c: string) => c },
    { pattern: /\.map\([^)]*\)\.filter/g, improvement: "Filter before map for better performance", fix: (c: string) => c.replace(/\.map\(([^)]*)\)\.filter\(([^)]*)\)/g, ".filter($2).map($1)") },
    { pattern: /new\s+Date\(\)/g, improvement: "Cache date objects in loops", fix: (c: string) => c },
  ];
  
  // Scan for errors and apply fixes
  errorPatterns.forEach(({ pattern, issue, fix }) => {
    if (pattern.test(code)) {
      detectedIssues.push(issue);
      fixedCode = fix(fixedCode);
    }
  });
  
  // Scan for performance improvements
  performancePatterns.forEach(({ pattern, improvement, fix }) => {
    if (pattern.test(code)) {
      performanceImprovements.push(improvement);
      fixedCode = fix(fixedCode);
    }
  });
  
  // Auto-formatting and code style consistency (simulated)
  // In a real implementation, this would use a proper formatter like prettier
  
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    fixedCode,
    detectedIssues,
    performanceImprovements
  };
}

/**
 * Self-learning System
 * Adds new solutions or reinforces existing ones based on feedback
 */
function learnFromSolution(pattern: string, solution: string, source: string = "user") {
  const existingEntry = learningDatabase.find(entry => 
    entry.pattern.toLowerCase() === pattern.toLowerCase());
  
  if (existingEntry) {
    // Reinforce existing knowledge
    existingEntry.votes++;
    existingEntry.confidence = Math.min(0.99, existingEntry.confidence + 0.01);
    existingEntry.timestamp = new Date();
    if (source === "internet") {
      // Update with newer information from internet
      existingEntry.solution = solution;
    }
  } else {
    // Add new knowledge
    learningDatabase.push({
      pattern,
      solution,
      confidence: 0.7, // Initial confidence
      votes: 1,
      timestamp: new Date(),
      source
    });
  }
}

/**
 * Internet Search Simulation
 * In a real implementation, this would connect to a webscraping service or API
 */
function searchInternetTrends(query: string): Promise<string> {
  // Simulating network latency
  return new Promise(resolve => {
    setTimeout(() => {
      // Knowledge base for common tech trends (in real implementation, this would be a real internet search)
      const trends = [
        {
          keyword: "typescript",
          info: "TypeScript 5.4 introduces more powerful type inference and new decorators API, improving developer experience with stricter type safety."
        },
        {
          keyword: "react",
          info: "React's new compiler architecture focuses on partial hydration and streaming SSR, significantly improving performance metrics."
        },
        {
          keyword: "ai coding",
          info: "AI coding assistants have evolved to understand full repository context and generate patches rather than just completing snippets."
        },
        {
          keyword: "webassembly",
          info: "WebAssembly's component model standardization is enabling language-agnostic module reuse across different environments."
        },
        {
          keyword: "database",
          info: "Vector databases are becoming essential infrastructure for AI applications requiring similarity search operations."
        },
        {
          keyword: "javascript",
          info: "JavaScript's Temporal API is revolutionizing date/time handling with immutable types and timezone-aware operations."
        },
        {
          keyword: "architecture",
          info: "Micro-frontends are gaining adoption for large-scale applications with domain-focused vertical slices."
        },
        {
          keyword: "security",
          info: "Supply chain attacks increased 300% in 2024, driving adoption of software bill of materials (SBOM) tooling."
        }
      ];

      // Find most relevant trend
      const matchingTrend = trends.find(trend => 
        query.toLowerCase().includes(trend.keyword));
      
      if (matchingTrend) {
        learnFromSolution(matchingTrend.keyword, matchingTrend.info, "internet");
        resolve(matchingTrend.info);
      } else {
        resolve("No specific trends found. Consider narrowing your search query.");
      }
    }, 500);
  });
}

/**
 * Model selection based on user subscription level and task
 */
async function selectAppropriateModel(userId: number, taskType: string): Promise<AIModel | null> {
  try {
    const user = await storage.getUser(userId);
    if (!user) return null;
    
    // Get user's subscription level
    const subscriptionLevel = user.subscriptionPlanId || 1; // Default to basic plan
    
    // Get allowed models for this subscription level
    const allowedModels = await storage.getModelsBySubscriptionLevel(subscriptionLevel);
    const allowedModelIds = allowedModels.map(m => m.name.toLowerCase());
    
    // Filter supported models by task type and subscription
    const eligibleModels = SUPPORTED_MODELS.filter(model => 
      model.type === taskType && 
      model.isActive &&
      allowedModelIds.includes(model.id));
    
    if (eligibleModels.length === 0) return null;
    
    // Return the most powerful model available (by parameter count)
    return eligibleModels.sort((a, b) => b.parameters - a.parameters)[0];
  } catch (error) {
    console.error("Error selecting model:", error);
    return null;
  }
}

// Controller for getting available AI models
export async function getAvailableModels(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const subscriptionLevel = user.subscriptionPlanId || 1;
    const allowedModels = await storage.getModelsBySubscriptionLevel(subscriptionLevel);
    
    // Map to the supported models with additional metadata
    const availableModels = SUPPORTED_MODELS
      .filter(model => allowedModels.some(m => 
        m.name.toLowerCase().includes(model.id) && m.isActive))
      .map(model => ({
        ...model,
        isAccessible: true
      }));
    
    // Also include inaccessible models but marked as such
    const inaccessibleModels = SUPPORTED_MODELS
      .filter(model => !availableModels.some(m => m.id === model.id))
      .map(model => ({
        ...model,
        isAccessible: false
      }));
    
    res.json({ 
      availableModels, 
      inaccessibleModels,
      subscriptionLevel
    });
  } catch (error) {
    console.error("Error fetching AI models:", error);
    res.status(500).json({ message: "Failed to fetch AI models" });
  }
}

// Controller for generating code
export async function generateCode(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { prompt, language, modelId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    
    const userId = req.user.id;
    
    // Find selected model or use best available
    let model: AIModel | null;
    
    if (modelId) {
      model = SUPPORTED_MODELS.find(m => m.id === modelId) || null;
    } else {
      model = await selectAppropriateModel(userId, "code");
    }
    
    if (!model) {
      return res.status(403).json({ 
        message: "No suitable AI model available for your subscription level" 
      });
    }
    
    // Check for learned patterns that might help
    let enhancedPrompt = prompt;
    const matchingPattern = learningDatabase.find(entry => 
      prompt.toLowerCase().includes(entry.pattern.toLowerCase()) && entry.confidence > 0.8);
    
    if (matchingPattern) {
      enhancedPrompt = `${prompt}\n\nAdditional context: ${matchingPattern.solution}`;
    }
    
    // Simulate model response based on the language requested
    // In a real implementation, this would call the actual model API
    setTimeout(async () => {
      // Check if the request is for a trending topic and add internet search results
      const isTrendingTopic = ["react", "typescript", "javascript", "ai", "database"].some(
        topic => prompt.toLowerCase().includes(topic)
      );
      
      if (isTrendingTopic) {
        const internetInfo = await searchInternetTrends(prompt);
        enhancedPrompt = `${enhancedPrompt}\n\nLatest trend info: ${internetInfo}`;
      }
      
      const response = generateSimulatedResponse(enhancedPrompt, language, model);
      
      // Learn from this interaction
      if (response.success) {
        const keywords = extractKeywords(prompt);
        keywords.forEach(keyword => {
          if (keyword.length > 4) { // Only learn meaningful keywords
            learnFromSolution(keyword, `For ${keyword}-related tasks, consider using: ${language || 'appropriate language'}`, "system");
          }
        });
      }
      
      res.json({
        success: response.success,
        model: model.name,
        code: response.code,
        explanation: response.explanation,
        usedLearning: !!matchingPattern,
        usedInternet: isTrendingTopic
      });
    }, model.latency === "low" ? 500 : model.latency === "medium" ? 1000 : 2000);
  } catch (error) {
    console.error("Error generating code:", error);
    res.status(500).json({ message: "Failed to generate code" });
  }
}

// Controller for refactoring code
export async function refactorCode(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { code, instructions, modelId } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }
    
    const userId = req.user.id;
    
    // Find selected model or use best available
    let model: AIModel | null;
    
    if (modelId) {
      model = SUPPORTED_MODELS.find(m => m.id === modelId) || null;
    } else {
      model = await selectAppropriateModel(userId, "refactor");
    }
    
    if (!model) {
      return res.status(403).json({ 
        message: "No suitable AI model available for your subscription level" 
      });
    }
    
    // Simulate model response
    // In a real implementation, this would call the actual model API
    setTimeout(async () => {
      const detectLanguage = detectCodeLanguage(code);
      
      // Check if there are any learned patterns for this language
      const matchingPattern = learningDatabase.find(entry => 
        entry.pattern.toLowerCase() === detectLanguage.toLowerCase() && entry.confidence > 0.7);
      
      const response = generateSimulatedRefactoring(code, instructions, model, detectLanguage);
      
      // Add learning if available
      if (matchingPattern) {
        response.explanation += `\n\nApplied best practice: ${matchingPattern.solution}`;
      }
      
      // Learn from this interaction
      if (response.success) {
        learnFromSolution(detectLanguage, `Common refactoring patterns for ${detectLanguage} include: ${instructions || 'improving readability'}`, "system");
      }
      
      res.json({
        success: response.success,
        model: model.name,
        refactoredCode: response.refactoredCode,
        explanation: response.explanation,
        diff: response.diff,
        usedLearning: !!matchingPattern
      });
    }, model.latency === "low" ? 500 : model.latency === "medium" ? 1000 : 2000);
  } catch (error) {
    console.error("Error refactoring code:", error);
    res.status(500).json({ message: "Failed to refactor code" });
  }
}

// Controller for architecture planning
export async function generateArchitecture(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { requirements, stack, modelId } = req.body;
    
    if (!requirements) {
      return res.status(400).json({ message: "Requirements are required" });
    }
    
    const userId = req.user.id;
    
    // Find selected model or use best available
    let model: AIModel | null;
    
    if (modelId) {
      model = SUPPORTED_MODELS.find(m => m.id === modelId) || null;
    } else {
      model = await selectAppropriateModel(userId, "planning");
    }
    
    if (!model) {
      return res.status(403).json({ 
        message: "No suitable AI model available for your subscription level" 
      });
    }
    
    // Check for learned patterns about architecture
    const matchingPattern = learningDatabase.find(entry => 
      entry.pattern.toLowerCase() === "architecture" && entry.confidence > 0.8);
    
    // Simulate model response
    // In a real implementation, this would call the actual model API
    setTimeout(async () => {
      // Check the latest architecture trends
      const architectureTrends = await searchInternetTrends("architecture latest trends");
      
      const response = generateSimulatedArchitecture(requirements, stack, model);
      
      // Add learning and trends if available
      if (matchingPattern) {
        response.explanation += `\n\nApplied architectural pattern: ${matchingPattern.solution}`;
      }
      
      response.explanation += `\n\nLatest trend in architecture: ${architectureTrends}`;
      
      // Learn from this interaction
      learnFromSolution("architecture", `For ${stack || 'modern'} architecture, consider: ${response.components.join(', ')}`, "system");
      
      res.json({
        success: response.success,
        model: model.name,
        diagram: response.diagram,
        components: response.components,
        explanation: response.explanation,
        usedLearning: !!matchingPattern,
        usedInternet: true
      });
    }, model.latency === "low" ? 1000 : model.latency === "medium" ? 2000 : 3000);
  } catch (error) {
    console.error("Error generating architecture:", error);
    res.status(500).json({ message: "Failed to generate architecture" });
  }
}

// Controller for processing user feedback
export async function processFeedback(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { pattern, solution, rating, source } = req.body;
    
    if (!pattern || !solution || !rating) {
      return res.status(400).json({ message: "Pattern, solution and rating are required" });
    }
    
    // Only learn from positive feedback
    if (rating >= 4) {
      learnFromSolution(pattern, solution, source || "user");
      res.json({ 
        success: true, 
        message: "Feedback processed and knowledge updated",
        databaseSize: learningDatabase.length
      });
    } else {
      // For negative feedback, decrease confidence if entry exists
      const existingEntry = learningDatabase.find(entry => 
        entry.pattern.toLowerCase() === pattern.toLowerCase());
      
      if (existingEntry) {
        existingEntry.confidence = Math.max(0.1, existingEntry.confidence - 0.1);
        existingEntry.votes--;
      }
      
      res.json({ 
        success: true, 
        message: "Feedback processed",
        databaseSize: learningDatabase.length
      });
    }
  } catch (error) {
    console.error("Error processing feedback:", error);
    res.status(500).json({ message: "Failed to process feedback" });
  }
}

// Controller for internet search
export async function searchInternet(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }
    
    // Perform internet search
    const results = await searchInternetTrends(query);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error("Error searching internet:", error);
    res.status(500).json({ message: "Failed to search internet" });
  }
}

// Controller for getting learning database statistics
export async function getLearningStats(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Only allow admins to access full stats
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Calculate statistics
    const totalEntries = learningDatabase.length;
    const bySource = {
      user: learningDatabase.filter(e => e.source === "user").length,
      system: learningDatabase.filter(e => e.source === "system").length,
      community: learningDatabase.filter(e => e.source === "community").length,
      internet: learningDatabase.filter(e => e.source === "internet").length,
    };
    const avgConfidence = learningDatabase.reduce((acc, curr) => acc + curr.confidence, 0) / totalEntries;
    const highConfidenceEntries = learningDatabase.filter(e => e.confidence > 0.8).length;
    
    // Get top patterns by votes
    const topPatterns = [...learningDatabase]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5)
      .map(e => ({
        pattern: e.pattern,
        votes: e.votes,
        confidence: e.confidence
      }));
    
    res.json({
      totalEntries,
      bySource,
      avgConfidence,
      highConfidenceEntries,
      topPatterns
    });
  } catch (error) {
    console.error("Error fetching learning stats:", error);
    res.status(500).json({ message: "Failed to fetch learning statistics" });
  }
}

/**
 * Auto-error detection and code optimization endpoint
 */
export async function autoFixCode(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }
    
    // Select appropriate model
    const model = await selectAppropriateModel(req.user.id, "debugging");
    if (!model) {
      return res.status(403).json({ message: "No appropriate model available for your subscription level" });
    }
    
    // Use the autodetect feature
    const result = await autoDetectAndFixErrors(code, language || 'javascript');
    
    // Learn from the automatic fixes for future improvements
    if (result.detectedIssues.length > 0) {
      result.detectedIssues.forEach(issue => {
        learnFromSolution(issue, "Auto-fixed: " + issue, "system");
      });
    }
    
    res.json({
      success: true,
      model: model.name,
      fixedCode: result.fixedCode,
      detectedIssues: result.detectedIssues,
      performanceImprovements: result.performanceImprovements,
      message: result.detectedIssues.length > 0 
        ? `Fixed ${result.detectedIssues.length} issues and suggested ${result.performanceImprovements.length} performance improvements` 
        : "No issues detected"
    });
  } catch (error: any) {
    console.error("Error in autoFixCode:", error);
    res.status(500).json({ message: error.message });
  }
}

// Register the AI Bridge routes
export function registerAIBridgeRoutes(app: any) {
  // Get available models
  app.get("/api/ai/models", isAuthenticated, getAvailableModels);
  
  // Code generation
  app.post("/api/ai/generate", isAuthenticated, generateCode);
  
  // Code refactoring
  app.post("/api/ai/refactor", isAuthenticated, refactorCode);
  
  // Architecture planning
  app.post("/api/ai/architecture", isAuthenticated, generateArchitecture);
  
  // Process feedback
  app.post("/api/ai/feedback", isAuthenticated, processFeedback);
  
  // Internet search
  app.post("/api/ai/search", isAuthenticated, searchInternet);
  
  // Get learning statistics (admin only)
  app.get("/api/ai/learning-stats", isAuthenticated, getLearningStats);
  
  // Auto-error detection and fixing
  app.post("/api/ai/auto-fix", isAuthenticated, autoFixCode);
  
  console.log("AI Bridge routes registered");
}

// Helper functions for simulating model responses
// In a real implementation, these would be replaced by actual API calls

function extractKeywords(text: string): string[] {
  // Simple keyword extraction logic
  const words = text.toLowerCase().split(/\W+/);
  const stopwords = ["the", "and", "or", "in", "on", "at", "to", "a", "an", "for", "with", "by"];
  return words
    .filter(word => word.length > 2 && !stopwords.includes(word))
    .slice(0, 5);
}

function detectCodeLanguage(code: string): string {
  // Simple language detection based on keywords/syntax
  if (code.includes("import React") || code.includes("function") && code.includes("return")) {
    return "javascript";
  }
  if (code.includes("def ") && code.includes(":")) {
    return "python";
  }
  if (code.includes("class ") && code.includes("{") && code.includes("public")) {
    return "java";
  }
  if (code.includes("#include") && code.includes("int main")) {
    return "c";
  }
  if (code.includes("func ") && code.includes("package main")) {
    return "go";
  }
  // Default
  return "unknown";
}

function generateSimulatedResponse(prompt: string, language: string, model: AIModel): {
  success: boolean;
  code: string;
  explanation: string;
} {
  // This is a simulation - in a real implementation, this would call the model API
  const lang = language || "javascript";
  
  let code = "";
  let explanation = "";
  
  if (lang === "javascript" || lang === "typescript") {
    code = `
// Generated by ${model.name}
function processData(input) {
  // Parse the input
  const data = JSON.parse(input);
  
  // Process the data
  const results = data.map(item => {
    return {
      id: item.id,
      value: item.value * 2,
      processed: true
    };
  });
  
  // Return the processed data
  return JSON.stringify(results);
}

export default processData;
`;
    explanation = `I've created a JavaScript function that takes an input string, parses it as JSON, processes each item by doubling its value, and returns the result as a JSON string. This implementation handles the core requirements you described. You might want to add error handling for invalid JSON input.`;
  } else if (lang === "python") {
    code = `
# Generated by ${model.name}
import json

def process_data(input_str):
    # Parse the input
    data = json.loads(input_str)
    
    # Process the data
    results = []
    for item in data:
        results.append({
            "id": item["id"],
            "value": item["value"] * 2,
            "processed": True
        })
    
    # Return the processed data
    return json.dumps(results)
`;
    explanation = `I've created a Python function that takes an input string, parses it as JSON, processes each item by doubling its value, and returns the result as a JSON string. The implementation includes proper JSON parsing and serialization using the built-in json module.`;
  }
  
  return {
    success: true,
    code,
    explanation
  };
}

function generateSimulatedRefactoring(code: string, instructions: string, model: AIModel, language: string): {
  success: boolean;
  refactoredCode: string;
  explanation: string;
  diff: string;
} {
  // This is a simulation - in a real implementation, this would call the model API
  const refactoredCode = code.replace("function", "// Refactored by " + model.name + "\nfunction");
  
  return {
    success: true,
    refactoredCode,
    explanation: `I've refactored the code to improve ${instructions || 'readability and performance'}. The key changes include better variable naming, adding comments for clarity, and optimizing the algorithm where possible.`,
    diff: `@@ -1,5 +1,6 @@
-function processData(input) {
+// Refactored by ${model.name}
+function processData(input) {
   // Process logic
 }`
  };
}

function generateSimulatedArchitecture(requirements: string, stack: string, model: AIModel): {
  success: boolean;
  diagram: string;
  components: string[];
  explanation: string;
} {
  // This is a simulation - in a real implementation, this would call the model API
  const components = [
    "Frontend (React/Next.js)",
    "API Gateway",
    "Auth Service",
    "User Service",
    "Content Service",
    "Database (PostgreSQL)",
    "Cache (Redis)",
    "Message Queue (Kafka)"
  ];
  
  return {
    success: true,
    diagram: "Architecture diagram would be rendered here",
    components,
    explanation: `Based on your requirements for ${requirements}, I've designed a microservices architecture using ${stack || 'modern technologies'}. The system is divided into several components with clear responsibilities and boundaries. The architecture supports horizontal scaling, fault tolerance, and maintainability.`
  };
}