import mongoose, { Schema, model, models, type Document } from 'mongoose';

export interface IWishData {
  name: string;
  day: number;
  month: string;
  message: string;
  createdAt: string;
  images?: string[];
  topic?: 'birthday' | 'propose';
}

export interface IWish extends Document {
  slug: string;
  url: string;
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
    createdAt: { type: String, required: true },
    images:    { type: [String], default: [] },
    topic:     { type: String, enum: ['birthday', 'propose'], default: 'birthday' },
  },
  { _id: false }
);

const WishSchema = new Schema<IWish>(
  {
    slug:      { type: String, required: true, unique: true, index: true },
    url:       { type: String, required: true },
    data:      { type: WishDataSchema, required: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Wish = (models.Wish as mongoose.Model<IWish>) ?? model<IWish>('Wish', WishSchema);
export default Wish;