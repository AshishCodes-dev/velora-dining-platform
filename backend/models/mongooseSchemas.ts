import mongoose, { Schema } from 'mongoose';

/**
 * VELORA — Production Mongoose Schemas & Models
 * Covers all 14+ relational entities:
 * Address, User, Category, Food, OrderItem, Cart, Order,
 * Reservation, Review, Coupon, Offer, Payment, Staff, Notification, RestaurantSettings
 */

const AddressSubSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true, maxlength: 60 },
    houseFlat: { type: String, required: true, trim: true, maxlength: 120 },
    street: { type: String, required: true, trim: true, maxlength: 150 },
    area: { type: String, required: true, trim: true, maxlength: 100 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, required: true, trim: true, maxlength: 60 },
    pincode: { type: String, required: true, trim: true, maxlength: 20 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

export const AddressSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
    label: { type: String, required: true, trim: true },
    houseFlat: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'STAFF', 'ADMIN'],
      default: 'CUSTOMER',
      index: true,
    },
    avatar: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISABLED'],
      default: 'ACTIVE',
      index: true,
    },
    favorites: [{ type: String, ref: 'Food' }],
    addresses: [AddressSubSchema],
    resetPasswordTokenHash: { type: String },
    resetPasswordExpiresAt: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const CategorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    iconName: { type: String, default: 'Utensils' },
  },
  { timestamps: true }
);

export const FoodSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    categoryId: { type: String, ref: 'Category', required: true, index: true },
    categoryName: { type: String, required: true, index: true },
    description: { type: String, required: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0.01 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    image: { type: String, required: true },
    illustrationType: {
      type: String,
      enum: [
        'platter',
        'pizza',
        'biryani',
        'burger',
        'tart',
        'pasta',
        'dimsum',
        'elixir',
        'scallop',
      ],
      default: 'platter',
    },
    isVeg: { type: Boolean, default: false, index: true },
    spicyLevel: { type: Number, enum: [0, 1, 2, 3], default: 0 },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    calories: { type: Number, default: 500, min: 0 },
    prepTimeMinutes: { type: Number, default: 20, min: 1 },
    ingredients: [{ type: String, trim: true }],
    dietaryTags: [{ type: String, trim: true }],
    isPopular: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewDish: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true, index: true },
    sizes: [
      {
        name: { type: String, enum: ['Regular', 'Large', 'Family'], required: true },
        priceDelta: { type: Number, required: true, default: 0 },
        serves: { type: String, default: 'Serves 1' },
      },
    ],
    addons: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        isVeg: { type: Boolean, default: true },
      },
    ],
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const OrderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    foodId: { type: String, ref: 'Food', required: true },
    foodName: { type: String, required: true },
    foodImage: { type: String, required: true },
    illustrationType: { type: String, default: 'platter' },
    basePrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    selectedSize: {
      type: String,
      enum: ['Regular', 'Large', 'Family'],
      default: 'Regular',
    },
    sizeDelta: { type: Number, default: 0 },
    selectedAddons: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        isVeg: { type: Boolean, default: true },
      },
    ],
    unitFinalPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 50 },
    specialInstructions: { type: String, maxlength: 300 },
    savedForLater: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CartSchema = new Schema(
  {
    sessionKey: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: 'User', index: true },
    items: [OrderItemSchema],
  },
  { timestamps: true }
);

export const OrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, required: true, trim: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, uppercase: true, trim: true },
    deliveryFee: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    orderType: {
      type: String,
      enum: ['Delivery', 'Pickup', 'Dine-in'],
      required: true,
      default: 'Delivery',
    },
    deliveryAddress: { type: AddressSubSchema, required: false },
    tableNumber: { type: String },
    paymentMethod: {
      type: String,
      enum: ['Card (Test Mode)', 'UPI / Instant Pay (Test)', 'Pay at Restaurant / COD'],
      default: 'Card (Test Mode)',
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'REFUNDED'],
      default: 'PAID',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Order Placed',
        'Confirmed',
        'Preparing',
        'Ready',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
      ],
      default: 'Order Placed',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: String, required: true },
        note: { type: String },
      },
    ],
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    estimatedDeliveryMinutes: { type: Number, default: 35 },
  },
  { timestamps: true }
);

export const ReservationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    reservationCode: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: 'User', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    time: { type: String, required: true, index: true },
    guests: { type: Number, required: true, min: 1, max: 20 },
    tableArea: {
      type: String,
      enum: [
        'Main Dining Room',
        'Velvet Chef Counter',
        'Private Sommelier Vault',
        'Velora Garden Terrace',
      ],
      required: true,
    },
    specialRequest: { type: String, maxlength: 400 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED'],
      default: 'CONFIRMED',
      index: true,
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);
ReservationSchema.index({ date: 1, time: 1, tableArea: 1 });

export const ReviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    foodId: { type: String, ref: 'Food', required: true, index: true },
    foodName: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true, index: true },
    userName: { type: String, required: true, trim: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 5, maxlength: 800 },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ['PUBLISHED', 'HIDDEN'],
      default: 'PUBLISHED',
      index: true,
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String },
  },
  { timestamps: true }
);

export const CouponSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    discountValue: { type: Number, required: true, min: 1 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    expiryDate: { type: String, required: true },
    usageLimit: { type: Number, default: 100, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const OfferSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    badgeText: { type: String, default: 'Featured Offer' },
    couponCode: { type: String, required: true, uppercase: true, trim: true },
    accentColor: {
      type: String,
      enum: ['purple', 'emerald', 'pink', 'gold'],
      default: 'purple',
    },
    validUntil: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PaymentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'REFUNDED'],
      default: 'PAID',
      index: true,
    },
    transactionRef: { type: String, required: true, unique: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const StaffSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    roleTitle: { type: String, required: true, trim: true },
    department: {
      type: String,
      enum: ['Culinary', 'Sommelier & Bar', 'Hospitality', 'Operations'],
      default: 'Culinary',
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    shift: {
      type: String,
      enum: [
        'Evening Service (16:00 - 00:00)',
        'Night Owl (18:00 - 02:00)',
        'All-Day Prep (11:00 - 19:00)',
      ],
      default: 'Evening Service (16:00 - 00:00)',
    },
    status: { type: String, enum: ['ON_DUTY', 'OFF_DUTY'], default: 'ON_DUTY' },
    specialty: { type: String, default: '' },
  },
  { timestamps: true }
);

export const NotificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    targetRole: {
      type: String,
      enum: ['ADMIN', 'CUSTOMER', 'ALL'],
      required: true,
      index: true,
    },
    userId: { type: String, ref: 'User', index: true },
    type: {
      type: String,
      enum: ['ORDER', 'RESERVATION', 'REVIEW', 'OFFER', 'SYSTEM'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    link: { type: String },
  },
  { timestamps: true }
);

export const RestaurantSettingsSchema = new Schema(
  {
    name: { type: String, required: true, default: 'VELORA' },
    tagline: { type: String, default: 'Modern Dining. Crafted to Remember.' },
    logoText: { type: String, default: 'VELORA' },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    openingHours: {
      weekdays: { type: String, default: 'Mon – Thu: 17:00 – 23:30' },
      weekends: { type: String, default: 'Fri – Sun: 12:00 – 01:00' },
      lateNight: { type: String, default: 'Velora Tasting Menu: 22:00 – 01:00' },
    },
    deliveryFee: { type: Number, default: 6, min: 0 },
    freeDeliveryThreshold: { type: Number, default: 65, min: 0 },
    minimumOrder: { type: Number, default: 20, min: 0 },
    taxPercent: { type: Number, default: 9, min: 0, max: 30 },
    currency: { type: String, default: 'USD' },
    currencySymbol: { type: String, default: '$' },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com/veloradining' },
      MichelinGuide: { type: String, default: 'https://guide.michelin.com' },
      reserveLink: { type: String, default: '/reservations' },
    },
  },
  { timestamps: true }
);

export const AddressModel: mongoose.Model<any> =
  mongoose.models.Address || mongoose.model('Address', AddressSchema);
export const UserModel: mongoose.Model<any> =
  mongoose.models.User || mongoose.model('User', UserSchema);
export const CategoryModel: mongoose.Model<any> =
  mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const FoodModel: mongoose.Model<any> =
  mongoose.models.Food || mongoose.model('Food', FoodSchema);
export const OrderItemModel: mongoose.Model<any> =
  mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
export const CartModel: mongoose.Model<any> =
  mongoose.models.Cart || mongoose.model('Cart', CartSchema);
export const OrderModel: mongoose.Model<any> =
  mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const ReservationModel: mongoose.Model<any> =
  mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);
export const ReviewModel: mongoose.Model<any> =
  mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const CouponModel: mongoose.Model<any> =
  mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export const OfferModel: mongoose.Model<any> =
  mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
export const PaymentModel: mongoose.Model<any> =
  mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export const StaffModel: mongoose.Model<any> =
  mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
export const NotificationModel: mongoose.Model<any> =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const RestaurantSettingsModel: mongoose.Model<any> =
  mongoose.models.RestaurantSettings ||
  mongoose.model('RestaurantSettings', RestaurantSettingsSchema);

export const CounterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 1000 },
  },
  { timestamps: false }
);

export const CounterModel: mongoose.Model<any> =
  mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

