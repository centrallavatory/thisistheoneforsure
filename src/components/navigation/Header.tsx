import { BellIcon, MenuIcon } from 'lucide-react';
import { useState } from 'react';
import NotificationsDropdown from '../ui/NotificationsDropdown';

type HeaderProps = {
  toggleSidebar: () => void;
};

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <header className="z-10 flex h-16 items-center justify-between border-b border-background-lighter bg-background-light px-4 md:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-gray-400 hover:bg-background-lighter hover:text-white"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        
        <h1 className="hidden text-lg font-medium md:block">OSINT Dashboard</h1>
      </div>
      
      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Quick search..."
              className="w-64 rounded-md bg-background py-1.5 pl-3 pr-8 text-sm text-gray-300 placeholder-gray-500 outline-none ring-1 ring-background-lighter focus:ring-primary-600"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button className="text-gray-400 hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-1.5 text-gray-400 hover:bg-background-lighter hover:text-white"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-500"></span>
          </button>
          
          {showNotifications && (
            <NotificationsDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;