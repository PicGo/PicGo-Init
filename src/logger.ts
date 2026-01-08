import chalk from 'chalk'
import type { Logger } from './types.js'

const formatError = (error: string | Error): string => {
  if (typeof error === 'string') {
    return error
  }
  if (error.message) {
    return error.stack ?? error.message
  }
  return String(error)
}

const createLogger = (): Logger => ({
  info: (message: string) => {
    console.log(chalk.cyan(message))
  },
  success: (message: string) => {
    console.log(chalk.green(message))
  },
  warn: (message: string) => {
    console.log(chalk.yellow(message))
  },
  error: (message: string | Error) => {
    console.error(chalk.red(formatError(message)))
  }
})

export { createLogger }
