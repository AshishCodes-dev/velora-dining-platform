export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface Address {
  id: string;
  label: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  status: 'ACTIVE' | 'DISABLED';
  favorites: string[];
  addresses: Address[];
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  dishCount?: number;
}

export interface CustomizationSize {
  name: 'Regular' | 'Large' | 'Family';
  priceDelta: number;
  serves: string;
}

export interface CustomizationAddon {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
}

export interface Food {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  discountPercent: number;
  image: string;
  illustrationType:
    | 'platter'
    | 'pizza'
    | 'biryani'
    | 'burger'
    | 'tart'
    | 'pasta'
    | 'dimsum'
    | 'elixir'
    | 'scallop';
  isVeg: boolean;
  spicyLevel: 0 | 1 | 2 | 3;
  rating: number;
  reviewCount: number;
  calories: number;
  prepTimeMinutes: number;
  ingredients: string[];
  dietaryTags: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isNewDish: boolean;
  isAvailable: boolean;
  sizes: CustomizationSize[];
  addons: CustomizationAddon[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  foodId: string;
  foodName: string;
  foodImage: string;
  illustrationType: Food['illustrationType'];
  basePrice: number;
  discountPercent: number;
  selectedSize: 'Regular' | 'Large' | 'Family';
  sizeDelta: number;
  selectedAddons: CustomizationAddon[];
  unitFinalPrice: number;
  quantity: number;
  specialInstructions?: string;
  savedForLater?: boolean;
}

export type OrderType = 'Delivery' | 'Pickup' | 'Dine-in';

export type OrderStatus =
  | 'Order Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderStatusStep {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  deliveryFee: number;
  taxAmount: number;
  grandTotal: number;
  orderType: OrderType;
  deliveryAddress?: Address;
  tableNumber?: string;
  paymentMethod: 'Card (Test Mode)' | 'UPI / Instant Pay (Test)' | 'Pay at Restaurant / COD';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: OrderStatus;
  statusHistory: OrderStatusStep[];
  createdAt: string;
  estimatedDeliveryMinutes: number;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED' | 'COMPLETED';

export interface Reservation {
  id: string;
  reservationCode: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  tableArea: 'Main Dining Room' | 'Velvet Chef Counter' | 'Private Sommelier Vault' | 'Velora Garden Terrace';
  specialRequest?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  foodId: string;
  foodName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  status: 'PUBLISHED' | 'HIDDEN';
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText: string;
  couponCode: string;
  accentColor: 'purple' | 'emerald' | 'pink' | 'gold';
  validUntil: string;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  roleTitle: string;
  department: 'Culinary' | 'Sommelier & Bar' | 'Hospitality' | 'Operations';
  email: string;
  phone: string;
  shift: 'Evening Service (16:00 - 00:00)' | 'Night Owl (18:00 - 02:00)' | 'All-Day Prep (11:00 - 19:00)';
  status: 'ON_DUTY' | 'OFF_DUTY';
  specialty: string;
}

export interface NotificationItem {
  id: string;
  targetRole: 'ADMIN' | 'CUSTOMER' | 'ALL';
  userId?: string;
  type: 'ORDER' | 'RESERVATION' | 'REVIEW' | 'OFFER' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: Order['paymentMethod'];
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  transactionRef: string;
  createdAt: string;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  logoText: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    weekdays: string;
    weekends: string;
    lateNight: string;
  };
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minimumOrder: number;
  taxPercent: number;
  currency: string;
  currencySymbol: string;
  socialLinks: {
    instagram: string;
    MichelinGuide: string;
    reserveLink: string;
  };
}
