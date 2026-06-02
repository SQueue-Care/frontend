import { isAxiosError } from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: { message?: string } }
      | undefined
    if (data?.error?.message) return data.error.message
    if (data?.message) return data.message
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
