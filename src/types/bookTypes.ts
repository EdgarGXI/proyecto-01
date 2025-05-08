import { BookDocument } from '../models/Book';

export type CreateBookDto = Omit<BookDocument, '_id' | 'createdAt' | 'updatedAt' | 'disabled' | 'reserved'>;
export type UpdateBookDto = Partial<Omit<BookDocument, '_id' | 'createdAt' | 'updatedAt'>>;

export type BookQuery = Partial<{
  _id: string;
  name: string;
  author: string;
  pubDate: string | Date;
  genre: string;
  publisher: string;
  reserved: boolean;
  disabled: boolean;
}>;