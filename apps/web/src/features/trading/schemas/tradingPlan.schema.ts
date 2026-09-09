import { z } from "zod";

export const tradingPlanSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  market: z.enum(["SPOT", "FUTURES"]),
  direction: z.enum(["LONG", "SHORT"]),
  type: z.enum(["MARKET", "LIMIT", "STOP_LOSS", "TAKE_PROFIT"]),
  
  // Size/Capital allocation
  risk_percent: z.number().min(0.1).max(100),
  leverage: z.number().min(1).max(125).optional(), // Only for futures
  
  // Entry & Exit
  entry_price: z.number().positive().optional(), // Optional for market orders
  stop_loss_price: z.number().positive().optional(),
  take_profit_prices: z.array(z.number().positive()).optional(),
  
  // Execution modifiers
  reduce_only: z.boolean().default(false),
  time_in_force: z.enum(["GTC", "IOC", "FOK"]).default("GTC"),
});

export type TradingPlan = z.infer<typeof tradingPlanSchema>;
