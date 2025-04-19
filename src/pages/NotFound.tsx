import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { HomeIcon, AlertTriangleIcon } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <AlertTriangleIcon className="h-16 w-16 text-warning-500" />
      <h1 className="mt-6 text-3xl font-bold text-gray-100">Page Not Found</h1>
      <p className="mt-3 max-w-md text-gray-400">
        The page you're looking for doesn't exist or you don't have permission to access it.
      </p>
      <div className="mt-8">
        <Button onClick={() => navigate('/')}>
          <HomeIcon className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;