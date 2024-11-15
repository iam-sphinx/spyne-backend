import { model, Schema } from 'mongoose';

const carSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: false,
    },
    company: {
      type: String,
      required: true,
    },
    dealer: {
      type: String,
      required: true,
    },
    dealerAddress: {
      type: String,
      requried: true,
    },
    year: {
      type: Date,
      required: true,
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      requried: false,
    },
    images: {
      type: [String],
      validate: {
        validator: (images: string[]) => {
          return images.length <= 10;
        },
        message: 'you can upload a maximum of 10 images',
      },
      required: false,
    },
  },
  { timestamps: true },
);

carSchema.index({ model: 'text', tags: 'text', description: 'text' });

const CAR = model('car', carSchema);

export default CAR;
