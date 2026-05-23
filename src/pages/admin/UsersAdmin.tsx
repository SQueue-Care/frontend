import { useOutletContext } from 'react-router-dom'
import UserTable from '../../components/admin/UserTable'
import type { AdminDashboardContext } from './Dashboard'

export default function AdminUsersAdmin() {
  const { onManageUser, onDeleteUser, userTableKey } = useOutletContext<AdminDashboardContext>()
  return (
    <UserTable
      key={`admin-${userTableKey}`}
      role="ADMIN"
      title="Akses Administrator"
      onManage={onManageUser}
      onDelete={onDeleteUser}
    />
  )
}
