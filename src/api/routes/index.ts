import { LoginService } from '@/api/routes/auth/LoginService';
import { UserService } from '@/api/routes/user/UserService';
import { UserMeService } from '@/api/routes/user/me/UserMeService';

export const services = [LoginService, UserService, UserMeService] as const;
