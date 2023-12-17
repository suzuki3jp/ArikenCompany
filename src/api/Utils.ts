import { Response } from 'express';
import {} from '../managers';

const getSafeUserDataFromRes = (res: Response): { id: number; name: string } | null => {
    const { user } = res.locals;
    if (!user) return null;
    delete user.password;
    return user;
};

export { getSafeUserDataFromRes };
