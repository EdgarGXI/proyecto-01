import { Request, Response } from 'express';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Reservation } from '../models/Reservation';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from '../types/userTypes';

// Crear un nuevo usuario
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserDto = req.body;
    
    // Hash de la contraseña
    userData.password = await argon2.hash(userData.password);
    
    const user = await User.create(userData);
    
    // No devolver la contraseña
    const userResponse = user.toObject();
    // Use type assertion to tell TypeScript it's safe to delete this property
    delete (userResponse as any).password;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error: any) {
    if (error.code === 11000) { // Error de duplicado en MongoDB
      res.status(400).json({
        message: 'Email or ID already exists',
      });
    } else {
      res.status(500).json({
        message: 'Error creating user',
        error: error.message
      });
    }
  }
};

// Login de usuario
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginUserDto = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ email, disabled: false });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    
    // Verificar contraseña
    const validPassword = await argon2.verify(user.password, password);
    
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { _id: user._id, permissions: user.permissions },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    
    // Obtener historial de reservas del usuario
    const reservations = await Reservation.find({ userId: user._id });
    
    // No devolver la contraseña
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse,
      reservationHistory: reservations
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const updateData: UpdateUserDto = req.body;
    
    // Si se actualiza la contraseña, hasheamos la nueva
    if (updateData.password) {
      updateData.password = await argon2.hash(updateData.password);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Desactivar usuario (soft delete)
export const disableUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { disabled: true },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'User disabled successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error disabling user',
      error: error.message
    });
  }
};