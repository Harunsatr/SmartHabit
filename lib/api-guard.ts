import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';

type GuardResponse<T = any> = {
  success: boolean;
  status: number;
  data?: T;
  error?: string;
};

export async function guardAuth(
  request?: NextRequest
): Promise<GuardResponse<{ userId: string; email: string; role: UserRole }>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return {
        success: false,
        status: 401,
        error: 'Unauthorized: Not authenticated',
      };
    }

    return {
      success: true,
      status: 200,
      data: {
        userId: session.user.id,
        email: session.user.email || '',
        role: session.user.role,
      },
    };
  } catch (error) {
    console.error('[guardAuth] Error:', error);
    return {
      success: false,
      status: 500,
      error: 'Internal server error',
    };
  }
}

export async function guardAdmin(
  request?: NextRequest
): Promise<GuardResponse<{ userId: string; email: string }>> {
  const authGuard = await guardAuth(request);

  if (!authGuard.success) {
    return authGuard;
  }

  if (authGuard.data?.role !== 'ADMIN') {
    return {
      success: false,
      status: 403,
      error: 'Forbidden: Admin access required',
    };
  }

  return {
    success: true,
    status: 200,
    data: {
      userId: authGuard.data.userId,
      email: authGuard.data.email,
    },
  };
}

export async function guardUserAccess(
  resourceUserId: string,
  request?: NextRequest
): Promise<GuardResponse> {
  const authGuard = await guardAuth(request);

  if (!authGuard.success) {
    return authGuard;
  }

  if (
    authGuard.data?.userId === resourceUserId ||
    authGuard.data?.role === 'ADMIN'
  ) {
    return { success: true, status: 200 };
  }

  return {
    success: false,
    status: 403,
    error: 'Forbidden: Cannot access this resource',
  };
}

export function errorResponse(
  error: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error }, { status });
}

export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
