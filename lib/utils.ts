import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const withErrorHandling = <T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>
) => {
  return async (...args: A): Promise<T> => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return errorMessage as unknown as T;
    }
  };
};

export const generateUUID = () => crypto.randomUUID();

export const parseStringify = (value: unknown) => {
  return JSON.parse(JSON.stringify(value));
};

// Admin check utility - Client-side version
export const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_1 || "johncarlomisa399@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_2 || "jcmisa.dev@gmail.com",
].filter(Boolean) as string[];

export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
};

// Server-side version (for API routes)
export const getAdminEmails = (): string[] => {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    console.warn("ADMIN_EMAILS not found in environment variables");
    return [];
  }
  return adminEmails.split(",").map((email) => email.trim());
};
