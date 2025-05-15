import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, X, Paperclip, Image, Send } from "lucide-react";
import { ProjectFile } from "@shared/schema";

interface AiAssistantProps {
  modelName: string;
  projectName: string;
  activeFile?: ProjectFile;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  code?: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ modelName, projectName, activeFile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: `I can help you optimize your code. Would you like me to:`,
      code: "Add rate limiting middleware for API protection\nImplement request logging with Morgan\nSet up environment variable validation\nAdd health check endpoints",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response after delay
    setTimeout(() => {
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Here's a suggestion for your ${activeFile?.path || "code"}:`,
        code: `// Example AI-generated code\nconst rateLimit = require('express-rate-limit');\nconst morgan = require('morgan');\n\n// Rate limiting middleware\napp.use('/api', rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100 // limit each IP to 100 requests per windowMs\n}));\n\n// Request logging\napp.use(morgan('dev'));`,
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  if (collapsed) {
    return (
      <div className="bg-slate-900 border-l border-slate-800 p-3 flex items-center justify-between">
        <span className="font-medium">AI Assistant ({modelName})</span>
        <Button variant="ghost" size="icon" onClick={handleToggleCollapse}>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/3 xl:w-2/5 bg-slate-900 border-l border-slate-800 flex flex-col">
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-medium">AI Assistant ({modelName})</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleToggleCollapse}>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start ${
              message.type === "user" ? "justify-end" : ""
            }`}
          >
            {message.type === "assistant" && (
              <div className="flex-shrink-0 bg-primary-500 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            )}
            <div
              className={`rounded-lg p-3 text-sm ${
                message.type === "assistant"
                  ? "bg-slate-800"
                  : "bg-primary-600 ml-auto"
              }`}
            >
              {message.type === "assistant" && (
                <p className="font-medium mb-1">{modelName}</p>
              )}
              <p>{message.content}</p>
              {message.code && (
                <pre className="bg-slate-950 p-2 rounded mt-2 text-xs overflow-x-auto">
                  <code>{message.code}</code>
                </pre>
              )}
            </div>
            {message.type === "user" && (
              <div className="flex-shrink-0 bg-gray-700 rounded-full p-2 ml-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-primary-500 rounded-full p-2 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-sm animate-pulse">
              <p className="font-medium mb-1">{modelName}</p>
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
          <div className="flex">
            <Input
              type="text"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-l-md py-2 px-3 text-sm focus:outline-none focus:border-primary-500"
              placeholder="Ask AI assistant..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-primary-600 text-white rounded-r-md px-3 py-2 text-sm font-medium hover:bg-primary-700 flex items-center"
              disabled={isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="flex items-center space-x-1 hover:text-gray-300"
              >
                <Paperclip className="h-4 w-4" />
                <span>Attach</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-1 hover:text-gray-300"
              >
                <Image className="h-4 w-4" />
                <span>Image</span>
              </button>
            </div>
            {isLoading ? (
              <span>{modelName} is responding...</span>
            ) : (
              <span>Powered by {modelName}</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
