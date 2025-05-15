import { Request, Response } from "express";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

// Wrapper functions for PayPal that handle missing credentials gracefully
export async function handlePayPalSetup(req: Request, res: Response) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(503).json({ 
      error: "PayPal is not configured. Please use manual payment option." 
    });
  }
  
  try {
    await loadPaypalDefault(req, res);
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
    await createPaypalOrder(req, res);
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
    await capturePaypalOrder(req, res);
  } catch (error) {
    console.error("PayPal capture error:", error);
    res.status(500).json({ 
      error: "Failed to process PayPal payment. Please use manual payment option." 
    });
  }
}