import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Users, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export interface Investigation {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  created: string;
  updated: string;
  profiles: number;
  confidence: number;
}

interface InvestigationCardProps {
  investigation: Investigation;
  index: number;
}

const InvestigationCard = ({ investigation, index }: InvestigationCardProps) => {
  const navigate = useNavigate();
  
  const handleView = () => {
    navigate(`/profile/${investigation.id}`);
  };
  
  const getStatusIcon = () => {
    switch (investigation.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-primary-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-warning-500" />;
      default:
        return null;
    }
  };
  
  const getPriorityClass = () => {
    switch (investigation.priority) {
      case 'high':
        return 'bg-error-700/20 text-error-400';
      case 'medium':
        return 'bg-warning-700/20 text-warning-400';
      case 'low':
        return 'bg-success-700/20 text-success-400';
      default:
        return 'bg-gray-700/20 text-gray-400';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full transition-transform hover:translate-y-[-2px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{investigation.title}</CardTitle>
            <span className={`rounded-full px-2 py-0.5 text-xs ${getPriorityClass()}`}>
              {investigation.priority}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(investigation.created), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              <span>{investigation.profiles} profile{investigation.profiles !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {/* Confidence indicator */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-gray-400">Confidence</span>
              <span className="text-xs font-medium text-gray-300">{investigation.confidence}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div 
                className="h-full rounded-full bg-primary-600" 
                style={{ width: `${investigation.confidence}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {getStatusIcon()}
            <span className="capitalize">{investigation.status}</span>
          </div>
          <Button variant="ghost" onClick={handleView}>View Details</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InvestigationCard;