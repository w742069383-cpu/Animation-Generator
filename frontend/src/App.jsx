/**
 * 根组件 - 深色/浅色主题管理
 */
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import './App.css'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // 从 localStorage 读取主题偏好
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    // 跟随系统主题
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // 更新 HTML 根元素的 dark 类
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const toggleDark = () => setDarkMode((prev) => !prev)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <Header darkMode={darkMode} onToggleDark={toggleDark} />
      <Home />
    </div>
  )
}
