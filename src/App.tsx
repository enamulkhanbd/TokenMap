import { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { parseTokens } from './utils/tokenParser';
import { getLayoutedElements } from './utils/layout';
import { processTokenFile } from './utils/fileUtils';
import { type Node, type Edge } from 'reactflow';
import type { TokenGroup } from './types/tokens';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [, setRawTokens] = useState<TokenGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await processTokenFile(file);
      setRawTokens(json);
      const { nodes: parsedNodes, edges: parsedEdges } = parseTokens(json);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(parsedNodes, parsedEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err) {
      alert('Failed to process file: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term.toLowerCase());
  }, []);

  // Filter logic
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;

    // Find matching nodes and their ancestors/descendants
    const matchingNodeIds = new Set<string>();

    nodes.forEach(node => {
      if (
        node.data.label.toLowerCase().includes(searchTerm) ||
        node.data.fullPath.toLowerCase().includes(searchTerm) ||
        (node.data.value && String(node.data.value).toLowerCase().includes(searchTerm))
      ) {
        matchingNodeIds.add(node.id);
      }
    });

    // For a real SystemsMap feel, we'd also include connected nodes
    // but for now let's just highlight/filter the list
    return nodes.map(node => ({
      ...node,
      style: { ...node.style, opacity: matchingNodeIds.has(node.id) || matchingNodeIds.size === 0 ? 1 : 0.2 }
    }));
  }, [nodes, searchTerm]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <Sidebar onFileUpload={handleFileUpload} onSearch={handleSearch} />
      <MapCanvas nodes={filteredNodes} edges={edges} />
    </div>
  );
}

export default App;
