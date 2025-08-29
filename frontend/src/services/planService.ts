import api from '@/lib/api';

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  max_beneficiaries: number;
  max_employees: number;
  features: string[];
  is_active: boolean;
  formatted_price: string;
  created_at: string;
  updated_at: string;
}

export interface PlansResponse {
  plans: Plan[];
}

export const planService = {
  // Get all available plans
  getPlans: async (): Promise<PlansResponse> => {
    const response = await api.get<PlansResponse>('/plans');
    return response.data;
  },
};
