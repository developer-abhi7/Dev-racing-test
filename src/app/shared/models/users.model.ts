export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  rememberMe?: boolean;
}