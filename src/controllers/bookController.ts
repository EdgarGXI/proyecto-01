import { Request, Response } from 'express';
import { Book } from '../models/Book';
import { Reservation } from '../models/Reservation';
import { CreateBookDto, UpdateBookDto, BookQuery } from '../types/bookTypes';
import { CreateReservationDto } from '../types/reservationTypes';

// Crear un nuevo libro
export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookData: CreateBookDto = req.body;
    const book = await Book.create(bookData);
    
    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error creating book',
      error: error.message
    });
  }
};

// Buscar libros con filtros
export const searchBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: BookQuery = { ...req.query, disabled: false };
    
    // Convertir la fecha de publicación a Date si existe
    if (query.pubDate) {
      query.pubDate = new Date(query.pubDate as string);
    }
    
    const books = await Book.find(query);
    
    res.status(200).json({
      message: 'Books found',
      results: books
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error searching books',
      error: error.message
    });
  }
};

// Buscar un libro por ID
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const book = await Book.findOne({ _id: bookId, disabled: false });
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    // Obtener historial de reservas para este libro
    const reservationHistory = await Reservation.find({ bookId });
    
    res.status(200).json({
      message: 'Book found',
      results: {
        book,
        reservationHistory
      }
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error finding book',
      error: error.message
    });
  }
};

// Actualizar libro
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const updateData: UpdateBookDto = req.body;
    
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedBook) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error updating book',
      error: error.message
    });
  }
};

// Reservar libro
export const reserveBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user?._id;
    
    // Verificar si el libro existe y no está reservado
    const book = await Book.findOne({ _id: bookId, disabled: false });
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    if (book.reserved) {
      res.status(400).json({ message: 'Book is already reserved' });
      return;
    }
    
    // Actualizar libro a reservado
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { reserved: true },
      { new: true }
    );
    
    // Crear registro de reserva
    const reservationData: CreateReservationDto = {
      bookId,
      userId: userId as string
    };
    
    const newReservation = await Reservation.create(reservationData);
    
    res.status(200).json({
      message: 'Book reserved successfully',
      updatedBook,
      newReservation
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error reserving book',
      error: error.message
    });
  }
};

// Devolver libro
export const returnBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user?._id;
    
    // Verificar si el libro existe y está reservado
    const book = await Book.findOne({ _id: bookId, disabled: false });
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    if (!book.reserved) {
      res.status(400).json({ message: 'Book is not reserved' });
      return;
    }
    
    // Actualizar registro de reserva
    const updatedReservation = await Reservation.findOneAndUpdate(
      { bookId, userId, returnDate: null },
      { returnDate: new Date() },
      { new: true }
    );
    
    if (!updatedReservation) {
      res.status(404).json({ message: 'No active reservation found for this book and user' });
      return;
    }
    
    // Actualizar libro a no reservado
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { reserved: false },
      { new: true }
    );
    
    res.status(200).json({
      message: 'Book returned successfully',
      updatedBook,
      updatedReservation
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error returning book',
      error: error.message
    });
  }
};

// Desactivar libro (soft delete)
export const disableBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    
    const book = await Book.findByIdAndUpdate(
      bookId,
      { disabled: true },
      { new: true }
    );
    
    if (!book) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Book disabled successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error disabling book',
      error: error.message
    });
  }
};