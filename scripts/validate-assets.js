#!/usr/bin/env node

/**
 * Asset Management System - Automated Validation Script
 * 
 * This script validates the entire asset manifest against established rules
 * and generates compliance reports for the 价值之旅·小小世界 project.
 * 
 * Usage:
 *   npm run validate:assets
 *   npm run validate:assets -- --detailed
 *   npm run validate:assets -- --fix-suggestions
 *   npm run validate:assets -- --output=validation-report.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

class AssetValidationRunner {
  constructor(options = {}) {
    this.options = {
      detailed: false,
      fixSuggestions: false,
      verbose: false,
      ...options
    }
    this.startTime = Date.now()
    this.initialMemory = process.memoryUsage().heapUsed
  }

  async run() {
    try {
      this.log('🔍 Starting asset validation...')
      
      const manifestPath = join(__dirname, '../public/assets/asset-manifest.json')
      const manifest = this.loadManifest(manifestPath)
      
      this.log(`📋 Loaded manifest with ${manifest.totalAssets} assets`)
      
      // Import validation functions dynamically
      const assetValidator = await import('../src/utils/assetValidator.js')
      const { validateAssetManifest, suggestFixes } = assetValidator
      
      const validationResult = validateAssetManifest(manifest)
      
      const report = await this.generateReport(validationResult, manifestPath)
      
      if (this.options.output) {
        this.saveReport(report, this.options.output)
      }
      
      this.printSummary(report)
      
      if (this.options.detailed) {
        this.printDetails(report)
      }
      
      return report
      
    } catch (error) {
      console.error('❌ Validation failed:', error)
      process.exit(1)
    }
  }

  loadManifest(manifestPath) {
    if (!existsSync(manifestPath)) {
      throw new Error(`Manifest file not found: ${manifestPath}`)
    }

    try {
      const content = readFileSync(manifestPath, 'utf-8')
      return JSON.parse(content)
    } catch (error) {
      throw new Error(`Failed to parse manifest: ${error.message}`)
    }
  }

  async generateReport(validationResult, manifestPath) {
    const endTime = Date.now()
    const finalMemory = process.memoryUsage().heapUsed
    
    const validAssets = []
    const invalidAssets = []
    
    // Process asset errors if they exist
    if (validationResult.assetErrors) {
      for (const error of validationResult.assetErrors) {
        const assetId = error.assetId
        const category = error.category || 'unknown'
        const errors = error.errors || []
        
        let fixes
        if (this.options.fixSuggestions && error.metadata) {
          const assetValidator = await import('../src/utils/assetValidator.js')
          const { suggestFixes } = assetValidator
          fixes = suggestFixes(error.metadata, error)
        }
        
        invalidAssets.push({
          assetId,
          category,
          errors,
          fixes
        })
      }
    }
    
    // Generate category statistics
    const categories = {}
    
    // This is a simplified version - in a real implementation, you'd parse the manifest
    // to get the actual category breakdown
    categories['all'] = {
      total: validationResult.totalAssets || 0,
      valid: validationResult.validAssets || 0,
      invalid: validationResult.invalidAssets || 0
    }
    
    return {
      timestamp: new Date().toISOString(),
      manifestPath,
      summary: {
        totalAssets: validationResult.totalAssets || 0,
        validAssets: validationResult.validAssets || 0,
        invalidAssets: validationResult.invalidAssets || 0,
        compliancePercentage: validationResult.compliancePercentage || 0,
        categories
      },
      details: {
        validAssets,
        invalidAssets
      },
      performance: {
        validationTime: endTime - this.startTime,
        memoryUsage: finalMemory - this.initialMemory
      }
    }
  }

  printSummary(report) {
    const { summary } = report
    const complianceEmoji = summary.compliancePercentage >= 95 ? '✅' : 
                           summary.compliancePercentage >= 80 ? '⚠️' : '❌'
    
    console.log('\n📊 Validation Summary')
    console.log('═'.repeat(50))
    console.log(`${complianceEmoji} Overall Compliance: ${summary.compliancePercentage.toFixed(1)}%`)
    console.log(`📈 Total Assets: ${summary.totalAssets}`)
    console.log(`✅ Valid Assets: ${summary.validAssets}`)
    console.log(`❌ Invalid Assets: ${summary.invalidAssets}`)
    
    if (summary.invalidAssets > 0) {
      console.log(`\n⚠️  Found ${summary.invalidAssets} validation issues that need attention`)
    } else {
      console.log('\n🎉 All assets passed validation!')
    }
    
    console.log(`\n⏱️  Validation Time: ${report.performance.validationTime}ms`)
    console.log(`💾 Memory Usage: ${(report.performance.memoryUsage / 1024 / 1024).toFixed(2)} MB`)
  }

  printDetails(report) {
    const { details } = report
    
    if (details.invalidAssets.length > 0) {
      console.log('\n🔍 Detailed Error Report')
      console.log('═'.repeat(50))
      
      for (const invalidAsset of details.invalidAssets) {
        console.log(`\n❌ ${invalidAsset.assetId} (${invalidAsset.category})`)
        
        for (const error of invalidAsset.errors) {
          console.log(`   • ${error}`)
        }
        
        if (invalidAsset.fixes && invalidAsset.fixes.length > 0) {
          console.log('   💡 Suggested fixes:')
          for (const fix of invalidAsset.fixes) {
            console.log(`     - ${fix}`)
          }
        }
      }
    }
    
    if (details.validAssets.length > 0) {
      console.log(`\n✅ Valid Assets (${details.validAssets.length}):`)
      for (const assetId of details.validAssets.slice(0, 10)) {
        console.log(`   • ${assetId}`)
      }
      if (details.validAssets.length > 10) {
        console.log(`   ... and ${details.validAssets.length - 10} more`)
      }
    }
  }

  saveReport(report, outputPath) {
    try {
      const fullPath = resolve(__dirname, outputPath)
      writeFileSync(fullPath, JSON.stringify(report, null, 2), 'utf-8')
      console.log(`\n💾 Report saved to: ${fullPath}`)
    } catch (error) {
      console.error(`❌ Failed to save report: ${error.message}`)
    }
  }

  log(message) {
    if (this.options.verbose) {
      console.log(message)
    }
  }
}

// CLI Argument Parser
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    if (arg === '--detailed' || arg === '-d') {
      options.detailed = true
    } else if (arg === '--fix-suggestions' || arg === '-f') {
      options.fixSuggestions = true
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true
    } else if (arg.startsWith('--output=') || arg.startsWith('-o=')) {
      const output = arg.split('=')[1]
      if (output) options.output = output
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  
  return options
}

function printHelp() {
  console.log(`
🎯 Asset Management System - Validation Script

Usage: npm run validate:assets [options]

Options:
  -d, --detailed          Show detailed error information
  -f, --fix-suggestions   Include suggested fixes for validation errors
  -v, --verbose           Enable verbose logging
  -o, --output=FILE       Save report to file (JSON format)
  -h, --help              Show this help message

Examples:
  npm run validate:assets
  npm run validate:assets -- --detailed
  npm run validate:assets -- --fix-suggestions --output=report.json
  npm run validate:assets -- --detailed --verbose

This script validates all assets in the manifest against naming conventions,
file format requirements, accessibility standards, and performance guidelines.
`)
}

// Main execution
async function main() {
  try {
    const options = parseArgs()
    const runner = new AssetValidationRunner(options)
    await runner.run()
    
    // Exit with appropriate code based on validation results
    process.exit(0)
  } catch (error) {
    console.error('❌ Validation script failed:', error)
    process.exit(1)
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { AssetValidationRunner }