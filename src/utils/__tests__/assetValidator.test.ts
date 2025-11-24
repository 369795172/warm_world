import { describe, it, expect, beforeEach } from 'vitest'
import { AssetMetadata } from '@/config/assetConfig'
import {
  validateAsset,
  validateAssetManifest,
  validateAssetId,
  validateAssetFile, 
  validateAssetMetadata, 
  validateAccessibility,
  suggestFixes,

  type AssetValidationReport
} from '../assetValidator'

describe('AssetValidator', () => {
  const validAssetMetadata: AssetMetadata = {
    id: 'character-001-xiaoming',
    name: '小明',
    category: 'characters',
    type: 'svg',
    src: '/assets/characters/xiaoming.svg',
    alt: '主角小明角色图标',
    version: '1.0.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    fileSize: 1024,
    dimensions: { width: 100, height: 100 },
    tags: ['character', 'protagonist'],
    fallback: '🧒'
  }

  describe('validateAssetId', () => {
    it('should validate correct character asset IDs', () => {
      const result = validateAssetId('character-001-xiaoming', 'characters')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid character asset IDs', () => {
      const result = validateAssetId('invalid-id', 'characters')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Asset ID must follow naming convention')
    })

    it('should validate toy asset IDs', () => {
      const result = validateAssetId('toy-001-ball', 'toys')
      expect(result.isValid).toBe(true)
    })

    it('should validate background asset IDs', () => {
      const result = validateAssetId('bg-001-home', 'backgrounds')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateAssetMetadata', () => {
    it('should validate complete metadata', () => {
      const result = validateAssetMetadata(validAssetMetadata)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject metadata with missing required fields', () => {
      const invalidMetadata = {
        ...validAssetMetadata,
        name: '' // Empty name
      }
      const result = validateAssetMetadata(invalidMetadata)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Asset name is required')
    })

    it('should reject metadata with invalid file size', () => {
      const invalidMetadata = {
        ...validAssetMetadata,
        fileSize: 200 * 1024 + 1 // 200KB + 1B
      }
      const result = validateAssetMetadata(invalidMetadata)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('SVG file size exceeds maximum limit of 200KB')
    })

    it('should reject metadata with invalid dimensions', () => {
      const invalidMetadata = {
        ...validAssetMetadata,
        dimensions: { width: 2000, height: 2000 } // Too large
      }
      const result = validateAssetMetadata(invalidMetadata)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Asset dimensions exceed maximum allowed size')
    })
  })

  describe('validateAssetFile', () => {
    it('should validate SVG files', () => {
      const svgContent = '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>'
      const result = validateAssetFile({ 
        id: 'test-svg',
        name: 'Test SVG',
        category: 'icons',
        type: 'svg',
        src: 'data:image/svg+xml;base64,' + btoa(svgContent),
        alt: 'Test SVG',
        version: '1.0.0',
        createdAt: '2025-11-22T00:00:00Z',
        updatedAt: '2025-11-22T00:00:00Z',
        tags: ['test']
      })
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid SVG files', () => {
      const invalidSvg = '<svg><script>alert("xss")</script></svg>'
      const result = validateAssetFile({ 
        id: 'test-invalid-svg',
        name: 'Test Invalid SVG',
        category: 'icons',
        type: 'svg',
        src: 'data:image/svg+xml;base64,' + btoa(invalidSvg),
        alt: 'Test Invalid SVG',
        version: '1.0.0',
        createdAt: '2025-11-22T00:00:00Z',
        updatedAt: '2025-11-22T00:00:00Z',
        tags: ['test']
      })
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('SVG contains potentially unsafe content')
    })

    it('should validate Lottie JSON files', () => {
      const lottieData = {
        v: '5.5.7',
        fr: 30,
        ip: 0,
        op: 60,
        w: 100,
        h: 100,
        nm: 'Test Animation',
        ddd: 0,
        assets: [],
        layers: []
      }
      const result = validateAssetFile({ 
        id: 'test-lottie',
        name: 'Test Lottie',
        category: 'animations',
        type: 'lottie',
        src: 'data:application/json;base64,' + btoa(JSON.stringify(lottieData)),
        alt: 'Test Lottie Animation',
        version: '1.0.0',
        createdAt: '2025-11-22T00:00:00Z',
        updatedAt: '2025-11-22T00:00:00Z',
        tags: ['test']
      })
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateAccessibility', () => {
    it('should validate accessible metadata', () => {
      const accessibleMetadata = {
        ...validAssetMetadata,
        alt: 'Clear and descriptive alt text'
      }
      const result = validateAccessibility(accessibleMetadata)
      expect(result.isValid).toBe(true)
    })

    it('should reject metadata with poor accessibility', () => {
      const poorMetadata = {
        ...validAssetMetadata,
        alt: 'image' // Too generic
      }
      const result = validateAccessibility(poorMetadata)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Alt text is too generic')
    })
  })

  describe('suggestFixes', () => {
    it('should suggest fixes for invalid asset IDs', () => {
      const report: AssetValidationReport = {
        assetId: 'invalid-id',
        category: 'characters',
        validation: {
          isValid: false,
          errors: ['Asset ID must follow naming convention'],
          warnings: [],
          suggestions: []
        },
        checkedAt: new Date().toISOString()
      }
      const fixes = suggestFixes(report)
      expect(fixes).toContain('Rename to: character-001-invalid-id')
    })

    it('should suggest fixes for accessibility issues', () => {
      const report: AssetValidationReport = {
        assetId: 'character-001-xiaoming',
        category: 'characters',
        validation: {
          isValid: false,
          errors: ['Alt text is too generic'],
          warnings: [],
          suggestions: []
        },
        checkedAt: new Date().toISOString()
      }
      const fixes = suggestFixes(report)
      expect(fixes).toContain('Improve alt text to be more descriptive')
    })
  })
})
