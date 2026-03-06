/**
 * 视频预览与下载组件
 */
import React, { useRef } from 'react'
import { getVideoDownloadUrl, getVideoPreviewUrl } from '../services/api'

export default function VideoPreview({ videoId, videoInfo }) {
  const videoRef = useRef(null)

  if (!videoId) return null

  const previewUrl = getVideoPreviewUrl(videoId)
  const downloadUrl = getVideoDownloadUrl(videoId)

  const formatFileSize = (bytes) => {
    if (!bytes) return '未知'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '未知'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    if (mins > 0) return `${mins}分${secs}秒`
    return `${secs}秒`
  }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">🎬 视频预览</h2>
        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          生成成功
        </div>
      </div>

      {/* 视频播放器 */}
      <div className="video-container rounded-xl overflow-hidden bg-black mb-4 shadow-lg">
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full"
          src={previewUrl}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        >
          您的浏览器不支持 HTML5 视频播放
        </video>
      </div>

      {/* 视频信息 */}
      {videoInfo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: '视频标题', value: videoInfo.title || '—', span: 'col-span-2' },
            { label: '分辨率', value: videoInfo.resolution || '—' },
            { label: '时长', value: formatDuration(videoInfo.duration) },
            { label: '文件大小', value: formatFileSize(videoInfo.file_size) },
            { label: '创建时间', value: videoInfo.created_at || '—' },
          ].map(({ label, value, span }) => (
            <div
              key={label}
              className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 ${span || ''}`}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 下载按钮 */}
      <a
        href={downloadUrl}
        download={`${videoId}.mp4`}
        className="btn-primary inline-flex items-center gap-2 w-full justify-center no-underline"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        下载视频 (MP4)
      </a>
    </div>
  )
}
