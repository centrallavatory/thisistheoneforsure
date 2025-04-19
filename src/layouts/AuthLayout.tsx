import { Outlet } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Brand/Info */}
      <div className="hidden w-1/2 flex-col justify-between bg-background-light p-12 lg:flex">
        <div>
          <div className="flex items-center gap-2 text-primary-500">
            <SearchIcon className="h-8 w-8" />
            <h1 className="text-xl font-bold">OSINT Dashboard</h1>
          </div>
          <p className="mt-6 max-w-md text-gray-400">
            Advanced intelligence gathering platform for comprehensive profile analysis using minimal input data.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-300">Secure By Design</h3>
            <p className="text-sm text-gray-400">End-to-end encryption, comprehensive access controls, and detailed audit logs.</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-300">Modular Architecture</h3>
            <p className="text-sm text-gray-400">Seamlessly integrate with a wide range of OSINT tools and data sources.</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-gray-300">Powerful Analysis</h3>
            <p className="text-sm text-gray-400">Advanced relationship mapping, profile correlation, and data visualization.</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;