import api from '@/lib/api';

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

class AuthService {
  async changePassword(data: ChangePasswordData): Promise<{ message: string; must_change_password: boolean }> {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  }
}

export const authService = new AuthService();