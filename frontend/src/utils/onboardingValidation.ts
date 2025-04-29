import { z } from 'zod';

export const step1Schema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
  // termsAgreed: z.boolean().refine((val) => val === true, {
  //   message: 'You must agree to the Terms and Conditions',
  // }),
});

export const step2Schema = z.object({
  companyLogo: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/png', 'image/jpeg'].includes(file.type),
      'Only .png and .jpg formats are supported'
    )
    .refine((file) => file instanceof File, 'Please upload a company logo'),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters'),

  workspaceUrl: z
    .string()
    .min(1, 'Workspace URL is required')
    .max(50, 'Workspace URL must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Only lowercase letters, numbers, and hyphens are allowed'
    ),
});
