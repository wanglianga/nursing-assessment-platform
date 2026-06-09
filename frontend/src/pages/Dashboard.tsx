import { useAuthStore } from '@/store/authStore'
import AdminDashboard from './dashboard/AdminDashboard'
import DoctorDashboard from './dashboard/DoctorDashboard'
import CaregiverDashboard from './dashboard/CaregiverDashboard'
import FamilyDashboard from './dashboard/FamilyDashboard'

export default function Dashboard() {
  const { user } = useAuthStore()
  const role = user?.role || 'ADMIN'

  switch (role) {
    case 'DOCTOR':
      return <DoctorDashboard />
    case 'CAREGIVER':
      return <CaregiverDashboard />
    case 'FAMILY':
      return <FamilyDashboard />
    default:
      return <AdminDashboard />
  }
}
