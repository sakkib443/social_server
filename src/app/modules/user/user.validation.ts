import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z
      .string({
        message: 'First name is required',
      })
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters')
      .trim(),
    lastName: z
      .string({
        message: 'Last name is required',
      })
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters')
      .trim(),
    email: z
      .string({
        message: 'Email is required',
      })
      .email('Please enter a valid email')
      .toLowerCase()
      .trim(),
    password: z
      .string({
        message: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string({
      message: 'Confirm password is required',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        message: 'Email is required',
      })
      .email('Please enter a valid email')
      .toLowerCase()
      .trim(),
    password: z
      .string({
        message: 'Password is required',
      })
      .min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
