import { FC, useState, useEffect } from 'react';

const Navbar: FC = () => {
  const [dark, setDark] = useState<boolean>(
    () =>
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.theme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow">
      <h1 className="text-xl font-semibold">Lamma</h1>
      <button
        onClick={() => setDark(!dark)}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </header>
  );
};

export default Navbar;
