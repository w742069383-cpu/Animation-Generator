/**
 * 文字输入区域组件
 */
import React from 'react'

const EXAMPLE_TEXTS = [
  '在一个宁静的秋日午后，金黄的树叶缓缓飘落。远处的山峦在薄雾中若隐若现，溪流潺潺，鸟鸣声声，一切都显得那么祥和美好。',
  'Once upon a time, in a magical forest filled with ancient trees and mystical creatures, a young adventurer discovered a hidden path leading to an enchanted waterfall.',
  '春天来了，万物复苏。樱花盛开，花瓣随风飘舞，如同粉色的雪花漫天飞舞。孩子们在花树下嬉戏玩耍，欢声笑语回荡在空气中。',
]

export default function TextInput({ value, onChange, disabled }) {
  const charCount = value.length
  const maxChars = 5000
  const isOverLimit = charCount > maxChars

  const handleExampleClick = (text) => {
    if (!disabled) {
      onChange(text)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">📝 输入文字内容</h2>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            isOverLimit
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : charCount > maxChars * 0.8
              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {charCount.toLocaleString()} / {maxChars.toLocaleString()}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="请输入您想转换为视频的文字内容...&#10;&#10;支持中英文，系统会自动将文字分割成多个场景，每个场景生成对应的 AI 画面和语音旁白。"
        className={`input-field resize-none h-40 leading-relaxed ${
          isOverLimit ? 'border-red-400 focus:ring-red-400' : ''
        }`}
      />

      {/* 示例文字 */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">💡 快速示例：</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_TEXTS.map((text, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(text)}
              disabled={disabled}
              className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 
                         rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         border border-blue-200 dark:border-blue-800 truncate max-w-xs"
              title={text}
            >
              示例 {i + 1}: {text.slice(0, 20)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
