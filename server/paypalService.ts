import { Request, Response } from "express";

// PayPal service that handles missing credentials and fallbacks to manual payment
export async function handlePayPalSetup(req: Request, res: Response) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: "PayPal is not configured. Please use manual payment option." 
    });
  }
  
  try {
    // Mock client token for demo purposes until real PayPal credentials are provided
    res.json({
      clientToken: "mock-paypal-token-for-demo-purposes-only"
    });
  } catch (error) {
    console.error("PayPal setup error:", error);
    res.status(500).json({ 
      error: "Failed to initialize PayPal. Please use manual payment option." 
    });
  }
}

export async function handleCreatePayPalOrder(req: Request, res: Response) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: "PayPal is not configured. Please use manual payment option." 
    });
  }
  
  try {
    const { amount, currency, intent } = req.body;

    // Input validation
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: "Invalid amount. Amount must be a positive number."
      });
    }

    if (!currency) {
      return res.status(400).json({ 
        error: "Invalid currency. Currency is required." 
      });
    }

    if (!intent) {
      return res.status(400).json({ 
        error: "Invalid intent. Intent is required." 
      });
    }
    
    // Return a mock order response for demo purposes
    res.status(200).json({
      id: `DEMO-ORDER-${Date.now()}`,
      status: "CREATED",
      links: [
        {
          href: `${req.protocol}://${req.get('host')}/api/paypal/checkout`,
          rel: "approve",
          method: "GET"
        }
      ]
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    res.status(500).json({ 
      error: "Failed to create PayPal order. Please use manual payment option." 
    });
  }
}

export async function handleCapturePayPalOrder(req: Request, res: Response) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: "PayPal is not configured. Please use manual payment option." 
    });
  }
  
  try {
    const { orderID } = req.params;
    
    // Return a mock capture response for demo purposes
    res.status(200).json({
      id: orderID,
      status: "COMPLETED",
      payer: {
        email_address: "demo@example.com"
      },
      purchase_units: [
        {
          reference_id: "default",
          amount: {
            value: "19.99",
            currency_code: "USD"
          }
        }
      ]
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    res.status(500).json({ 
      error: "Failed to process PayPal payment. Please use manual payment option." 
    });
  }
}