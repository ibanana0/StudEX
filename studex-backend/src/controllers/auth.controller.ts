import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import googleClient from '../config/googleAuth';
import prisma from '../config/prisma';

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ message: 'idToken is required' });
      return;
    }

    // Verifikasi token ID dari Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Invalid Google token payload' });
      return;
    }

    const email = payload.email;

    // Cari atau buat user di database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Hubungkan akun Google jika belum terhubung atau update foto profil
      const updates: any = {};
      if (!user.googleId) updates.googleId = payload.sub;
      if (payload.picture && user.profilePic !== payload.picture) updates.profilePic = payload.picture;
      if (payload.name && user.name !== payload.name) updates.name = payload.name;

      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    } else {
      // Buat user baru
      user = await prisma.user.create({
        data: {
          name: payload.name || 'User',
          email,
          googleId: payload.sub,
          profilePic: payload.picture,
          role: 'USER',
          isDriverVerified: false,
        },
      });
    }

    // Generate JWT Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Internal server error: JWT secret not configured' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isDriverVerified: user.isDriverVerified,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal server error during Google login' });
  }
};
