#!/usr/bin/env node

/**
 * Asset Management System - Simple Validation Script
 * 
 * This script validates the asset manifest against basic naming conventions
 * and file format requirements for the 价值之旅·小小世界 project.
 * 
 * Usage:
 *   npm run validate:assets:simple
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

function validateAssetId(assetId, category) {
  const patterns = {
    characters: /^character-\d{3}-[a-z]+$/,
    toys: /^toy-\d{3}-[a-z-]+$/,
    backgrounds: /^bg-\d{3}-[a-z-]+$/,
    animations: /^anim-\d{3}-[a-z-]+$/,
    icons: /^icon-\d{3}-[a-z-]+$/
  }
  
  if (!patterns[category]) {
    return { valid: false, errors: [`Invalid category: ${category}`] }
  }
  
  if (!patterns[category].test(assetId)) {
    return { 
      valid: false, 
      errors: [`Asset ID "${assetId}" does not match naming convention for ${category}`] 
    }
  }
  
  return { valid: true, errors: [] }
}

function validateAssetFile(metadata) {
  const { type, size } = metadata
  
  const limits = {
    svg: 200 * 1024, // 200KB
    lottie: 500 * 1024, // 500KB
    emoji: 10 * 1024, // 10KB
    gltf: 2 * 1024 * 1024 // 2MB
  }
  
  if (!limits[type]) {
    return { valid: false, errors: [`Unsupported asset type: ${type}`] }
  }
  
  if (size > limits[type]) {
    return { 
      valid: false, 
      errors: [`${type.toUpperCase()} file size (${size} bytes) exceeds maximum allowed (${limits[type]} bytes)`] 
    }
  }
  
  return { valid: true, errors: [] }
}

function validateAsset(metadata) {
  const reports = {
    naming: validateAssetId(metadata.id, metadata.category),
    file: validateAssetFile(metadata)
  }
  
  const valid = reports.naming.valid && reports.file.valid
  const errors = [...reports.naming.errors, ...reports.file.errors]
  
  return {
    valid,
    errors,
    reports
  }
}

function validateManifest(manifest) {
  // Count total assets across all categories
  let totalAssets = 0
  for (const categoryData of Object.values(manifest.categories)) {
    totalAssets += categoryData.assets.length
  }
  
  console.log(`📋 Validating manifest with ${totalAssets} assets...`)
  
  let validAssets = 0
  let invalidAssets = 0
  const errors = []
  
  // Validate each category
  for (const [category, categoryData] of Object.entries(manifest.categories)) {
    const assets = categoryData.assets
    console.log(`🔍 Validating ${category} category (${assets.length} assets)...`)
    
    for (const asset of assets) {
      const result = validateAsset(asset)
      
      if (result.valid) {
        validAssets++
        console.log(`   ✅ ${asset.id}`)
      } else {
        invalidAssets++
        console.log(`   ❌ ${asset.id}`)
        for (const error of result.errors) {
          console.log(`      • ${error}`)
        }
      }
    }
  }
  
  const compliancePercentage = totalAssets > 0 
    ? Math.round((validAssets / totalAssets) * 100) 
    : 100
  
  console.log('\n📊 Validation Summary')
  console.log('═'.repeat(50))
  console.log(`✅ Valid Assets: ${validAssets}`)
  console.log(`❌ Invalid Assets: ${invalidAssets}`)
  console.log(`📈 Compliance: ${compliancePercentage}%`)
  
  if (invalidAssets > 0) {
    console.log(`\n⚠️  Found ${invalidAssets} validation issues that need attention`)
  } else {
    console.log('\n🎉 All assets passed validation!')
  }
  
  return {
    validAssets,
    invalidAssets,
    compliancePercentage,
    totalAssets
  }
}

async function main() {
  try {
    console.log('🎯 Asset Management System - Simple Validation')
    console.log('═'.repeat(50))
    
    const manifestPath = join(__dirname, '../public/assets/asset-manifest.json')
    
    if (!existsSync(manifestPath)) {
      console.error(`❌ Manifest file not found: ${manifestPath}`)
      process.exit(1)
    }
    
    const content = readFileSync(manifestPath, 'utf-8')
    const manifest = JSON.parse(content)
    
    const result = validateManifest(manifest)
    
    // Exit with appropriate code based on validation results
    process.exit(result.invalidAssets > 0 ? 1 : 0)
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    process.exit(1)
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}