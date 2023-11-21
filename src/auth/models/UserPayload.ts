export interface UserPayload {
  id: string;
  sub: string; // Vou arranjar uma solução para esse problema depois. TypeScript ta enchendo o saco.
  email: string;
  name: string;
  isActive: boolean;
  iat?: number;
  exp?: number;
}
