import { describe, expect, it } from 'vitest'
import { homePathForRole, isAdminRole } from './roles'

describe('role helpers', () => {
  it('distinguishes both administrator roles from consumer roles', () => {
    expect(isAdminRole('super_admin')).toBe(true)
    expect(isAdminRole('market_admin')).toBe(true)
    expect(isAdminRole('vendor')).toBe(false)
    expect(isAdminRole('user')).toBe(false)
  })

  it.each([
    ['super_admin', '/admin/manage'],
    ['market_admin', '/admin/dashboard'],
    ['vendor', '/vendor/home'],
    ['user', '/markets'],
  ])('maps %s to its workbench', (role, expected) => {
    expect(homePathForRole(role)).toBe(expected)
  })

  it('sends unknown roles to login', () => {
    expect(homePathForRole('legacy_admin')).toBe('/login')
  })
})
