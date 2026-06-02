import { useOutletContext } from 'react-router-dom'
import UserTable from '../../components/admin/UserTable'
import type { AdminDashboardContext } from './Dashboard'

export default function AdminUsersDoctor() {
  const { onManageUser, onDeleteUser, userTableKey } = useOutletContext<AdminDashboardContext>()
  return (
    <UserTable
      key={`doctor-${userTableKey}`}
      role="DOCTOR"
      title="Data Dokter Spesialis"
      onManage={onManageUser}
      onDelete={onDeleteUser}
    />
  )
}
