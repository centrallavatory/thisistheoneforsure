from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
import logging
from slowapi import Limiter
from slowapi.util import get_remote_address
from ..database.neo4j_manager import Neo4jManager
from ..auth.jwt import get_current_user
from ..schemas.user import User

# Configure logger
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(
    prefix="/graph",
    tags=["graph"],
    responses={404: {"description": "Not found"}},
)

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)

@router.get("/")
@limiter.limit("30/minute")
async def get_graph_data(
    investigation_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=10, le=500),
    user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieve a graph representation of entity relationships.
    
    Args:
        investigation_id: Optional ID to filter by investigation
        limit: Maximum number of nodes to return
        user: Current authenticated user
    
    Returns:
        Dict containing nodes and links for graph visualization
    """
    try:
        neo4j_manager = Neo4jManager()
        
        # Construct the Cypher query based on whether an investigation_id is provided
        if investigation_id:
            # Query for entities related to a specific investigation
            query = """
            MATCH (i:Investigation {id: $investigation_id})
            MATCH (i)-[:CONTAINS]->(e)
            MATCH (e)-[r]-(related)
            WHERE NOT (related:Investigation)
            RETURN e, r, related
            LIMIT $limit
            """
            params = {"investigation_id": investigation_id, "limit": limit}
        else:
            # Get a sample of entities and their relationships
            query = """
            MATCH (e)
            WHERE NOT e:Investigation
            MATCH (e)-[r]-(related)
            WHERE NOT (related:Investigation)
            RETURN e, r, related
            LIMIT $limit
            """
            params = {"limit": limit}
        
        # Execute query
        result = neo4j_manager.execute_query(query, params)
        
        # Process the results into a format suitable for graph visualization
        nodes = {}
        links = []
        
        for record in result:
            # Process source node
            src = record["e"]
            if src.id not in nodes:
                nodes[src.id] = {
                    "id": src.id,
                    "name": src.get("name", "Unknown"),
                    "type": list(src.labels)[0],
                    "properties": {k: v for k, v in src.items() if k != "name"}
                }
            
            # Process target node
            tgt = record["related"]
            if tgt.id not in nodes:
                nodes[tgt.id] = {
                    "id": tgt.id,
                    "name": tgt.get("name", "Unknown"),
                    "type": list(tgt.labels)[0],
                    "properties": {k: v for k, v in tgt.items() if k != "name"}
                }
            
            # Process relationship
            rel = record["r"]
            links.append({
                "source": src.id,
                "target": tgt.id,
                "type": type(rel).__name__,
                "properties": {k: v for k, v in rel.items()}
            })
        
        return {
            "nodes": list(nodes.values()),
            "links": links
        }
    
    except Exception as e:
        logger.error(f"Error retrieving graph data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve graph data: {str(e)}"
        )

@router.get("/entity/{entity_id}")
@limiter.limit("50/minute")
async def get_entity_graph(
    entity_id: str,
    depth: int = Query(1, ge=1, le=3),
    user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieve a graph centered around a specific entity.
    
    Args:
        entity_id: ID of the entity to retrieve connections for
        depth: How many hops away to retrieve relationships (1-3)
        user: Current authenticated user
    
    Returns:
        Dict containing nodes and links for graph visualization
    """
    try:
        neo4j_manager = Neo4jManager()
        
        # Query for relationships up to specified depth
        query = """
        MATCH (e)
        WHERE ID(e) = $entity_id
        CALL apoc.path.expand(e, "", "", 1, $depth) YIELD path
        WITH DISTINCT relationships(path) as rels, nodes(path) as nodes
        UNWIND rels as rel
        UNWIND nodes as node
        RETURN DISTINCT node, rel
        """
        
        params = {"entity_id": entity_id, "depth": depth}
        result = neo4j_manager.execute_query(query, params)
        
        # Process the results
        nodes = {}
        links = []
        
        for record in result:
            # Process node
            node = record["node"]
            if node.id not in nodes:
                nodes[node.id] = {
                    "id": node.id,
                    "name": node.get("name", "Unknown"),
                    "type": list(node.labels)[0],
                    "properties": {k: v for k, v in node.items() if k != "name"}
                }
            
            # Process relationships if present
            if record["rel"] is not None:
                rel = record["rel"]
                links.append({
                    "source": rel.start_node.id,
                    "target": rel.end_node.id,
                    "type": type(rel).__name__,
                    "properties": {k: v for k, v in rel.items()}
                })
        
        return {
            "nodes": list(nodes.values()),
            "links": links
        }
    
    except Exception as e:
        logger.error(f"Error retrieving entity graph: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve entity graph: {str(e)}"
        ) 