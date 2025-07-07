/**
 * Secure error handling utilities that don't expose sensitive information
 */

type ErrorContext = 'auth' | 'database' | 'network' | 'validation' | 'general';

interface SecureError {
  message: string;
  code?: string;
  context: ErrorContext;
}

/**
 * Maps internal errors to user-friendly messages without exposing system details
 */
export const createSecureError = (error: any, context: ErrorContext): SecureError => {
  // Log the actual error for debugging (server-side only in production)
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error);
  }

  const baseMessages = {
    auth: 'Authentication failed. Please try again.',
    database: 'Unable to process your request. Please try again later.',
    network: 'Network error. Please check your connection and try again.',
    validation: 'The information you entered is not valid. Please check and try again.',
    general: 'Something went wrong. Please try again.'
  };

  // Handle specific known error patterns without exposing internal details
  let userMessage = baseMessages[context];
  let errorCode: string | undefined;

  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials')) {
      userMessage = 'Invalid email or password. Please check your credentials.';
      errorCode = 'INVALID_CREDENTIALS';
    } else if (message.includes('email not confirmed')) {
      userMessage = 'Please check your email and confirm your account before signing in.';
      errorCode = 'EMAIL_NOT_CONFIRMED';
    } else if (message.includes('user already registered')) {
      userMessage = 'An account with this email already exists. Please sign in instead.';
      errorCode = 'USER_EXISTS';
    } else if (message.includes('too many requests')) {
      userMessage = 'Too many attempts. Please wait a few minutes before trying again.';
      errorCode = 'RATE_LIMITED';
    } else if (message.includes('network')) {
      userMessage = baseMessages.network;
      errorCode = 'NETWORK_ERROR';
    }
  }

  return {
    message: userMessage,
    code: errorCode,
    context
  };
};

/**
 * Safely handles and displays errors to users
 */
export const handleSecureError = (
  error: any, 
  context: ErrorContext,
  onError?: (secureError: SecureError) => void
): SecureError => {
  const secureError = createSecureError(error, context);
  
  if (onError) {
    onError(secureError);
  }
  
  return secureError;
};