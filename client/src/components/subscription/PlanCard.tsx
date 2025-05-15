import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { SubscriptionPlan } from "@shared/schema";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: (planId: number) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  isPopular = false,
  isSelected = false,
  onSelect 
}) => {
  // Helper function to parse features
  const getFeatures = (): { name: string; included: boolean }[] => {
    if (typeof plan.features === 'string') {
      try {
        return JSON.parse(plan.features);
      } catch {
        return [];
      }
    }
    return Array.isArray(plan.features) ? plan.features : [];
  };

  const features = getFeatures();

  return (
    <div 
      className={cn(
        "bg-slate-800 rounded-lg p-6 border-2 transition-all cursor-pointer",
        isPopular ? "border-primary-500" : isSelected ? "border-primary-500" : "border-slate-700 hover:border-primary-500"
      )}
      onClick={() => onSelect(plan.id)}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          POPULAR
        </div>
      )}
      
      <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
      <div className="text-2xl font-bold mb-4">
        {formatCurrency(plan.price)}
        <span className="text-sm font-normal text-gray-400">/{plan.interval}</span>
      </div>
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.included ? (
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <span className={feature.included ? "" : "text-gray-500"}>{feature.name}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        className={cn(
          "w-full",
          isSelected ? "bg-green-600 hover:bg-green-700" : "bg-primary-600 hover:bg-primary-700"
        )}
        onClick={() => onSelect(plan.id)}
      >
        {isSelected ? "Selected" : "Select Plan"}
      </Button>
    </div>
  );
};

export default PlanCard;
