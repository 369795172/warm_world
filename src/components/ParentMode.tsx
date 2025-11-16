import React, { useState } from 'react'
import { useAppStore, getDominantInterests, getInterestLabel, formatPlayTime } from '../store/appStore'
import { Heart, BarChart3, Lightbulb, Settings, ArrowLeft, Clock, TrendingUp, Baby } from 'lucide-react'
import NavigationBar from './NavigationBar'

const ParentMode: React.FC = () => {
  const { 
    childProfile, 
    settings, 
    updateSettings 
  } = useAppStore()
  
  const [activeTab, setActiveTab] = useState<'snapshot' | 'suggestions' | 'settings'>('snapshot')
  const dominantInterests = getDominantInterests(childProfile.interests)

  const getRecentBehaviors = (days: number = 7) => {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    return childProfile.behaviors.filter(b => b.timestamp > cutoff)
  }

  const getBehaviorStats = () => {
    const recentBehaviors = getRecentBehaviors()
    const totalSessions = childProfile.sessionCount
    const avgSessionTime = totalSessions > 0 ? childProfile.totalPlayTime / totalSessions : 0
    
    const shareCount = recentBehaviors.filter(b => b.action === 'share').length
    const helpCount = recentBehaviors.filter(b => b.action === 'help').length
    const careCount = recentBehaviors.filter(b => b.action === 'care').length
    
    return {
      totalSessions,
      avgSessionTime,
      shareCount,
      helpCount,
      careCount,
      totalPositiveBehaviors: shareCount + helpCount + careCount
    }
  }

  const getPlaySuggestions = () => {
    const suggestions = []
    
    if (dominantInterests.length > 0) {
      const topInterest = dominantInterests[0].category
      
      switch (topInterest) {
        case 'music':
          suggestions.push({
            title: '音乐探索',
            description: '这几天宝宝很喜欢音乐，可以一起制作简单的打击乐器，比如用筷子和碗做鼓。',
            activity: '家庭音乐会'
          })
          break
        case 'hands_on':
          suggestions.push({
            title: '动手创作',
            description: '宝宝表现出对动手活动的兴趣，可以一起玩积木、拼图或者做手工。',
            activity: '创意手工时间'
          })
          break
        case 'care':
          suggestions.push({
            title: '照顾体验',
            description: '宝宝喜欢照顾和关怀，可以一起照顾家里的植物或宠物，培养责任感。',
            activity: '小小护理员'
          })
          break
        case 'social':
          suggestions.push({
            title: '社交互动',
            description: '宝宝喜欢与人互动，可以安排与其他小朋友的游戏时间，或者角色扮演游戏。',
            activity: '朋友聚会'
          })
          break
        case 'exploration':
          suggestions.push({
            title: '探索发现',
            description: '宝宝充满好奇心，可以到公园探索自然，观察小动物和植物。',
            activity: '自然探索之旅'
          })
          break
      }
    }

    // General suggestions
    suggestions.push({
      title: '日常分享',
      description: '在日常生活中多鼓励宝宝分享玩具和食物，强化分享带来的快乐体验。',
      activity: '分享时刻'
    })

    suggestions.push({
      title: '情感表达',
      description: '通过绘本、歌曲等方式帮助宝宝理解和表达不同的情感。',
      activity: '情感小课堂'
    })

    return suggestions
  }

  const stats = getBehaviorStats()
  const suggestions = getPlaySuggestions()

  const renderSnapshot = () => (
    <div className="space-y-6">
      {/* Child Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{childProfile.name}</h3>
            <p className="text-gray-600">{childProfile.age}岁</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600">总游戏时间</p>
            <p className="font-bold text-blue-600">{formatPlayTime(childProfile.totalPlayTime)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-gray-600">游戏次数</p>
            <p className="font-bold text-green-600">{stats.totalSessions}次</p>
          </div>
        </div>
      </div>

      {/* Interest Analysis */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          兴趣偏好
        </h3>
        
        {dominantInterests.length > 0 ? (
          <div className="space-y-3">
            {dominantInterests.map((interest, index) => (
              <div key={interest.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="font-medium">{getInterestLabel(interest.category)}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(interest.score * 20, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{Math.round(interest.score)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">让宝宝多玩一会儿，我们就能了解TA的兴趣了</p>
        )}
      </div>

      {/* Behavior Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          最近7天行为统计
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-pink-50 rounded-xl">
            <div className="text-2xl font-bold text-pink-600">{stats.shareCount}</div>
            <div className="text-sm text-gray-600">分享行为</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{stats.helpCount}</div>
            <div className="text-sm text-gray-600">帮助行为</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{stats.careCount}</div>
            <div className="text-sm text-gray-600">照顾行为</div>
          </div>
        </div>
        
        {stats.totalPositiveBehaviors > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
            <p className="text-sm text-gray-700">
              🎉 宝宝展现了 <strong>{stats.totalPositiveBehaviors}</strong> 次积极行为！
              太棒了！
            </p>
          </div>
        )}
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          游戏习惯
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">平均游戏时长</span>
            <span className="font-medium">{formatPlayTime(stats.avgSessionTime)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">上次游戏</span>
            <span className="font-medium">
              {childProfile.lastSessionEnd 
                ? new Date(childProfile.lastSessionEnd).toLocaleDateString()
                : '暂无记录'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSuggestions = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          个性化建议
        </h3>
        <p className="text-gray-600 text-sm">
          基于宝宝在游戏中的表现，我们为您推荐以下共玩活动：
        </p>
      </div>

      {suggestions.map((suggestion, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
          <h4 className="text-lg font-bold text-gray-800 mb-2">{suggestion.title}</h4>
          <p className="text-gray-600 mb-3">{suggestion.description}</p>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-sm font-medium text-blue-800">💡 建议活动：{suggestion.activity}</p>
          </div>
        </div>
      ))}

      <div className="bg-yellow-50 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-yellow-500" />
          通用建议
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• 保持每天的游戏时间在建议范围内（10-15分钟）</li>
          <li>• 与宝宝一起玩游戏，增强亲子互动</li>
          <li>• 鼓励宝宝在现实世界中实践游戏中的积极行为</li>
          <li>• 定期查看成长快照，了解宝宝的发展变化</li>
          <li>• 如果宝宝对某个场景特别感兴趣，可以在现实中创造类似体验</li>
        </ul>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          应用设置
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              每日游戏时间限制（分钟）
            </label>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map(time => (
                <button
                  key={time}
                  onClick={() => updateSettings({ dailyTimeLimit: time })}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    settings.dailyTimeLimit === time
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}分钟
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700">声音效果</span>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                settings.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700">振动反馈</span>
            <button
              onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                settings.vibrationEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-3">数据管理</h4>
        <p className="text-sm text-gray-600 mb-4">
          所有数据都保存在本地设备上，不会上传到服务器。
        </p>
        <button className="bg-red-500 text-white font-medium py-2 px-4 rounded-xl hover:bg-red-600 transition-colors">
          清除所有数据
        </button>
      </div>
    </div>
  )

  const handleBackToGame = () => {
    updateSettings({ parentMode: false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Navigation Bar */}
      <NavigationBar 
        title="家长模式"
        showHomeButton={false} // 在家长模式中隐藏主页按钮，因为我们有专门的返回按钮
        showSettingsButton={false} // 已经在家长模式中了，不需要再显示设置按钮
        showBackButton={true}
        onBack={handleBackToGame}
      />
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 mt-16">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">家长模式</h1>
            <p className="text-gray-600">了解宝宝的成长轨迹</p>
          </div>
          <button
            onClick={handleBackToGame}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回宝宝模式
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('snapshot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'snapshot'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            成长快照
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'suggestions'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            共玩建议
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'settings'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            设置
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'snapshot' && renderSnapshot()}
        {activeTab === 'suggestions' && renderSuggestions()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  )
}

export default ParentMode