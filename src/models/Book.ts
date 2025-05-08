import { Schema, model, Document } from 'mongoose';

export interface BookDocument extends Document {
  name: string;
  author: string;
  pubDate: Date;
  genre: string;
  publisher: string;
  reserved: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<BookDocument>({
  name: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  pubDate: {
    type: Date,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  reserved: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});

export const Book = model<BookDocument>('Book', bookSchema);