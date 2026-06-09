import { Request, Response, NextFunction } from 'express';
   import jwt from 'jsonwebtoken';
   import prisma from '../config/prisma';
   import { Role } from '@prisma/client';

   interface JwtPayload {
     id: number;
     role: Role;
   }

   export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
     try {
       const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith('Bearer ')) {
         res.status(401).json({ message: 'Unauthorized: No token provided' });
         return;
       }

       const token = authHeader.split(' ')[1];
       const secret = process.env.JWT_SECRET;
       if (!secret) {
         res.status(500).json({ message: 'Internal server error: JWT secret not configured' });
         return;
       }

       let decoded: JwtPayload;
       try {
         decoded = jwt.verify(token, secret) as JwtPayload;
       } catch (err) {
         res.status(401).json({ message: 'Unauthorized: Invalid token' });
         return;
       }

       const user = await prisma.user.findUnique({
         where: { id: decoded.id },
         select: {
           id: true,
           role: true,
           isDriverVerified: true,
         },
       });

       if (!user) {
         res.status(401).json({ message: 'Unauthorized: User not found' });
         return;
       }

       req.user = {
         id: user.id,
         role: user.role,
         isDriverVerified: user.isDriverVerified,
       };

       next();
     } catch (error) {
       console.error('Auth middleware error:', error);
       res.status(500).json({ message: 'Internal server error' });
     }
   };
   
