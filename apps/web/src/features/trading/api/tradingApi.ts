import { TradingPlan } from "../schemas/tradingPlan.schema";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const tradingApi = {
  /**
   * Validates a trading plan with the backend risk engine.
   */
  validatePlan: async (plan: TradingPlan) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tools/risk/validate_plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Risk validation failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Trading API: validatePlan error", error);
      throw error;
    }
  },

  /**
   * Submits a trading plan for execution.
   */
  createPlan: async (plan: TradingPlan) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tools/plan/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create trading plan");
      }

      return await response.json();
    } catch (error) {
      console.error("Trading API: createPlan error", error);
      throw error;
    }
  }
};
