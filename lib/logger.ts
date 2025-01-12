import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info')

export const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
})

export class Logger {
  static info(message: string, data?: object) {
    logger.info(data || {}, message)
  }

  static error(message: string, error?: unknown) {
    if (error instanceof Error) {
      logger.error(
        {
          err: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message
      )
    } else {
      logger.error({ err: error }, message)
    }
  }

  static warn(message: string, data?: object) {
    logger.warn(data || {}, message)
  }

  static debug(message: string, data?: object) {
    logger.debug(data || {}, message)
  }

  // API リクエストのログ
  static logRequest(req: Request, userId?: string) {
    const url = new URL(req.url)
    logger.info(
      {
        method: req.method,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams),
        userId,
      },
      'API Request'
    )
  }

  // API レスポンスのログ
  static logResponse(
    req: Request,
    status: number,
    responseTime: number,
    error?: unknown
  ) {
    const url = new URL(req.url)
    const logData = {
      method: req.method,
      path: url.pathname,
      status,
      responseTime: `${responseTime}ms`,
    }

    if (error) {
      logger.error({ ...logData, error }, 'API Error Response')
    } else {
      logger.info(logData, 'API Success Response')
    }
  }
} 