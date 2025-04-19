import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  SearchIcon, 
  LayoutDashboardIcon, 
  FolderIcon, 
  PlusCircleIcon, 
  SettingsIcon, 
  LogOutIcon,
  ChevronLeftIcon
} from 'lucide-react';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { logout, user } = useAuth();
  
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 overflow-y-auto bg-background-light lg:static"
        initial={{ x: -280 }}
        animate={{ x: open ? 0 : -280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 text-primary-500">
              <SearchIcon className="h-6 w-6" />
              <span className="text-lg font-semibold">OSINT Dashboard</span>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-background-lighter hover:text-white lg:hidden"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 space-y-1 px-3 py-6">
            <NavItem to="/" icon={<LayoutDashboardIcon className="h-5 w-5" />} label="Dashboard" />
            <NavItem to="/investigations" icon={<FolderIcon className="h-5 w-5" />} label="Investigations" />
            <NavItem to="/investigations/new" icon={<PlusCircleIcon className="h-5 w-5" />} label="New Investigation" />
            <NavItem to="/settings" icon={<SettingsIcon className="h-5 w-5" />} label="Settings" />
          </div>
          
          {/* User section */}
          <div className="border-t border-background-lighter p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-700 text-white">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-gray-400 transition-colors hover:bg-background-lighter hover:text-white"
            >
              <LogOutIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 rounded-md px-3 py-2 transition-colors
      ${isActive 
        ? 'bg-primary-900/50 text-primary-400' 
        : 'text-gray-400 hover:bg-background-lighter hover:text-white'}
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;