export const isAdminRole = (role) => role === 'super_admin' || role === 'market_admin'

export const homePathForRole = (role) => ({
  super_admin: '/admin/manage',
  market_admin: '/admin/dashboard',
  vendor: '/vendor/home',
  user: '/markets',
}[role] || '/login')
