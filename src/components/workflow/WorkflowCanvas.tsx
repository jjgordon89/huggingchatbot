import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  MarkerType,
  useReactFlow,
  useKeyPress,
  OnSelectionChangeParams,
  NodeDragHandler,
  NodeMouseHandler,
  EdgeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Panel } from 'reactflow';
import {
  Trash2,
  Save,
  PlayCircle,
  Download,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Copy,
  Scissors,
  FileDown,
  FilePlus,
  Maximize,
  PlusCircle,
  Focus,
  Info,
  AlignJustify,
  PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

// Node types imports
import { TriggerNode } from './nodes/TriggerNode';
import { LLMNode } from './nodes/LLMNode';
import { RAGNode } from './nodes/RAGNode';
import { WebSearchNode } from './nodes/WebSearchNode';
import { ConditionalNode } from './nodes/ConditionalNode';
import { InputOutputNode } from './nodes/InputOutputNode';
import { FunctionNode } from './nodes/FunctionNode';
import { LanceDbNode } from './nodes/LanceDbNode';

// Custom edge types (if we add them)
const customEdgeStyle = {
  stroke: '#b1b1b7',
  strokeWidth: 2,
  transitionProperty: 'stroke, stroke-width',
  transitionDuration: '0.3s',
  transitionTimingFunction: 'ease',
};

const activeEdgeStyle = {
  ...customEdgeStyle,
  stroke: '#4f46e5',
  strokeWidth: 3,
};

const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  rag: RAGNode,
  'web-search': WebSearchNode,
  conditional: ConditionalNode,
  input: InputOutputNode,
  output: InputOutputNode,
  function: FunctionNode,
  lancedb: LanceDbNode
};

// Edge types
const edgeTypes = {};

// Custom default edge options
const defaultEdgeOptions = {
  style: customEdgeStyle,
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
  },
  type: 'smoothstep',
};

// History tracking for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

// Graph stats
interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  triggersCount: number;
  actionsCount: number;
}

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onNodeSelect?: (node: Node | null) => void;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onPlay?: () => void;
  readOnly?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
  title?: string;
  workflowId?: string;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onSave,
  onPlay,
  readOnly = false,
  showControls = true,
  showMiniMap = true,
  title,
  workflowId,
  onToggleSidebar,
  showSidebarToggle = false
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedElements, setSelectedElements] = useState<OnSelectionChangeParams>({ nodes: [], edges: [] });
  
  // Undo/Redo state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryUpdate, setIsHistoryUpdate] = useState(false);
  
  // UI state
  const [showGrid, setShowGrid] = useState(true);
  const [canvasMode, setCanvasMode] = useState<'default' | 'connect' | 'select'>('default');
  const [stats, setStats] = useState<GraphStats>({
    nodeCount: initialNodes.length,
    edgeCount: initialEdges.length,
    triggersCount: initialNodes.filter(n => n.type === 'trigger').length,
    actionsCount: initialNodes.filter(n => n.type !== 'trigger' && n.type !== 'input' && n.type !== 'output').length
  });
  
  // Add keyboard shortcuts support
  const deletePressed = useKeyPress(['Delete', 'Backspace']);
  const ctrlZPressed = useKeyPress(['z']);
  const ctrlYPressed = useKeyPress(['y']);
  const ctrlCPressed = useKeyPress(['c']);
  const ctrlVPressed = useKeyPress(['v']);
  const escPressed = useKeyPress(['Escape']);
  
  // Get ReactFlow utility functions
  const { fitView, zoomIn, zoomOut, getViewport, setViewport } = useReactFlow();
  
  // Update stats when nodes or edges change
  useEffect(() => {
    setStats({
      nodeCount: nodes.length,
      edgeCount: edges.length,
      triggersCount: nodes.filter(n => n.type === 'trigger').length,
      actionsCount: nodes.filter(n => n.type !== 'trigger' && n.type !== 'input' && n.type !== 'output').length
    });
  }, [nodes, edges]);
  
  // Add to history when nodes or edges change (except during undo/redo operations)
  useEffect(() => {
    if (isHistoryUpdate) {
      setIsHistoryUpdate(false);
      return;
    }
    
    // Only add to history if we have nodes or edges
    if (nodes.length > 0 || edges.length > 0) {
      // Add current state to history
      const newState: HistoryState = {
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e }))
      };
      
      // If we're not at the end of history, truncate it
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [nodes, edges]);
  
  // Handle undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setIsHistoryUpdate(true);
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // Handle redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setIsHistoryUpdate(true);
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // Watch for keyboard shortcuts
  useEffect(() => {
    if (!readOnly) {
      // Delete selected elements
      if (deletePressed && (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0)) {
        if (selectedElements.nodes.length > 0) {
          setNodes(nds => nds.filter(n => !selectedElements.nodes.some(sn => sn.id === n.id)));
        }
        if (selectedElements.edges.length > 0) {
          setEdges(eds => eds.filter(e => !selectedElements.edges.some(se => se.id === e.id)));
        }
      }
      
      // Undo/Redo with proper event typing
      if (ctrlZPressed) {
        const evt = window.event as KeyboardEvent | undefined;
        if (evt && (window.navigator.platform.match(/Mac/i) ? evt.metaKey : evt.ctrlKey)) {
          handleUndo();
        }
      }
      if (ctrlYPressed) {
        const evt = window.event as KeyboardEvent | undefined;
        if (evt && (window.navigator.platform.match(/Mac/i) ? evt.metaKey : evt.ctrlKey)) {
          handleRedo();
        }
      }
      
      // Exit connect mode on escape
      if (escPressed && canvasMode !== 'default') {
        setCanvasMode('default');
      }
    }
  }, [deletePressed, ctrlZPressed, ctrlYPressed, escPressed, selectedElements, canvasMode, readOnly, handleUndo, handleRedo]);
  
  // Node selection handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
    setSelectedEdge(null);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [onNodeSelect]);
  
  // Edge selection handler
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);
  
  // Background click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);
  
  // Track multi-selection
  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedElements(params);
    
    // If only one node is selected, update selectedNode
    if (params.nodes.length === 1 && params.edges.length === 0) {
      setSelectedNode(params.nodes[0]);
      setSelectedEdge(null);
      if (onNodeSelect) {
        onNodeSelect(params.nodes[0]);
      }
    }
    // If only one edge is selected, update selectedEdge
    else if (params.edges.length === 1 && params.nodes.length === 0) {
      setSelectedNode(null);
      setSelectedEdge(params.edges[0]);
      if (onNodeSelect) {
        onNodeSelect(null);
      }
    }
    // If multiple elements or none are selected
    else {
      setSelectedNode(null);
      setSelectedEdge(null);
      if (onNodeSelect) {
        onNodeSelect(null);
      }
    }
  }, [onNodeSelect]);
  
  // Handle new connection
  const handleConnect = useCallback((connection: Connection) => {
    // Validate the connection
    // This is where we'd add rules like:
    // - No connections to self
    // - No duplicate connections between same nodes
    // - Direction-specific rules (e.g., triggers can only have outgoing connections)
    
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    // Simple validation example
    if (connection.source === connection.target) {
      console.warn('Self-connections are not allowed');
      return;
    }
    
    // No duplicate connections
    const hasDuplicate = edges.some(e =>
      e.source === connection.source &&
      e.target === connection.target
    );
    
    if (hasDuplicate) {
      console.warn('Duplicate connections are not allowed');
      return;
    }
    
    // Create the new edge with our default options
    const newEdge = {
      ...connection,
      ...defaultEdgeOptions,
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
    };
    
    setEdges(eds => addEdge(newEdge, eds));
    
    if (onConnect) {
      onConnect(connection);
    }
  }, [setEdges, onConnect, nodes, edges]);
  
  // Handle node changes
  const onNodesChangeHandler = useCallback((changes: NodeChange[]) => {
    // Update local state
    handleNodesChange(changes);
    
    // Check if selected node is being removed
    changes.forEach(change => {
      if (change.type === 'remove' && selectedNode && change.id === selectedNode.id) {
        setSelectedNode(null);
        if (onNodeSelect) {
          onNodeSelect(null);
        }
      }
    });
    
    // Propagate changes to parent if handler provided
    if (onNodesChange) {
      onNodesChange(changes);
    }
  }, [handleNodesChange, onNodesChange, selectedNode, onNodeSelect]);
  
  // Handle edge changes
  const onEdgesChangeHandler = useCallback((changes: EdgeChange[]) => {
    // Update local state
    handleEdgesChange(changes);
    
    // Check if selected edge is being removed
    changes.forEach(change => {
      if (change.type === 'remove' && selectedEdge && change.id === selectedEdge.id) {
        setSelectedEdge(null);
      }
    });
    
    // Propagate changes to parent if handler provided
    if (onEdgesChange) {
      onEdgesChange(changes);
    }
  }, [handleEdgesChange, onEdgesChange, selectedEdge]);
  
  // Handle node deletion
  const handleDeleteSelected = useCallback(() => {
    // Delete selected nodes
    if (selectedElements.nodes.length > 0) {
      setNodes(nds => nds.filter(n => !selectedElements.nodes.some(sn => sn.id === n.id)));
    }
    
    // Delete selected edges
    if (selectedElements.edges.length > 0) {
      setEdges(eds => eds.filter(e => !selectedElements.edges.some(se => se.id === e.id)));
    }
    
    // Clear selection state
    setSelectedNode(null);
    setSelectedEdge(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [selectedElements, setNodes, setEdges, onNodeSelect]);
  
  // Handle save workflow
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);
  
  // Handle play workflow
  const handlePlay = useCallback(() => {
    if (onPlay) {
      onPlay();
    }
  }, [onPlay]);
  
  // Handle export to JSON
  const handleExport = useCallback(() => {
    const workflow = {
      nodes,
      edges,
      viewport: getViewport(),
      metadata: {
        exportedAt: new Date().toISOString(),
        workflowId: workflowId || `workflow-${Date.now()}`,
        stats
      }
    };
    
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${workflowId || 'workflow'}-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges, getViewport, workflowId, stats]);
  
  // Handle clear canvas
  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas? All nodes and connections will be removed.')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setSelectedEdge(null);
      if (onNodeSelect) {
        onNodeSelect(null);
      }
    }
  }, [setNodes, setEdges, onNodeSelect]);
  
  // Handle drag over for node placement
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Handle drop for new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      const nodeName = event.dataTransfer.getData('nodeName');

      if (typeof nodeType === 'undefined' || !nodeType || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create appropriate initial data for the node type
      let initialData: Record<string, any> = { label: nodeName || `New ${nodeType} Node` };
      
      // Add type-specific initial data
      switch (nodeType) {
        case 'trigger':
          initialData = {
            ...initialData,
            triggerType: 'manual',
            description: 'Manually triggered workflow'
          };
          break;
        case 'llm':
          initialData = {
            ...initialData,
            model: 'gpt-4',
            temperature: 0.7,
            prompt: 'Your prompt here'
          };
          break;
        case 'rag':
          initialData = {
            ...initialData,
            retrievalMethod: 'similarity',
            topK: 3,
            documents: []
          };
          break;
        case 'conditional':
          initialData = {
            ...initialData,
            conditionType: 'expression',
            condition: '',
            description: 'Branch based on condition'
          };
          break;
        case 'function':
          initialData = {
            ...initialData,
            functionName: 'processData',
            language: 'javascript',
            code: '// Your code here\nfunction processData(input) {\n  return input;\n}'
          };
          break;
        case 'input':
          initialData = {
            ...initialData,
            variableName: 'input',
            dataType: 'string',
            description: 'Workflow input parameter'
          };
          break;
        case 'output':
          initialData = {
            ...initialData,
            variableName: 'output',
            dataType: 'string',
            description: 'Workflow output result'
          };
          break;
      }

      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: initialData,
      };

      setNodes(nds => nds.concat(newNode));
      
      // Select the new node
      setSelectedNode(newNode);
      if (onNodeSelect) {
        onNodeSelect(newNode);
      }
    },
    [reactFlowInstance, setNodes, onNodeSelect]
  );
  
  // Get edge style based on selection state
  const getEdgeStyle = useCallback((edge: Edge) => {
    if (selectedEdge && selectedEdge.id === edge.id) {
      return activeEdgeStyle;
    }
    return customEdgeStyle;
  }, [selectedEdge]);

  // Toolbar and control panel rendering
  const renderToolbar = () => (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-md border shadow-sm">
      {showSidebarToggle && (
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} title="Toggle Sidebar">
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}
      
      {title && (
        <div className="px-2 font-medium text-sm flex items-center">
          {title}
        </div>
      )}
      
      <Separator orientation="vertical" className="h-6" />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={readOnly || !onSave}
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save Workflow</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              disabled={readOnly || !onPlay}
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Run Workflow</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Separator orientation="vertical" className="h-6" />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              disabled={readOnly || historyIndex <= 0}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              disabled={readOnly || historyIndex >= history.length - 1}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Separator orientation="vertical" className="h-6" />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3X3 className={`h-4 w-4 ${showGrid ? 'text-primary' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Grid</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fitView({ padding: 0.2 })}
            >
              <Focus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit View</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <AlignJustify className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export to JSON</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => handleClear()}
            className="flex items-center gap-2"
            disabled={readOnly}
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Canvas</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => window.open('https://workflow-docs.example.com', '_blank')}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            <span>Help</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
  
  // Stats display
  const renderStats = () => (
    <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-md border shadow-sm text-xs">
      <div className="flex gap-3">
        <div>
          <Badge variant="outline" className="font-normal">
            {stats.nodeCount} nodes
          </Badge>
        </div>
        <div>
          <Badge variant="outline" className="font-normal">
            {stats.edgeCount} connections
          </Badge>
        </div>
        <div>
          <Badge variant="outline" className="font-normal bg-orange-50 text-orange-800">
            {stats.triggersCount} triggers
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          style: selectedEdge && selectedEdge.id === edge.id ? activeEdgeStyle : customEdgeStyle
        }))}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDrop={readOnly ? undefined : onDrop}
        onDragOver={readOnly ? undefined : onDragOver}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        attributionPosition="bottom-right"
        connectionLineType={ConnectionLineType.SmoothStep}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly && canvasMode !== 'select'}
        elementsSelectable={!readOnly}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2}
        edgesFocusable={true}
        edgesUpdatable={!readOnly}
        className={cn(
          "workflow-canvas",
          readOnly && "workflow-canvas--readonly",
          canvasMode === 'connect' && "workflow-canvas--connect-mode",
          canvasMode === 'select' && "workflow-canvas--select-mode"
        )}
      >
        {showControls && <Controls />}
        
        {showMiniMap && (
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            maskColor="rgba(240, 240, 240, 0.6)"
            className="bg-background/80 border rounded-md shadow-sm"
          />
        )}
        
        {showGrid && <Background gap={12} size={1} color="#e5e5e5" />}
        
        {/* Render toolbar if not in readonly mode */}
        {renderToolbar()}
        
        {/* Render stats */}
        {renderStats()}
        
        {/* Action panel for selected elements */}
        {!readOnly && (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0) && (
          <Panel position="top-right" className="bg-background/90 backdrop-blur-sm border rounded-md shadow-sm p-2">
            <div className="flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">
                {selectedElements.nodes.length > 0 && selectedElements.edges.length > 0 && (
                  <span>{selectedElements.nodes.length} nodes and {selectedElements.edges.length} edges selected</span>
                )}
                {selectedElements.nodes.length > 0 && selectedElements.edges.length === 0 && (
                  <span>{selectedElements.nodes.length} node{selectedElements.nodes.length !== 1 ? 's' : ''} selected</span>
                )}
                {selectedElements.nodes.length === 0 && selectedElements.edges.length > 0 && (
                  <span>{selectedElements.edges.length} edge{selectedElements.edges.length !== 1 ? 's' : ''} selected</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
                
                {/* Copy button would be implemented here if we add clipboard functionality */}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

// Wrapped component with provider
export const WorkflowCanvasWithProvider: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
};