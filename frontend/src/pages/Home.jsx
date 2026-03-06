/**
 * 主页面组件
 */
import React, { useState, useEffect, useRef } from 'react'
import TextInput from '../components/TextInput'
import SettingsPanel from '../components/SettingsPanel'
import ProgressBar from '../components/ProgressBar'
import VideoPreview from '../components/VideoPreview'
import HistoryList from '../components/HistoryList'
import { generateVideo, getTaskStatus, listVideos } from '../services/api'

const DEFAULT_SETTINGS = {
  voice: 'zh-CN-XiaoxiaoNeural',
  resolution: '720p',
  art_style: 'realistic',
  duration_per_scene: 5,
}

const POLL_INTERVAL = 2000 // 每 2 秒查询一次进度

export default function Home() {
  const [text, setText] = useState('')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [isGenerating, setIsGenerating] = useState(false)
  const [taskId, setTaskId] = useState(null)
  const [taskProgress, setTaskProgress] = useState(null)
  const [completedVideoId, setCompletedVideoId] = useState(null)
  const [completedVideoInfo, setCompletedVideoInfo] = useState(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [error, setError] = useState('')

  const pollRef = useRef(null)

  // 开始轮询任务状态
  useEffect(() => {
    if (!taskId || !isGenerating) return

    const poll = async () => {
      try {
        const progress = await getTaskStatus(taskId)
        setTaskProgress(progress)

        if (progress.status === 'completed') {
          setIsGenerating(false)
          setCompletedVideoId(progress.video_id)
          setHistoryRefresh((n) => n + 1)
          clearInterval(pollRef.current)
        } else if (progress.status === 'failed') {
          setIsGenerating(false)
          setError(progress.error || '视频生成失败，请重试')
          clearInterval(pollRef.current)
        }
      } catch (err) {
        console.error('查询进度失败:', err)
      }
    }

    pollRef.current = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [taskId, isGenerating])

  // 获取已完成视频的详细信息
  useEffect(() => {
    if (!completedVideoId) return
    listVideos().then((videos) => {
      const video = videos.find((v) => v.video_id === completedVideoId)
      if (video) setCompletedVideoInfo(video)
    })
  }, [completedVideoId, historyRefresh])

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('请输入文字内容')
      return
    }
    if (text.length > 5000) {
      setError('文字内容不能超过 5000 字')
      return
    }

    setError('')
    setIsGenerating(true)
    setTaskProgress(null)
    setCompletedVideoId(null)
    setCompletedVideoInfo(null)

    try {
      const result = await generateVideo({
        text: text.trim(),
        voice: settings.voice,
        resolution: settings.resolution,
        art_style: settings.art_style,
        duration_per_scene: settings.duration_per_scene,
      })
      setTaskId(result.task_id)
    } catch (err) {
      setIsGenerating(false)
      const msg = err.response?.data?.detail || err.message || '提交失败，请检查后端服务是否启动'
      setError(msg)
    }
  }

  const handleReset = () => {
    setIsGenerating(false)
    setTaskId(null)
    setTaskProgress(null)
    setError('')
    clearInterval(pollRef.current)
  }

  const isTextValid = text.trim().length > 0 && text.length <= 5000

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* 欢迎横幅 */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          <span className="gradient-text">AI 文字转视频</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
          输入任意文字，自动生成带 AI 画面、语音旁白和字幕的精美视频
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-400 dark:text-gray-500">
          <span>🎨 AI 图片生成</span>
          <span>🎤 语音合成</span>
          <span>🎬 视频合成</span>
          <span>📥 一键下载</span>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="space-y-5">
        {/* 文字输入 */}
        <TextInput value={text} onChange={setText} disabled={isGenerating} />

        {/* 设置面板 */}
        <SettingsPanel settings={settings} onChange={setSettings} disabled={isGenerating} />

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                          text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* 生成按钮 */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !isTextValid}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-base"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                生成中...
              </>
            ) : (
              <>
                <span>🚀</span>
                开始生成视频
              </>
            )}
          </button>

          {isGenerating && (
            <button
              onClick={handleReset}
              className="btn-secondary px-4"
              title="取消生成"
            >
              ✕ 取消
            </button>
          )}
        </div>

        {/* 进度展示 */}
        {taskProgress && <ProgressBar taskProgress={taskProgress} />}

        {/* 视频预览 */}
        {completedVideoId && (
          <VideoPreview videoId={completedVideoId} videoInfo={completedVideoInfo} />
        )}

        {/* 历史记录 */}
        <HistoryList refreshTrigger={historyRefresh} />
      </div>

      {/* 底部说明 */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          💡 无 OpenAI API Key 时自动降级：使用渐变背景图片 + edge-tts 语音合成
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Powered by FastAPI · React · edge-tts · MoviePy
        </p>
      </div>
    </main>
  )
}
