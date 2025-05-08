import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { TokenPayload } from '../types/userTypes';

// Extender la interfaz de Request para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// Verificar el token JWT
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user || user.disabled) {
      return res.status(401).json({ message: 'User not found or disabled' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware para verificar si el usuario es el mismo o tiene permiso para modificar usuarios
export const canModifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (currentUser._id === userId || currentUser.permissions['UPDATE-USERS']) {
      return next();
    }

    return res.status(403).json({ message: 'Not authorized to modify this user' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware para verificar si el usuario tiene permiso para desactivar usuarios
export const canDisableUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (currentUser._id === userId || currentUser.permissions['DELETE-USERS']) {
      return next();
    }

    return res.status(403).json({ message: 'Not authorized to disable this user' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware para verificar si el usuario tiene permiso para crear libros
export const canCreateBook = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user || !user.permissions['CREATE-BOOKS']) {
    return res.status(403).json({ message: 'Not authorized to create books' });
  }

  next();
};

// Middleware para verificar si el usuario tiene permiso para modificar libros
export const canModifyBook = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  // Si el usuario intenta modificar la reserva
  if (req.body.reserved !== undefined) {
    return next();
  }

  if (!user || !user.permissions['UPDATE-BOOKS']) {
    return res.status(403).json({ message: 'Not authorized to modify books' });
  }

  next();
};

// Middleware para verificar si el usuario tiene permiso para desactivar libros
export const canDisableBook = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user || !user.permissions['DELETE-BOOKS']) {
    return res.status(403).json({ message: 'Not authorized to disable books' });
  }

  next();
};