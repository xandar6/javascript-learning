import { isValidState } from './storage.js';

export async function fetchImportState(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Could not load import data')
    const data = await response.json()
    if (!isValidState(data)) throw new Error('Import data has an invalid structure')
    return { state: data, error: null }
  } catch (error) {
    return { state: null, error: error.message }
  }
}
