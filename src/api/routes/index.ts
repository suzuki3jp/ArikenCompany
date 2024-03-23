import { LoginService } from '@/api/routes/auth/LoginService';

import { UserService } from '@/api/routes/user/UserService';
import { UserMeService } from '@/api/routes/user/me/UserMeService';

import { PublicCommandsService } from '@/api/routes/commands/public/PublicCommandsService';

export const services = [LoginService, UserService, UserMeService, PublicCommandsService] as const;
