/**
 * API 调用服务
 * 封装所有后端接口调用
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
})

/**
 * 提交视频生成任务
 * @param {Object} params 生成参数
 * @returns {Promise<{task_id: string}>}
 */
export async function generateVideo(params) {
  const { data } = await api.post('/generate', params)
  return data
}

/**
 * 查询任务进度
 * @param {string} taskId 任务 ID
 * @returns {Promise<TaskProgress>}
 */
export async function getTaskStatus(taskId) {
  const { data } = await api.get(`/status/${taskId}`)
  return data
}

/**
 * 获取历史视频列表
 * @returns {Promise<VideoInfo[]>}
 */
export async function listVideos() {
  const { data } = await api.get('/videos')
  return data
}

/**
 * 获取可用语音列表
 * @returns {Promise<VoiceInfo[]>}
 */
export async function getVoices() {
  const { data } = await api.get('/voices')
  return data
}

/**
 * 获取视频下载 URL
 * @param {string} videoId
 * @returns {string}
 */
export function getVideoDownloadUrl(videoId) {
  return `${API_BASE}/videos/${videoId}/download`
}

/**
 * 获取视频预览 URL（通过静态文件服务）
 * @param {string} videoId
 * @returns {string}
 */
export function getVideoPreviewUrl(videoId) {
  return `/outputs/${videoId}.mp4`
}

export default api
