export interface RegisterForm {
    nama: string;
    email: string;
    telepon: string;
    password: string;
    konfirmasiPassword: string;
  }
  
  export interface FieldErrors {
    nama?: string;
    email?: string;
    telepon?: string;
    password?: string;
    konfirmasiPassword?: string;
  }
  
  export interface AuthUser {
    user_id: string;
    nama: string;
    email: string;
    telepon: string | null;
    password: string;
    role: "customer" | "admin" ;
    created_at?: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: AuthUser;
  }
  
  export interface ApiError {
    code: number;
    message: string;
    errors?: string[];
  }