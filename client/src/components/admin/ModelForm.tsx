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
  FormDescription,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiModel } from "@shared/schema";

const modelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  apiEndpoint: z.string().optional(),
  minSubscriptionLevel: z.number().min(0, "Min subscription level must be a non-negative number"),
  active: z.boolean().default(true),
});

type ModelFormValues = z.infer<typeof modelSchema>;

interface ModelFormProps {
  initialData?: AiModel;
  onSubmit: (data: ModelFormValues) => void;
  isSubmitting: boolean;
}

const ModelForm: React.FC<ModelFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}) => {
  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "code-generation",
      apiEndpoint: initialData?.apiEndpoint || "",
      minSubscriptionLevel: initialData?.minSubscriptionLevel || 1,
      active: initialData?.active !== undefined ? initialData.active : true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g. StarCoder" 
                    className="bg-slate-800 border-slate-700"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="code-generation">Code Generation</SelectItem>
                    <SelectItem value="diffing">Diffing & Refactoring</SelectItem>
                    <SelectItem value="planning">Planning & Language</SelectItem>
                    <SelectItem value="vision">Vision & UI</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Describe the model capabilities" 
                  className="bg-slate-800 border-slate-700"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="apiEndpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Endpoint (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="https://api.example.com/v1/models/starcoder" 
                  className="bg-slate-800 border-slate-700"
                />
              </FormControl>
              <FormDescription className="text-gray-500">
                The endpoint URL for the model API (leave empty for local models)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="minSubscriptionLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Subscription Level</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min={0}
                  step={1}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                  className="bg-slate-800 border-slate-700"
                />
              </FormControl>
              <FormDescription className="text-gray-500">
                Minimum subscription level required to use this model (0 = free tier)
              </FormDescription>
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
                <FormLabel className="text-base">Active Model</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this model available for use
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
              initialData ? "Update Model" : "Create Model"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ModelForm;
