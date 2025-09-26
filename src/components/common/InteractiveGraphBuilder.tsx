// src/components/common/InteractiveGraphBuilder.tsx
import React, { useState, useRef, useEffect } from 'react';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  cluster?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'positive' | 'negative';
  weight?: number;
}

interface InteractiveGraphBuilderProps {
  width: number;
  height: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodesChange: (nodes: GraphNode[]) => void;
  onEdgesChange: (edges: GraphEdge[]) => void;
  mode: 'add-node' | 'add-edge' | 'delete' | 'move' | 'view';
  edgeType?: 'positive' | 'negative';
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
  showInstructions = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const clusterColors = [
    '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
    '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
  ];

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'add-node') return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Don't add node if clicking on existing node
    const clickedNode = nodes.find(n => 
      Math.sqrt(Math.pow(n.x - x, 2) + Math.pow(n.y - y, 2)) < 20
    );
    if (clickedNode) return;

    const newNode: GraphNode = {
      id: `node-${Date.now()}`,
      x,
      y,
      label: String(nodes.length + 1)
    };

    onNodesChange([...nodes, newNode]);
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === 'delete') {
      // Delete node and its edges
      onNodesChange(nodes.filter(n => n.id !== nodeId));
      onEdgesChange(edges.filter(e => e.from !== nodeId && e.to !== nodeId));
    } else if (mode === 'add-edge') {
      if (!selectedNode) {
        setSelectedNode(nodeId);
      } else if (selectedNode !== nodeId) {
        // Check if edge already exists
        const existingEdge = edges.find(e => 
          (e.from === selectedNode && e.to === nodeId) ||
          (e.from === nodeId && e.to === selectedNode)
        );

        if (!existingEdge) {
          const newEdge: GraphEdge = {
            from: selectedNode,
            to: nodeId,
            type: edgeType
          };
          onEdgesChange([...edges, newEdge]);
        }
        setSelectedNode(null);
      }
    }
  };

  const handleEdgeClick = (edge: GraphEdge, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (mode === 'delete') {
      onEdgesChange(edges.filter(e => e !== edge));
    }
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (mode === 'move') {
      setDraggedNode(nodeId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (draggedNode && mode === 'move') {
      const updatedNodes = nodes.map(n => 
        n.id === draggedNode ? { ...n, x, y } : n
      );
      onNodesChange(updatedNodes);
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // Clean up selected node when mode changes
  useEffect(() => {
    setSelectedNode(null);
  }, [mode]);

  const styles = {
    svg: {
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      cursor: mode === 'add-node' ? 'crosshair' : 
              mode === 'move' ? 'move' : 
              mode === 'delete' ? 'pointer' : 'default',
    },
    instructions: {
      position: 'absolute' as const,
      top: '10px',
      left: '10px',
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      borderRadius: '6px',
      fontSize: '12px',
    }
  };

  const getInstructionText = () => {
    switch(mode) {
      case 'add-node': return 'Click to add node';
      case 'add-edge': return selectedNode ? 'Click another node to connect' : 'Click a node to start edge';
      case 'move': return 'Drag nodes to move';
      case 'delete': return 'Click to delete';
      case 'view': return 'View only';
      default: return '';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {showInstructions && (
        <div style={styles.instructions}>
          {getInstructionText()}
        </div>
      )}
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={styles.svg}
        onClick={handleSvgClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Draw edges */}
        {edges.map((edge, idx) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          
          if (!fromNode || !toNode) return null;

          const edgeClass = edge.type === 'positive' ? 'edge-positive' : 'edge-negative';
          
          return (
            <g key={idx}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className={edgeClass}
                onClick={(e) => handleEdgeClick(edge, e)}
                style={{ cursor: mode === 'delete' ? 'pointer' : 'default' }}
              />
              {showWeights && edge.weight && (
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2}
                  fill="black"
                  fontSize="12"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Draw nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode === node.id;
          const color = node.cluster !== undefined ? 
            clusterColors[node.cluster % clusterColors.length] : '#667eea';
          
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={20}
                fill={color}
                stroke={isSelected ? '#fbbf24' : '#374151'}
                strokeWidth={isSelected ? 3 : 2}
                onClick={(e) => handleNodeClick(node.id, e)}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                style={{ 
                  cursor: mode === 'delete' ? 'pointer' : 
                         mode === 'move' ? 'move' : 
                         mode === 'add-edge' ? 'pointer' : 'default',
                  transition: 'fill 0.3s ease'
                }}
              />
              <text
                x={node.x}
                y={node.y}
                dy="0.35em"
                fill="white"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.label || node.id.slice(-4)}
              </text>
            </g>
          );
        })}

        {/* Draw line preview when adding edge */}
        {mode === 'add-edge' && selectedNode && (
          <>
            {nodes.find(n => n.id === selectedNode) && (
              <line
                x1={nodes.find(n => n.id === selectedNode)!.x}
                y1={nodes.find(n => n.id === selectedNode)!.y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="#9ca3af"
                strokeWidth="2"
                strokeDasharray="5,5"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </>
        )}
      </svg>
    </div>
  );
};