// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export default function useDarkMode() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark' 
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return [theme, toggleTheme];
}