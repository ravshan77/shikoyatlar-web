export const API_BASE_URL = 'https://garant-hr.uz/api';

export const COMPLAINT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const COMPLAINT_STATUS_LABELS = {
  [COMPLAINT_STATUS.IN_PROGRESS]: 'Jarayonda',
  [COMPLAINT_STATUS.COMPLETED]: 'Yakunlangan',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
} as const;

export const PHONE_FORMAT = {
  PREFIX: '+998 ',
  PATTERN: /^\+998 \d{2} \d{3} \d{2} \d{2}$/,
  PLACEHOLDER: '+998 XX XXX XX XX',
} as const;

export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
} as const;

export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MIN_COMPLAINT_LENGTH: 10,
  MAX_COMPLAINT_LENGTH: 1000,
} as const;