import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import googleClient from '../config/googleAuth';
import prisma from '../config/prisma';

const SALT_ROUNDS = 12;

function generateToken(userId: number, role: string): string {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
  );
}

function userResponse(user: any) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic,
    phoneNumber: user.phoneNumber,
    fakultas: user.fakultas,
    jurusan: user.jurusan,
    universitas: user.universitas,
    role: user.role,
    isDriverVerified: user.isDriverVerified,
  };
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, name, email, password, phoneNumber, fakultas, jurusan, universitas } = req.body;

    if (!username || !name || !email || !password) {
      res.status(400).json({ message: 'username, name, email, and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters' });
      return;
    }

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingEmail) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    if (existingUsername) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        fakultas: fakultas || null,
        jurusan: jurusan || null,
        universitas: universitas || null,
        role: 'USER',
        isDriverVerified: false,
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ message: 'idToken is required' });
      return;
    }

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

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const updates: any = {};
      if (!user.googleId) updates.googleId = payload.sub;
      if (payload.picture && user.profilePic !== payload.picture) updates.profilePic = payload.picture;
      if (payload.name && user.name !== payload.name) updates.name = payload.name;

      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({ where: { id: user.id }, data: updates });
      }
    } else {
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

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: 'Internal server error: JWT secret not configured' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal server error during Google login' });
  }
};
