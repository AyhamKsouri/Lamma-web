import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar: FC = () => {
  const [dark, setDark] = useState<boolean>(() =>
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.theme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <header className="flex items-center justify-end px-6 py-4 bg-white dark:bg-gray-950 shadow text-gray-900 dark:text-white">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>

        <Link to="/profile">
          <img
            src="https://github.com/shadcn.png"
            alt="User Avatar"
            className="w-9 h-9 rounded-full border-2 border-gray-300 dark:border-gray-600"
          />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
