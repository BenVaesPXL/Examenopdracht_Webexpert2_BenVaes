// Validation utilities for form fields and data validation

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROOM_ID_REGEX = /^[A-Z]\d{3}$/;

const SCHOOL_EMAIL_REGEX = /^[^\s@]+@(student\.)?pxl\.be$/i;

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validates room ID format (A101, B201, etc.)
 */
export const validateRoomId = (roomId: string): ValidationResult => {
  if (!roomId || roomId.trim() === '') {
    return { isValid: false, error: 'Room selection is required' };
  }
  
  if (!ROOM_ID_REGEX.test(roomId.trim())) {
    return { isValid: false, error: 'Invalid room ID format' };
  }
  
  return { isValid: true };
};

/**
 * Validates required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

/**
 * Validates text length
 */
export const validateTextLength = (
  text: string, 
  minLength: number, 
  maxLength: number,
  fieldName?: string
): ValidationResult => {
  const trimmedText = text.trim();
  
  if (trimmedText.length < minLength) {
    return { 
      isValid: false, 
      error: `${fieldName || 'Field'} must be at least ${minLength} characters long` 
    };
  }
  
  if (trimmedText.length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName || 'Field'} must not exceed ${maxLength} characters` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates description field (10-500 characters)
 */
export const validateDescription = (description: string): ValidationResult => {
  return validateTextLength(description, 10, 500, 'Description');
};

/**
 * Validates school email format (optional field)
 */
export const validateSchoolEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: true }; // School email is optional
  }
  
  if (!SCHOOL_EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid PXL school email address' };
  }
  
  return { isValid: true };
};

/**
 * Validates problem type
 */
export const validateProblemType = (problemType: string): ValidationResult => {
  const validTypes = ['Technisch', 'Infrastructuur', 'Netwerk', 'Overig'];
  
  if (!problemType || problemType.trim() === '') {
    return { isValid: false, error: 'Problem type is required' };
  }
  
  if (!validTypes.includes(problemType)) {
    return { isValid: false, error: 'Please select a valid problem type' };
  }
  
  return { isValid: true };
};

/**
 * Validates priority level
 */
export const validatePriority = (priority: string): ValidationResult => {
  const validPriorities = ['Laag', 'Medium', 'Hoog'];
  
  if (!priority || priority.trim() === '') {
    return { isValid: false, error: 'Priority is required' };
  }
  
  if (!validPriorities.includes(priority)) {
    return { isValid: false, error: 'Please select a valid priority level' };
  }
  
  return { isValid: true };
};

/**
 * Validates complete report form
 */
export const validateReportForm = (formData: {
  roomId: string;
  problemType: string;
  priority: string;
  description: string;
  contactInfo?: string;
}): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  
  const roomValidation = validateRoomId(formData.roomId);
  if (!roomValidation.isValid) {
    errors.roomId = roomValidation.error;
  }
  
  const problemTypeValidation = validateProblemType(formData.problemType);
  if (!problemTypeValidation.isValid) {
    errors.problemType = problemTypeValidation.error;
  }
  
  const priorityValidation = validatePriority(formData.priority);
  if (!priorityValidation.isValid) {
    errors.priority = priorityValidation.error;
  }
  
  const descriptionValidation = validateDescription(formData.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error;
  }
  
  if (formData.contactInfo) {
    const contactValidation = validateSchoolEmail(formData.contactInfo);
    if (!contactValidation.isValid) {
      errors.contactInfo = contactValidation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitizes text input (removes extra whitespace)
 */
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Validates login form
 */
export const validateLoginForm = (email: string, password: string): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  const passwordValidation = validateRequired(password, 'Password');
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates registration form
 */
export const validateRegistrationForm = (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};
  
  // Validate name
  const nameValidation = validateRequired(formData.name, 'Name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  } else if (formData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Validate password
  const passwordValidation = validateRequired(formData.password, 'Password');
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  // Validate confirm password
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
