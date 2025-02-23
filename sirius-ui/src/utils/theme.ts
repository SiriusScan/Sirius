export const initializeTheme = () => {
  // Check if theme was previously set
  const storedTheme = localStorage.getItem("darkMode");
  
  if (storedTheme === null) {
    // No preference stored, default to dark mode
    document.documentElement.classList.add("dark");
    localStorage.setItem("darkMode", "true");
    return true;
  }
  
  // Use stored preference
  const isDark = storedTheme === "true";
  document.documentElement.classList.toggle("dark", isDark);
  return isDark;
}; 