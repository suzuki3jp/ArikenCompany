import { Response } from 'express';

const getSafeUserDataFromRes = (res: Response): { id: number; name: string } => {
    const { user } = res.locals;
    delete user.password;
    return user;
};

export { getSafeUserDataFromRes };
