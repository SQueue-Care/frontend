import { useOutletContext } from 'react-router-dom'
import UserTable from '../../components/admin/UserTable'
import type { AdminDashboardContext } from './Dashboard'

export default function AdminUsersPatient() {
  const { onManageUser, onDeleteUser, userTableKey } = useOutletContext<AdminDashboardContext>()
  return (
    <UserTable
      key={`patient-${userTableKey}`}
      role="PATIENT"
      title="Data Pasien"
      onManage={onManageUser}
      onDelete={onDeleteUser}
    />
  )
}
