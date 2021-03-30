import { UserPreference } from '../interfaces'
import { useDocument, UseDocumentOptions } from './useDocument'

export const useUserPreferences = (options?: UseDocumentOptions) =>
  useDocument<UserPreference>('user_preference', options)
