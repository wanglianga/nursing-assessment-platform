import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardCheck, AlertTriangle,
  Receipt, Heart, FileText, CalendarDays, MessageSquare,
  ChevronLeft, ChevronRight, LogOut, Home
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  icon: React.ReactNode
  path: string
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: '仪表盘', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: '老人档案', icon: <Users size={20} />, path: '/elders' },
    { label: '风险事件', icon: <AlertTriangle size={20} />, path: '/risk-events' },
    { label: '费用结算', icon: <Receipt size={20} />, path: '/billing' },
  ],
  DOCTOR: [
    { label: '仪表盘', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: '老人档案', icon: <Users size={20} />, path: '/elders' },
    { label: '等级复评', icon: <ClipboardCheck size={20} />, path: '/reassessment' },
    { label: '风险事件', icon: <AlertTriangle size={20} />, path: '/risk-events' },
  ],
  CAREGIVER: [
    { label: '仪表盘', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: '日常护理', icon: <Heart size={20} />, path: '/daily-care' },
    { label: '风险事件', icon: <AlertTriangle size={20} />, path: '/risk-events' },
  ],
  FAMILY: [
    { label: '服务记录', icon: <FileText size={20} />, path: '/family/records' },
    { label: '请假外出', icon: <CalendarDays size={20} />, path: '/family/leave' },
    { label: '费用预估', icon: <Receipt size={20} />, path: '/family/billing' },
    { label: '投诉建议', icon: <MessageSquare size={20} />, path: '/family/complaints' },
  ],
}

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/elders': '老人档案',
  '/elders/new': '新增老人',
  '/risk-events': '风险事件',
  '/billing': '费用结算',
  '/reassessment': '等级复评',
  '/daily-care': '日常护理',
  '/family/records': '服务记录',
  '/family/leave': '请假外出',
  '/family/billing': '费用预估',
  '/family/complaints': '投诉建议',
}

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; path: string }[] = [{ label: '首页', path: '/' }]
  let currentPath = ''
  for (const part of parts) {
    currentPath += `/${part}`
    const label = BREADCRUMB_MAP[currentPath] || part
    crumbs.push({ label, path: currentPath })
  }
  return crumbs
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const role = user?.role || 'ADMIN'
  const navItems = NAV_ITEMS[role]
  const breadcrumbs = getBreadcrumbs(location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-60'
        } bg-primary-800 text-white flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700">
          {!collapsed && (
            <span className="text-lg font-bold tracking-wide">护理评估平台</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              {item.icon}
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-primary-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-200 hover:bg-primary-700 hover:text-white transition-colors w-full"
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">退出登录</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Home size={14} className="text-slate-400" />
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-300">/</span>}
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? 'text-slate-800 font-medium'
                      : 'text-slate-500'
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user?.name}</span>
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
              {role === 'ADMIN' ? '管理员' : role === 'DOCTOR' ? '医生' : role === 'CAREGIVER' ? '护工' : '家属'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
