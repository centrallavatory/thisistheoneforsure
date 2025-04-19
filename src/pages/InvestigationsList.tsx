import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon, Search, SlidersHorizontal, 
  ArrowUpDown, ChevronDown, X, 
  Calendar, UserIcon, Tag, Filter,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Investigation } from '../components/dashboard/InvestigationCard';
import { statusBadgeClass } from '../lib/utils';
import { format } from 'date-fns';
import { investigationApi } from '../lib/api';

const ITEMS_PER_PAGE = 10;

const InvestigationsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [profileCountFilter, setProfileCountFilter] = useState('all');

  useEffect(() => {
    fetchInvestigations();
  }, [currentPage]);

  const fetchInvestigations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await investigationApi.getAll();
      setInvestigations(response.data);
      setTotalItems(response.data.length); // In a real API, this would come from response headers or metadata
    } catch (err) {
      console.error('Failed to fetch investigations:', err);
      let errorMessage = 'Failed to load investigations';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err && 'response' in err) {
        // Axios error handling
        const axiosError = err as any;
        errorMessage = axiosError.response?.data?.detail || 'Failed to load investigations';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewInvestigation = () => {
    navigate('/investigations/new');
  };
  
  const handleViewInvestigation = (id: string) => {
    navigate(`/profile/${id}`);
  };
  
  const toggleFilters = () => {
    setFilterOpen(!filterOpen);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setProfileCountFilter('all');
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchInvestigations();
  };
  
  // Apply search and filters to the data
  const filteredInvestigations = useMemo(() => {
    return investigations.filter(inv => {
      // Search query filter
      if (searchQuery && !inv.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && inv.status !== statusFilter) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && inv.priority !== priorityFilter) {
        return false;
      }
      
      // Date filter would be implemented here
      
      // Profile count filter
      if (profileCountFilter !== 'all') {
        const count = inv.profiles;
        if (profileCountFilter === '0' && count !== 0) return false;
        if (profileCountFilter === '1-2' && (count < 1 || count > 2)) return false;
        if (profileCountFilter === '3-5' && (count < 3 || count > 5)) return false;
        if (profileCountFilter === '6+' && count < 6) return false;
      }
      
      return true;
    });
  }, [investigations, searchQuery, statusFilter, priorityFilter, profileCountFilter]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredInvestigations.length / ITEMS_PER_PAGE);
  const paginatedInvestigations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvestigations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvestigations, currentPage]);
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold">Investigations</h1>
        
        <Button onClick={handleNewInvestigation}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Investigation
        </Button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-error-900/20 p-3 text-sm text-error-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search investigations..."
              className="w-full rounded-md border border-background-lighter bg-background py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:border-primary-600 focus:outline-none"
              aria-label="Search investigations"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleFilters} aria-expanded={filterOpen} aria-controls="filter-panel">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              <span className="ml-2 rounded-full bg-primary-700 px-1.5 py-0.5 text-xs">
                {[statusFilter, priorityFilter, dateFilter].filter(f => f !== 'all').length}
              </span>
            </Button>
            
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Active filters */}
        <AnimatedFilters isOpen={filterOpen}>
          <Card className="overflow-hidden border-background-lighter" id="filter-panel">
            <div className="flex items-center justify-between border-b border-background-lighter bg-background-lighter p-3">
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={toggleFilters} aria-label="Close filters">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Date filter */}
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400" id="date-filter-label">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Date Range</span>
                </label>
                <select 
                  className="w-full rounded border border-background-lighter bg-background px-3 py-1.5 text-sm text-gray-300 focus:border-primary-600 focus:outline-none"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  aria-labelledby="date-filter-label"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              
              {/* Status filter */}
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400" id="status-filter-label">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Status</span>
                </label>
                <select 
                  className="w-full rounded border border-background-lighter bg-background px-3 py-1.5 text-sm text-gray-300 focus:border-primary-600 focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-labelledby="status-filter-label"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              {/* Priority filter */}
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400" id="priority-filter-label">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Priority</span>
                </label>
                <select 
                  className="w-full rounded border border-background-lighter bg-background px-3 py-1.5 text-sm text-gray-300 focus:border-primary-600 focus:outline-none"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  aria-labelledby="priority-filter-label"
                >
                  <option value="all">All priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              {/* Profile count filter */}
              <div>
                <label className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-400" id="profile-filter-label">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Profile Count</span>
                </label>
                <select 
                  className="w-full rounded border border-background-lighter bg-background px-3 py-1.5 text-sm text-gray-300 focus:border-primary-600 focus:outline-none"
                  value={profileCountFilter}
                  onChange={(e) => setProfileCountFilter(e.target.value)}
                  aria-labelledby="profile-filter-label"
                >
                  <option value="all">Any count</option>
                  <option value="0">None (0)</option>
                  <option value="1-2">Few (1-2)</option>
                  <option value="3-5">Several (3-5)</option>
                  <option value="6+">Many (6+)</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-background-lighter bg-background-lighter p-3">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </Card>
        </AnimatedFilters>
        
        {/* Active filter pills */}
        <div className="flex flex-wrap gap-2" role="region" aria-label="Active filters">
          {priorityFilter !== 'all' && (
            <FilterPill label={`Priority: ${priorityFilter}`} onRemove={() => setPriorityFilter('all')} />
          )}
          {statusFilter !== 'all' && (
            <FilterPill label={`Status: ${statusFilter}`} onRemove={() => setStatusFilter('all')} />
          )}
          {dateFilter !== 'all' && (
            <FilterPill label={dateFilter === 'week' ? 'This week' : dateFilter === 'month' ? 'This month' : dateFilter} onRemove={() => setDateFilter('all')} />
          )}
        </div>
      </div>
      
      {/* Investigations Table */}
      <Card className="border-background-lighter">
        <div className="overflow-x-auto">
          <table className="w-full table-auto" aria-label="Investigations list">
            <thead>
              <tr className="border-b border-background-lighter text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="whitespace-nowrap p-4" scope="col">Title</th>
                <th className="whitespace-nowrap p-4" scope="col">Status</th>
                <th className="whitespace-nowrap p-4" scope="col">Priority</th>
                <th className="whitespace-nowrap p-4" scope="col">Profiles</th>
                <th className="whitespace-nowrap p-4" scope="col">Confidence</th>
                <th className="whitespace-nowrap p-4" scope="col">Created</th>
                <th className="whitespace-nowrap p-4" scope="col">Last Updated</th>
                <th className="whitespace-nowrap p-4" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="border-b border-background-lighter">
                    <td className="p-4">
                      <div className="h-5 w-48 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-20 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-20 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-10 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-20 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-24 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-24 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-20 animate-pulse rounded bg-background-lighter"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedInvestigations.length > 0 ? (
                paginatedInvestigations.map((inv) => (
                  <tr key={inv.id} className="border-b border-background-lighter">
                    <td className="p-4">
                      <span className="font-medium text-white">{inv.title}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{inv.priority}</td>
                    <td className="p-4">{inv.profiles}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-background-lighter">
                          <div
                            className="h-full rounded-full bg-primary-600"
                            style={{ width: `${inv.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{inv.confidence}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {format(new Date(inv.created), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-gray-400">
                      {format(new Date(inv.updated), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewInvestigation(inv.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-400">
                    No investigations found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && filteredInvestigations.length > 0 && (
          <div className="flex items-center justify-between border-t border-background-lighter p-4">
            <div className="text-sm text-gray-400">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredInvestigations.length)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvestigations.length)}</span> of{' '}
              <span className="font-medium">{filteredInvestigations.length}</span> results
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

interface AnimatedFiltersProps {
  children: React.ReactNode;
  isOpen: boolean;
}

const AnimatedFilters = ({ children, isOpen }: AnimatedFiltersProps) => (
  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
    {children}
  </div>
);

interface FilterPillProps {
  label: string;
  onRemove: () => void;
}

const FilterPill = ({ label, onRemove }: FilterPillProps) => (
  <div className="flex items-center gap-1 rounded-full bg-background-lighter px-3 py-1 text-xs">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="ml-1 rounded-full p-0.5 hover:bg-background"
      aria-label={`Remove filter: ${label}`}
    >
      <X className="h-3 w-3" />
    </button>
  </div>
);

export default InvestigationsList;