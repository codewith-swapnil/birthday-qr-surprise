import mongoose, { Schema, model, models, type Document } from 'mongoose';

/* ── Embedded WishData shape ── */
export interface IWishData {
  name: string;
  day: number;
  month: string;
  message: string;
  createdAt: string;      // ISO string (matches your existing WishData type)
  images?: string[];
}

/* ── Full document stored in MongoDB ── */
export interface IWish extends Document {
  slug: string;           // unique identifier, e.g. "sophia-14-july-a3f2"
  url: string;            // full share URL with encoded data
  data: IWishData;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WishDataSchema = new Schema<IWishData>(
  {
    name:      { type: String, required: true, trim: true, maxlength: 50 },
    day:       { type: Number, required: true, min: 1, max: 31 },
    month:     { type: String, required: true },
    message:   { type: String, default: '', maxlength: 500 },
    createdAt: { type: String, required: true },   // ISO string from client
    images:    { type: [String], default: [] },
  },
  { _id: false }  // no separate _id for the sub-document
);

const WishSchema = new Schema<IWish>(
  {
    slug:      { type: String, required: true, unique: true, index: true },
    url:       { type: String, required: true },
    data:      { type: WishDataSchema, required: true },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt (Date) at the top level
  }
);

/* ── Prevent model re-compilation in dev hot reloads ── */
const Wish = (models.Wish as mongoose.Model<IWish>) ?? model<IWish>('Wish', WishSchema);
export default Wish;