/**
 * Centralized API client for ChiZen Fitness
 * Handles authentication, error handling, and request/response management
 */

import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    duration: number;
    focus_areas: string[];
    language: string;
  };
  streak_data: {
    current: number;
    longest: number;
    last_completed: string | null;
  };
  total_xp: number;
  is_admin: boolean;
  created_at: string;
}

export interface Routine {
  _id: string;
  routine_id: string;
  title: string;
  total_duration: number;
  focus_area: string;
  difficulty_level: number;
  blocks: RoutineBlock[];
  completion_xp: number;
  daily_wisdom: string;
  created_at: string;
  completed_at?: string;
}

export interface RoutineBlock {
  type: 'move' | 'mind' | 'core';
  name: string;
  duration_seconds: number;
  instructions: string[];
  difficulty: number;
  audio_cue: string;
  benefits: string[];
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'An error occurred';
        
        try {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.detail || parsed.message || errorMessage;
        } catch {
          errorMessage = errorData || `HTTP ${response.status}`;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const headers = await this.getAuthHeaders();
        const config: RequestInit = {
          headers,
          timeout: 10000, // 10 second timeout
          ...options,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return this.handleResponse<T>(response);
        
      } catch (error) {
        const isLastAttempt = attempt === retries;
        
        if (error instanceof Error) {
          // Don't retry on certain errors
          if (error.name === 'AbortError' || error.message.includes('unauthorized')) {
            return {
              success: false,
              error: error.name === 'AbortError' ? 'Request timed out' : error.message,
            };
          }
        }
        
        if (isLastAttempt) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          };
        }
        
        // Exponential backoff for retries
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: 'Network error - all retries failed',
    };
  }

  // Authentication endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/me');
  }

  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; user: User }>> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    fitness_level?: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Routine endpoints
  async getTodayRoutine(): Promise<ApiResponse<Routine>> {
    return this.request<Routine>('/api/routine/today');
  }

  async generateRoutine(): Promise<ApiResponse<Routine>> {
    return this.request<Routine>('/api/routine/generate', {
      method: 'POST',
    });
  }

  async completeRoutine(routineId: string, data: {
    duration_completed?: number;
    exercises_completed?: number;
    feedback?: 'easy' | 'perfect' | 'challenging';
  }): Promise<ApiResponse<{ xp_earned: number; streak_updated: boolean }>> {
    return this.request(`/api/routine/complete`, {
      method: 'POST',
      body: JSON.stringify({
        routine_id: routineId,
        ...data,
      }),
    });
  }

  async getRoutineHistory(page = 1, limit = 20): Promise<ApiResponse<{
    routines: Routine[];
    total: number;
    page: number;
    pages: number;
  }>> {
    return this.request(`/api/routine/history?page=${page}&limit=${limit}`);
  }

  // Progress endpoints
  async getProgress(): Promise<ApiResponse<{
    current_streak: number;
    longest_streak: number;
    total_xp: number;
    total_sessions: number;
    last_7_days: boolean[];
    monthly_stats: any;
  }>> {
    return this.request('/api/progress');
  }

  async getLeaderboard(limit = 50): Promise<ApiResponse<{
    users: Array<{
      username: string;
      streak: number;
      total_xp: number;
      rank: number;
    }>;
  }>> {
    return this.request(`/api/leaderboard?limit=${limit}`);
  }

  // Newsletter endpoints
  async subscribeNewsletter(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async unsubscribeNewsletter(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/api/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Admin endpoints
  async getUsers(page = 1, limit = 50): Promise<ApiResponse<{
    users: User[];
    total: number;
    page: number;
    pages: number;
  }>> {
    return this.request(`/api/admin/users?page=${page}&limit=${limit}`);
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request(`/api/admin/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAnalytics(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    total_routines: number;
    completion_rate: number;
    avg_streak: number;
    top_categories: Array<{ category: string; count: number }>;
    daily_signups: Array<{ date: string; count: number }>;
    user_retention: {
      day_1: number;
      day_7: number;
      day_30: number;
    };
  }>> {
    return this.request('/api/admin/analytics');
  }

  // Voice synthesis endpoint
  async generateVoice(text: string, voiceId?: string): Promise<ApiResponse<{ audio_url: string }>> {
    return this.request('/api/voice/generate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        voice_id: voiceId || 'master-lee',
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const {
  getCurrentUser,
  login,
  register,
  getTodayRoutine,
  generateRoutine,
  completeRoutine,
  getRoutineHistory,
  getProgress,
  getLeaderboard,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAnalytics,
  generateVoice,
  healthCheck,
} = apiClient;

export default apiClient;