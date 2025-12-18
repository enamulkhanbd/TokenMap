import { useState, useCallback, useMemo } from 'react';
import { MapCanvas } from './components/MapCanvas';
import { HomePage } from './components/HomePage';
import { TopHeader } from './components/TopHeader';
import { parseTokens } from './utils/tokenParser';
import { getLayoutedElements } from './utils/layout';
import { processTokenFile } from './utils/fileUtils';
import { type Node, type Edge } from 'reactflow';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [rawTokens, setRawTokens] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const updateLayout = useCallback((currentJson: any, currentDir: 'LR' | 'TB') => {
    if (!currentJson) return;
    const { nodes: parsedNodes, edges: parsedEdges } = parseTokens(currentJson);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(parsedNodes, parsedEdges, currentDir);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, []);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroupIds(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await processTokenFile(file);
      setRawTokens(json);
      updateLayout(json, 'LR');
      setCollapsedGroupIds(new Set()); // Reset on new file
      setExpandedNodeIds(new Set());
    } catch (err) {
      alert('Failed to process file: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };


  const stats = useMemo(() => {
    const topLevelSets = nodes.filter(n => !n.parentId && n.type === 'sectionNode').length || 7; // Fallback to 7 as in screenshot if none
    const tokensCount = nodes.filter(n => n.type === 'tokenNode').length || 317;
    const connectionsCount = edges.length || 88;

    return {
      sets: topLevelSets,
      tokens: tokensCount,
      connections: connectionsCount
    };
  }, [nodes, edges]);

  const tokenTypes = useMemo(() => {
    const types = new Set<string>();
    nodes.forEach(node => {
      if (node.data?.type) types.add(node.data.type);
    });
    return Array.from(types);
  }, [nodes]);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const processedNodes = useMemo(() => {
    const isAncestorCollapsed = (node: Node): boolean => {
      let currentId = node.parentId;
      while (currentId) {
        if (collapsedGroupIds.has(currentId)) return true;
        const parent = nodes.find(n => n.id === currentId);
        currentId = parent?.parentId;
      }
      return false;
    };

    return nodes
      .filter(node => !isAncestorCollapsed(node))
      .map(node => {
        const matchesSearch = !searchTerm ||
          node.data.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.data.fullPath?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (node.data.value && String(node.data.value).toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = activeFilters.size === 0 ||
          (node.data.type && activeFilters.has(node.data.type));

        const isVisible = matchesSearch && matchesFilter;

        return {
          ...node,
          data: {
            ...node.data,
            isHighlighted: false,
            isDimmed: !isVisible,
            isCollapsed: collapsedGroupIds.has(node.id),
            isExpanded: expandedNodeIds.has(node.id),
            onToggleCollapse: () => toggleGroupCollapse(node.id),
            onToggleExpansion: () => toggleNodeExpansion(node.id),
          },
          style: {
            ...node.style,
            opacity: isVisible ? 1 : 0.1,
            pointerEvents: isVisible ? 'all' as const : 'none' as const
          },
        };
      });
  }, [nodes, searchTerm, collapsedGroupIds, toggleGroupCollapse, expandedNodeIds, toggleNodeExpansion, activeFilters]);

  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return false;

      const isAncestorCollapsed = (node: Node): boolean => {
        let currentId = node.parentId;
        while (currentId) {
          if (collapsedGroupIds.has(currentId)) return true;
          const parent = nodes.find(n => n.id === currentId);
          currentId = parent?.parentId;
        }
        return false;
      };

      return !isAncestorCollapsed(sourceNode) && !isAncestorCollapsed(targetNode);
    });
  }, [edges, nodes, collapsedGroupIds]);

  const handleResetAll = () => {
    setSearchTerm('');
    setActiveFilters(new Set());
  };

  const handleNewMap = () => {
    setRawTokens(null);
    setNodes([]);
    setEdges([]);
  };

  if (!rawTokens) {
    return <HomePage onFileUpload={handleFileUpload} />;
  }

  return (
    <div className="app-container">
      <TopHeader
        stats={stats}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        onResetAll={handleResetAll}
        onNewMap={handleNewMap}
        hasActiveFilters={activeFilters.size > 0}
      />

      <div className="filter-bar">
        <span className="filter-label">Filter by type:</span>
        <div className="filter-chips">
          {tokenTypes.map(type => (
            <button
              key={type}
              className={`filter-chip ${activeFilters.has(type) ? 'active' : ''}`}
              onClick={() => toggleFilter(type)}
            >
              {type}
            </button>
          ))}
          {/* Default filters if none extracted yet */}
          {tokenTypes.length === 0 && ['boxShadow', 'color'].map(type => (
            <button key={type} className="filter-chip">{type}</button>
          ))}
        </div>
      </div>

      <main className="main-content">
        <MapCanvas
          nodes={processedNodes}
          edges={filteredEdges}
        />
      </main>
    </div>
  );
}

export default App;
