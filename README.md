# OSINT Dashboard

A full-stack, modular OSINT dashboard for profiling individuals using minimal input data.

## Features

- Advanced intelligence gathering from multiple data sources
- Comprehensive profile analysis with confidence scoring
- Relationship graph visualization
- Modular architecture supporting various OSINT tool integrations
- Secure authentication and data encryption
- Real-time task processing with progress tracking
- Robust error handling and logging
- Responsive design with accessibility features
- Feature flag system for controlled rollout

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- D3.js for graph visualization
- React Router for navigation
- Axios for API requests
- Jest and React Testing Library for testing

### Backend
- FastAPI as API server
- Celery for background tasks
- Redis for task queue
- PostgreSQL for structured data
- Elasticsearch for text search
- Neo4j for entity graph
- Pytest for backend testing

### Integrations
- PhoneInfoga for phone number analysis
- TheHarvester for email lookup
- Sherlock for social media lookup
- Facial recognition support

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ (for local development)
- Python 3.10+ (for local development)

### Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/osint-dashboard.git
   cd osint-dashboard
   ```

2. Copy the example environment file:
   ```
   cp .env.example .env
   ```

3. Update the environment variables in the `.env` file:
   - `SECRET_KEY`: A secure random string for JWT token generation
   - `DEBUG`: Set to "true" for verbose logging (recommended during development)
   - `ELASTICSEARCH_URL`: URL for your Elasticsearch instance
   - `NEO4J_URL`: URL for your Neo4j instance
   - API keys for external services

4. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

### Frontend Development

#### Setup
```
npm install
npm run dev
```

#### Testing
```
npm test
npm run test:coverage
```

#### Feature Flags
The application uses a centralized feature flag system to manage feature rollout. Feature flags are defined in `src/context/FeatureFlagContext.tsx`.

To use a feature flag in a component:
```tsx
import { useIsFeatureEnabled } from '../context/FeatureFlagContext';

const MyComponent = () => {
  const isAdvancedVisualizationEnabled = useIsFeatureEnabled('ADVANCED_VISUALIZATION');
  
  return (
    <div>
      {isAdvancedVisualizationEnabled && <AdvancedVisualization />}
    </div>
  );
};
```

### Backend Development

#### Setup
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Testing
```
cd backend
pytest
```

#### API Endpoints

The following API endpoints are available:

**Authentication**
- `POST /api/auth/login` - Authenticate user and get token
- `GET /api/auth/me` - Get current user information

**Investigations**
- `GET /api/investigations` - List investigations (with pagination and filtering)
- `POST /api/investigations` - Create a new investigation
- `GET /api/investigations/{id}` - Get investigation details
- `PUT /api/investigations/{id}` - Update an investigation
- `DELETE /api/investigations/{id}` - Delete an investigation

**Profiles**
- `GET /api/profiles/{id}` - Get profile details
- `POST /api/profiles` - Create a new profile
- `GET /api/profiles/search` - Search for profiles

**Tasks**
- `POST /api/tasks/{task_type}` - Create a new background task
- `GET /api/tasks/{task_id}` - Check task status
- `POST /api/tasks/{task_id}/cancel` - Cancel a running task

**Tools**
- `POST /api/tools/email-scan` - Scan an email address
- `POST /api/tools/phone-scan` - Scan a phone number
- `POST /api/tools/social-scan` - Scan for social media profiles
- `POST /api/tools/image-scan` - Scan an image for facial recognition

## Security Considerations

- API access is restricted with token-based authentication (JWT)
- All API requests are logged with timestamps and unique trace IDs for audit purposes
- Sensitive data is encrypted at rest
- Error responses don't expose internal system details in production
- Consider running through a VPN or Tor for anonymity

## Performance Optimization

- Frontend uses React.memo and useMemo to prevent unnecessary re-renders
- Pagination implemented for all list views
- API responses are cached where appropriate
- Background processing for intensive operations
- Database indexing for faster queries

## Accessibility

The application is designed with accessibility in mind:
- Semantic HTML5 elements
- ARIA attributes for screen readers
- Keyboard navigation support
- Color contrast compliance
- Focus management for modal dialogs

## Troubleshooting

### Common Issues

**Docker Issues**
- Check container logs: `docker-compose logs <service_name>`
- Ensure all required ports are available
- Verify environment variables in `.env` file

**API Connection Issues**
- Check CORS settings in `backend/main.py`
- Verify API URL in frontend environment variables
- Check that the token is being correctly sent in Authorization header

**Database Issues**
- Ensure database containers are running: `docker-compose ps`
- Check connection strings in environment variables
- Verify database migrations have been applied

### Debugging

- Set `DEBUG=true` in `.env` for verbose backend logs
- Check `api.log` for detailed backend errors
- Use browser devtools for frontend debugging
- Enable Redux DevTools for state management debugging

## License

This project is for personal, non-commercial use only.

## Disclaimer

This tool is intended for legal use cases only. The user is responsible for complying with all applicable laws and regulations when using this software.