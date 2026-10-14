import { Router } from 'express';
import {
  authenticate,
  optionalAuthenticate,
  authorizeRoles,
} from '../middleware/authMiddleware.ts';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  toggleFavorite,
  saveAddress,
  deleteAddress,
} from '../controllers/authController.ts';
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getCategories,
  createCategory,
  deleteCategory,
} from '../controllers/foodController.ts';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderAndCartController.ts';
import {
  getAvailableSlots,
  createReservation,
  getReservations,
  updateReservationStatus,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reservationAndReviewController.ts';
import {
  getCoupons,
  applyCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getOffers,
  createOffer,
  deleteOffer,
  getAdminAnalytics,
  getCustomers,
  toggleCustomerStatus,
  getStaff,
  createStaff,
  toggleStaffStatus,
  deleteStaff,
  getSettings,
  updateSettings,
  getPayments,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/adminAndCouponController.ts';

export const apiRouter = Router();

// Auth & User Profile
apiRouter.post('/auth/register', registerUser);
apiRouter.post('/auth/login', loginUser);
apiRouter.post('/auth/forgot-password', forgotPassword);
apiRouter.post('/auth/reset-password', resetPassword);
apiRouter.get('/auth/profile', authenticate, getProfile);
apiRouter.put('/auth/profile', authenticate, updateProfile);
apiRouter.post('/auth/favorites', authenticate, toggleFavorite);
apiRouter.post('/auth/addresses', authenticate, saveAddress);
apiRouter.delete('/auth/addresses/:id', authenticate, deleteAddress);

// Foods & Categories
apiRouter.get('/foods', getFoods);
apiRouter.get('/foods/:id', getFoodById);
apiRouter.post('/foods', authenticate, authorizeRoles('ADMIN', 'STAFF'), createFood);
apiRouter.put('/foods/:id', authenticate, authorizeRoles('ADMIN', 'STAFF'), updateFood);
apiRouter.delete('/foods/:id', authenticate, authorizeRoles('ADMIN', 'STAFF'), deleteFood);

apiRouter.get('/categories', getCategories);
apiRouter.post('/categories', authenticate, authorizeRoles('ADMIN', 'STAFF'), createCategory);
apiRouter.delete(
  '/categories/:id',
  authenticate,
  authorizeRoles('ADMIN', 'STAFF'),
  deleteCategory
);

// Cart
apiRouter.get('/cart', optionalAuthenticate, getCart);
apiRouter.post('/cart', optionalAuthenticate, addToCart);
apiRouter.put('/cart/:id', optionalAuthenticate, updateCartItem);
apiRouter.delete('/cart/:id', optionalAuthenticate, removeCartItem);
apiRouter.delete('/cart', optionalAuthenticate, clearCart);

// Orders
apiRouter.post('/orders', optionalAuthenticate, createOrder);
apiRouter.get('/orders', optionalAuthenticate, getOrders);
apiRouter.get('/orders/:id', optionalAuthenticate, getOrderById);
apiRouter.patch(
  '/orders/:id/status',
  authenticate,
  authorizeRoles('ADMIN', 'STAFF'),
  updateOrderStatus
);

// Reservations
apiRouter.get('/reservations/slots', getAvailableSlots);
apiRouter.post('/reservations', optionalAuthenticate, createReservation);
apiRouter.get('/reservations', optionalAuthenticate, getReservations);
apiRouter.patch('/reservations/:id/status', authenticate, updateReservationStatus);

// Reviews
apiRouter.get('/reviews', getReviews);
apiRouter.post('/reviews', optionalAuthenticate, createReview);
apiRouter.put('/reviews/:id', authenticate, updateReview);
apiRouter.delete(
  '/reviews/:id',
  authenticate,
  authorizeRoles('ADMIN', 'STAFF'),
  deleteReview
);

// Coupons & Offers (Management restricted strictly to ADMIN)
apiRouter.get('/coupons', getCoupons);
apiRouter.post('/coupons/apply', applyCoupon);
apiRouter.post('/coupons', authenticate, authorizeRoles('ADMIN'), createCoupon);
apiRouter.put('/coupons/:id', authenticate, authorizeRoles('ADMIN'), updateCoupon);
apiRouter.delete('/coupons/:id', authenticate, authorizeRoles('ADMIN'), deleteCoupon);

apiRouter.get('/offers', getOffers);
apiRouter.post('/offers', authenticate, authorizeRoles('ADMIN'), createOffer);
apiRouter.delete('/offers/:id', authenticate, authorizeRoles('ADMIN'), deleteOffer);

// Admin Management (Protected strictly for ADMIN)
apiRouter.get('/analytics', authenticate, authorizeRoles('ADMIN'), getAdminAnalytics);
apiRouter.get(
  '/admin/analytics',
  authenticate,
  authorizeRoles('ADMIN'),
  getAdminAnalytics
);
apiRouter.get('/customers', authenticate, authorizeRoles('ADMIN'), getCustomers);
apiRouter.patch(
  '/customers/:id/status',
  authenticate,
  authorizeRoles('ADMIN'),
  toggleCustomerStatus
);

apiRouter.get('/staff', authenticate, authorizeRoles('ADMIN'), getStaff);
apiRouter.post('/staff', authenticate, authorizeRoles('ADMIN'), createStaff);
apiRouter.patch(
  '/staff/:id/status',
  authenticate,
  authorizeRoles('ADMIN'),
  toggleStaffStatus
);
apiRouter.delete('/staff/:id', authenticate, authorizeRoles('ADMIN'), deleteStaff);

apiRouter.get('/settings', getSettings);
apiRouter.put('/settings', authenticate, authorizeRoles('ADMIN'), updateSettings);

apiRouter.get('/payments', authenticate, authorizeRoles('ADMIN'), getPayments);

// Notifications
apiRouter.get('/notifications', optionalAuthenticate, getNotifications);
apiRouter.patch('/notifications/:id/read', optionalAuthenticate, markNotificationRead);
apiRouter.post('/notifications/read-all', optionalAuthenticate, markAllNotificationsRead);
