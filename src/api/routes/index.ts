import { LoginService } from '@/api/routes/auth/LoginService';
import { UserMeService } from '@/api/routes/user/me/UserMeService';

export const services = [LoginService, UserMeService] as const;
