import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
})

export default {
  info: (data: any, msg?: string) => {
    try {
      if (typeof data === 'string') {
        console.log('[INFO]', data, msg || '')
      } else {
        console.log('[INFO]', msg || '', data)
      }
    } catch (error) {
      console.log('[Logger Error]', error)
    }
  },
  error: (data: any, msg?: string) => {
    try {
      if (typeof data === 'string') {
        console.error('[ERROR]', data, msg || '')
      } else {
        console.error('[ERROR]', msg || '', data)
      }
    } catch (error) {
      console.error('[Logger Error]', error)
    }
  },
  warn: (data: any, msg?: string) => {
    try {
      if (typeof data === 'string') {
        console.warn('[WARN]', data, msg || '')
      } else {
        console.warn('[WARN]', msg || '', data)
      }
    } catch (error) {
      console.warn('[Logger Error]', error)
    }
  },
  debug: (data: any, msg?: string) => {
    try {
      if (typeof data === 'string') {
        console.debug('[DEBUG]', data, msg || '')
      } else {
        console.debug('[DEBUG]', msg || '', data)
      }
    } catch (error) {
      console.debug('[Logger Error]', error)
    }
  }
} 