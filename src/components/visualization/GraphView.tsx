import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ZoomInIcon, ZoomOutIcon, RefreshCwIcon, InfoIcon } from 'lucide-react';
import * as d3 from 'd3';
import { cn } from '../../lib/utils';

// These type definitions would normally come from @types/d3
// Including simplified versions here since we couldn't install the package
interface SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

interface SimulationLinkDatum {
  source: string | SimulationNodeDatum;
  target: string | SimulationNodeDatum;
  type: string;
  properties: Record<string, any>;
  index?: number;
}

interface GraphData {
  nodes: SimulationNodeDatum[];
  links: SimulationLinkDatum[];
}

interface GraphViewProps {
  investigationId?: string;
  width?: number;
  height?: number;
}

const GraphView: React.FC<GraphViewProps> = ({
  investigationId,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SimulationNodeDatum | null>(null);
  const [zoom, setZoom] = useState(1);
  const simulationRef = useRef<d3.Simulation<SimulationNodeDatum, SimulationLinkDatum> | null>(null);

  // Fetch graph data from API
  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = investigationId ? `?investigation_id=${investigationId}` : '';
      const response = await api.get(`/api/graph${params}`);
      setGraphData(response.data);
    } catch (err) {
      console.error('Failed to load graph data:', err);
      setError('Failed to load relationship graph data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [investigationId]);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;

    // Create color scale for node types
    const nodeColorScale = d3.scaleOrdinal<string>()
      .domain(['person', 'company', 'social_media', 'website', 'organization'])
      .range(['#60a5fa', '#34d399', '#f87171', '#a78bfa', '#fbbf24']);

    // Clean up previous simulation if it exists
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Setup SVG and add zoom behavior
    const svg = d3.select(svgRef.current);
    const g = svg.append('g');
    
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoomBehavior);
    
    // Prepare the data - create deep copies to avoid modifying the original
    const nodes = graphData.nodes.map((n: SimulationNodeDatum) => ({ ...n }));
    const links = graphData.links.map((l: SimulationLinkDatum) => ({ ...l }));
    
    // Create the simulation
    const simulation = d3.forceSimulation<SimulationNodeDatum>(nodes)
      .force('link', d3.forceLink<SimulationNodeDatum, SimulationLinkDatum>(links)
        .id((d: SimulationNodeDatum) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));
    
    simulationRef.current = simulation;
    
    // Create the links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: SimulationLinkDatum) => Math.sqrt((d.properties?.strength || 1) * 2));
    
    // Create the link text labels
    const linkText = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('dy', -5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#aaa')
      .attr('font-size', '10px')
      .text((d: SimulationLinkDatum) => d.type);
    
    // Create the nodes with different shapes based on type
    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(d3.drag<SVGGElement, SimulationNodeDatum>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // Person nodes are circles
    nodeGroup.filter((d: SimulationNodeDatum) => d.type === 'person')
      .append('circle')
      .attr('r', 20)
      .attr('fill', (d: SimulationNodeDatum) => nodeColorScale(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
    
    // Organization nodes are rectangles
    nodeGroup.filter((d: SimulationNodeDatum) => d.type !== 'person')
      .append('rect')
      .attr('width', 35)
      .attr('height', 35)
      .attr('x', -17.5)
      .attr('y', -17.5)
      .attr('rx', 5)
      .attr('fill', (d: SimulationNodeDatum) => nodeColorScale(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
    
    // Add text labels to nodes
    nodeGroup.append('text')
      .attr('dy', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .text((d: SimulationNodeDatum) => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name);
    
    // Add tooltip behavior
    nodeGroup.on('click', (event: MouseEvent, d: SimulationNodeDatum) => {
      event.stopPropagation();
      setSelectedNode(d);
    });
    
    // Add background click to deselect node
    svg.on('click', () => {
      setSelectedNode(null);
    });
    
    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: SimulationLinkDatum) => (d.source as SimulationNodeDatum).x || 0)
        .attr('y1', (d: SimulationLinkDatum) => (d.source as SimulationNodeDatum).y || 0)
        .attr('x2', (d: SimulationLinkDatum) => (d.target as SimulationNodeDatum).x || 0)
        .attr('y2', (d: SimulationLinkDatum) => (d.target as SimulationNodeDatum).y || 0);
        
      linkText
        .attr('x', (d: SimulationLinkDatum) => {
          const sourceX = (d.source as SimulationNodeDatum).x || 0;
          const targetX = (d.target as SimulationNodeDatum).x || 0;
          return (sourceX + targetX) / 2;
        })
        .attr('y', (d: SimulationLinkDatum) => {
          const sourceY = (d.source as SimulationNodeDatum).y || 0;
          const targetY = (d.target as SimulationNodeDatum).y || 0;
          return (sourceY + targetY) / 2;
        });
      
      nodeGroup.attr('transform', (d: SimulationNodeDatum) => `translate(${d.x || 0},${d.y || 0})`);
    });
    
    // Define drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, SimulationNodeDatum, SimulationNodeDatum>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGGElement, SimulationNodeDatum, SimulationNodeDatum>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGGElement, SimulationNodeDatum, SimulationNodeDatum>) {
      if (!event.active) simulation.alphaTarget(0);
      
      // Keep fixed on dragend to maintain position
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    // Initialize with some heat
    simulation.alpha(1).restart();
    
    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [graphData, width, height]);

  useEffect(() => {
    // Update zoom manually (separate from D3 zoom behavior)
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const currentTransform = d3.zoomTransform(svg.node() as Element);
      
      // Create a new transform with updated scale but same translation
      const newTransform = d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(zoom);
      
      // Apply the transform
      svg.call(d3.zoom<SVGSVGElement, unknown>().transform, newTransform);
    }
  }, [zoom]);

  const handleZoomIn = () => {
    setZoom((prev: number) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev: number) => Math.max(prev - 0.2, 0.5));
  };

  const handleRefresh = () => {
    fetchGraphData();
  };

  return (
    <div className={cn("rounded-lg border border-background-lighter bg-background-light shadow-sm relative")}>
      <div className="border-b border-background-lighter bg-background-lighter p-3 flex justify-between items-center">
        <div className="font-medium">Relationship Graph</div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            aria-label="Refresh graph"
          >
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-error-900/20 text-error-500 p-3 text-sm flex items-center">
          <InfoIcon className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="h-[600px] flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="relative overflow-hidden" style={{ height }}>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="bg-background"
          />
          
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-background-light p-4 rounded-md shadow-lg border border-background-lighter max-w-xs">
              <h3 className="font-medium mb-2">{selectedNode.name}</h3>
              <div className="text-xs text-gray-400 mb-1">Type: {selectedNode.type}</div>
              <div className="text-sm">
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between mt-1">
                    <span className="text-gray-400">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-background-lighter p-2 text-xs text-gray-400 border-t border-background-lighter">
        {graphData ? (
          <span>
            Showing {graphData.nodes.length} entities with {graphData.links.length} relationships
          </span>
        ) : (
          <span>No graph data available</span>
        )}
      </div>
    </div>
  );
};

export default GraphView; 