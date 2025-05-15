import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionPlan } from "@shared/schema";

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be a positive number"),
  interval: z.string().min(1, "Interval is required"),
  stripePriceId: z.string().optional(),
  active: z.boolean().default(true),
  features: z.array(z.object({
    name: z.string(),
    included: z.boolean().default(false),
  })).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  initialData?: SubscriptionPlan;
  onSubmit: (data: PlanFormValues) => void;
  isSubmitting: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}) => {
  // Parse features from initialData
  const getInitialFeatures = (): { name: string; included: boolean }[] => {
    if (!initialData?.features) return defaultFeatures;
    
    if (typeof initialData.features === 'string') {
      try {
        return JSON.parse(initialData.features);
      } catch {
        return defaultFeatures;
      }
    }
    
    return Array.isArray(initialData.features) 
      ? initialData.features 
      : defaultFeatures;
  };

  // Default feature set
  const defaultFeatures = [
    { name: "Access to StarCoder & CodeParrot", included: true },
    { name: "Access to CodeLlama & CodeT5", included: false },
    { name: "Access to all AI models", included: false },
    { name: "Private projects", included: true },
    { name: "Unlimited projects", included: false },
    { name: "Basic code generation", included: true },
    { name: "Advanced code generation", included: false },
    { name: "UI generation with Stable Diffusion", included: false },
    { name: "Code refactoring with Diff-CodeGen", included: false },
    { name: "Advanced UI/UX generation", included: false },
    { name: "Priority support & training", included: false },
  ];
  
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price ? initialData.price / 100 : 0, // Convert cents to dollars for display
      interval: initialData?.interval || "month",
      stripePriceId: initialData?.stripePriceId || "",
      active: initialData?.active !== undefined ? initialData.active : true,
      features: getInitialFeatures(),
    },
  });
  
  // Handle form submission
  const handleSubmit = (values: PlanFormValues) => {
    // Convert price from dollars to cents
    const formattedValues = {
      ...values,
      price: Math.round(values.price * 100), // Convert to cents
    };
    
    onSubmit(formattedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g. Professional Plan" 
                      className="bg-slate-800 border-slate-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe the plan benefits" 
                      className="bg-slate-800 border-slate-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          className="pl-8 bg-slate-800 border-slate-700"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Interval</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="stripePriceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stripe Price ID (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="price_1234567890" 
                      className="bg-slate-800 border-slate-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Plan</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this plan available for purchase
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Plan Features</h3>
              <div className="space-y-4">
                {form.watch('features')?.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between space-x-2">
                    <Input
                      value={feature.name}
                      onChange={(e) => {
                        const newFeatures = [...form.getValues('features') || []];
                        newFeatures[index].name = e.target.value;
                        form.setValue('features', newFeatures);
                      }}
                      className="bg-slate-900 border-slate-700"
                      placeholder="Feature name"
                    />
                    <Switch
                      checked={feature.included}
                      onCheckedChange={(checked) => {
                        const newFeatures = [...form.getValues('features') || []];
                        newFeatures[index].included = checked;
                        form.setValue('features', newFeatures);
                      }}
                    />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-700 text-gray-300 hover:bg-slate-700"
                  onClick={() => {
                    const currentFeatures = form.getValues('features') || [];
                    form.setValue('features', [
                      ...currentFeatures,
                      { name: "", included: false }
                    ]);
                  }}
                >
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              initialData ? "Update Plan" : "Create Plan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PlanForm;
