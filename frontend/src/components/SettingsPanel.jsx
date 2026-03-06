/**
 * 视频设置面板组件
 */
import React from 'react'

const VOICE_OPTIONS = [
  { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓（普通话女声）', flag: '🇨🇳' },
  { value: 'zh-CN-YunxiNeural', label: '云希（普通话男声）', flag: '🇨🇳' },
  { value: 'en-US-JennyNeural', label: 'Jenny（英语女声）', flag: '🇺🇸' },
  { value: 'en-US-GuyNeural', label: 'Guy（英语男声）', flag: '🇺🇸' },
]

const RESOLUTION_OPTIONS = [
  { value: '720p', label: '720p HD', desc: '1280×720' },
  { value: '1080p', label: '1080p Full HD', desc: '1920×1080' },
]

const ART_STYLE_OPTIONS = [
  { value: 'realistic', label: '写实风格', emoji: '📷' },
  { value: 'anime', label: '动漫风格', emoji: '🎨' },
  { value: 'watercolor', label: '水彩风格', emoji: '🖌️' },
]

const DURATION_OPTIONS = [3, 4, 5, 6, 7, 8, 10]

export default function SettingsPanel({ settings, onChange, disabled }) {
  const handleChange = (key, value) => {
    if (!disabled) {
      onChange({ ...settings, [key]: value })
    }
  }

  return (
    <div className="card p-6">
      <h2 className="section-title">⚙️ 视频设置</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* 语音选择 */}
        <div>
          <label className="label">🎤 语音选择</label>
          <select
            value={settings.voice}
            onChange={(e) => handleChange('voice', e.target.value)}
            disabled={disabled}
            className="select-field"
          >
            {VOICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 视频分辨率 */}
        <div>
          <label className="label">📺 视频分辨率</label>
          <div className="flex gap-2">
            {RESOLUTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('resolution', opt.value)}
                disabled={disabled}
                className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all
                  ${
                    settings.resolution === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-bold">{opt.label}</div>
                <div className="text-xs opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI 画风 */}
        <div>
          <label className="label">🎭 AI 画风</label>
          <div className="flex gap-2">
            {ART_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('art_style', opt.value)}
                disabled={disabled}
                className={`flex-1 py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all
                  ${
                    settings.art_style === opt.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-lg mb-0.5">{opt.emoji}</div>
                <div>{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 每场景时长 */}
        <div>
          <label className="label">
            ⏱️ 每场景时长
            <span className="text-blue-500 dark:text-blue-400 ml-1 font-bold">
              {settings.duration_per_scene}秒
            </span>
          </label>
          <input
            type="range"
            min="3"
            max="15"
            step="1"
            value={settings.duration_per_scene}
            onChange={(e) => handleChange('duration_per_scene', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer
                       accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3秒</span>
            <span>9秒</span>
            <span>15秒</span>
          </div>
        </div>
      </div>
    </div>
  )
}
