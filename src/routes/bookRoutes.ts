import { Router } from 'express';
import {
  createBook,
  searchBooks,
  getBookById,
  updateBook,
  reserveBook,
  returnBook,
  disableBook
} from '../controllers/bookController';
import {
  verifyToken,
  canCreateBook,
  canModifyBook,
  canDisableBook
} from '../middleware/auth';

const router = Router();

// Rutas públicas
router.get('/', searchBooks);
router.get('/:bookId', getBookById);

// Rutas protegidas
router.post('/', verifyToken, canCreateBook, createBook);
router.put('/:bookId', verifyToken, canModifyBook, updateBook);
router.post('/:bookId/reserve', verifyToken, reserveBook);
router.post('/:bookId/return', verifyToken, returnBook);
router.delete('/:bookId', verifyToken, canDisableBook, disableBook);

export default router;