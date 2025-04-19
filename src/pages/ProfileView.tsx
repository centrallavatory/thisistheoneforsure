import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Globe, Calendar,
  FileText, Download, Share2, AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { confidenceColor } from '../lib/utils';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created: string;
  confidence: number;
  status: 'active' | 'completed' | 'pending';
  social_media: Array<{
    platform: string;
    username: string;
    url: string;
    last_active: string;
  }>;
  data_sources: Array<{
    name: string;
    status: string;
    results: number;
  }>;
  timeline: Array<{
    date: string;
    event: string;
    details: string;
  }>;
  relationships: Array<{
    name: string;
    type: string;
    confidence: number;
  }>;
  locations: Array<{
    address: string;
    type: string;
    confidence: number;
    last_seen: string;
  }>;
}

const ProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfile({
        id: id!,
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY 10001',
        created: '2025-03-15T10:30:00Z',
        confidence: 85,
        status: 'active',
        social_media: [
          {
            platform: 'Twitter',
            username: '@johnsmith',
            url: 'https://twitter.com/johnsmith',
            last_active: '2025-05-01T15:22:31Z'
          },
          {
            platform: 'LinkedIn',
            username: 'john-smith-nyc',
            url: 'https://linkedin.com/in/john-smith-nyc',
            last_active: '2025-04-28T09:15:00Z'
          },
          {
            platform: 'GitHub',
            username: 'jsmith-dev',
            url: 'https://github.com/jsmith-dev',
            last_active: '2025-05-02T11:45:22Z'
          }
        ],
        data_sources: [
          {
            name: 'Email Analysis',
            status: 'completed',
            results: 3
          },
          {
            name: 'Phone Lookup',
            status: 'completed',
            results: 2
          },
          {
            name: 'Social Media Scan',
            status: 'completed',
            results: 5
          },
          {
            name: 'Dark Web Scan',
            status: 'pending',
            results: 0
          }
        ],
        timeline: [
          {
            date: '2025-05-02T11:45:22Z',
            event: 'GitHub Activity',
            details: 'Code commit to project-x repository'
          },
          {
            date: '2025-05-01T15:22:31Z',
            event: 'Twitter Post',
            details: 'Posted about technology trends'
          },
          {
            date: '2025-04-28T09:15:00Z',
            event: 'LinkedIn Update',
            details: 'Profile position update'
          }
        ],
        relationships: [
          {
            name: 'Jane Smith',
            type: 'Family',
            confidence: 95
          },
          {
            name: 'Tech Corp Inc',
            type: 'Employment',
            confidence: 88
          },
          {
            name: 'Developer Group NYC',
            type: 'Association',
            confidence: 75
          }
        ],
        locations: [
          {
            address: '123 Main St, New York, NY 10001',
            type: 'Residential',
            confidence: 92,
            last_seen: '2025-05-02T00:00:00Z'
          },
          {
            address: '456 Tech Ave, New York, NY 10013',
            type: 'Work',
            confidence: 85,
            last_seen: '2025-05-01T17:30:00Z'
          }
        ]
      });
      setLoading(false);
    }, 1500);
  }, [id]);
  
  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-background-lighter"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 rounded bg-background-lighter"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-background-lighter"></div>
                  <div className="h-4 w-3/4 rounded bg-background-lighter"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-background-lighter bg-background-light">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-warning-500" />
          <h2 className="mt-4 text-lg font-medium">Profile Not Found</h2>
          <p className="mt-2 text-sm text-gray-400">
            The requested profile could not be found or you don't have permission to view it.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <p className="mt-1 text-sm text-gray-400">
            Investigation started on {new Date(profile.created).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <User className="h-4 w-4" />
                <span>Identity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-medium">{profile.name}</p>
                <p className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-medium">New York, NY</p>
                <p className="text-sm text-gray-400">{profile.address}</p>
                <p className="text-xs text-gray-500">Last verified: 2 days ago</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <Globe className="h-4 w-4" />
                <span>Digital Presence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-medium">{profile.social_media.length} Profiles</p>
                <p className="text-sm text-gray-400">
                  Active on {profile.social_media.map(sm => sm.platform).join(', ')}
                </p>
                <p className="text-xs text-gray-500">Last activity: 2 hours ago</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Analysis Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-medium capitalize">{profile.status}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Confidence:</span>
                  <span className={`text-sm font-medium ${confidenceColor(profile.confidence)}`}>
                    {profile.confidence}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                  <div 
                    className="h-full rounded-full bg-primary-600"
                    style={{ width: `${profile.confidence}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Timeline and Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.timeline.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="relative flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                    {index !== profile.timeline.length - 1 && (
                      <div className="absolute bottom-0 left-1/2 h-full w-0.5 -translate-x-1/2 transform bg-background-lighter"></div>
                    )}
                  </div>
                  <div className="flex-1 rounded-lg border border-background-lighter bg-background p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{event.event}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">{event.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.data_sources.map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-background-lighter p-3"
                >
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-gray-400">
                      {source.results} {source.results === 1 ? 'result' : 'results'}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    source.status === 'completed' 
                      ? 'bg-success-900/20 text-success-500' 
                      : 'bg-warning-900/20 text-warning-500'
                  }`}>
                    {source.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Relationships and Locations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Known Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.relationships.map((relationship, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-background-lighter p-3"
                >
                  <div>
                    <p className="font-medium">{relationship.name}</p>
                    <p className="text-sm text-gray-400">{relationship.type}</p>
                  </div>
                  <span className={`text-sm ${confidenceColor(relationship.confidence)}`}>
                    {relationship.confidence}% match
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Known Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.locations.map((location, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-background-lighter p-3"
                >
                  <div>
                    <p className="font-medium">{location.type}</p>
                    <p className="text-sm text-gray-400">{location.address}</p>
                    <p className="text-xs text-gray-500">
                      Last seen: {new Date(location.last_seen).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm ${confidenceColor(location.confidence)}`}>
                    {location.confidence}% match
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;