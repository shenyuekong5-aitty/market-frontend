import { computed, ref, toValue } from 'vue'

// Searches presentation data only; original lists and business actions remain intact.
export function useCollectionSearch(source, fields) {
  const searchQuery = ref('')
  const filteredRows = computed(() => {
    const rows = toValue(source) || []
    const query = searchQuery.value.trim().toLocaleLowerCase()
    if (!query) return rows
    return rows.filter(row => fields.some(field => String(row[field] ?? '').toLocaleLowerCase().includes(query)))
  })
  return { searchQuery, filteredRows }
}
