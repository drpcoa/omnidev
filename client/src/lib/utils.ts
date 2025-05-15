import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }
  
  return "just now";
}

export function truncate(str: string, length: number): string {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  if (typeof amount !== 'number') return "";
  
  // Convert cents to dollars
  const dollars = amount / 100;
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(dollars);
}

export function getTechnologyIcon(tech: string): string {
  const techIcons: Record<string, string> = {
    react: "react",
    vue: "vuejs",
    angular: "angular",
    node: "nodejs",
    express: "express",
    mongodb: "mongodb",
    postgres: "postgresql",
    python: "python",
    django: "django",
    flask: "flask",
    javascript: "javascript",
    typescript: "typescript",
    html: "html5",
    css: "css3",
    sass: "sass",
    tailwind: "tailwindcss",
  };
  
  return techIcons[tech.toLowerCase()] || "code";
}

export function getFileExtensionIcon(filename: string): string {
  if (!filename) return "file";
  
  const ext = filename.split(".").pop()?.toLowerCase();
  
  const fileIcons: Record<string, string> = {
    js: "javascript",
    jsx: "react",
    ts: "typescript",
    tsx: "react",
    py: "python",
    html: "html5",
    css: "css3",
    scss: "sass",
    json: "json",
    md: "markdown",
    php: "php",
    rb: "ruby",
    go: "go",
    java: "java",
    c: "c",
    cpp: "cplusplus",
    cs: "csharp",
    swift: "swift",
    kt: "kotlin",
    rs: "rust",
  };
  
  return ext && fileIcons[ext] ? fileIcons[ext] : "file";
}
