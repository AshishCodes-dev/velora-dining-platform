import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d\s().-]{7,25}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}

export function isValidEntityId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  return trimmed.length >= 2 && trimmed.length <= 120 && /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

// Zod Schemas
export const RegistrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(100),
  email: z.string().trim().email('Please provide a valid email address.').max(120),
  phone: z.string().trim().regex(PHONE_REGEX, 'Please provide a valid phone number (7–25 digits).'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export const LoginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').max(120),
  password: z.string().min(1, 'Email and password are required.'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email('Please provide a valid registered email address.').max(120),
});

export const ResetPasswordSchema = z.object({
  email: z.string().trim().email('Valid email address is required.').max(120),
  resetToken: z.string().trim().min(1, 'Password reset verification token is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long.'),
});

export const FoodSchema = z.object({
  name: z.string().trim().min(2, 'Dish name is required (minimum 2 characters).').max(120),
  categoryName: z.string().trim().min(1, 'Category is required.').max(80),
  price: z.coerce.number().positive('Price must be greater than 0.').max(5000),
  discountPercent: z.coerce.number().min(0).max(90).default(0),
  description: z.string().trim().max(1000).optional(),
  categoryId: z.string().trim().max(80).optional(),
  illustrationType: z.enum(['platter', 'pizza', 'biryani', 'burger', 'tart', 'pasta', 'dimsum', 'elixir', 'scallop']).optional(),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  spicyLevel: z.coerce.number().min(0).max(3).optional(),
  preparationTimeMinutes: z.coerce.number().min(1).max(180).optional(),
  calories: z.coerce.number().min(0).max(5000).optional(),
});

export const ReservationSchema = z.object({
  name: z.string().trim().min(2, 'Guest name is required (minimum 2 characters).').max(100),
  phone: z.string().trim().regex(PHONE_REGEX, 'Valid contact phone number is required.'),
  email: z.string().trim().email('Please provide a valid email address.').max(120).optional().or(z.literal('')),
  date: z.string().regex(DATE_REGEX, 'Valid reservation date (YYYY-MM-DD) is required.'),
  time: z.string().regex(TIME_REGEX, 'Valid reservation time (HH:MM) is required.'),
  guests: z.coerce.number().int().min(1, 'Guest count must be at least 1.').max(20, 'Guest count cannot exceed 20.'),
  tableArea: z.enum(['Main Dining Room', 'Velvet Chef Counter', 'Private Sommelier Vault', 'Velora Garden Terrace']).default('Main Dining Room'),
  specialRequest: z.string().trim().max(400).optional(),
});

export const OrderItemInputSchema = z.object({
  id: z.string().optional(),
  foodId: z.string().min(1, 'Food ID is required.'),
  quantity: z.coerce.number().int().min(1).max(50),
  selectedSize: z.enum(['Regular', 'Large', 'Family']).default('Regular'),
  selectedAddons: z.array(z.any()).default([]),
  specialInstructions: z.string().max(200).optional(),
});

export const OrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name is required.').max(100),
  customerPhone: z.string().trim().regex(PHONE_REGEX, 'Valid customer phone number is required.'),
  customerEmail: z.string().trim().email('Valid customer email address is required.').max(120),
  orderType: z.enum(['Delivery', 'Pickup', 'Dine-in']),
  items: z.array(OrderItemInputSchema).min(1, 'Cannot place an order with an empty cart.'),
  deliveryAddress: z.object({
    id: z.string().optional(),
    label: z.string().optional(),
    houseFlat: z.string().trim().min(1, 'House/Flat is required for delivery.'),
    street: z.string().trim().min(1, 'Street is required for delivery.'),
    area: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().trim().min(1, 'Pincode is required for delivery.'),
    isDefault: z.boolean().optional(),
  }).optional(),
  tableNumber: z.string().max(40).optional(),
  paymentMethod: z.enum(['Card (Test Mode)', 'UPI / Instant Pay (Test)', 'Pay at Restaurant / COD']).default('Card (Test Mode)'),
  couponCode: z.string().max(40).optional(),
});

export const CouponSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,25}$/, 'Coupon code must be 3–25 alphanumeric characters.'),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(2).max(300),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive('Discount value must be greater than 0.'),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required.'),
  usageLimit: z.coerce.number().int().min(1).default(100),
  isActive: z.boolean().default(true),
});

export const OfferSchema = z.object({
  title: z.string().trim().min(2).max(100),
  subtitle: z.string().trim().min(2).max(200),
  description: z.string().trim().min(2).max(500),
  badgeText: z.string().trim().min(1).max(50),
  couponCode: z.string().trim().toUpperCase().min(3).max(30),
  validUntil: z.string().min(1),
  accentColor: z.enum(['purple', 'emerald', 'pink', 'gold']).default('purple'),
  isActive: z.boolean().default(true),
});

export const ReviewSchema = z.object({
  foodId: z.string().trim().min(1, 'Dish ID is required for review.'),
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5.').max(5, 'Rating must be between 1 and 5.'),
  comment: z.string().trim().min(5, 'Review comment must be at least 5 characters long.').max(800),
});

export const StaffSchema = z.object({
  name: z.string().trim().min(2, 'Staff name is required.').max(100),
  email: z.string().trim().email('Valid email is required.').max(120),
  phone: z.string().trim().regex(PHONE_REGEX, 'Valid phone number is required.'),
  roleTitle: z.string().trim().min(2).max(80),
  department: z.enum(['Culinary', 'Service & Sommelier', 'Hospitality', 'Operations']),
  shift: z.enum(['Evening Service (16:00 - 00:00)', 'Night Owl (18:00 - 02:00)', 'All-Day Prep (11:00 - 19:00)']),
  specialty: z.string().trim().max(120).default('Fine Dining Service'),
});

export const AddressSchemaValidator = z.object({
  label: z.string().trim().min(1).max(60).default('Home'),
  houseFlat: z.string().trim().min(1, 'House/Flat is required.').max(120),
  street: z.string().trim().min(1, 'Street is required.').max(150),
  area: z.string().trim().max(100).default('Downtown'),
  city: z.string().trim().max(80).default('San Francisco'),
  state: z.string().trim().max(60).default('CA'),
  pincode: z.string().trim().min(1, 'Pincode is required.').max(20),
  isDefault: z.boolean().default(false),
});

// Helper validation functions
function formatZodError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Invalid input data.';
}

export function validateRegistrationInput(body: unknown): { valid: boolean; error?: string; data?: z.infer<typeof RegistrationSchema> } {
  const result = RegistrationSchema.safeParse(body);
  if (!result.success) {
    return { valid: false, error: formatZodError(result.error) };
  }
  return { valid: true, data: result.data };
}

export function validateFoodInput(body: unknown): { valid: boolean; error?: string; data?: z.infer<typeof FoodSchema> } {
  const result = FoodSchema.safeParse(body);
  if (!result.success) {
    return { valid: false, error: formatZodError(result.error) };
  }
  return { valid: true, data: result.data };
}

export function validateReservationInput(body: unknown): { valid: boolean; error?: string; data?: z.infer<typeof ReservationSchema> } {
  const result = ReservationSchema.safeParse(body);
  if (!result.success) {
    return { valid: false, error: formatZodError(result.error) };
  }
  return { valid: true, data: result.data };
}

export function validateOrderInput(body: unknown): { valid: boolean; error?: string; data?: z.infer<typeof OrderSchema> } {
  const result = OrderSchema.safeParse(body);
  if (!result.success) {
    return { valid: false, error: formatZodError(result.error) };
  }
  if (result.data.orderType === 'Delivery' && !result.data.deliveryAddress) {
    return { valid: false, error: 'Delivery address is required for delivery orders.' };
  }
  return { valid: true, data: result.data };
}

export function validateCouponInput(body: unknown): { valid: boolean; error?: string; data?: z.infer<typeof CouponSchema> } {
  const result = CouponSchema.safeParse(body);
  if (!result.success) {
    return { valid: false, error: formatZodError(result.error) };
  }
  if (result.data.discountType === 'PERCENTAGE' && result.data.discountValue > 90) {
    return { valid: false, error: 'Percentage discount cannot exceed 90%.' };
  }
  return { valid: true, data: result.data };
}

export function validateReviewInput(body: unknown): { valid: boolean; error?: string; data?: z.infer<typeof ReviewSchema> } {
  const result = ReviewSchema.safeParse(body);
  if (!result.success) {
    return { valid: false, error: formatZodError(result.error) };
  }
  return { valid: true, data: result.data };
}
