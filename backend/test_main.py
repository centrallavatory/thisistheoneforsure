import pytest
from fastapi.testclient import TestClient
from main import app
import json

# Create a test client
client = TestClient(app)

# Mock JWT token for test authentication
MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTk5OTk5OTk5OX0.tpNdNwFj-7CXXgMg1j2_K4tCCytxNFyXAcWbBqZAEBw"

@pytest.fixture
def auth_headers():
    """Fixture to provide authentication headers for requests"""
    return {"Authorization": f"Bearer {MOCK_TOKEN}"}

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "version" in response.json()

def test_login_success():
    """Test successful login"""
    response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "password"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    assert "user" in response.json()

def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "wrong_password"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()

def test_get_current_user_with_token(auth_headers):
    """Test getting current user with valid token"""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "admin"

def test_get_current_user_without_token():
    """Test getting current user without token"""
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_create_investigation(auth_headers):
    """Test creating a new investigation"""
    investigation_data = {
        "title": "Test Investigation",
        "description": "This is a test investigation",
        "status": "pending",
        "priority": "medium",
        "inputs": {
            "email": "test@example.com"
        }
    }
    
    response = client.post(
        "/api/investigations",
        headers=auth_headers,
        json=investigation_data
    )
    
    assert response.status_code == 200
    assert response.json()["title"] == "Test Investigation"
    assert "id" in response.json()

def test_get_investigations(auth_headers):
    """Test getting investigations list with pagination"""
    # Create a test investigation first
    investigation_data = {
        "title": "Test Investigation for List",
        "description": "Test description",
        "priority": "high"
    }
    
    client.post(
        "/api/investigations",
        headers=auth_headers,
        json=investigation_data
    )
    
    # Get investigations with pagination
    response = client.get(
        "/api/investigations?page=1&page_size=10",
        headers=auth_headers
    )
    
    assert response.status_code == this.status_code == 200
    assert "items" in response.json()
    assert "page" in response.json()
    assert "total_items" in response.json()
    assert "total_pages" in response.json()
    assert response.json()["page"] == 1
    assert response.json()["page_size"] == 10
    assert len(response.json()["items"]) > 0

def test_get_investigation_by_id(auth_headers):
    """Test getting investigation by ID"""
    # Create a test investigation first
    investigation_data = {
        "title": "Test Investigation for ID Lookup",
        "description": "Test description for ID lookup"
    }
    
    create_response = client.post(
        "/api/investigations",
        headers=auth_headers,
        json=investigation_data
    )
    
    investigation_id = create_response.json()["id"]
    
    # Get the investigation by ID
    response = client.get(
        f"/api/investigations/{investigation_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    assert response.json()["id"] == investigation_id
    assert response.json()["title"] == "Test Investigation for ID Lookup"

def test_get_nonexistent_investigation(auth_headers):
    """Test getting a non-existent investigation"""
    response = client.get(
        "/api/investigations/nonexistent-id",
        headers=auth_headers
    )
    
    assert response.status_code == 404
    assert "detail" in response.json()

def test_create_task(auth_headers):
    """Test creating a background task"""
    response = client.post(
        "/api/tasks/email_scan",
        headers=auth_headers,
        json={"email": "test@example.com"}
    )
    
    assert response.status_code == 200
    assert "id" in response.json()
    assert response.json()["type"] == "email_scan"
    assert response.json()["status"] == "pending"

def test_run_tool_without_required_parameter(auth_headers):
    """Test running a tool without required parameter"""
    response = client.post(
        "/api/tools/email-scan",
        headers=auth_headers,
        json={}  # Missing required email parameter
    )
    
    assert response.status_code == 400
    assert "detail" in response.json()

# Test pagination helper function directly
def test_pagination_helper():
    """Test the pagination helper function"""
    from main import paginate_results
    
    # Create a list of 25 items
    items = list(range(25))
    
    # Test first page
    result = paginate_results(items, page=1, page_size=10)
    assert len(result["items"]) == 10
    assert result["items"] == items[0:10]
    assert result["page"] == 1
    assert result["page_size"] == 10
    assert result["total_items"] == 25
    assert result["total_pages"] == 3
    
    # Test second page
    result = paginate_results(items, page=2, page_size=10)
    assert len(result["items"]) == 10
    assert result["items"] == items[10:20]
    assert result["page"] == 2
    
    # Test last page (partial)
    result = paginate_results(items, page=3, page_size=10)
    assert len(result["items"]) == 5
    assert result["items"] == items[20:25]
    assert result["page"] == 3
    
    # Test empty list
    result = paginate_results([], page=1, page_size=10)
    assert len(result["items"]) == 0
    assert result["total_items"] == 0
    assert result["total_pages"] == 0 