import type { Request, Response } from 'express';
import { UserModel } from '../models/mongooseSchemas.ts';
import {
  hashPassword,
  verifyPassword,
  signToken,
  sanitizeString,
  generatePasswordResetToken,
  hashResetToken,
  generateEntityId,
} from '../utils/security.ts';
import {
  dispatchPasswordResetEmail,
  isEmailServiceConfigured,
} from '../services/emailAndPaymentService.ts';
import { validateRegistrationInput, isValidEmail } from '../validators/index.ts';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import type { User, Address } from '../models/types.ts';

function stripSensitiveFields(user: any) {
  const {
    passwordHash: _pw,
    resetPasswordTokenHash: _rth,
    resetPasswordExpiresAt: _rte,
    _id: _id,
    __v: __v,
    ...safeUser
  } = user;
  return safeUser;
}

export async function registerUser(req: Request, res: Response) {
  const validation = validateRegistrationInput(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      error: validation.error,
    });
  }

  const email = sanitizeString(req.body.email, 120).toLowerCase();
  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
      error: 'An account with this email already exists.',
    });
  }

  const newUser: User = {
    id: generateEntityId('user'),
    name: sanitizeString(req.body.name, 100),
    email,
    phone: sanitizeString(req.body.phone, 30),
    passwordHash: hashPassword(String(req.body.password)),
    role: 'CUSTOMER',
    status: 'ACTIVE',
    favorites: ['food-1', 'food-2'],
    addresses: [],
    createdAt: new Date().toISOString(),
  };

  await UserModel.create(newUser);

  const token = signToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  return res.status(201).json({
    success: true,
    token,
    user: stripSensitiveFields(newUser),
  });
}

export async function loginUser(req: Request, res: Response) {
  const email = sanitizeString(req.body?.email, 120).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
      error: 'Email and password are required.',
    });
  }

  const user = (await UserModel.findOne({ email }).lean()) as unknown as User | null;
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      error: 'Invalid email or password.',
    });
  }

  if (user.status === 'DISABLED') {
    return res.status(403).json({
      success: false,
      message: 'This account has been disabled by administration.',
      error: 'This account has been disabled by administration.',
    });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return res.json({
    success: true,
    token,
    user: stripSensitiveFields(user),
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const email = sanitizeString(req.body?.email, 120).toLowerCase();
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid registered email address.',
      error: 'Please provide a valid registered email address.',
    });
  }

  const user = (await UserModel.findOne({ email }).lean()) as unknown as User | null;
  if (!user) {
    // Return generic response to prevent account enumeration
    return res.json({
      success: true,
      message: `If an account exists for ${email}, password reset instructions have been issued (simulated mode).`,
      emailDeliveryConfigured: isEmailServiceConfigured(),
      isSimulated: true,
    });
  }

  const { rawToken, tokenHash, expiresAt } = generatePasswordResetToken();
  await UserModel.updateOne(
    { email },
    {
      $set: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      },
    }
  );

  const { previewToken } = await dispatchPasswordResetEmail({
    toEmail: user.email,
    userName: user.name,
    rawToken,
    expiresAt,
  });

  const isProd = process.env.NODE_ENV === 'production';

  return res.json({
    success: true,
    message: 'Password reset token generated (valid for 15 minutes). Simulated email delivery active.',
    emailDeliveryConfigured: false,
    isSimulated: true,
    ...(!isProd ? { demoResetToken: previewToken } : {}),
  });
}

export async function resetPassword(req: Request, res: Response) {
  const email = sanitizeString(req.body?.email, 120).toLowerCase();
  const resetToken = sanitizeString(req.body?.resetToken, 80);
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email address is required.',
      error: 'Valid email address is required.',
    });
  }
  if (!resetToken) {
    return res.status(400).json({
      success: false,
      message: 'Password reset verification token is required.',
      error: 'Password reset verification token is required.',
    });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long.',
      error: 'New password must be at least 6 characters long.',
    });
  }

  const user = (await UserModel.findOne({ email }).lean()) as unknown as User | null;
  if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired password reset request.',
      error: 'Invalid or expired password reset request.',
    });
  }

  if (new Date(user.resetPasswordExpiresAt).getTime() < Date.now()) {
    await UserModel.updateOne(
      { email },
      {
        $unset: {
          resetPasswordTokenHash: 1,
          resetPasswordExpiresAt: 1,
        },
      }
    );
    return res.status(400).json({
      success: false,
      message: 'Password reset token has expired. Please request a new one.',
      error: 'Password reset token has expired. Please request a new one.',
    });
  }

  const incomingHash = hashResetToken(resetToken);
  if (incomingHash !== user.resetPasswordTokenHash) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password reset verification token.',
      error: 'Invalid password reset verification token.',
    });
  }

  await UserModel.updateOne(
    { email },
    {
      $set: { passwordHash: hashPassword(newPassword) },
      $unset: { resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 },
    }
  );

  return res.json({
    success: true,
    message: 'Password updated and reset token invalidated. You may now sign in.',
  });
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const user = await UserModel.findOne({ id: req.user?.userId }).lean();
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found.',
      error: 'User profile not found.',
    });
  }
  return res.json({ success: true, user: stripSensitiveFields(user) });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const updateData: Record<string, string> = {};
  if (req.body.name) {
    const cleanName = sanitizeString(req.body.name, 100);
    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters.',
        error: 'Name must be at2 characters.',
      });
    }
    updateData.name = cleanName;
  }
  if (req.body.phone) updateData.phone = sanitizeString(req.body.phone, 30);
  if (req.body.avatar !== undefined) updateData.avatar = sanitizeString(req.body.avatar, 400);

  const user = await UserModel.findOneAndUpdate(
    { id: req.user?.userId },
    { $set: updateData },
    { new: true }
  ).lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found.',
      error: 'User profile not found.',
    });
  }
  return res.json({ success: true, user: stripSensitiveFields(user) });
}

export async function toggleFavorite(req: AuthenticatedRequest, res: Response) {
  const user = (await UserModel.findOne({ id: req.user?.userId }).lean()) as unknown as User | null;
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found.',
      error: 'User profile not found.',
    });
  }
  const foodId = sanitizeString(req.body?.foodId, 80);
  if (!foodId) {
    return res.status(400).json({
      success: false,
      message: 'foodId is required.',
      error: 'foodId is required.',
    });
  }

  const isFav = user.favorites.includes(foodId);
  const updatedUser = (await UserModel.findOneAndUpdate(
    { id: req.user?.userId },
    isFav ? { $pull: { favorites: foodId } } : { $addToSet: { favorites: foodId } },
    { new: true }
  ).lean()) as unknown as User;

  return res.json({
    success: true,
    favorites: updatedUser.favorites,
    added: !isFav,
  });
}

export async function saveAddress(req: AuthenticatedRequest, res: Response) {
  const user = (await UserModel.findOne({ id: req.user?.userId }).lean()) as unknown as User | null;
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found.',
      error: 'User profile not found.',
    });
  }

  const newAddr: Address = {
    id: generateEntityId('addr'),
    label: sanitizeString(req.body?.label || 'Saved Address', 50),
    houseFlat: sanitizeString(req.body?.houseFlat, 100),
    street: sanitizeString(req.body?.street, 120),
    area: sanitizeString(req.body?.area || 'Downtown', 100),
    city: sanitizeString(req.body?.city || 'San Francisco', 80),
    state: sanitizeString(req.body?.state || 'CA', 50),
    pincode: sanitizeString(req.body?.pincode, 20),
    isDefault: Boolean(req.body?.isDefault) || user.addresses.length === 0,
  };

  if (!newAddr.houseFlat || !newAddr.street || !newAddr.pincode) {
    return res.status(400).json({
      success: false,
      message: 'House/Flat, Street, and Pincode are required.',
      error: 'House/Flat, Street, and Pincode are required.',
    });
  }

  if (newAddr.isDefault) {
    await UserModel.updateOne(
      { id: req.user?.userId },
      { $set: { 'addresses.$[].isDefault': false } }
    );
  }

  const updatedUser = (await UserModel.findOneAndUpdate(
    { id: req.user?.userId },
    { $push: { addresses: newAddr } },
    { new: true }
  ).lean()) as unknown as User;

  return res.status(201).json({ success: true, addresses: updatedUser.addresses });
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response) {
  const updatedUser = (await UserModel.findOneAndUpdate(
    { id: req.user?.userId },
    { $pull: { addresses: { id: req.params.id } } },
    { new: true }
  ).lean()) as unknown as User | null;

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found.',
      error: 'User profile not found.',
    });
  }
  return res.json({ success: true, addresses: updatedUser.addresses });
}
