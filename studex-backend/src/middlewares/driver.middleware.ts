import { Request, Response, NextFunction } from 'express';

export const requireVerifiedDriver = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    return;
  }

  if (!req.user.isDriverVerified) {
    res.status(403).json({ message: 'Forbidden: Driver verification required' });
    return;
  }

  next();
};
