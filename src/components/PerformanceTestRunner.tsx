import React, { useState, useEffect } from 'react'
import { 
  performanceTestSuite, 
  PerformanceTestResult, 
  AnimationPerformanceTest, 
  LighthouseMetrics,
  runQuickPerformanceTest,
  runAnimationPerformanceTest,
  simulateLighthouseTest
} from '../utils/performanceTestSuite'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  BarChart3, 
  Accessibility, 
  MemoryStick, 
  Package, 
  Smartphone,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Zap,
  Award
} from 'lucide-react'

interface PerformanceTestRunnerProps {
  className?: string
  onTestComplete?: (results: PerformanceTestResult[]) => void
}

interface TestCategory {
  name: string
  icon: React.ReactNode
  color: string
  tests: PerformanceTestResult[]
}

const PerformanceTestRunner: React.FC<PerformanceTestRunnerProps> = ({ 
  className = '', 
  onTestComplete 
}) => {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([])
  const [animationResults, setAnimationResults] = useState<AnimationPerformanceTest[]>([])
  const [lighthouseResults, setLighthouseResults] = useState<LighthouseMetrics | null>(null)
  const [currentTest, setCurrentTest] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'animations' | 'accessibility' | 'performance'>('overview')

  const runFullTest = async () => {
    setIsRunning(true)
    setTestResults([])
    setAnimationResults([])
    setLighthouseResults(null)
    setProgress(0)

    try {
      // Run performance tests with progress tracking
      const results = await runQuickPerformanceTest()
      setTestResults(results)
      setProgress(50)

      // Run animation-specific tests
      const animationTests = await runAnimationPerformanceTest()
      setAnimationResults(animationTests)
      setProgress(75)

      // Simulate Lighthouse audit
      const lighthouse = await simulateLighthouseTest()
      setLighthouseResults(lighthouse)
      setProgress(100)

      onTestComplete?.(results)
    } catch (error) {
      console.error('Performance test failed:', error)
    } finally {
      setIsRunning(false)
      setCurrentTest('')
    }
  }

  const getCategoryData = (): TestCategory[] => {
    const categories = testResults.reduce((acc, result) => {
      const category = result.testName.split(':')[0] || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(result)
      return acc
    }, {} as Record<string, PerformanceTestResult[]>)

    return [
      {
        name: 'Animation',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        tests: categories['Animation'] || []
      },
      {
        name: 'Accessibility',
        icon: <Accessibility className="w-5 h-5" />,
        color: 'text-green-600 bg-green-50 border-green-200',
        tests: categories['Accessibility'] || []
      },
      {
        name: 'Memory',
        icon: <MemoryStick className="w-5 h-5" />,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        tests: categories['Memory'] || []
      },
      {
        name: 'Assets',
        icon: <Package className="w-5 h-5" />,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        tests: categories['Assets'] || []
      },
      {
        name: 'Responsive',
        icon: <Smartphone className="w-5 h-5" />,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        tests: categories['Responsive'] || []
      }
    ]
  }

  const getOverallScore = (): number => {
    if (testResults.length === 0) return 0
    const totalScore = testResults.reduce((sum, result) => sum + result.score, 0)
    return Math.round(totalScore / testResults.length)
  }

  const getPassRate = (): number => {
    if (testResults.length === 0) return 0
    const passedTests = testResults.filter(result => result.passed).length
    return Math.round((passedTests / testResults.length) * 100)
  }

  const TestResultCard: React.FC<{ result: PerformanceTestResult }> = ({ result }) => {
    const getStatusIcon = () => {
      if (result.passed) {
        return <CheckCircle className="w-5 h-5 text-green-500" />
      }
      return result.score > 50 ? 
        <AlertCircle className="w-5 h-5 text-yellow-500" /> : 
        <XCircle className="w-5 h-5 text-red-500" />
    }

    const getScoreColor = () => {
      if (result.score >= 90) return 'text-green-600 bg-green-50'
      if (result.score >= 70) return 'text-yellow-600 bg-yellow-50'
      return 'text-red-600 bg-red-50'
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <h4 className="font-medium text-gray-900">
              {result.testName.split(':')[1]?.trim() || result.testName}
            </h4>
          </div>
          <div className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor()}`}>
            {result.score.toFixed(0)}
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(result.details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="font-medium text-gray-900">
                {typeof value === 'number' ? value.toFixed(2) : String(value)}
              </span>
            </div>
          ))}
        </div>

        {result.recommendations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-900 mb-1">Recommendations:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    )
  }

  const AnimationTestCard: React.FC<{ test: AnimationPerformanceTest }> = ({ test }) => {
    const getFpsColor = (fps: number) => {
      if (fps >= 55) return 'text-green-600 bg-green-50'
      if (fps >= 30) return 'text-yellow-600 bg-yellow-50'
      return 'text-red-600 bg-red-50'
    }

    const getPerformanceGrade = (fps: number) => {
      if (fps >= 55) return { grade: 'A', color: 'text-green-600' }
      if (fps >= 45) return { grade: 'B', color: 'text-yellow-600' }
      if (fps >= 30) return { grade: 'C', color: 'text-orange-600' }
      return { grade: 'D', color: 'text-red-600' }
    }

    const grade = getPerformanceGrade(test.averageFps)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">{test.name}</h4>
          <div className={`text-2xl font-bold ${grade.color}`}>
            {grade.grade}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Average FPS</p>
            <div className={`text-xl font-semibold ${getFpsColor(test.averageFps).split(' ')[0]}`}>
              {test.averageFps.toFixed(1)}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dropped Frames</p>
            <div className={`text-xl font-semibold ${test.droppedFrames < 5 ? 'text-green-600' : 'text-red-600'}`}>
              {test.droppedFrames}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Min FPS:</span>
            <span className="font-medium">{test.minFps.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Max FPS:</span>
            <span className="font-medium">{test.maxFps.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Memory Usage:</span>
            <span className="font-medium">
              {((test.memoryUsage.peak - test.memoryUsage.start) / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  const LighthouseScoreCard: React.FC<{ metrics: LighthouseMetrics }> = ({ metrics }) => {
    const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-600 bg-green-50'
      if (score >= 50) return 'text-yellow-600 bg-yellow-50'
      return 'text-red-600 bg-red-50'
    }

    const getScoreGrade = (score: number) => {
      if (score >= 90) return 'A'
      if (score >= 80) return 'B'
      if (score >= 70) return 'C'
      if (score >= 60) return 'D'
      return 'F'
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Lighthouse Scores</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { name: 'Performance', score: metrics.performance },
            { name: 'Accessibility', score: metrics.accessibility },
            { name: 'Best Practices', score: metrics.bestPractices },
            { name: 'SEO', score: metrics.seo }
          ].map(({ name, score }) => (
            <div key={name} className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(score).split(' ')[0]} mb-1`}>
                {score}
              </div>
              <div className="text-sm text-gray-600">{name}</div>
              <div className={`text-xs font-medium ${getScoreColor(score)}`}>
                Grade {getScoreGrade(score)}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Core Web Vitals</h4>
          {Object.entries(metrics.metrics).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="font-medium">
                {typeof value === 'number' ? `${value.toFixed(0)} ms` : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const OverviewTab = () => {
    const categories = getCategoryData()
    const overallScore = getOverallScore()
    const passRate = getPassRate()

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-6 text-center"
          >
            <div className={`text-4xl font-bold mb-2 ${
              overallScore >= 90 ? 'text-green-600' : 
              overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {overallScore}
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
            <div className={`text-xs font-medium mt-1 ${
              overallScore >= 90 ? 'text-green-600' : 
              overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {overallScore >= 90 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Improvement'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 text-center"
          >
            <div className={`text-4xl font-bold mb-2 ${
              passRate >= 90 ? 'text-green-600' : 
              passRate >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {passRate}%
            </div>
            <div className="text-sm text-gray-600">Pass Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {testResults.filter(r => r.passed).length} of {testResults.length} tests
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-6 text-center"
          >
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {animationResults.length}
            </div>
            <div className="text-sm text-gray-600">Animation Tests</div>
            <div className="text-xs text-gray-500 mt-1">
              {animationResults.filter(t => t.averageFps >= 55).length} meeting target
            </div>
          </motion.div>
        </div>

        {/* Category Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const averageScore = category.tests.length > 0 
              ? category.tests.reduce((sum, test) => sum + test.score, 0) / category.tests.length 
              : 0
            const passedCount = category.tests.filter(test => test.passed).length

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-lg border p-4 ${category.color}`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  {category.icon}
                  <h3 className="font-medium">{category.name}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score:</span>
                    <span className="font-semibold">{averageScore.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Passed:</span>
                    <span className="font-semibold">{passedCount}/{category.tests.length}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Lighthouse Results */}
        {lighthouseResults && (
          <LighthouseScoreCard metrics={lighthouseResults} />
        )}
      </div>
    )
  }

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6" />
          <span>Performance Test Suite</span>
        </h2>
        <button
          onClick={runFullTest}
          disabled={isRunning}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isRunning 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
          <span>{isRunning ? 'Running Tests...' : 'Run Full Test Suite'}</span>
        </button>
      </div>

      {isRunning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="font-medium text-blue-900">Running performance tests...</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-blue-700 mt-2">
            Progress: {progress}%
          </div>
        </motion.div>
      )}

      {testResults.length > 0 && (
        <div>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'animations', label: 'Animations', icon: Zap },
              { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
              { id: 'performance', label: 'All Tests', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab />}
            
            {activeTab === 'animations' && (
              <motion.div
                key="animations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {animationResults.map((test, index) => (
                  <AnimationTestCard key={index} test={test} />
                ))}
              </motion.div>
            )}

            {activeTab === 'accessibility' && (
              <motion.div
                key="accessibility"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {testResults
                  .filter(result => result.testName.startsWith('Accessibility:'))
                  .map((result, index) => (
                    <TestResultCard key={index} result={result} />
                  ))}
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {testResults.map((result, index) => (
                  <TestResultCard key={index} result={result} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default PerformanceTestRunner