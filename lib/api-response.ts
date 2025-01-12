import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
};

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
    },
    { status }
  );
}

export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
  return errorResponse(message, 400, 'VALIDATION_ERROR');
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const; 