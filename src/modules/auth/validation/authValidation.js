import { z } from 'zod';
import { AUTH_VALIDATION_MESSAGES } from '../constants/authConstants';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, AUTH_VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .email(AUTH_VALIDATION_MESSAGES.EMAIL_INVALID),
  password: z
    .string()
    .min(1, AUTH_VALIDATION_MESSAGES.PASSWORD_REQUIRED),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, AUTH_VALIDATION_MESSAGES.FULL_NAME_MIN)
      .max(100, 'Họ và tên tối đa 100 ký tự'),
    phone: z
      .string()
      .trim()
      .min(1, AUTH_VALIDATION_MESSAGES.PHONE_REQUIRED)
      // Vietnamese mobile: 0 or +84 / 84, then a 3|5|7|8|9 carrier prefix and 8 digits
      .regex(/^(?:\+?84|0)[35789][0-9]{8}$/, AUTH_VALIDATION_MESSAGES.PHONE_INVALID),
    email: z
      .string()
      .trim()
      .min(1, AUTH_VALIDATION_MESSAGES.EMAIL_REQUIRED)
      .email(AUTH_VALIDATION_MESSAGES.EMAIL_INVALID),
    password: z
      .string()
      .min(6, AUTH_VALIDATION_MESSAGES.PASSWORD_MIN),
    confirmPassword: z
      .string()
      .min(1, AUTH_VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, AUTH_VALIDATION_MESSAGES.EMAIL_REQUIRED)
    .email(AUTH_VALIDATION_MESSAGES.EMAIL_INVALID),
});

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, AUTH_VALIDATION_MESSAGES.EMAIL_REQUIRED)
      .email(AUTH_VALIDATION_MESSAGES.EMAIL_INVALID),
    token: z
      .string()
      .trim()
      .regex(/^\d{6}$/, AUTH_VALIDATION_MESSAGES.RESET_CODE_INVALID),
    newPassword: z
      .string()
      .min(6, AUTH_VALIDATION_MESSAGES.PASSWORD_MIN),
    confirmNewPassword: z
      .string()
      .min(1, AUTH_VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: AUTH_VALIDATION_MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmNewPassword'],
  });
