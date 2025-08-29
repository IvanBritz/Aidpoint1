import api from '@/lib/api';

export interface Employee {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  position?: {
    id: number;
    name: string;
    description?: string;
  };
  position_id?: number;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  privileges: string[];
  formatted_privileges: Record<string, string>;
  created_at: string;
  updated_at: string;
  must_change_password: boolean;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  username?: string;
  position_id?: number | null;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
  privileges: string[];
}

export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  username?: string;
  position_id?: number | null;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'suspended';
  privileges?: string[];
}

export interface EmployeeResponse {
  employees: {
    data: Employee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  available_privileges: Record<string, string>;
}

export interface PrivilegesResponse {
  privileges: Record<string, string>;
}

export interface PositionsResponse {
  positions: string[];
  positions_full?: {
    id: number;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  }[];
}

export interface CreatePositionData {
  name: string;
  description?: string;
}

class EmployeeService {
  async getEmployees(page = 1): Promise<EmployeeResponse> {
    const response = await api.get(`/employees?page=${page}`);
    return response.data;
  }

  async getEmployee(id: number): Promise<{ employee: Employee; available_privileges: Record<string, string>; formatted_privileges: Record<string, string> }> {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  }

  async createEmployee(data: CreateEmployeeData): Promise<{ message: string; employee: Employee }> {
    console.log('EmployeeService: Creating employee with data:', data);
    
    // Clean up the data before sending
    const cleanData = {
      ...data,
      username: data.username || undefined, // Remove empty string
      phone: data.phone || undefined,
      address: data.address || undefined,
      position_id: data.position_id || undefined,
    };
    
    console.log('EmployeeService: Cleaned data:', cleanData);
    
    try {
      const response = await api.post('/employees', cleanData);
      console.log('EmployeeService: Success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('EmployeeService: Error creating employee:', error);
      throw error;
    }
  }

  async updateEmployee(id: number, data: UpdateEmployeeData): Promise<{ message: string; employee: Employee; formatted_privileges: Record<string, string> }> {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  }

  async deleteEmployee(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }

  async getAvailablePrivileges(): Promise<PrivilegesResponse> {
    const response = await api.get('/employees/privileges/list');
    return response.data;
  }

  async getAvailablePositions(): Promise<PositionsResponse> {
    const response = await api.get('/employees/positions/list');
    return response.data;
  }

  async createPosition(data: CreatePositionData): Promise<{ message: string; position: string; position_full: any }> {
    const response = await api.post('/employees/positions', data);
    return response.data;
  }
}

export const employeeService = new EmployeeService();