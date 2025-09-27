// src/components/common/InteractiveGraphBuilder.tsx
import React, { useState, useRef, useEffect } from 'react';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  cluster?: number;
  style?: React.CSSProperties;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  type?: 'positive' | 'negative'; // Keep for backwards compatibility but always use positive
}

interface InteractiveGraphBuilderProps {
  width: number;
  height: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodesChange: (nodes: GraphNode[]) => void;
  onEdgesChange: (edges: GraphEdge[]) => void;
  mode: 'add-node' | 'add-edge' | 'delete' | 'move' | 'view';
  edgeType?: 'positive' | 'negative'; // Kept for compatibility but always use positive
  showWeights?: boolean;
  showInstructions?: boolean;
}

export const InteractiveGraphBuilder: React.FC<InteractiveGraphBuilderProps> = ({
  width,
  height,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  mode,
  edgeType = 'positive',
  showWeights = false,
  showInstructions = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getClusterColor = (cluster?: number) => {
    const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899'];
    return cluster !== undefined ? colors[cluster % colors.length] : '#6b7280';
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'add-node') return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: GraphNode = {
      id: `n${Date.now()}`,
      x,
      y,
      label: String(nodes.length + 1),
    };

    onNodesChange([...nodes, newNode]);
  };

  const handleNodeClick = (nodeId: string) => {
    if (mode === 'add-edge') {
      if (!selectedNode) {
        setSelectedNode(nodeId);
      } else {
        if (selectedNode !== nodeId) {
          // Check if edge already exists
          const edgeExists = edges.some(
            e => (e.from === selectedNode && e.to === nodeId) ||
                 (e.from === nodeId && e.to === selectedNode)
          );

          if (!edgeExists) {
            const newEdge: GraphEdge = {
              from: selectedNode,
              to: nodeId,
              type: edgeType,
            };
            onEdgesChange([...edges, newEdge]);
          }
        }
        setSelectedNode(null);
      }
    } else if (mode === 'delete') {
      // Delete node and its connected edges
      onNodesChange(nodes.filter(n => n.id !== nodeId));
      onEdgesChange(edges.filter(e => e.from !== nodeId && e.to !== nodeId));
    }
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (mode !== 'move') return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || mode !== 'move') return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    onNodesChange(
      nodes.map(n =>
        n.id === draggedNode
          ? { ...n, x: newX, y: newY }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handleEdgeClick = (edge: GraphEdge) => {
    if (mode === 'delete') {
      onEdgesChange(edges.filter(e => !(e.from === edge.from && e.to === edge.to)));
    }
  };

  // Clear selection when mode changes
  useEffect(() => {
    setSelectedNode(null);
  }, [mode]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: 'white',
          cursor: mode === 'add-node' ? 'crosshair' : 
                  mode === 'move' ? 'move' : 
                  mode === 'delete' ? 'pointer' : 'default',
        }}
        onClick={handleSvgClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Draw edges */}
        {edges.map((edge, index) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          // For clustering page, all edges are positive, but respect type for other pages
          const edgeColor = edge.type === 'negative' ? '#ef4444' : '#10b981';
          const strokeDasharray = edge.type === 'negative' ? '5,5' : 'none';

          return (
            <g key={index}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edgeColor}
                strokeWidth="2"
                strokeDasharray={strokeDasharray}
                opacity="0.7"
                style={{ cursor: mode === 'delete' ? 'pointer' : 'default' }}
                onClick={() => handleEdgeClick(edge)}
              />
              {showWeights && edge.weight !== undefined && (
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2}
                  fill="#374151"
                  fontSize="12"
                  textAnchor="middle"
                  dy="-5"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Draw nodes */}
        {nodes.map(node => {
          const isSelected = selectedNode === node.id;
          const color = node.cluster !== undefined ? 
            getClusterColor(node.cluster) : '#9ca3af';
          
          // Apply any custom styles from the node
          const finalStyle = {
            fill: node.style?.fill || color,
            stroke: node.style?.stroke || (isSelected ? '#fbbf24' : '#374151'),
            strokeWidth: node.style?.strokeWidth || (isSelected ? 3 : 2),
            opacity: node.style?.opacity !== undefined ? node.style.opacity : 1,
          };
          
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill={finalStyle.fill}
                stroke={finalStyle.stroke}
                strokeWidth={finalStyle.strokeWidth}
                opacity={finalStyle.opacity}
                onClick={() => handleNodeClick(node.id)}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                style={{ 
                  cursor: mode === 'view' ? 'default' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
              <text
                x={node.x}
                y={node.y}
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dy="5"
                pointerEvents="none"
              >
                {node.label || node.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Instructions */}
      {showInstructions && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#f9fafb',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#6b7280',
        }}>
          {mode === 'add-node' && "Click on the canvas to add a node"}
          {mode === 'add-edge' && "Click two nodes to connect them with an edge"}
          {mode === 'move' && "Drag nodes to move them"}
          {mode === 'delete' && "Click nodes or edges to delete them"}
          {mode === 'view' && "View mode - interaction disabled"}
        </div>
      )}
    </div>
  );
};