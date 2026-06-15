import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt = require('bcrypt');
import { Prisma, Role } from '@prisma/client';
import googleClient from '../config/googleAuth';
import prisma from '../config/prisma';

const SALT_ROUNDS = 12;

const authUserSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  password: true,
  googleId: true,
  profilePic: true,
  phoneNumber: true,
  fakultas: true,
  jurusan: true,
  universitas: true,
  role: true,
  isDriverVerified: true,
  driverProfile: {
    select: {
      id: true,
      isActive: true,
      avgRating: true,
      totalTrips: true,
    },
  },
} satisfies Prisma.UserSelect;

type AuthUser = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

type PublicUser = Omit<AuthUser, 'password' | 'googleId' | 'driverProfile'> & {
  hasDriverApplication: boolean;
  driverProfile: AuthUser['driverProfile'];
};

function generateToken(userId: number, role: Role): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT secret not configured');
  }

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(
    { id: userId, role },
    secret,
    options
  );
}

function sanitizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isProfileComplete(user: Pick<AuthUser, 'username' | 'name' | 'phoneNumber' | 'fakultas' | 'jurusan' | 'universitas'>): boolean {
  return Boolean(
    user.username?.trim() &&
    user.name.trim() &&
    user.phoneNumber?.trim() &&
    user.fakultas?.trim() &&
    user.jurusan?.trim() &&
    user.universitas?.trim()
  );
}

function toPublicUser(user: AuthUser): PublicUser {
  const { password: _password, googleId: _googleId, driverProfile, ...publicUser } = user;
  return {
    ...publicUser,
    hasDriverApplication: Boolean(driverProfile),
    driverProfile: driverProfile ?? null,
  };
}

function buildAuthPayload(user: AuthUser, token?: string) {
  return {
    ...(token ? { token } : {}),
    user: toPublicUser(user),
    needsProfileCompletion: !isProfileComplete(user),
    canUseDriverMode: user.isDriverVerified,
  };
}

async function getAuthUserById(userId: number): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: authUserSelect,
  });
}

function getRequestUserId(req: Request): number | null {
  return req.user?.id ?? null;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = sanitizeString(req.body.username);
    const name = sanitizeString(req.body.name);
    const email = sanitizeString(req.body.email)?.toLowerCase() ?? null;
    const password = typeof req.body.password === 'string' ? req.body.password : null;
    const phoneNumber = sanitizeString(req.body.phoneNumber);
    const fakultas = sanitizeString(req.body.fakultas);
    const jurusan = sanitizeString(req.body.jurusan);
    const universitas = sanitizeString(req.body.universitas);

    if (!username || !name || !email || !password || !phoneNumber || !fakultas || !jurusan || !universitas) {
      res.status(400).json({
        message: 'username, name, email, password, phoneNumber, fakultas, jurusan, and universitas are required',
      });
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
        phoneNumber,
        fakultas,
        jurusan,
        universitas,
        role: Role.USER,
        isDriverVerified: false,
      },
      select: authUserSelect,
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      ...buildAuthPayload(user, token),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = sanitizeString(req.body.email)?.toLowerCase() ?? null;
    const password = typeof req.body.password === 'string' ? req.body.password : null;

    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: authUserSelect,
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.password) {
      res.status(409).json({ message: 'This account was registered with Google. Please continue with Google login.' });
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
      ...buildAuthPayload(user, token),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const idToken = sanitizeString(req.body.idToken);

    if (!idToken) {
      res.status(400).json({ message: 'idToken is required' });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(400).json({ message: 'Invalid Google token payload' });
      return;
    }

    const email = payload.email.toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email },
      select: authUserSelect,
    });

    if (user) {
      const updates: Prisma.UserUpdateInput = {};

      if (!user.googleId) {
        updates.googleId = payload.sub;
      }

      if (payload.picture && user.profilePic !== payload.picture) {
        updates.profilePic = payload.picture;
      }

      if (payload.name && user.name !== payload.name) {
        updates.name = payload.name;
      }

      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
          select: authUserSelect,
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: payload.name || 'User',
          email,
          googleId: payload.sub,
          profilePic: payload.picture,
          role: Role.USER,
          isDriverVerified: false,
        },
        select: authUserSelect,
      });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      ...buildAuthPayload(user, token),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Internal server error during Google login' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getRequestUserId(req);

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await getAuthUserById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(buildAuthPayload(user));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error while fetching current user' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getRequestUserId(req);

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const username = sanitizeString(req.body.username);
    const name = sanitizeString(req.body.name);
    const phoneNumber = sanitizeString(req.body.phoneNumber);
    const fakultas = sanitizeString(req.body.fakultas);
    const jurusan = sanitizeString(req.body.jurusan);
    const universitas = sanitizeString(req.body.universitas);

    const updateData: Prisma.UserUpdateInput = {};

    if (req.body.username !== undefined) {
      if (!username) {
        res.status(400).json({ message: 'username cannot be empty' });
        return;
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (existingUsername && existingUsername.id !== userId) {
        res.status(409).json({ message: 'Username already taken' });
        return;
      }

      updateData.username = username;
    }

    if (req.body.name !== undefined) {
      if (!name) {
        res.status(400).json({ message: 'name cannot be empty' });
        return;
      }

      updateData.name = name;
    }

    if (req.body.phoneNumber !== undefined) {
      if (!phoneNumber) {
        res.status(400).json({ message: 'phoneNumber cannot be empty' });
        return;
      }

      updateData.phoneNumber = phoneNumber;
    }

    if (req.body.fakultas !== undefined) {
      if (!fakultas) {
        res.status(400).json({ message: 'fakultas cannot be empty' });
        return;
      }

      updateData.fakultas = fakultas;
    }

    if (req.body.jurusan !== undefined) {
      if (!jurusan) {
        res.status(400).json({ message: 'jurusan cannot be empty' });
        return;
      }

      updateData.jurusan = jurusan;
    }

    if (req.body.universitas !== undefined) {
      if (!universitas) {
        res.status(400).json({ message: 'universitas cannot be empty' });
        return;
      }

      updateData.universitas = universitas;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'At least one profile field must be provided' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: authUserSelect,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      ...buildAuthPayload(user),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error while updating profile' });
  }
};
