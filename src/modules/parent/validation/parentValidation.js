import { z } from 'zod';

export const parentInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ và tên tối thiểu 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự'),
  bio: z
    .string()
    .trim()
    .max(500, 'Giới thiệu bản thân không được vượt quá 500 ký tự')
    .optional(),
  city: z.string().trim().min(1, 'Vui lòng chọn hoặc nhập Tỉnh / Thành phố'),
  area: z.string().trim().min(1, 'Vui lòng chọn hoặc nhập Phường / Xã / Quận'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
    confirmNewPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
    path: ['newPassword'],
  });
