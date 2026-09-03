import api from "./axios";

export type CreateBudgetRequest = {
  tripId: string;
  profileId: string;
  total: number;
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  misc: number;
};

export type UpdateBudgetRequest = {
  total?: number;
  flights?: number;
  accommodation?: number;
  food?: number;
  activities?: number;
  misc?: number;
};

export type BudgetResponse = CreateBudgetRequest & {
  budgetId: string;
  createdAt: string;
  updatedAt: string;
};

export const createBudget = async (
  budgetData: CreateBudgetRequest,
  token: string,
): Promise<BudgetResponse> => {
  const response = await api.post("/budgets", budgetData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getBudgetByTripAndProfile = async (
  tripId: string,
  profileId: string,
  token: string,
): Promise<BudgetResponse> => {
  const response = await api.get(
    `/budgets/by-trip/${tripId}/profile/${profileId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const updateBudget = async (
  budgetId: string,
  budgetData: UpdateBudgetRequest,
  token: string,
): Promise<BudgetResponse> => {
  const response = await api.put(
    `/budgets/${budgetId}`,
    budgetData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};