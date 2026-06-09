import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, Heart, Users, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

const ROLES: { key: UserRole; label: string; icon: React.ReactNode }[] = [
  { key: 'DOCTOR', label: '医生', icon: <Stethoscope size={18} /> },
  { key: 'CAREGIVER', label: '护工', icon: <Heart size={18} /> },
  { key: 'FAMILY', label: '家属', icon: <Users size={18} /> },
  { key: 'ADMIN', label: '管理员', icon: <ShieldCheck size={18} /> },
]

const DEMO_ACCOUNTS: Record<UserRole, { username: string; password: string }> = {
  DOCTOR: { username: 'doctor1', password: 'doc123' },
  CAREGIVER: { username: 'caregiver1', password: 'care123' },
  FAMILY: { username: 'family1', password: 'fam123' },
  ADMIN: { username: 'admin', password: 'admin123' },
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('DOCTOR')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    const demo = DEMO_ACCOUNTS[role]
    setUsername(demo.username)
    setPassword(demo.password)
    clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      // error is handled in store
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-2xl mb-4">
              <Heart size={32} className="text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">护理评估平台</h1>
            <p className="text-sm text-slate-500 mt-2">养老院护理评估与管理系统</p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => handleRoleSelect(role.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  selectedRole === role.key
                    ? 'bg-primary-50 border-2 border-primary-500 text-primary-700'
                    : 'bg-slate-50 border-2 border-transparent text-slate-500 hover:bg-slate-100'
                }`}
              >
                {role.icon}
                <span className="text-xs font-medium">{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                '登 录'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            点击角色标签可自动填充演示账号
          </p>
        </div>
      </div>
    </div>
  )
}
