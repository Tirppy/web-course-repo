export function loadLocalStorage(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return fallbackValue
    }

    return JSON.parse(rawValue)
  } catch {
    return fallbackValue
  }
}

export function saveLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return null
  }

  return value
}
