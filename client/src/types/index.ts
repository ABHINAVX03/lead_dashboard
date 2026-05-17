export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'sales';
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  status: '' | LeadStatus;
  source: '' | LeadSource;
  search: string;
  sort: 'latest' | 'oldest';
}

export interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  pagination: PaginationData;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: 'admin' | 'sales';
  adminSecret?: string;
}
