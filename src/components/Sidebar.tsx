import { FC } from 'react';
import { NavLink } from 'react-router-dom';

const links: { to: string; label: string }[] = [
  { to: '/',           label: 'Home'  },
  { to: '/events',     label: 'Events'     },
  { to: '/calendar',   label: 'Calendar'    },  
  { to: '/profile',    label: 'Profile'    },
  { to: '/new-event',  label: 'New Event'  },
  
];

const Sidebar: FC = () => (
  <nav className="w-56 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
    <ul className="mt-6">
      {links.map(({ to, label }) => (
        <li key={to}>
          <NavLink
            to={to}
            className={({ isActive }) =>
              `block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isActive ? 'bg-gray-200 dark:bg-gray-700 font-medium' : ''
              }`
            }
          >
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default Sidebar;
