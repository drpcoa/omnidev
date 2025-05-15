import React, { useState } from "react";
import Header from "@/components/layout/Header";
import { useSubscriptionPlans } from "@/hooks/use-subscription";
import { useStripePayment, useManualPayment } from "@/hooks/use-payments";
import PlanCard from "@/components/subscription/PlanCard";
import PaymentMethodSelector from "@/components/subscription/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import PayPalButton from "@/components/PayPalButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Initialize Stripe
const stripePromise = process.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

export default function Subscription() {
  const { user } = useAuth();
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("manual");
  const [transactionDetails, setTransactionDetails] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const stripePaymentMutation = useStripePayment();
  const manualPaymentMutation = useManualPayment();
  
  const plans = plansData?.plans || [];
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
  
  // Handle plan selection
  const handleSelectPlan = (planId: number) => {
    setSelectedPlanId(planId);
  };
  
  // Handle payment method selection
  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
  };
  
  // Handle payment submission
  const handleSubmitPayment = async () => {
    if (!selectedPlanId) {
      toast({
        title: "Selection required",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod === "stripe") {
        const { clientSecret } = await stripePaymentMutation.mutateAsync({ planId: selectedPlanId });
        
        if (stripePromise && clientSecret) {
          const stripe = await stripePromise;
          const { error } = await stripe!.redirectToCheckout({
            sessionId: clientSecret,
          });
          
          if (error) {
            throw new Error(error.message);
          }
        } else {
          throw new Error("Stripe is not configured properly");
        }
      } 
      else if (paymentMethod === "manual") {
        if (!transactionDetails.trim()) {
          throw new Error("Please provide transaction details");
        }
        
        await manualPaymentMutation.mutateAsync({
          planId: selectedPlanId,
          details: transactionDetails,
        });
        
        // Clear form
        setTransactionDetails("");
        setSelectedPlanId(null);
      }
      // Other payment methods would be handled here
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "An error occurred while processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Plans</h1>
          <p className="text-gray-400">Choose the plan that works best for you</p>
          
          {user?.subscriptionStatus === "active" && (
            <div className="mt-4 bg-slate-800 border border-green-500 rounded-md p-4">
              <p className="text-green-500 font-medium">You currently have an active subscription.</p>
              <p className="text-gray-400 text-sm mt-1">
                Selecting a new plan will change your current subscription.
              </p>
            </div>
          )}
        </div>
        
        {plansLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isPopular={index === 1} // Make the second plan popular (Professional)
                  isSelected={selectedPlanId === plan.id}
                  onSelect={handleSelectPlan}
                />
              ))}
            </div>
            
            {/* Payment Section */}
            {selectedPlanId && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Payment</CardTitle>
                  <CardDescription className="text-gray-400">
                    Complete your subscription with your preferred payment method
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs defaultValue="payment-method" className="w-full">
                    <TabsList className="grid grid-cols-2 bg-slate-900">
                      <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
                      <TabsTrigger value="confirmation">Confirmation</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="payment-method" className="pt-4">
                      <PaymentMethodSelector 
                        selectedMethod={paymentMethod}
                        onSelectMethod={handleSelectPaymentMethod}
                      />
                    </TabsContent>
                    
                    <TabsContent value="confirmation" className="pt-4">
                      <div className="mb-6">
                        <h3 className="font-medium mb-3">Order Summary</h3>
                        <div className="bg-slate-900 rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">Plan:</span>
                            <span>{selectedPlan?.name}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">Price:</span>
                            <span>${(selectedPlan?.price || 0) / 100}/{selectedPlan?.interval}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">Payment Method:</span>
                            <span className="capitalize">{paymentMethod}</span>
                          </div>
                          <div className="border-t border-slate-800 my-2 pt-2 flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${(selectedPlan?.price || 0) / 100}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Different payment forms based on selected method */}
                      {paymentMethod === "manual" && (
                        <div className="mb-6">
                          <h3 className="font-medium mb-3">Transaction Details</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="transaction-details">
                                Please provide your payment details
                              </Label>
                              <Textarea
                                id="transaction-details"
                                placeholder="Transaction ID, date, amount, etc."
                                className="bg-slate-900 border-slate-700 min-h-[100px]"
                                value={transactionDetails}
                                onChange={(e) => setTransactionDetails(e.target.value)}
                              />
                              <p className="text-xs text-gray-500">
                                Your subscription will be activated after admin approval.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethod === "paypal" && (
                        <div className="mb-6 flex justify-center">
                          <div className="bg-slate-900 rounded-md p-6 inline-block">
                            <PayPalButton 
                              amount={(selectedPlan?.price || 0) / 100 + ""} 
                              currency="USD" 
                              intent="CAPTURE" 
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Submit button for non-PayPal methods */}
                      {paymentMethod !== "paypal" && (
                        <Button
                          className="w-full bg-primary-600 hover:bg-primary-700"
                          size="lg"
                          onClick={handleSubmitPayment}
                          disabled={isProcessing || (paymentMethod === "manual" && !transactionDetails.trim())}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                            </>
                          ) : (
                            "Complete Payment"
                          )}
                        </Button>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
