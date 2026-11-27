import { describe, it, expect } from 'vitest'
import { defaultPortfolioData } from '../app/lib/portfolio-data'

describe('Portfolio Data Types', () => {
  describe('defaultPortfolioData', () => {
    it('should have all required top-level properties', () => {
      expect(defaultPortfolioData).toHaveProperty('personalInfo')
      expect(defaultPortfolioData).toHaveProperty('skills')
      expect(defaultPortfolioData).toHaveProperty('experience')
      expect(defaultPortfolioData).toHaveProperty('education')
      expect(defaultPortfolioData).toHaveProperty('projects')
      expect(defaultPortfolioData).toHaveProperty('gallery')
    })

    it('should have valid personalInfo structure', () => {
      const { personalInfo } = defaultPortfolioData
      
      expect(personalInfo.name).toBe('Your Name')
      expect(personalInfo.title).toBe('Software Developer')
      expect(typeof personalInfo.email).toBe('string')
      expect(typeof personalInfo.phone).toBe('string')
      expect(typeof personalInfo.location).toBe('string')
      expect(typeof personalInfo.about).toBe('string')
      expect(typeof personalInfo.avatarUrl).toBe('string')
    })

    it('should have valid social links structure', () => {
      const { social } = defaultPortfolioData.personalInfo
      
      expect(social).toHaveProperty('github')
      expect(social).toHaveProperty('linkedin')
      expect(social).toHaveProperty('twitter')
      expect(social).toHaveProperty('instagram')
    })

    it('should have valid stats structure', () => {
      const { stats } = defaultPortfolioData.personalInfo
      
      expect(stats).toHaveProperty('yearsExperience')
      expect(stats).toHaveProperty('projectsCompleted')
      expect(stats).toHaveProperty('certificationsAwards')
    })

    it('should have skills array with valid structure', () => {
      expect(Array.isArray(defaultPortfolioData.skills)).toBe(true)
      expect(defaultPortfolioData.skills.length).toBeGreaterThan(0)
      
      defaultPortfolioData.skills.forEach((skill) => {
        expect(typeof skill.name).toBe('string')
        expect(typeof skill.level).toBe('number')
        expect(skill.level).toBeGreaterThanOrEqual(0)
        expect(skill.level).toBeLessThanOrEqual(100)
      })
    })

    it('should have experience array with valid structure', () => {
      expect(Array.isArray(defaultPortfolioData.experience)).toBe(true)
      
      defaultPortfolioData.experience.forEach((exp) => {
        expect(typeof exp.title).toBe('string')
        expect(typeof exp.company).toBe('string')
        expect(typeof exp.period).toBe('string')
        expect(typeof exp.description).toBe('string')
      })
    })

    it('should have education array with valid structure', () => {
      expect(Array.isArray(defaultPortfolioData.education)).toBe(true)
      
      defaultPortfolioData.education.forEach((edu) => {
        expect(typeof edu.degree).toBe('string')
        expect(typeof edu.school).toBe('string')
        expect(typeof edu.period).toBe('string')
      })
    })

    it('should have projects array with valid structure', () => {
      expect(Array.isArray(defaultPortfolioData.projects)).toBe(true)
      
      defaultPortfolioData.projects.forEach((project) => {
        expect(typeof project.title).toBe('string')
        expect(typeof project.description).toBe('string')
        expect(Array.isArray(project.tags)).toBe(true)
        expect(typeof project.link).toBe('string')
        expect(typeof project.imageUrl).toBe('string')
      })
    })

    it('should have gallery array with valid structure', () => {
      expect(Array.isArray(defaultPortfolioData.gallery)).toBe(true)
      
      defaultPortfolioData.gallery.forEach((item) => {
        expect(typeof item.title).toBe('string')
        expect(typeof item.description).toBe('string')
        expect(typeof item.imageUrl).toBe('string')
      })
    })
  })

  describe('Data Validation', () => {
    it('should have valid email format in default data', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test(defaultPortfolioData.personalInfo.email)).toBe(true)
    })

    it('should have non-empty name and title', () => {
      expect(defaultPortfolioData.personalInfo.name.length).toBeGreaterThan(0)
      expect(defaultPortfolioData.personalInfo.title.length).toBeGreaterThan(0)
    })

    it('should have at least one skill', () => {
      expect(defaultPortfolioData.skills.length).toBeGreaterThanOrEqual(1)
    })

    it('should have at least one project', () => {
      expect(defaultPortfolioData.projects.length).toBeGreaterThanOrEqual(1)
    })
  })
})
