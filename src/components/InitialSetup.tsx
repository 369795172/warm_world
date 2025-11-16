import React, { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Heart, Sparkles, Baby } from 'lucide-react'

const InitialSetup: React.FC = () => {
  const { initializeChild, updateSettings } = useAppStore()
  const [step, setStep] = useState<'welcome' | 'setup' | 'complete'>('welcome')
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState<number>(3)
  const [parentName, setParentName] = useState('')

  const handleWelcomeContinue = () => {
    setStep('setup')
  }

  const handleSetupComplete = () => {
    if (childName.trim()) {
      initializeChild(childName.trim(), childAge)
      setStep('complete')
      
      // Auto-switch to child mode after 2 seconds
      setTimeout(() => {
        updateSettings({ parentMode: false })
      }, 2000)
    }
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎来到</h1>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              价值之旅 · 小小世界
            </h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>温柔安全的世界</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Baby className="w-5 h-5 text-blue-500" />
              <span>专为2-4岁宝宝设计</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>兴趣驱动的探索</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              这是一个充满温柔和爱的世界，
              宝宝可以在这里安全地探索、分享和学习。
              让我们一起开始这段美好的旅程吧！
            </p>
          </div>

          <button
            onClick={handleWelcomeContinue}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            开始设置
          </button>
        </div>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Baby className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">宝宝信息设置</h2>
            <p className="text-gray-600">让我们更好地了解宝宝</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                宝宝的名字
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="请输入宝宝的名字"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                宝宝的年龄
              </label>
              <div className="flex gap-3">
                {[2, 3, 4].map(age => (
                  <button
                    key={age}
                    onClick={() => setChildAge(age)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      childAge === age
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {age}岁
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                家长的名字（可选）
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="请输入您的名字"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-yellow-500" />
              给家长的小贴士
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 建议和宝宝一起探索这个世界</li>
              <li>• 每天使用时间控制在10-15分钟内</li>
              <li>• 观察宝宝在不同场景中的偏好</li>
              <li>• 将虚拟世界的体验延伸到现实生活</li>
            </ul>
          </div>

          <button
            onClick={handleSetupComplete}
            disabled={!childName.trim()}
            className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
              childName.trim()
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            开始探索世界
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">设置完成！</h2>
          <p className="text-lg text-gray-600">
            欢迎 <span className="font-bold text-blue-600">{childName}</span> 来到小小世界！
          </p>
        </div>

        <div className="bg-green-50 rounded-2xl p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            世界正在准备中...
            <br />
            让我们一起开始这段美好的探索之旅吧！
          </p>
        </div>

        <div className="animate-pulse">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">正在进入宝宝模式...</p>
        </div>
      </div>
    </div>
  )
}

export default InitialSetup