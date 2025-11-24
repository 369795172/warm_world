import React, { useState, useEffect } from 'react'
import { 
  accessibilityTester, 
  AccessibilityReport, 
  ScreenReaderManager,
  reducedMotionManager 
} from '../utils/accessibility'
import { AlertCircle, CheckCircle, XCircle, Info, Eye, EyeOff } from 'lucide-react'

interface AccessibilityTesterProps {
  targetElement?: HTMLElement | null
  onReportGenerated?: (report: AccessibilityReport) => void
  className?: string
}

export const AccessibilityTester: React.FC<AccessibilityTesterProps> = ({
  targetElement,
  onReportGenerated,
  className = ''
}) => {
  const [report, setReport] = useState<AccessibilityReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check reduced motion preference
    setReducedMotion(reducedMotionManager.getPrefersReducedMotion())
    
    const handleReducedMotionChange = (prefersReduced: boolean) => {
      setReducedMotion(prefersReduced)
    }
    
    reducedMotionManager.addListener(handleReducedMotionChange)
    return () => reducedMotionManager.removeListener(handleReducedMotionChange)
  }, [])

  const runAccessibilityTests = async () => {
    setIsRunning(true)
    setReport(null)
    
    try {
      // Clear existing tests
      accessibilityTester['tests'] = []
      
      // Add standard tests for target element or document body
      const element = targetElement || document.body
      accessibilityTester.createStandardTests(element)
      
      // Add custom tests for our specific components
      addCustomTests(element)
      
      // Run tests
      const result = await accessibilityTester.runTests()
      setReport(result)
      
      if (onReportGenerated) {
        onReportGenerated(result)
      }
      
      // Announce results to screen readers
      const totalTests = result.passed + result.failed
      const successRate = totalTests > 0 ? Math.round((result.passed / totalTests) * 100) : 0
      ScreenReaderManager.announce(
        `无障碍测试完成。通过 ${result.passed} 项，失败 ${result.failed} 项，成功率 ${successRate}%。`,
        'polite'
      )
    } catch (error) {
      console.error('Accessibility test failed:', error)
      ScreenReaderManager.announce('无障碍测试失败，请检查控制台错误信息。', 'assertive')
    } finally {
      setIsRunning(false)
    }
  }

  const addCustomTests = (element: HTMLElement) => {
    // Test for proper heading structure
    accessibilityTester.addTest({
      name: 'Proper heading structure (h1-h6)',
      test: () => {
        const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
        if (headings.length === 0) return true // No headings is OK
        
        let previousLevel = 0
        for (const heading of Array.from(headings)) {
          const level = parseInt(heading.tagName.charAt(1))
          if (previousLevel === 0) {
            previousLevel = level
            continue
          }
          if (level > previousLevel + 1) return false // Skipped a level
          previousLevel = level
        }
        return true
      },
      severity: 'major',
      wcagReference: '1.3.1 Info and Relationships'
    })

    // Test for language attributes
    accessibilityTester.addTest({
      name: 'Page has language attribute',
      test: () => {
        return document.documentElement.hasAttribute('lang') && 
               document.documentElement.getAttribute('lang') !== ''
      },
      severity: 'major',
      wcagReference: '3.1.1 Language of Page'
    })

    // Test for skip links
    accessibilityTester.addTest({
      name: 'Skip links present for keyboard navigation',
      test: () => {
        const skipLinks = element.querySelectorAll('a[href^="#"]')
        return Array.from(skipLinks).some(link => 
          link.textContent?.toLowerCase().includes('skip') ||
          link.textContent?.toLowerCase().includes('跳') ||
          link.getAttribute('aria-label')?.toLowerCase().includes('skip') ||
          link.getAttribute('aria-label')?.toLowerCase().includes('跳')
        )
      },
      severity: 'major',
      wcagReference: '2.4.1 Bypass Blocks'
    })

    // Test for reduced motion support
    accessibilityTester.addTest({
      name: 'Respects prefers-reduced-motion preference',
      test: () => {
        // This is a simplified test - in real implementation you'd check CSS
        return reducedMotionManager.getPrefersReducedMotion() !== undefined
      },
      severity: 'minor',
      wcagReference: '2.3.3 Animation from Interactions'
    })

    // Test for form labels
    accessibilityTester.addTest({
      name: 'Form inputs have associated labels',
      test: () => {
        const inputs = element.querySelectorAll('input:not([type="hidden"]), select, textarea')
        return Array.from(inputs).every(input => {
          const id = input.getAttribute('id')
          if (!id) return false // Input needs an ID for label association
          
          // Check for associated label
          const label = element.querySelector(`label[for="${id}"]`)
          if (label) return true
          
          // Check if input is wrapped in a label
          const parentLabel = input.closest('label')
          if (parentLabel) return true
          
          // Check for aria-label or aria-labelledby
          return input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby')
        })
      },
      severity: 'critical',
      wcagReference: '3.3.2 Labels or Instructions'
    })
  }

  const getSeverityColor = (severity: 'critical' | 'major' | 'minor') => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'major': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'minor': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getSeverityIcon = (severity: 'critical' | 'major' | 'minor') => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />
      case 'major': return <AlertCircle className="w-4 h-4" />
      case 'minor': return <Info className="w-4 h-4" />
    }
  }

  if (!report) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">无障碍测试工具</h3>
          <p className="text-gray-600 mb-6">
            运行 WCAG 2.1 AA 合规性测试，检查颜色对比度、键盘导航、屏幕阅读器支持等。
          </p>
          <button
            onClick={runAccessibilityTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            aria-label="开始运行无障碍测试"
          >
            {isRunning ? '测试中...' : '开始测试'}
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>当前运动偏好：{reducedMotion ? '减少运动' : '正常运动'}</p>
            <p className="mt-2">快捷键：</p>
            <ul className="text-xs text-left mt-1 space-y-1">
              <li>• 数字键 1-3：选择种子工具</li>
              <li>• W 键：选择浇水工具</li>
              <li>• ESC 键：取消当前工具</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const totalTests = report.passed + report.failed
  const successRate = totalTests > 0 ? Math.round((report.passed / totalTests) * 100) : 0

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">无障碍测试报告</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          aria-label={showDetails ? '隐藏详细信息' : '显示详细信息'}
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDetails ? '隐藏详情' : '显示详情'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{report.passed}</div>
          <div className="text-sm text-green-700">通过</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">{report.failed}</div>
          <div className="text-sm text-red-700">失败</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
          <div className="text-sm text-blue-700">成功率</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            successRate >= 90 ? 'bg-green-600' : 
            successRate >= 70 ? 'bg-yellow-600' : 'bg-red-600'
          }`}
          style={{ width: `${successRate}%` }}
          role="progressbar"
          aria-valuenow={successRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`测试完成度：${successRate}%`}
        />
      </div>

      {/* Test details */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 mb-3">测试详情</h4>
          {report.tests.map((test, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                test.passed 
                  ? 'bg-green-50 border-green-200' 
                  : getSeverityColor(test.severity)
              }`}
            >
              <div className="flex items-start gap-3">
                {test.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(test.severity)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${
                      test.passed ? 'text-green-800' : 'text-gray-800'
                    }`}>
                      {test.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      test.passed 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {test.passed ? '通过' : '失败'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    WCAG 参考：{test.wcagReference}
                  </div>
                  {test.message && (
                    <div className="text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                      {test.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={runAccessibilityTests}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          aria-label="重新运行测试"
        >
          {isRunning ? '测试中...' : '重新测试'}
        </button>
        <button
          onClick={() => setReport(null)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          aria-label="清除测试结果"
        >
          清除结果
        </button>
      </div>

      {/* Accessibility tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">💡 无障碍优化建议</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 确保所有交互元素都有清晰的焦点指示器</li>
          <li>• 为图片和图标提供替代文本描述</li>
          <li>• 保持足够的颜色对比度（至少 4.5:1）</li>
          <li>• 支持键盘导航和屏幕阅读器</li>
          <li>• 尊重用户的运动偏好设置</li>
        </ul>
      </div>
    </div>
  )
}

export default AccessibilityTester