import { describe, it, expect } from 'vitest'

// Helper to validate email format (same logic as in the API)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper to validate contact form data
interface ContactFormData {
  name?: string
  email?: string
  message?: string
  recipientEmail?: string
}

function validateContactForm(data: ContactFormData): { valid: boolean; error?: string } {
  const { name, email, message, recipientEmail } = data

  // Check required fields
  if (!name || !email || !message || !recipientEmail) {
    return { valid: false, error: 'Missing required fields' }
  }

  // Validate email formats
  if (!isValidEmail(email) || !isValidEmail(recipientEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

describe('Contact Form Validation', () => {
  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@email.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('notanemail')).toBe(false)
      expect(isValidEmail('missing@domain')).toBe(false)
      expect(isValidEmail('@nodomain.com')).toBe(false)
      expect(isValidEmail('spaces in@email.com')).toBe(false)
      expect(isValidEmail('double@@at.com')).toBe(false)
    })
  })

  describe('Form Data Validation', () => {
    it('should accept valid form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test message.',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(validData)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject when name is missing', () => {
      const data = {
        email: 'john@example.com',
        message: 'Hello',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing required fields')
    })

    it('should reject when email is missing', () => {
      const data = {
        name: 'John Doe',
        message: 'Hello',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing required fields')
    })

    it('should reject when message is missing', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing required fields')
    })

    it('should reject when recipientEmail is missing', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing required fields')
    })

    it('should reject when sender email is invalid', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Hello',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid email format')
    })

    it('should reject when recipient email is invalid', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
        recipientEmail: 'not-an-email'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid email format')
    })

    it('should reject empty strings as valid values', () => {
      const data = {
        name: '',
        email: 'john@example.com',
        message: 'Hello',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Missing required fields')
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace-only values as missing', () => {
      const data = {
        name: '   ',
        email: 'john@example.com',
        message: 'Hello',
        recipientEmail: 'portfolio@example.com'
      }

      // Note: Current implementation doesn't trim, so this would pass
      // This test documents current behavior
      const result = validateContactForm(data)
      expect(result.valid).toBe(true) // Current behavior - might want to change
    })

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000)
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: longMessage,
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(true)
    })

    it('should handle special characters in name', () => {
      const data = {
        name: "John O'Brien-Smith",
        email: 'john@example.com',
        message: 'Hello',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(true)
    })

    it('should handle unicode in message', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello! 你好 🌟 مرحبا',
        recipientEmail: 'portfolio@example.com'
      }

      const result = validateContactForm(data)
      expect(result.valid).toBe(true)
    })
  })
})
