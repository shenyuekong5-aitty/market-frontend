import { describe, expect, it } from 'vitest'
import { getFullUrl } from './urlHelper'

describe('getFullUrl', () => {
  it('keeps absolute URLs unchanged', () => {
    expect(getFullUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg')
  })

  it('keeps local relative resources usable with the development proxy', () => {
    expect(getFullUrl('/images/default-avatar.svg')).toBe('/images/default-avatar.svg')
  })

  it('returns an empty string when no resource is provided', () => {
    expect(getFullUrl('')).toBe('')
  })
})
