import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { SearchIcon, ShieldIcon, LockIcon, AlertCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      let errorMessage = 'Invalid username or password';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err && 'response' in err) {
        // Axios error handling
        const axiosError = err as any;
        errorMessage = axiosError.response?.data?.detail || 'Authentication failed';
      }
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-8 rounded-lg border border-background-lighter bg-background-light p-8 shadow-xl"
    >
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-900">
          <SearchIcon className="h-6 w-6 text-primary-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-400">Sign in to access your OSINT dashboard</p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-error-900/20 p-3 text-sm text-error-500">
            <AlertCircleIcon className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-300">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-md border border-background-lighter bg-background px-3 py-2 pl-10 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
              placeholder="Enter your username"
              aria-label="Username"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-background-lighter bg-background px-3 py-2 pl-10 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
              placeholder="Enter your password"
              aria-label="Password"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <LockIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-background-lighter bg-background text-primary-600 focus:ring-primary-500"
              aria-label="Remember me"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-primary-500 hover:text-primary-400">
              Forgot password?
            </a>
          </div>
        </div>
        
        <div>
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            aria-label="Sign in"
          >
            Sign in
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldIcon className="h-3 w-3" />
          <span>Secured with end-to-end encryption</span>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;