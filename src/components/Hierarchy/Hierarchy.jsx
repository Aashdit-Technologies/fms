import React, { useState } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StyledNode = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -20,
    left: '50%',
    width: 2,
    height: 20,
    background: '#cc0000',
    transform: 'translateX(-50%)',
  },
  '&.root-node::before': {
    display: 'none',
  }
});

const StyledNodeBox = styled(Paper)(({ selected }) => ({
  padding: '15px 20px',
  minWidth: 180,
  textAlign: 'center',
  border: `2px solid ${selected ? '#990000' : '#cc0000'}`,
  borderRadius: 4,
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: selected ? '0 0 0 2px rgba(153, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    borderColor: '#990000',
    boxShadow: '0 2px 6px rgba(153, 0, 0, 0.1)',
  }
}));

const StyledChildren = styled('div')(({ single }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 60,
  marginTop: 40,
  position: 'relative',
  padding: '0 30px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -40,
    left: '50%',
    width: 2,
    height: 40,
    background: '#cc0000',
    transform: 'translateX(-50%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 2,
    background: '#cc0000',
    display: single ? 'none' : 'block',
  }
}));

const HierarchyNode = ({ node, onSelect, isSelected, onAdd, onDelete, onMove, onLevelChange, existingValues }) => {
  const levels = [
    { value: 'ceo', label: 'CEO' },
    { value: 'director', label: 'Director' },
    { value: 'manager', label: 'Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'associate', label: 'Associate' }
  ];

  const handleLevelChange = (event) => {
    const newValue = event.target.value;
    if (existingValues.includes(newValue)) {
      toast.error('This organization level is already selected');
      return;
    }
    onLevelChange(node.id, newValue);
  };

  return (
    <StyledNode className={node.id === '1' ? 'root-node' : ''}>
      <StyledNodeBox selected={isSelected} onClick={() => onSelect(node)}>
        <FormControl fullWidth>
          <InputLabel>Position</InputLabel>
          <Select
            value={node.level || ''}
            onChange={handleLevelChange}
            label="Position"
            defaultValue={node.id === '1' ? 'ceo' : ''}
          >
            {levels.map((level) => (
              <MenuItem
                key={level.value}
                value={level.value}
                disabled={existingValues.includes(level.value) && node.level !== level.value}
              >
                {level.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </StyledNodeBox>
      
      {node.children?.length > 0 && (
        <StyledChildren single={node.children.length === 1}>
          {node.children.map((child) => (
            <HierarchyNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              isSelected={child.id === isSelected}
              onAdd={onAdd}
              onDelete={onDelete}
              onMove={onMove}
              onLevelChange={onLevelChange}
              existingValues={existingValues}
            />
          ))}
        </StyledChildren>
      )}
    </StyledNode>
  );
};

const Hierarchy = () => {
  const [selectedNode, setSelectedNode] = useState({
    id: '1',
    name: 'JJG Corp',
    level: 'ceo',
    children: []
  });
  
  const [treeData, setTreeData] = useState({
    id: '1',
    name: 'JJG Corp',
    level: 'ceo',
    children: []
  });

  const getAllValues = (node) => {
    let values = [node.level];
    if (node.children) {
      node.children.forEach(child => {
        values = [...values, ...getAllValues(child)];
      });
    }
    return values.filter(Boolean);
  };

  const findParentNode = (tree, id) => {
    for (const child of tree.children || []) {
      if (child.id === id) return tree;
      const found = findParentNode(child, id);
      if (found) return found;
    }
    return null;
  };

  const addNode = () => {
    if (!selectedNode) return;
    
    const newNode = {
      id: Date.now().toString(),
      name: 'Select Organization',
      level: '',
      children: []
    };

    const updateTree = (node) => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      return {
        ...node,
        children: (node.children || []).map(updateTree)
      };
    };

    setTreeData(updateTree(treeData));
  };

  const deleteNode = () => {
    if (!selectedNode || selectedNode.id === '1') return;

    const updateTree = (node) => {
      return {
        ...node,
        children: (node.children || [])
          .filter(child => child.id !== selectedNode.id)
          .map(updateTree)
      };
    };

    setTreeData(updateTree(treeData));
    setSelectedNode(null);
  };

  const moveNode = (direction) => {
    if (!selectedNode || selectedNode.id === '1') return;

    const parentNode = findParentNode(treeData, selectedNode.id);
    if (!parentNode) return;

    const siblings = parentNode.children;
    const currentIndex = siblings.findIndex(node => node.id === selectedNode.id);
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= siblings.length) return;

    const updateTree = (node) => {
      if (node.id === parentNode.id) {
        const newChildren = [...node.children];
        [newChildren[currentIndex], newChildren[newIndex]] = [newChildren[newIndex], newChildren[currentIndex]];
        return { ...node, children: newChildren };
      }
      return {
        ...node,
        children: (node.children || []).map(updateTree)
      };
    };

    setTreeData(updateTree(treeData));
  };

  const handleLevelChange = (nodeId, level) => {
    const updateTree = (node) => {
      if (node.id === nodeId) {
        return { ...node, level };
      }
      return {
        ...node,
        children: (node.children || []).map(updateTree)
      };
    };
    setTreeData(updateTree(treeData));
  };

  const existingValues = getAllValues(treeData);

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', minHeight: 'calc(100vh - 100px)' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained"
          onClick={() => moveNode('left')}
          disabled={!selectedNode || selectedNode.id === '1'}
          sx={{ bgcolor: '#1976D2' }}
        >
          ←
        </Button>
        <Button 
          variant="contained"
          onClick={() => moveNode('right')}
          disabled={!selectedNode || selectedNode.id === '1'}
          sx={{ bgcolor: '#1976D2' }}
        >
          →
        </Button>
        <Button 
          variant="contained"
          onClick={addNode}
          disabled={!selectedNode}
          sx={{ bgcolor: '#4CAF50' }}
        >
          +
        </Button>
        <Button 
          variant="contained"
          onClick={deleteNode}
          disabled={!selectedNode || selectedNode.id === '1'}
          sx={{ bgcolor: '#F44336' }}
        >
          ×
        </Button>
      </Box>
      
      <Paper sx={{ p: 8, minHeight: 400, position: 'relative', overflow: 'auto' }}>
        <HierarchyNode
          node={treeData}
          onSelect={setSelectedNode}
          isSelected={selectedNode?.id}
          onAdd={addNode}
          onDelete={deleteNode}
          onMove={moveNode}
          onLevelChange={handleLevelChange}
          existingValues={existingValues}
        />
      </Paper>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </Box>
  );
};

export default Hierarchy;