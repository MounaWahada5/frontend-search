import React from 'react';

function NavItem({ children, active, onClick }) {
  return (
    <li>
      <div
        className={`flex items-center cursor-pointer px-3 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group ${active ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        onClick={onClick}
      >
        {children}
      </div>
    </li>
  );
}

export default NavItem;