import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'RESTAURANT_STAFF', 'DELIVERY_PARTNER', 'ADMIN']).default('CUSTOMER'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const menuItemSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(2, 'Category is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  isVeg: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  calories: z.number().optional(),
  prepTime: z.string().optional().default('15 mins'),
});

export const cartItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  specialNotes: z.string().optional(),
});

export const checkoutSchema = z.object({
  restaurantId: z.string().min(1),
  deliveryAddress: z.string().min(5, 'Valid delivery address is required'),
  customerPhone: z.string().min(7, 'Valid contact phone is required'),
  paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING', 'COD']),
  couponCode: z.string().optional(),
  specialInstructions: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  upiId: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().min(5),
  discountPercent: z.number().min(1).max(100),
  maxDiscount: z.number().positive(),
  minOrderValue: z.number().min(0),
  validUntil: z.string().or(z.date()),
  isActive: z.boolean().default(true),
});

export const complaintSchema = z.object({
  orderId: z.string().min(1),
  subject: z.string().min(3),
  description: z.string().min(10),
});

export const reviewSchema = z.object({
  restaurantId: z.string().min(1),
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3),
});
