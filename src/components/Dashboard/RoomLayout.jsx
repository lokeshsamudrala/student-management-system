import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  RotateCcw, 
  Download, 
  Search, 
  Filter,
  Users,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FolderOpen,
  Trash2,
  Film
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

// Movable Furniture Component
const FurnitureItem = ({ id, type, position, onMove, zoom, isSelected, onSelect, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    onSelect(id);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    onMove(id, newPosition);
  }, [isDragging, dragStart, id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const scale = zoom / 100;

  return (
    <div
      className={`absolute select-none cursor-move ${isDragging ? 'z-50' : 'z-5'} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

// Updated Student Node Component with better tooltip positioning and all fields
const StudentNode = ({ data, position, onMove, onRemove, zoom, isSelected, onSelect }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltipPosition, setTooltipPosition] = useState('top');
  const nodeRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    onSelect(data.id);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    onMove(data.id, newPosition);
  }, [isDragging, dragStart, data.id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate optimal tooltip position to avoid overlaps
  const calculateTooltipPosition = useCallback(() => {
    if (!nodeRef.current) return;

    const nodeRect = nodeRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Check if there's enough space above
    const spaceAbove = nodeRect.top;
    const spaceBelow = viewportHeight - nodeRect.bottom;
    const spaceLeft = nodeRect.left;
    const spaceRight = viewportWidth - nodeRect.right;

    // Tooltip dimensions (approximate)
    const tooltipHeight = 400;
    const tooltipWidth = 320;

    let newPosition = 'top';

    if (spaceAbove >= tooltipHeight) {
      newPosition = 'top';
    } else if (spaceBelow >= tooltipHeight) {
      newPosition = 'bottom';
    } else if (spaceRight >= tooltipWidth) {
      newPosition = 'right';
    } else if (spaceLeft >= tooltipWidth) {
      newPosition = 'left';
    } else {
      // Fallback to top if no good position
      newPosition = 'top';
    }

    setTooltipPosition(newPosition);
  }, []);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    calculateTooltipPosition();
  };

  const scale = zoom / 100;
  const nameParts = data.full_name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  // Tooltip positioning classes
  const getTooltipClasses = () => {
    const baseClasses = "absolute z-50 w-80 bg-white rounded-lg shadow-xl border border-apple-200 p-4 print:hidden";
    
    switch (tooltipPosition) {
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      default: // top
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  return (
    <div 
      ref={nodeRef}
      className={`absolute select-none ${isDragging ? 'z-50' : 'z-10'} ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => onRemove(data.id)}
    >
      {/* Student Avatar */}
      <div className={`w-16 h-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white cursor-move hover:scale-110 transition-transform ${isDragging ? 'opacity-80' : ''}`}>
        {data.profile_picture_url ? (
          <img
            src={data.profile_picture_url}
            alt={data.full_name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {data.full_name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* Student Name - Better formatting for PDF export */}
      <div className="text-center mt-1 w-20">
        <div 
          className="text-xs font-semibold text-apple-700 leading-tight"
          style={{
            fontSize: Math.max(10, 12 * (zoom / 100)) + 'px',
            lineHeight: '1.1',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}
        >
          <div className="truncate">{firstName}</div>
          {lastName && (
            <div className="truncate text-apple-600" style={{ fontSize: Math.max(9, 10 * (zoom / 100)) + 'px' }}>
              {lastName}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Tooltip with all fields and better positioning */}
      {showTooltip && !isDragging && (
        <div ref={tooltipRef} className={getTooltipClasses()}>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              {data.profile_picture_url ? (
                <img
                  src={data.profile_picture_url}
                  alt={data.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {data.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-apple-900">{data.full_name}</h3>
              <p className="text-sm text-apple-600">{data.pronoun}</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm max-h-80 overflow-y-auto">
            <div>
              <span className="font-medium text-apple-700">Email:</span>
              <p className="text-apple-600 break-all">{data.email}</p>
            </div>
            
            <div>
              <span className="font-medium text-apple-700">Major:</span>
              <p className="text-apple-600">{data.major}</p>
            </div>
            
            {data.hobbies && data.hobbies.length > 0 && (
              <div>
                <span className="font-medium text-apple-700">Hobbies:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.hobbies.map((hobby, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-apple-100 text-apple-700 text-xs rounded-full"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Movies/Shows Section */}
            {data.favorite_movies && data.favorite_movies.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <Film className="h-4 w-4 mr-1 text-apple-600" />
                  <span className="font-medium text-apple-700">Favorite Movies/Shows:</span>
                </div>
                <div className="space-y-2">
                  {data.favorite_movies.map((movie, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-8 h-10 bg-apple-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        {movie.poster ? (
                          <img 
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="h-3 w-3 text-apple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-apple-700 truncate">{movie.title}</p>
                        <p className="text-xs text-apple-500">
                          {movie.year} • {movie.type === 'movie' ? 'Movie' : 'TV'}
                          {movie.rating && ` • ⭐ ${movie.rating}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {data.about_me && (
              <div>
                <span className="font-medium text-apple-700">About:</span>
                <p className="text-apple-600 leading-relaxed">{data.about_me}</p>
              </div>
            )}
            
            {data.professor_notes && data.professor_notes.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <span className="font-medium text-yellow-800">Professor Notes:</span>
                <div className="mt-2 space-y-2">
                  {data.professor_notes.map((note, index) => (
                    <div key={index} className="bg-yellow-100 rounded p-2">
                      <p className="text-yellow-700 text-xs leading-relaxed">
                        {note.notes}
                      </p>
                      {note.created_at && (
                        <p className="text-yellow-600 text-xs mt-1">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-apple-200">
            <div className="text-xs text-apple-500 text-center">
              Double-click to remove • Drag to move
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Saved Layouts Modal
const SavedLayoutsModal = ({ isOpen, onClose, savedLayouts, onLoadLayout, onDeleteLayout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-apple-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-apple-900">Saved Layouts</h2>
            <button
              onClick={onClose}
              className="text-apple-400 hover:text-apple-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {savedLayouts.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-apple-400 mx-auto mb-4" />
              <p className="text-apple-600">No saved layouts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className="flex items-center justify-between p-4 bg-apple-50 rounded-lg hover:bg-apple-100 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-apple-900">{layout.layout_name}</h3>
                    <p className="text-sm text-apple-600">
                      Created: {new Date(layout.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-apple-500">
                      {layout.layout_data?.students?.length || 0} students placed
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        onLoadLayout(layout);
                        onClose();
                      }}
                      className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteLayout(layout.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
const RoomLayout = ({ students, user }) => {
  const [placedStudents, setPlacedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [layoutName, setLayoutName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [showSavedLayouts, setShowSavedLayouts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLayoutId, setCurrentLayoutId] = useState(null);
  
  // Furniture state
  const [furniture, setFurniture] = useState([
    {
      id: 'table1',
      type: 'table',
      position: { x: 100, y: 150 },
      name: 'Table 1'
    },
    {
      id: 'table2',
      type: 'table', 
      position: { x: 500, y: 150 },
      name: 'Table 2'
    },
    {
      id: 'teacherDesk',
      type: 'teacherDesk',
      position: { x: 300, y: 450 },
      name: "Teacher's Desk"
    },
    {
      id: 'whiteboard',
      type: 'whiteboard',
      position: { x: 250, y: 50 },
      name: 'Whiteboard'
    }
  ]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  
  const canvasRef = useRef(null);

  const majors = ['Computer Science', 'Information Technology', 'Cybersecurity', 'DSBA'];

  // Load saved layouts and auto-save state on mount
  useEffect(() => {
    loadSavedLayouts();
    loadAutoSavedState();
  }, [user]);

  // Auto-save current state when it changes
  useEffect(() => {
    if (isLoading) return;
    
    const autoSaveData = {
      placedStudents,
      furniture,
      zoom,
      canvasOffset,
      layoutName,
      selectedMajor,
      searchTerm
    };
    
    localStorage.setItem('roomLayout_autoSave', JSON.stringify(autoSaveData));
  }, [placedStudents, furniture, zoom, canvasOffset, layoutName, selectedMajor, searchTerm, isLoading]);

  const loadAutoSavedState = () => {
    try {
      const autoSaved = localStorage.getItem('roomLayout_autoSave');
      if (autoSaved) {
        const data = JSON.parse(autoSaved);
        setPlacedStudents(data.placedStudents || []);
        setFurniture(data.furniture || furniture);
        setZoom(data.zoom || 100);
        setCanvasOffset(data.canvasOffset || { x: 0, y: 0 });
        setLayoutName(data.layoutName || '');
        setSelectedMajor(data.selectedMajor || '');
        setSearchTerm(data.searchTerm || '');
      }
    } catch (error) {
      console.error('Error loading auto-saved state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedLayouts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('room_layouts')
        .select('*')
        .eq('professor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedLayouts(data || []);
    } catch (error) {
      console.error('Error loading saved layouts:', error);
    }
  };

  const loadLayout = (layout) => {
    try {
      const layoutData = layout.layout_data;
      setPlacedStudents(layoutData.students || []);
      setFurniture(layoutData.furniture || furniture);
      setZoom(layoutData.zoom || 100);
      setCanvasOffset(layoutData.canvasOffset || { x: 0, y: 0 });
      setLayoutName(layout.layout_name);
      setCurrentLayoutId(layout.id);
      toast.success(`Loaded layout: ${layout.layout_name}`);
    } catch (error) {
      console.error('Error loading layout:', error);
      toast.error('Failed to load layout');
    }
  };

  const deleteLayout = async (layoutId) => {
    try {
      const { error } = await supabase
        .from('room_layouts')
        .delete()
        .eq('id', layoutId);

      if (error) throw error;

      setSavedLayouts(prev => prev.filter(layout => layout.id !== layoutId));
      if (currentLayoutId === layoutId) {
        setCurrentLayoutId(null);
      }
      toast.success('Layout deleted successfully');
    } catch (error) {
      console.error('Error deleting layout:', error);
      toast.error('Failed to delete layout');
    }
  };

  // Furniture movement function
  const moveFurniture = (furnitureId, newPosition) => {
    setFurniture(prev =>
      prev.map(item =>
        item.id === furnitureId
          ? { ...item, position: newPosition }
          : item
      )
    );
  };

  // Filter available students
  useEffect(() => {
    const placedStudentIds = placedStudents.map(student => student.data.id);
    let filtered = students.filter(student => !placedStudentIds.includes(student.id));

    if (searchTerm) {
      filtered = filtered.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        return (
          student.full_name.toLowerCase().includes(searchLower) ||
          student.major.toLowerCase().includes(searchLower) ||
          (student.hobbies && student.hobbies.some(hobby => 
            hobby.toLowerCase().includes(searchLower)
          ))
        );
      });
    }

    if (selectedMajor) {
      filtered = filtered.filter(student => student.major === selectedMajor);
    }

    setAvailableStudents(filtered);
  }, [students, placedStudents, searchTerm, selectedMajor]);

  const onDragStart = (event, student) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(student));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();
    const studentData = JSON.parse(event.dataTransfer.getData('text/plain'));
    const rect = canvasRef.current.getBoundingClientRect();
    
    const position = {
      x: (event.clientX - rect.left - canvasOffset.x) / (zoom / 100) - 40,
      y: (event.clientY - rect.top - canvasOffset.y) / (zoom / 100) - 40
    };

    const newPlacedStudent = {
      id: studentData.id,
      data: studentData,
      position: position
    };

    setPlacedStudents(prev => [...prev, newPlacedStudent]);
  };

  const moveStudent = (studentId, newPosition) => {
    setPlacedStudents(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, position: newPosition }
          : student
      )
    );
  };

  const removeStudent = (studentId) => {
    setPlacedStudents(prev => prev.filter(student => student.id !== studentId));
    setSelectedStudent(null);
  };

  const clearLayout = () => {
    setPlacedStudents([]);
    setSelectedStudent(null);
    setSelectedFurniture(null);
    setCurrentLayoutId(null);
    setLayoutName('');
    // Reset furniture to default positions
    setFurniture([
      {
        id: 'table1',
        type: 'table',
        position: { x: 100, y: 150 },
        name: 'Table 1'
      },
      {
        id: 'table2',
        type: 'table', 
        position: { x: 500, y: 150 },
        name: 'Table 2'
      },
      {
        id: 'teacherDesk',
        type: 'teacherDesk',
        position: { x: 300, y: 450 },
        name: "Teacher's Desk"
      },
      {
        id: 'whiteboard',
        type: 'whiteboard',
        position: { x: 250, y: 50 },
        name: 'Whiteboard'
      }
    ]);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const resetView = () => {
    setZoom(100);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedStudent(null);
      setSelectedFurniture(null);
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y
      });
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isPanning) return;
    
    setCanvasOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  const saveLayout = async () => {
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name');
      return;
    }

    if (!user || !user.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      const layoutData = {
        students: placedStudents,
        furniture: furniture,
        zoom: zoom,
        canvasOffset: canvasOffset
      };

      let result;
      if (currentLayoutId) {
        result = await supabase
          .from('room_layouts')
          .update({
            layout_name: layoutName,
            layout_data: layoutData
          })
          .eq('id', currentLayoutId)
          .select();
      } else {
        result = await supabase
          .from('room_layouts')
          .insert([{
            professor_id: user.id,
            layout_name: layoutName,
            layout_data: layoutData
          }])
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data && data[0]) {
        setCurrentLayoutId(data[0].id);
      }

      await loadSavedLayouts();
      toast.success(currentLayoutId ? 'Layout updated successfully!' : 'Layout saved successfully!');
    } catch (error) {
      console.error('Save layout error:', error);
      toast.error(`Failed to save layout: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = async () => {
    try {
      // Hide tooltips and interactive elements before export
      const tooltips = document.querySelectorAll('.print\\:hidden');
      tooltips.forEach(tooltip => {
        tooltip.style.display = 'none';
      });

      const element = canvasRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        logging: false,
        ignoreElements: (element) => {
          return element.classList.contains('print:hidden') || 
                 element.getAttribute('role') === 'tooltip';
        },
        onclone: (clonedDoc) => {
         // Improve text rendering in the clone
         const textElements = clonedDoc.querySelectorAll('div, span');
         textElements.forEach(el => {
           const computedStyle = window.getComputedStyle(el);
           el.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
           el.style.fontSmooth = 'always';
           el.style.webkitFontSmoothing = 'antialiased';
           el.style.textRendering = 'optimizeLegibility';
           
           if (el.style.fontSize) {
             const fontSize = parseFloat(el.style.fontSize);
             if (fontSize < 12) {
               el.style.fontSize = '12px';
             }
           }
         });
       }
     });

     const imgData = canvas.toDataURL('image/png', 1.0);
     const pdf = new jsPDF({
       orientation: 'landscape',
       unit: 'mm',
       format: 'a4',
     });

     // Calculate dimensions
     const pdfWidth = pdf.internal.pageSize.getWidth();
     const pdfHeight = pdf.internal.pageSize.getHeight();
     const imgWidth = pdfWidth;
     const imgHeight = (canvas.height * imgWidth) / canvas.width;

     // Add title
     pdf.setFontSize(16);
     pdf.setFont(undefined, 'bold');
     pdf.text(`Classroom Layout: ${layoutName || 'Untitled'}`, 15, 15);
     
     // Add layout image
     const yOffset = 25;
     const maxImgHeight = pdfHeight - yOffset - 40;
     const finalImgHeight = Math.min(imgHeight, maxImgHeight);
     
     pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, finalImgHeight);
     
     // Add student list on a new page if there are students
     if (placedStudents.length > 0) {
       pdf.addPage();
       pdf.setFontSize(14);
       pdf.setFont(undefined, 'bold');
       pdf.text('Students in Layout:', 15, 20);
       
       pdf.setFont(undefined, 'normal');
       pdf.setFontSize(11);
       
       let yPos = 35;
       placedStudents.forEach((student, index) => {
         if (yPos > pdfHeight - 20) {
           pdf.addPage();
           yPos = 20;
         }
         
         const studentInfo = `${index + 1}. ${student.data.full_name} - ${student.data.major}`;
         pdf.text(studentInfo, 15, yPos);
         
         if (student.data.email) {
           yPos += 5;
           pdf.setFontSize(9);
           pdf.setTextColor(100);
           pdf.text(`   Email: ${student.data.email}`, 15, yPos);
           pdf.setTextColor(0);
           pdf.setFontSize(11);
         }
         
         yPos += 8;
       });
     }

     // Save the PDF
     pdf.save(`classroom-layout-${layoutName?.replace(/[^a-z0-9]/gi, '_') || Date.now()}.pdf`);
     
     // Restore tooltips
     tooltips.forEach(tooltip => {
       tooltip.style.display = '';
     });
     
     toast.success('Layout exported to PDF successfully!');
   } catch (error) {
     console.error('Export error:', error);
     toast.error('Failed to export PDF. Please try again.');
   }
 };

 if (isLoading) {
   return (
     <div className="flex items-center justify-center h-screen">
       <div className="text-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
         <p className="text-apple-600">Loading layout...</p>
       </div>
     </div>
   );
 }

 return (
   <div className="flex h-screen bg-apple-50">
     {/* Student List Sidebar */}
     <div className={`${isFullscreen ? 'hidden' : 'w-80'} bg-white shadow-lg border-r border-apple-200 flex flex-col`}>
       <div className="p-4 border-b border-apple-200">
         <h2 className="text-lg font-semibold text-apple-900 mb-4">Available Students</h2>
         
         {/* Search */}
         <div className="relative mb-3">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-apple-400" />
           <input
             type="text"
             placeholder="Search students..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 border border-apple-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
           />
         </div>

         {/* Major Filter */}
         <div className="relative mb-3">
           <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-apple-400" />
           <select
             value={selectedMajor}
             onChange={(e) => setSelectedMajor(e.target.value)}
             className="w-full pl-10 pr-4 py-2 border border-apple-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
           >
             <option value="">All Majors</option>
             {majors.map(major => (
               <option key={major} value={major}>{major}</option>
             ))}
           </select>
         </div>

         <div className="flex items-center text-sm text-apple-600">
           <Users className="h-4 w-4 mr-2" />
           {availableStudents.length} students available
         </div>
       </div>

       {/* Student List */}
       <div className="flex-1 overflow-y-auto p-4">
         <div className="space-y-2">
           {availableStudents.map((student) => (
             <div
               key={student.id}
               draggable
               onDragStart={(e) => onDragStart(e, student)}
               className="p-3 bg-apple-50 rounded-lg border border-apple-200 cursor-grab hover:bg-apple-100 hover:shadow-md transition-all active:cursor-grabbing"
             >
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0">
                   {student.profile_picture_url ? (
                     <img
                       src={student.profile_picture_url}
                       alt={student.full_name}
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                       {student.full_name.charAt(0)}
                     </div>
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-medium text-apple-900 truncate">{student.full_name}</h3>
                   <p className="text-sm text-apple-600 truncate">{student.major}</p>
                 </div>
               </div>
             </div>
           ))}
           
           {availableStudents.length === 0 && (
             <div className="text-center py-8">
               <Users className="h-12 w-12 text-apple-400 mx-auto mb-4" />
               <p className="text-apple-600">No students found</p>
               {(searchTerm || selectedMajor) && (
                 <button
                   onClick={() => {
                     setSearchTerm('');
                     setSelectedMajor('');
                   }}
                   className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                 >
                   Clear filters
                 </button>
               )}
             </div>
           )}
         </div>
       </div>
     </div>

     {/* Main Canvas Area */}
     <div className="flex-1 flex flex-col">
       {/* Toolbar */}
       <div className="bg-white shadow-sm border-b border-apple-200 p-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <input
               type="text"
               placeholder="Layout name..."
               value={layoutName}
               onChange={(e) => setLayoutName(e.target.value)}
               className="px-3 py-2 border border-apple-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
             />
             
             <div className="flex items-center space-x-2">
               <button
                 onClick={saveLayout}
                 disabled={isSaving}
                 className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Save className="h-4 w-4" />
                 <span>{isSaving ? 'Saving...' : 'Save Layout'}</span>
               </button>
               
               <button
                 onClick={() => setShowSavedLayouts(true)}
                 className="flex items-center space-x-2 px-4 py-2 bg-apple-600 text-white rounded-lg hover:bg-apple-700"
               >
                 <FolderOpen className="h-4 w-4" />
                 <span>Load Layout</span>
               </button>
               
               <button
                 onClick={clearLayout}
                 className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
               >
                 <RotateCcw className="h-4 w-4" />
                 <span>Clear</span>
               </button>
               
               <button
                 onClick={exportToPDF}
                 className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
               >
                 <Download className="h-4 w-4" />
                 <span>Export PDF</span>
               </button>
             </div>
           </div>

           <div className="flex items-center space-x-2">
             {/* Zoom Controls */}
             <div className="flex items-center space-x-1 bg-apple-100 rounded-lg p-1">
               <button
                 onClick={handleZoomOut}
                 className="p-2 text-apple-600 hover:bg-white rounded"
               >
                 <ZoomOut className="h-4 w-4" />
               </button>
               <span className="px-3 py-1 text-sm font-medium text-apple-700 min-w-[60px] text-center">
                 {zoom}%
               </span>
               <button
                 onClick={handleZoomIn}
                 className="p-2 text-apple-600 hover:bg-white rounded"
               >
                 <ZoomIn className="h-4 w-4" />
               </button>
             </div>
             
             <button
               onClick={resetView}
               className="p-2 text-apple-600 hover:bg-apple-100 rounded"
               title="Reset View"
             >
               <RotateCw className="h-4 w-4" />
             </button>
             
             <button
               onClick={() => setIsFullscreen(!isFullscreen)}
               className="p-2 text-apple-600 hover:bg-apple-100 rounded"
             >
               {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
             </button>
           </div>
         </div>
       </div>

       {/* Canvas */}
       <div className="flex-1 overflow-hidden relative">
         <div
           ref={canvasRef}
           className="w-full h-full bg-apple-50 relative cursor-grab active:cursor-grabbing"
           onDrop={onDrop}
           onDragOver={onDragOver}
           onMouseDown={handleCanvasMouseDown}
           style={{
             transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
             backgroundImage: `
               radial-gradient(circle, #e2e8f0 1px, transparent 1px),
               radial-gradient(circle, #e2e8f0 1px, transparent 1px)
             `,
             backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`,
             backgroundPosition: '0 0, 10px 10px'
           }}
         >
           {/* Render Furniture */}
           {furniture.map((item) => (
             <FurnitureItem
               key={item.id}
               id={item.id}
               type={item.type}
               position={item.position}
               onMove={moveFurniture}
               zoom={zoom}
               isSelected={selectedFurniture === item.id}
               onSelect={setSelectedFurniture}
             >
               <FurnitureComponent type={item.type} name={item.name} />
             </FurnitureItem>
           ))}

           {/* Render Students */}
           {placedStudents.map((student) => (
             <StudentNode
               key={student.id}
               data={student.data}
               position={student.position}
               onMove={moveStudent}
               onRemove={removeStudent}
               zoom={zoom}
               isSelected={selectedStudent === student.id}
               onSelect={setSelectedStudent}
             />
           ))}

           {/* Drop Zone Indicator */}
           <div className="absolute inset-0 pointer-events-none">
             <div className="w-full h-full border-2 border-dashed border-apple-300 opacity-50" />
           </div>
         </div>
       </div>

       {/* Status Bar */}
       <div className="bg-white border-t border-apple-200 px-4 py-2">
         <div className="flex items-center justify-between text-sm text-apple-600">
           <div className="flex items-center space-x-4">
             <span>Students placed: {placedStudents.length}</span>
             <span>Available: {availableStudents.length}</span>
             {currentLayoutId && <span>Layout saved</span>}
           </div>
           <div className="flex items-center space-x-4">
             <span>Zoom: {zoom}%</span>
             <span>Drag students from sidebar • Pan with mouse • Double-click to remove</span>
           </div>
         </div>
       </div>
     </div>

     {/* Saved Layouts Modal */}
     <SavedLayoutsModal
       isOpen={showSavedLayouts}
       onClose={() => setShowSavedLayouts(false)}
       savedLayouts={savedLayouts}
       onLoadLayout={loadLayout}
       onDeleteLayout={deleteLayout}
     />
   </div>
 );
};

// Furniture Component Renderer
const FurnitureComponent = ({ type, name }) => {
 const baseClasses = "border-2 border-apple-300 bg-white shadow-lg rounded-lg flex items-center justify-center text-apple-700 font-medium text-sm select-none";
 
 switch (type) {
   case 'table':
     return (
       <div className={`${baseClasses} w-32 h-20 bg-amber-50 border-amber-300`}>
         {name}
       </div>
     );
   case 'teacherDesk':
     return (
       <div className={`${baseClasses} w-40 h-24 bg-blue-50 border-blue-300`}>
         {name}
       </div>
     );
   case 'whiteboard':
     return (
       <div className={`${baseClasses} w-48 h-16 bg-gray-100 border-gray-400`}>
         {name}
       </div>
     );
   default:
     return (
       <div className={`${baseClasses} w-24 h-24`}>
         {name}
       </div>
     );
 }
};

export default RoomLayout;
