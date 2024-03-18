export interface UserPayload {
  id: string;
  sub: string;
  email: string;
  name: string;
  active: boolean;
  iat?: number;
  exp?: number;
}
