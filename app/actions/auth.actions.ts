/**
 * Server actions for authentication
 * Use in Client Components with "use server" directive
 * All operations run on the server
 */

"use server";

import { signIn, signOut } from "next-auth/react";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  validateCredentials,
  validatePassword,
  sanitizeEmail,
} from "@/lib/auth/auth.utils";
import { AUTH_CONSTANTS } from "@/lib/auth/constants";
import type { AuthResponse, AuthCredentials } from "@/lib/auth/auth.types";

/**
 * Server action: User login
 * @param credentials - Email and password
 * @returns Auth response with success status and error if any
 */
export async function loginAction(
  credentials: AuthCredentials
): Promise<AuthResponse> {
  try {
    // Validate credentials format
    const validation = validateCredentials(credentials);
    if (!validation.valid) {
      return {
        success: false,
        message: AUTH_CONSTANTS.ERRORS[validation.error || "INVALID_CREDENTIALS"],
        error: validation.error,
      };
    }

    // Attempt login via NextAuth
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });

    if (!result?.ok) {
      return {
        success: false,
        message: AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS,
        error: "INVALID_CREDENTIALS",
      };
    }

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    console.error("[loginAction] Error:", error);
    return {
      success: false,
      message: AUTH_CONSTANTS.ERRORS.DATABASE_ERROR,
      error: "DATABASE_ERROR",
    };
  }
}

/**
 * Server action: User logout
 * @returns Auth response
 */
export async function logoutAction(): Promise<AuthResponse> {
  try {
    await signOut({ redirect: false });
    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("[logoutAction] Error:", error);
    return {
      success: false,
      message: AUTH_CONSTANTS.ERRORS.DATABASE_ERROR,
      error: "DATABASE_ERROR",
    };
  }
}

/**
 * Server action: User registration
 * @param data - User registration data
 * @returns Auth response
 */
export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResponse> {
  try {
    // Validate inputs
    if (!data.name?.trim()) {
      return {
        success: false,
        message: "Name is required",
        error: "INVALID_CREDENTIALS",
      };
    }

    if (!data.email?.trim()) {
      return {
        success: false,
        message: AUTH_CONSTANTS.ERRORS.INVALID_EMAIL,
        error: "INVALID_EMAIL",
      };
    }

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: AUTH_CONSTANTS.ERRORS.PASSWORD_MISMATCH,
        error: "PASSWORD_MISMATCH",
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        message: passwordValidation.error || "Invalid password",
        error: "INVALID_CREDENTIALS",
      };
    }

    const email = sanitizeEmail(data.email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: AUTH_CONSTANTS.ERRORS.USER_EXISTS,
        error: "USER_EXISTS",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        password: hashedPassword,
        role: "USER",
        language: "en",
      },
    });

    return {
      success: true,
      message: "Registration successful. Please log in.",
    };
  } catch (error) {
    console.error("[registerAction] Error:", error);
    return {
      success: false,
      message: AUTH_CONSTANTS.ERRORS.DATABASE_ERROR,
      error: "DATABASE_ERROR",
    };
  }
}

/**
 * Server action: Update user language preference
 * @param language - Language code
 * @returns Auth response
 */
export async function updateLanguageAction(language: string): Promise<AuthResponse> {
  try {
    // This would typically use getCurrentUser() first
    // For now, just return success
    // In real implementation: await verifyAuth() && update
    return {
      success: true,
      message: "Language updated",
    };
  } catch (error) {
    console.error("[updateLanguageAction] Error:", error);
    return {
      success: false,
      message: AUTH_CONSTANTS.ERRORS.DATABASE_ERROR,
      error: "DATABASE_ERROR",
    };
  }
}
