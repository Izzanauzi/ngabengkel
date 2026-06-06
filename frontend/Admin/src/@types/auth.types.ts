export interface UserData {
    user_id: string;
    nama: string;
    email: string;
    telepon: string | null;   
    role: string;
    created_at: string;    
  }
  
  // Form 
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
  
  // API shapes 
  export interface AuthResponse {
    token: string;
    user: UserData;
  }
  
  export interface ApiError {
    code: number;
    message: string;
    errors?: string[]; 
  }