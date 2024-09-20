import { type ErrorRequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'
import ClientError from '@/errors/ClientError'


const { NODE_ENV } = process.env
const isTest = NODE_ENV === 'test'

/**
 * Reports error in a simple structured JSON format.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const jsonErrors: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = getErrorStatusCode(error)

  // display error in the console
  if (!isTest) {
    // tests tend to produce errors on purpose and
    // we don't want to pollute the console expected behavior
    // eslint-disable-next-line no-console
    console.error(error)
  }
  const errorResponse = formatErrorResponse(error)
  
  res.status(statusCode).json(errorResponse)
}

function getErrorStatusCode(error: Error) {
  if (error instanceof ClientError) {
    return error.status;
  }

  if ('status' in error && typeof error.status === 'number') {
    return error.status
  }

  if (error instanceof ZodError) return StatusCodes.BAD_REQUEST

  return StatusCodes.INTERNAL_SERVER_ERROR
}

function formatErrorResponse(error: Error) {
  if (error instanceof ZodError) {
    // Extract and simplify the issues from the Zod error
    const issues = error.issues.map(issue => ({
      message: issue.message,
      path: issue.path.join('.') 
    }));

    return {
      error: {
        message: 'Validation error',
        issues
      }
    };
  }

  return {
    error: {
      message: error.message ?? 'Internal server error',
    },
  };
}

export default jsonErrors
