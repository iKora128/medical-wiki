import Logger from './logger'
import { errorResponse } from './api-response'

export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    const [req] = args
    try {
      Logger.info({
        method: req.method,
        path: new URL(req.url).pathname,
      }, 'API Request')

      const result = await handler(...args)
      return result
    } catch (error: any) {
      Logger.error('APIエラー', error)

      return errorResponse(
        error.message || '予期せぬエラーが発生しました',
        error.statusCode || 500
      )
    }
  }
} 