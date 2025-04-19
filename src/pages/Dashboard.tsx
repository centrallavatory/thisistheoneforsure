import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, SearchIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import InvestigationCard, { Investigation } from '../components/dashboard/InvestigationCard';
import { confidenceColor } from '../lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  
  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setInvestigations([
        {
          id: '1',
          title: 'John Smith Investigation',
          status: 'active',
          priority: 'high',
          created: '2025-05-01T10:30:00Z',
          updated: '2025-05-03T15:45:00Z',
          profiles: 3,
          confidence: 75
        },
        {
          id: '2',
          title: 'Jane Doe Analysis',
          status: 'completed',
          priority: 'medium',
          created: '2025-04-15T08:20:00Z',
          updated: '2025-04-20T11:10:00Z',
          profiles: 1,
          confidence: 92
        },
        {
          id: '3',
          title: 'Vehicle Trace: CA-7729',
          status: 'pending',
          priority: 'low',
          created: '2025-05-04T09:15:00Z',
          updated: '2025-05-04T09:15:00Z',
          profiles: 0,
          confidence: 30
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleNewInvestigation = () => {
    navigate('/investigations/new');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        
        <Button onClick={handleNewInvestigation}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Investigation
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          index={0}
          title="Active Investigations"
          value="3"
          trend="+2 this week"
          trendUp={true}
        />
        <StatsCard
          index={1}
          title="Profiles Analyzed"
          value="28"
          trend="+12 this month"
          trendUp={true}
        />
        <StatsCard
          index={2}
          title="Data Sources"
          value="7"
          trend="2 pending integration"
          trendUp={false}
        />
      </div>
      
      {/* Recent Investigations */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Investigations</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/investigations')}>
            View All
            <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 animate-pulse">
                <CardHeader>
                  <div className="h-6 w-3/4 rounded bg-background-lighter"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-4 rounded bg-background-lighter"></div>
                      <div className="h-4 rounded bg-background-lighter"></div>
                    </div>
                    <div className="h-2 rounded bg-background-lighter"></div>
                    <div className="h-8 rounded bg-background-lighter"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {investigations.map((investigation, index) => (
              <InvestigationCard
                key={investigation.id}
                investigation={investigation}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Activity Feed */}
      <div>
        <h2 className="mb-4 text-lg font-medium">Recent Activity</h2>
        <Card className="overflow-hidden">
          <div className="max-h-72 overflow-y-auto px-4 py-2">
            {activityFeed.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group flex cursor-pointer items-start gap-3 border-b border-background-lighter py-3 last:border-b-0 hover:bg-background/50"
              >
                <div className={`mt-1 rounded-full p-2 ${activity.iconBg}`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-200">
                    {activity.title}
                    {activity.confidence && (
                      <span className={`ml-2 text-sm ${confidenceColor(activity.confidence)}`}>
                        {activity.confidence}% match
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    <ChevronRightIcon className="h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

interface StatsCardProps {
  index: number;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

const StatsCard = ({ index, title, value, trend, trendUp }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold">{value}</div>
          <div className={`text-xs ${trendUp ? 'text-success-500' : 'text-primary-500'}`}>
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const activityFeed = [
  {
    id: 1,
    title: 'Social media profile found',
    description: 'Twitter account @johnsmith matched to target profile.',
    time: '10 minutes ago',
    icon: <SearchIcon className="h-4 w-4 text-primary-500" />,
    iconBg: 'bg-primary-900/20',
    confidence: 82,
  },
  {
    id: 2,
    title: 'Phone number analysis completed',
    description: 'Carrier identified as Verizon Wireless with registration in New York.',
    time: '2 hours ago',
    icon: <SearchIcon className="h-4 w-4 text-primary-500" />,
    iconBg: 'bg-primary-900/20',
    confidence: 95,
  },
  {
    id: 3,
    title: 'Vehicle registration cross-reference',
    description: 'License plate CA-7729 matched to registered owner in database.',
    time: '6 hours ago',
    icon: <SearchIcon className="h-4 w-4 text-primary-500" />,
    iconBg: 'bg-primary-900/20',
    confidence: 67,
  },
  {
    id: 4,
    title: 'Email domain analysis',
    description: 'Corporate email domain verified with employment records.',
    time: '1 day ago',
    icon: <SearchIcon className="h-4 w-4 text-primary-500" />,
    iconBg: 'bg-primary-900/20',
    confidence: 88,
  },
  {
    id: 5,
    title: 'Address verification completed',
    description: '742 Evergreen Terrace confirmed as residential address.',
    time: '2 days ago',
    icon: <SearchIcon className="h-4 w-4 text-primary-500" />,
    iconBg: 'bg-primary-900/20',
    confidence: 76,
  },
];

export default Dashboard;