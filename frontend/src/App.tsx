import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Elders from '@/pages/Elders'
import ElderDetail from '@/pages/ElderDetail'
import Assessment from '@/pages/Assessment'
import CarePlan from '@/pages/CarePlan'
import DailyCare from '@/pages/DailyCare'
import RiskEvents from '@/pages/RiskEvents'
import RiskEventDetail from '@/pages/RiskEventDetail'
import Reassessment from '@/pages/Reassessment'
import Billing from '@/pages/Billing'
import FamilyPortal from '@/pages/FamilyPortal'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<PublicRoute><Login /></PublicRoute>}
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/elders" element={<Elders />} />
          <Route path="/elders/:id" element={<ElderDetail />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/care-plan" element={<CarePlan />} />
          <Route path="/daily-care" element={
            <ProtectedRoute allowedRoles={['CAREGIVER', 'ADMIN']}>
              <DailyCare />
            </ProtectedRoute>
          } />
          <Route path="/risk-events" element={<RiskEvents />} />
          <Route path="/risk-events/:id" element={<RiskEventDetail />} />
          <Route path="/reassessment" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
              <Reassessment />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/family/:tab" element={
            <ProtectedRoute allowedRoles={['FAMILY']}>
              <FamilyPortal />
            </ProtectedRoute>
          } />
          <Route path="/family/records" element={<ProtectedRoute allowedRoles={['FAMILY']}><FamilyPortal /></ProtectedRoute>} />
          <Route path="/family/leave" element={<ProtectedRoute allowedRoles={['FAMILY']}><FamilyPortal /></ProtectedRoute>} />
          <Route path="/family/billing" element={<ProtectedRoute allowedRoles={['FAMILY']}><FamilyPortal /></ProtectedRoute>} />
          <Route path="/family/complaints" element={<ProtectedRoute allowedRoles={['FAMILY']}><FamilyPortal /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
