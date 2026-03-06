/**
 * 历史记录列表组件
 */
import React, { useState, useEffect } from 'react'
import { listVideos, getVideoDownloadUrl } from '../services/api'

export default function HistoryList({ refreshTrigger }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [refreshTrigger])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const data = await listVideos()
      setVideos(data)
    } catch (error) {
      console.error('获取历史视频失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, '0')}`
    return `0:${secs.toString().padStart(2, '0')}`
  }

  if (videos.length === 0 && !loading) {
    return null
  }

  const displayVideos = expanded ? videos : videos.slice(0, 3)

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          📚 历史记录
          {videos.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({videos.length} 个视频)
            </span>
          )}
        </h2>
        <button
          onClick={fetchVideos}
          disabled={loading}
          className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 
                     flex items-center gap-1 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          刷新
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full spinner" />
        </div>
      ) : (
        <div className="space-y-3">
          {displayVideos.map((video) => (
            <div
              key={video.video_id}
              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* 视频缩略图占位 */}
              <div className="w-16 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-lg shadow-sm">
                🎬
              </div>

              {/* 视频信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {video.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {video.created_at}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {video.resolution}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDuration(video.duration)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatFileSize(video.file_size)}
                  </span>
                </div>
              </div>

              {/* 下载按钮 */}
              <a
                href={getVideoDownloadUrl(video.video_id)}
                download={`${video.video_id}.mp4`}
                className="flex-shrink-0 p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
                           bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40
                           rounded-lg transition-colors"
                title="下载视频"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            </div>
          ))}

          {/* 展开/收起按钮 */}
          {videos.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                         py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
            >
              {expanded ? '▲ 收起' : `▼ 查看全部 ${videos.length} 个视频`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
