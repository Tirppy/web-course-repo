function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <span>Theme</span>
      <strong>{theme === 'light' ? 'Dark' : 'Light'}</strong>
    </button>
  )
}

export default ThemeToggle
