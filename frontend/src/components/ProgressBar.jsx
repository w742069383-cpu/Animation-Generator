/**
 * 生成进度条组件
 */
import React from 'react'

const STAGE_LABELS = {
  pending: '等待处理',
  parsing: '解析文字',
  generating_images: '生成 AI 图片',
  synthesizing_voice: '合成语音',
  composing_video: '合成视频',
  completed: '生成完成',
  failed: '生成失败',
}

const STAGE_EMOJIS = {
  pending: '⏳',
  parsing: '📝',
  generating_images: '🎨',
  synthesizing_voice: '🎤',
  composing_video: '🎬',
  completed: '✅',
  failed: '❌',
}

const STAGES = ['parsing', 'generating_images', 'synthesizing_voice', 'composing_video', 'completed']

export default function ProgressBar({ taskProgress }) {
  if (!taskProgress) return null

  const { status, progress, message } = taskProgress
  const isCompleted = status === 'completed'
  const isFailed = status === 'failed'
  const isActive = !isCompleted && !isFailed && status !== 'pending'

  const currentStageIndex = STAGES.indexOf(status)

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          {STAGE_EMOJIS[status] || '⏳'} {STAGE_LABELS[status] || '处理中'}
        </h2>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            isCompleted
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : isFailed
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}
        >
          {progress}%
        </span>
      </div>

      {/* 进度条 */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : isFailed
                ? 'bg-gradient-to-r from-red-400 to-rose-500'
                : 'progress-bar-animated'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 阶段步骤指示器 */}
      <div className="flex items-center justify-between mb-4">
        {STAGES.slice(0, 4).map((stage, index) => {
          const isStageCompleted =
            isCompleted || currentStageIndex > index || (currentStageIndex === index && progress >= 95)
          const isCurrentStage = !isCompleted && !isFailed && currentStageIndex === index

          return (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${
                      isStageCompleted
                        ? 'bg-green-500 text-white shadow-md'
                        : isCurrentStage
                        ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-200 dark:ring-blue-900'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                >
                  {isStageCompleted ? '✓' : index + 1}
                </div>
                <span className="text-xs mt-1 text-gray-500 dark:text-gray-400 text-center hidden sm:block max-w-16">
                  {STAGE_LABELS[stage]}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded transition-all ${
                    currentStageIndex > index || isCompleted
                      ? 'bg-green-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* 当前消息 */}
      {message && (
        <div
          className={`text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 ${
            isCompleted
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : isFailed
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          }`}
        >
          {isActive && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full spinner flex-shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* 错误信息 */}
      {isFailed && taskProgress.error && (
        <div className="mt-2 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-lg">
          错误详情: {taskProgress.error}
        </div>
      )}
    </div>
  )
}
