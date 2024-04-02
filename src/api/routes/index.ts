import { LoginService } from '@/api/routes/auth/LoginService';

import { UserService } from '@/api/routes/user/UserService';
import { UserMeService } from '@/api/routes/user/me/UserMeService';

import { PublicCommandsService } from '@/api/routes/commands/public/PublicCommandsService';
import { CommandsService } from '@/api/routes/commands/CommandsService';

export const services = [LoginService, UserService, UserMeService, PublicCommandsService, CommandsService] as const;
