import {
    ArrowLeft,
    Cat,
    Check,
    ExternalLink,
    Key,
    RefreshCw,
    X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../App'

export default function OAuth() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [authUrl, setAuthUrl] = useState('')
  const [callbackUrl, setCallbackUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isDonate, setIsDonate] = useState(true)
  const [forceDonate, setForceDonate] = useState(false)
  
  // 获取强制捐赠配置
  useEffect(() => {
    api.get('/api/manage/public-config').then(res => {
      if (res.data.force_donate) {
        setForceDonate(true)
        setIsDonate(true)
      }
    }).catch(() => {})
  }, [])
  
  // 引导流程状态
  const [showGuide, setShowGuide] = useState(false)
  const [countdown, setCountdown] = useState(8)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizPassed, setQuizPassed] = useState(false)
  

  // 倒计时效果
  useEffect(() => {
    if (showGuide && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [showGuide, countdown])

  const getAuthUrl = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await api.get('/api/oauth/auth-url', {
        params: { get_all_projects: false }
      })
      setAuthUrl(res.data.auth_url)
      // 显示引导弹窗
      setShowGuide(true)
      setCountdown(8)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || '获取认证链接失败' })
    } finally {
      setLoading(false)
    }
  }

  const handleQuizAnswer = (correct) => {
    if (correct) {
      setQuizPassed(true)
      setShowQuiz(false)
      // 打开认证链接
      if (authUrl) {
        window.open(authUrl, '_blank')
      }
    } else {
      setMessage({ type: 'error', text: '❌ 答案错误，请仔细阅读操作指引！' })
    }
  }

  const handleGuideConfirm = () => {
    setShowGuide(false)
    setShowQuiz(true)
  }

  const submitCallbackUrl = async () => {
    if (!callbackUrl.trim()) return
    setSubmitting(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await api.post('/api/oauth/from-callback-url', {
        callback_url: callbackUrl,
        is_public: isDonate  // 是否捐赠到公共池
      })
      const donateText = res.data.is_public ? '（已上传到公共池 🎉）' : '（私有凭证）'
      setMessage({ type: 'success', text: `凭证获取成功！邮箱: ${res.data.email} ${donateText}` })
      setCallbackUrl('')
    } catch (err) {
      console.error('OAuth错误:', JSON.stringify(err.response?.data, null, 2))
      const detail = err.response?.data?.detail
      const errorText = typeof detail === 'string' ? detail : JSON.stringify(detail) || '获取凭证失败'
      setMessage({ type: 'error', text: errorText })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* 操作指引弹窗 */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-md w-full p-6 border border-dark-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">⚠️ 操作指引</h3>
              <button onClick={() => setShowGuide(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>接下来将跳转到 Google 登录界面，请完成登录和授权。</p>
              
              <p>
                授权后，浏览器会打开一个以 <span className="text-purple-400 font-mono">localhost</span> 开头的页面，该页面显示<span className="text-red-400 font-bold">无法访问是正常现象</span>。
              </p>
              
              <p className="text-amber-300 font-medium">
                您需要做的就是：<span className="text-white">将那个无法访问的页面的网址完整复制下来</span>，然后回到本页面，粘贴到"步骤2"的输入框中。
              </p>
            </div>
            
            <button
              onClick={handleGuideConfirm}
              disabled={countdown > 0}
              className={`w-full mt-6 py-3 rounded-lg font-medium transition-all ${
                countdown > 0 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {countdown > 0 ? `请仔细阅读... (${countdown})` : '我已了解，继续'}
            </button>
          </div>
        </div>
      )}

      {/* 快速问答弹窗 */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-md w-full p-6 border border-cyan-500/50">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">📝 快速问答</h3>
            
            <p className="text-gray-300 mb-6">
              当你完成登录 Google 账号后，发现浏览器打开了一个无法访问的页面，你应该怎么做？
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleQuizAnswer(true)}
                className="w-full p-4 text-left rounded-lg border border-dark-500 hover:border-gray-500 hover:bg-dark-700 text-gray-300 transition-colors"
              >
                完整复制该网页链接并回到此页面粘贴
              </button>
              <button
                onClick={() => handleQuizAnswer(false)}
                className="w-full p-4 text-left rounded-lg border border-dark-500 hover:border-gray-500 hover:bg-dark-700 text-gray-300 transition-colors"
              >
                到公益站帖子下求助
              </button>
              <button
                onClick={() => handleQuizAnswer(false)}
                className="w-full p-4 text-left rounded-lg border border-dark-500 hover:border-gray-500 hover:bg-dark-700 text-gray-300 transition-colors"
              >
                刷新页面尝试访问
              </button>
              <button
                onClick={() => handleQuizAnswer(false)}
                className="w-full p-4 text-left rounded-lg border border-dark-500 hover:border-gray-500 hover:bg-dark-700 text-gray-300 transition-colors"
              >
                尝试重新开始认证流程
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导航栏 */}
      <nav className="bg-dark-900 border-b border-dark-700">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cat className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold">Catiecli</span>
            <span className="text-sm text-gray-500 bg-dark-700 px-2 py-0.5 rounded">OAuth认证</span>
          </div>
          <Link to="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft size={20} />
            返回
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 消息提示 */}
        {message.text && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* 步骤 1: 登录并授权 */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">1</span>
            登录并授权
          </h2>
          
          <button
            onClick={getAuthUrl}
            disabled={loading}
            className="w-full btn btn-primary py-4 text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <ExternalLink size={20} />
            )}
            登录 Google 账号
          </button>
          
          {quizPassed && (
            <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
              <Check size={16} />
              已通过验证，认证页面已在新窗口打开
            </div>
          )}
        </div>

        {/* 步骤 2: 粘贴回调 URL */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center">2</span>
            粘贴回调 URL
          </h2>
          
          <p className="text-gray-400 text-sm mb-4">
            请在完成Google授权后，从打开的显示<span className="text-red-400">无法访问</span>的页面的地址栏中<span className="text-amber-400 font-medium">完整复制整个网址</span>并粘贴到下方。
          </p>
          
          <input
            type="text"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
            placeholder="在此处粘贴从浏览器地址栏复制的完整网址"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500"
          />
        </div>

        {/* 步骤 3: 提交并生成凭证 */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-green-600 text-white text-sm flex items-center justify-center">3</span>
            提交并生成凭证
          </h2>
          
          {/* 捐赠选项 - 强制捐赠时隐藏 */}
          {!forceDonate && (
            <label className="flex items-start gap-3 p-4 mb-4 bg-purple-500/10 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors">
              <input
                type="checkbox"
                checked={isDonate}
                onChange={(e) => setIsDonate(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <div className="text-purple-400 font-medium">🎁 上传到公共池（推荐）</div>
                <p className="text-purple-300/70 text-sm mt-1">
                  上传后可使用所有公共凭证，还能获得额度奖励！
                </p>
              </div>
            </label>
          )}

          <button
            onClick={submitCallbackUrl}
            disabled={submitting || !callbackUrl.trim()}
            className="w-full btn bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <Key size={18} />
            )}
            提交并生成凭证
          </button>
        </div>
      </div>
    </div>
  )
}
