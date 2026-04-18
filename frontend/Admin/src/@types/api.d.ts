export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
  }
  
  export interface UserProfile {
    id: string;
    name: string;
    email: string;
}

export interface LoginResponse {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string; 
    };
  }