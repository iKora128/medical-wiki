import { NextResponse } from 'next/server'
import { Logger } from './logger'
import { AuthError } from './auth'
import { ZodError } from 'zod'
import { errorResponse } from './api-response'

type ApiHandler = (req: Request, context: any) => Promise<Response>

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: Request, context: any) => {
    const startTime = Date.now()

    try {
      Logger.logRequest(req)
      const response = await handler(req, context)
      const responseTime = Date.now() - startTime
      
      Logger.logResponse(req, response.status, responseTime)
      return response
    } catch (error) {
      const responseTime = Date.now() - startTime

      if (error instanceof AuthError) {
        Logger.warn('認証エラー', { error })
        return errorResponse(error.message, error.statusCode, error.code)
      }

      if (error instanceof ZodError) {
        Logger.warn('バリデーションエラー', { error })
        const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        return errorResponse(message, 400, 'VALIDATION_ERROR')
      }

      Logger.error('予期せぬエラー', error)
      Logger.logResponse(req, 500, responseTime, error)

      return errorResponse(
        '予期せぬエラーが発生しました',
        500,
        'INTERNAL_SERVER_ERROR'
      )
    }
  }
} 