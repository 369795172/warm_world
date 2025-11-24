// Asset validation utilities for ensuring compliance with naming rules and quality standards
import { 
  ASSET_NAMING_RULES, 
  ASSET_VALIDATION_RULES, 
  AssetMetadata, 
  AssetType,
  AssetCategory 
} from '@/config/assetConfig'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface AssetValidationReport {
  assetId: string
  category: AssetCategory
  validation: ValidationResult
  metadata?: AssetMetadata
  checkedAt: string
}

/**
 * Validates asset ID according to category-specific naming rules
 */
export function validateAssetId(assetId: string, category: AssetCategory): ValidationResult {
  const rules = ASSET_NAMING_RULES[category]
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check naming pattern
  if (!rules.pattern.test(assetId)) {
    errors.push(`Asset ID "${assetId}" does not match naming pattern for ${category} category`)
    suggestions.push(`Expected pattern: ${rules.pattern.source}`)
    suggestions.push(`Examples: ${rules.examples.join(', ')}`)
  }

  // Check length constraints
  if (assetId.length < 3) {
    warnings.push(`Asset ID "${assetId}" is very short (minimum 3 characters recommended)`)
  }
  if (assetId.length > 50) {
    errors.push(`Asset ID "${assetId}" is too long (maximum 50 characters)`)
  }

  // Check for special characters (except underscores)
  if (/[^a-z0-9_]/.test(assetId)) {
    errors.push(`Asset ID "${assetId}" contains invalid characters (only lowercase letters, numbers, and underscores allowed)`)
  }

  // Check for consecutive underscores
  if (/__/.test(assetId)) {
    warnings.push(`Asset ID "${assetId}" contains consecutive underscores`)
    suggestions.push('Use single underscores to separate words')
  }

  // Check for leading/trailing underscores
  if (assetId.startsWith('_') || assetId.endsWith('_')) {
    warnings.push(`Asset ID "${assetId}" has leading or trailing underscores`)
    suggestions.push('Remove leading/trailing underscores')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Validates asset file type and format
 */
export function validateAssetFile(assetMetadata: AssetMetadata): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const { type, src, dimensions, fileSize } = assetMetadata
  const rules = ASSET_VALIDATION_RULES[type as keyof typeof ASSET_VALIDATION_RULES]

  if (!rules) {
    errors.push(`Unsupported asset type: ${type}`)
    return { isValid: false, errors, warnings, suggestions }
  }

  // Validate file size
  if (fileSize && fileSize > rules.maxFileSize) {
    errors.push(`File size (${formatFileSize(fileSize)}) exceeds maximum allowed (${formatFileSize(rules.maxFileSize)})`)
    suggestions.push(`Reduce file size to under ${formatFileSize(rules.maxFileSize)}`)
  }

  // Validate dimensions for image assets
  if (dimensions && 'dimensions' in rules) {
    const { min, max } = rules.dimensions
    
    if (dimensions.width < min || dimensions.height < min) {
      errors.push(`Dimensions (${dimensions.width}x${dimensions.height}) are below minimum (${min}x${min})`)
    }
    
    if (dimensions.width > max || dimensions.height > max) {
      errors.push(`Dimensions (${dimensions.width}x${dimensions.height}) exceed maximum (${max}x${max})`)
      suggestions.push(`Resize to maximum ${max}x${max}px`)
    }

    // Check aspect ratio for certain asset types
    if (type === 'svg') {
      const aspectRatio = dimensions.width / dimensions.height
      if (aspectRatio > 4 || aspectRatio < 0.25) {
        warnings.push(`Unusual aspect ratio (${aspectRatio.toFixed(2)}) for SVG asset`)
        suggestions.push('Consider using a more balanced aspect ratio (0.5-2.0)')
      }
    }
  }

  // Validate source path
  if (!src || typeof src !== 'string') {
    errors.push('Missing or invalid source path')
  } else {
    // Check path format
    if (!src.startsWith('/') && !src.startsWith('http')) {
      warnings.push('Source path should be absolute or full URL')
      suggestions.push('Use absolute path starting with / or full URL')
    }

    // Check file extension for non-emoji assets
    if (type !== 'emoji') {
      const expectedExtensions = getExpectedExtensions(type)
      const hasValidExtension = expectedExtensions.some(ext => src.toLowerCase().endsWith(ext))
      
      if (!hasValidExtension) {
        errors.push(`Source path does not end with expected extension for ${type} asset`)
        suggestions.push(`Expected extensions: ${expectedExtensions.join(', ')}`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Validates asset metadata completeness
 */
export function validateAssetMetadata(metadata: AssetMetadata): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  const requiredFields = ['id', 'name', 'category', 'type', 'src', 'alt', 'version', 'createdAt', 'updatedAt', 'tags']
  const missingFields = requiredFields.filter(field => !metadata[field as keyof AssetMetadata])

  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`)
  }

  // Validate specific fields
  if (metadata.id && typeof metadata.id !== 'string') {
    errors.push('ID must be a string')
  }

  if (metadata.name && typeof metadata.name !== 'string') {
    errors.push('Name must be a string')
  }

  if (metadata.alt && typeof metadata.alt !== 'string') {
    errors.push('Alt text must be a string')
  }

  if (metadata.tags && !Array.isArray(metadata.tags)) {
    errors.push('Tags must be an array')
  }

  if (metadata.version && !/^\d+\.\d+\.\d+/.test(metadata.version)) {
    warnings.push('Version should follow semantic versioning (e.g., 1.0.0)')
    suggestions.push('Use semantic versioning format: MAJOR.MINOR.PATCH')
  }

  // Check date formats
  if (metadata.createdAt && !isValidISODate(metadata.createdAt)) {
    errors.push('CreatedAt must be a valid ISO 8601 date string')
  }

  if (metadata.updatedAt && !isValidISODate(metadata.updatedAt)) {
    errors.push('UpdatedAt must be a valid ISO 8601 date string')
  }

  // Check for reasonable dates (not in the future, not too old)
  if (metadata.createdAt) {
    const createdDate = new Date(metadata.createdAt)
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    if (createdDate > now) {
      warnings.push('Created date is in the future')
    }
    if (createdDate < oneYearAgo) {
      warnings.push('Created date is more than a year old')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Validates accessibility features
 */
export function validateAccessibility(metadata: AssetMetadata): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check alt text
  if (!metadata.alt || metadata.alt.trim().length === 0) {
    errors.push('Missing alt text for accessibility')
    suggestions.push('Provide descriptive alt text for screen readers')
  } else {
    if (metadata.alt.length < 5) {
      warnings.push('Alt text is very short (minimum 5 characters recommended)')
    }
    if (metadata.alt.length > 200) {
      warnings.push('Alt text is very long (consider making it more concise)')
    }
  }

  // Check for fallback
  if (metadata.type !== 'emoji' && !metadata.fallback) {
    warnings.push('No fallback asset specified for graceful degradation')
    suggestions.push('Provide a fallback asset ID for better resilience')
  }

  // Check tags for accessibility keywords
  if (metadata.tags && metadata.tags.length > 0) {
    const accessibilityTags = ['accessible', 'aria', 'screen-reader', 'keyboard']
    const hasAccessibilityTag = metadata.tags.some(tag => 
      accessibilityTags.some(accessibilityTag => 
        tag.toLowerCase().includes(accessibilityTag)
      )
    )
    
    if (!hasAccessibilityTag && metadata.category === 'icons') {
      suggestions.push('Consider adding accessibility-related tags for better discoverability')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Performs comprehensive validation of an asset
 */
export function validateAsset(metadata: AssetMetadata): AssetValidationReport {
  const reports = {
    naming: validateAssetId(metadata.id, metadata.category),
    file: validateAssetFile(metadata),
    metadata: validateAssetMetadata(metadata),
    accessibility: validateAccessibility(metadata)
  }

  // Combine all validation results
  const allErrors = Object.values(reports).flatMap(r => r.errors)
  const allWarnings = Object.values(reports).flatMap(r => r.warnings)
  const allSuggestions = Object.values(reports).flatMap(r => r.suggestions)

  return {
    assetId: metadata.id,
    category: metadata.category,
    validation: {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions
    },
    metadata,
    checkedAt: new Date().toISOString()
  }
}

/**
 * Validates multiple assets and returns a summary report
 */
export function validateAssetManifest(assets: AssetMetadata[]): {
  reports: AssetValidationReport[]
  summary: {
    total: number
    valid: number
    invalid: number
    warnings: number
    errors: number
    byCategory: Record<string, { valid: number; invalid: number; warnings: number }>
  }
} {
  const reports = assets.map(validateAsset)
  
  const summary = {
    total: assets.length,
    valid: reports.filter(r => r.validation.isValid).length,
    invalid: reports.filter(r => !r.validation.isValid).length,
    warnings: reports.reduce((sum, r) => sum + r.validation.warnings.length, 0),
    errors: reports.reduce((sum, r) => sum + r.validation.errors.length, 0),
    byCategory: {} as Record<string, { valid: number; invalid: number; warnings: number }>
  }

  // Group by category
  reports.forEach(report => {
    const category = report.category
    if (!summary.byCategory[category]) {
      summary.byCategory[category] = { valid: 0, invalid: 0, warnings: 0 }
    }
    
    if (report.validation.isValid) {
      summary.byCategory[category].valid++
    } else {
      summary.byCategory[category].invalid++
    }
    
    summary.byCategory[category].warnings += report.validation.warnings.length
  })

  return { reports, summary }
}

/**
 * Utility functions
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function getExpectedExtensions(type: AssetType): string[] {
  switch (type) {
    case 'svg':
      return ['.svg']
    case 'lottie':
      return ['.json']
    case 'gltf':
      return ['.gltf', '.glb']
    case 'emoji':
      return [] // Emoji don't have file extensions
    default:
      return []
  }
}

function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime()) && dateString.includes('T')
  } catch {
    return false
  }
}

/**
 * Auto-fix suggestions for common validation issues
 */
export function suggestFixes(report: AssetValidationReport): string[] {
  const fixes: string[] = []
  
  // Naming fixes
  if (report.validation.errors.some(e => e.includes('naming pattern'))) {
    const validName = report.assetId
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_')
    
    if (validName !== report.assetId) {
      fixes.push(`Rename asset ID from "${report.assetId}" to "${validName}"`)
    }
  }

  // File size fixes
  if (report.validation.errors.some(e => e.includes('File size'))) {
    fixes.push('Compress the asset file to reduce file size')
    fixes.push('Consider using a different file format with better compression')
  }

  // Dimension fixes
  if (report.validation.errors.some(e => e.includes('Dimensions'))) {
    fixes.push('Resize the asset to meet the dimension requirements')
    fixes.push('Consider using vector formats for scalability')
  }

  // Alt text fixes
  if (report.validation.errors.some(e => e.includes('alt text'))) {
    fixes.push('Add descriptive alt text for accessibility')
    fixes.push(`Example: "${report.assetId} character icon"`)
  }

  return fixes
}

export default {
  validateAssetId,
  validateAssetFile,
  validateAssetMetadata,
  validateAccessibility,
  validateAsset,
  validateAssetManifest,
  suggestFixes
}