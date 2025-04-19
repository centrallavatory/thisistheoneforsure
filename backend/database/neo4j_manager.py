import os
import logging
from typing import Dict, Any, List
from neo4j import GraphDatabase, Driver, Session
from neo4j.exceptions import Neo4jError

# Configure logger
logger = logging.getLogger(__name__)

class Neo4jManager:
    """Manager class for Neo4j database operations"""
    
    def __init__(self):
        """Initialize the Neo4j connection using environment variables"""
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        username = os.getenv("NEO4J_USERNAME", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        
        # Verbose debugging
        logger.debug(f"Connecting to Neo4j at {uri}")
        
        try:
            self.driver: Driver = GraphDatabase.driver(uri, auth=(username, password))
            # Verify connection
            self.driver.verify_connectivity()
            logger.info("Successfully connected to Neo4j database")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {str(e)}")
            raise

    def close(self):
        """Close the Neo4j connection"""
        if hasattr(self, 'driver'):
            self.driver.close()
            logger.debug("Neo4j connection closed")

    def execute_query(self, query: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Execute a Cypher query against the Neo4j database
        
        Args:
            query: Cypher query string
            params: Optional parameters for the query
            
        Returns:
            List of records from the query result
        """
        if params is None:
            params = {}
            
        logger.debug(f"Executing query: {query}")
        logger.debug(f"Query parameters: {params}")
        
        results = []
        try:
            with self.driver.session() as session:
                result = session.run(query, params)
                for record in result:
                    results.append(record)
                    
            logger.debug(f"Query returned {len(results)} results")
            return results
            
        except Neo4jError as e:
            logger.error(f"Neo4j query error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error executing Neo4j query: {str(e)}")
            raise

    def create_entity(self, entity_type: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new entity node in the graph
        
        Args:
            entity_type: The label for the node (e.g., Person, Organization)
            properties: Dictionary of properties for the node
            
        Returns:
            Dictionary representation of the created node
        """
        query = f"""
        CREATE (n:{entity_type} $properties)
        RETURN n
        """
        
        logger.debug(f"Creating {entity_type} node with properties: {properties}")
        
        try:
            results = self.execute_query(query, {"properties": properties})
            if results:
                node = results[0]["n"]
                return {
                    "id": node.id,
                    "type": entity_type,
                    **{k: v for k, v in node.items()}
                }
            return None
        except Exception as e:
            logger.error(f"Error creating entity: {str(e)}")
            raise

    def create_relationship(
        self, 
        from_id: str, 
        to_id: str, 
        rel_type: str, 
        properties: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Create a relationship between two nodes
        
        Args:
            from_id: ID of the source node
            to_id: ID of the target node
            rel_type: Type of relationship (e.g., KNOWS, WORKS_FOR)
            properties: Optional properties for the relationship
            
        Returns:
            Dictionary representation of the created relationship
        """
        if properties is None:
            properties = {}
            
        query = f"""
        MATCH (a), (b)
        WHERE ID(a) = $from_id AND ID(b) = $to_id
        CREATE (a)-[r:{rel_type} $properties]->(b)
        RETURN a, r, b
        """
        
        params = {
            "from_id": from_id,
            "to_id": to_id,
            "properties": properties
        }
        
        logger.debug(f"Creating {rel_type} relationship: {from_id} -> {to_id}")
        
        try:
            results = self.execute_query(query, params)
            if results:
                rel = results[0]["r"]
                source = results[0]["a"]
                target = results[0]["b"]
                
                return {
                    "source": source.id,
                    "target": target.id,
                    "type": rel_type,
                    "properties": {k: v for k, v in rel.items()}
                }
            return None
        except Exception as e:
            logger.error(f"Error creating relationship: {str(e)}")
            raise
            
    def __del__(self):
        """Ensure connection is closed on deletion"""
        self.close() 