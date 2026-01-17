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
  Film,
  X,
  Eye,
  EyeOff,
  Mail,
  GraduationCap,
  Heart,
  User
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

// Curved table classroom configuration - 26 seats per row
const CLASSROOM_LAYOUT = [
  { row: 'A', seats: 26, tableWidth: 1300 },  // Front row
  { row: 'B', seats: 26, tableWidth: 1350 },  // Second row
  { row: 'C', seats: 26, tableWidth: 1400 },  // Third row
  { row: 'D', seats: 26, tableWidth: 1450 },  // Fourth row
  { row: 'E', seats: 26, tableWidth: 1500 },  // Fifth row
  { row: 'F', seats: 26, tableWidth: 1550 },  // Back row
];

const TOTAL_ROWS = CLASSROOM_LAYOUT.length;

// Seat Component
const Seat = ({ rowLetter, rowIndex, seatIndex, student, onAssignStudent, onRemoveStudent, zoom, isSelected, onSelect, isBlurred, compactMode }) => {
  const seatId = `${rowIndex}-${seatIndex}`;
  const isEmpty = !student;
  const [imageError, setImageError] = useState(false);

  // Reset image error when student changes
  useEffect(() => {
    setImageError(false);
  }, [student?.id, student?.profile_picture_url]);

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(seatId);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (student) {
      onRemoveStudent(rowIndex, seatIndex);
    }
  };

  const handleDragStart = (e) => {
    if (student) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        ...student,
        fromSeat: { rowIndex, seatIndex }
      }));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const droppedData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (!isEmpty) {
        return;
      }
      
      if (droppedData.fromSeat) {
        onRemoveStudent(droppedData.fromSeat.rowIndex, droppedData.fromSeat.seatIndex);
      }
      
      const { fromSeat, ...studentData } = droppedData;
      onAssignStudent(rowIndex, seatIndex, studentData);
    } catch (error) {
      console.error('Error parsing dropped student data:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (isEmpty) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const seatSize = 48;

  return (
    <div
      className={`
        relative flex items-center justify-center rounded-lg border-2 cursor-pointer transition-all duration-200
        ${isEmpty 
          ? 'border-apple-300 bg-apple-50 hover:border-apple-400 hover:bg-apple-100' 
          : 'border-primary-300 bg-white hover:border-primary-400 shadow-sm cursor-grab active:cursor-grabbing'
        }
        ${isSelected ? 'ring-2 ring-primary-500 ring-offset-1' : ''}
        ${isBlurred ? 'filter blur-sm opacity-40' : ''}
        ${isEmpty ? 'border-dashed' : 'border-solid'}
      `}
      style={{
        width: `${seatSize}px`,
        height: `${seatSize}px`,
        minWidth: `${seatSize}px`,
        minHeight: `${seatSize}px`,
        flexShrink: 0
      }}
      draggable={!isEmpty}
      onDragStart={handleDragStart}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      title={student ? student.full_name : `Seat ${rowLetter}${seatIndex + 1}`}
    >
      {student ? (
        <div className="w-full h-full rounded-lg overflow-hidden">
          {student.profile_picture_url && !imageError ? (
            <img
              src={student.profile_picture_url}
              alt={student.full_name}
              className="w-full h-full object-cover"
              draggable={false}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {student.full_name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-apple-400 font-medium text-xs">
          {rowLetter}{seatIndex + 1}
        </div>
      )}
      
      {student && compactMode && !isSelected && (
        <div className="absolute -top-1 -right-1 bg-primary-500 rounded-full flex items-center justify-center w-4 h-4">
          <Eye className="text-white w-2 h-2" />
        </div>
      )}
    </div>
  );
};

// Student Profile Card Component
const StudentProfileCard = ({ student, onClose, canvasRef, studentPosition, zoom, canvasOffset }) => {
  const cardRef = useRef(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (cardRef.current && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const cardWidth = 288;
      const cardHeight = 400;
      
      const studentScreenX = canvasRect.left + canvasOffset.x + (studentPosition.x * zoom / 100);
      const studentScreenY = canvasRect.top + canvasOffset.y + (studentPosition.y * zoom / 100);
      
      let newX = studentScreenX + 80;
      let newY = studentScreenY - 50;
      
      if (newX + cardWidth > window.innerWidth - 20) {
        newX = studentScreenX - cardWidth - 20;
      }
      
      if (newY + cardHeight > window.innerHeight - 20) {
        newY = window.innerHeight - cardHeight - 20;
      }
      if (newY < 20) {
        newY = 20;
      }
      
      if (newX < 20) {
        newX = 20;
      }
      
      setCardPosition({ x: newX, y: newY });
    }
  }, [studentPosition, zoom, canvasOffset, canvasRef]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-apple-200 w-72 overflow-hidden flex flex-col"
      style={{
        left: cardPosition.x,
        top: cardPosition.y,
        maxHeight: '400px',
        minHeight: '350px',
      }}
    >
      <div className="relative px-4 pt-3 pb-2 bg-gradient-to-br from-primary-500 to-primary-600 text-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-white hover:text-primary-100 transition-colors p-1 hover:bg-primary-400 rounded"
        >
          <X className="h-3 w-3" />
        </button>
        
        <div className="flex justify-center mb-2">
          <div
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white cursor-pointer transition-transform duration-200 hover:scale-110"
            onMouseEnter={() => student.profile_picture_url && !imageError && setShowEnlargedImage(true)}
            onMouseLeave={() => setShowEnlargedImage(false)}
          >
            {student.profile_picture_url && !imageError ? (
              <img
                src={student.profile_picture_url}
                alt={student.full_name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {student.full_name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-base font-semibold text-white">
            {student.full_name}
          </h3>
          <p className="text-xs text-primary-100">{student.pronoun}</p>
        </div>
      </div>
      
      <div 
        className="px-4 pt-3 space-y-3 text-sm flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #F3F4F6',
          maxHeight: '200px',
          paddingBottom: '16px',
        }}
      >
        <div className="flex items-center text-sm text-apple-600">
          <Mail className="h-4 w-4 mr-2 text-apple-400" />
          <span className="truncate">{student.email}</span>
        </div>
        
        <div className="flex items-center text-sm text-apple-600">
          <GraduationCap className="h-4 w-4 mr-2 text-apple-400" />
          <span>{student.major}</span>
        </div>

        {student.hobbies && student.hobbies.length > 0 && (
          <div>
            <div className="flex items-center text-sm text-apple-600 mb-2">
              <Heart className="h-4 w-4 mr-2 text-apple-400" />
              <span className="font-medium">Hobbies</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {student.hobbies.map((hobby, index) => (
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

        {student.favorite_movies && student.favorite_movies.length > 0 && (
          <div>
            <div className="flex items-center text-sm text-apple-600 mb-2">
              <Film className="h-4 w-4 mr-2 text-apple-400" />
              <span className="font-medium">Movies/Shows</span>
            </div>
            <div className="space-y-2">
              {student.favorite_movies.map((movie, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-6 h-8 bg-apple-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    <p className="text-xs text-apple-500 truncate">
                      {movie.year} • {movie.type === 'movie' ? 'Movie' : 'TV'}
                      {movie.rating && ` • ⭐ ${movie.rating}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {student.about_me && (
          <div>
            <div className="flex items-center text-sm text-apple-600 mb-2">
              <User className="h-4 w-4 mr-2 text-apple-400" />
              <span className="font-medium">About Me</span>
            </div>
            <p className="text-sm text-apple-600 leading-relaxed">
              {student.about_me}
            </p>
          </div>
        )}
        
        {student.professor_notes && student.professor_notes.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Professor Notes</h4>
            <div className="space-y-2">
              {student.professor_notes.map((noteObj, index) => (
                <div key={noteObj.id || index} className="bg-yellow-100 rounded p-2">
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    {noteObj.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="h-4"></div>
      </div>
      
      <div className="px-4 py-2 bg-apple-50 border-t border-apple-200">
        <div className="text-xs text-apple-500 text-center">
          Double-click on canvas to remove • Drag to move
        </div>
      </div>

      {showEnlargedImage && student.profile_picture_url && !imageError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative pointer-events-auto"
            onMouseEnter={() => setShowEnlargedImage(true)}
            onMouseLeave={() => setShowEnlargedImage(false)}
          >
            <div className="relative w-56 h-56 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
              <img
                src={student.profile_picture_url}
                alt={student.full_name}
                className="w-full h-full object-cover"
                onError={() => setShowEnlargedImage(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
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
                      {(() => {
                        if (!layout.layout_data?.seatingChart) return 0;
                        let count = 0;
                        layout.layout_data.seatingChart.forEach(row => {
                          if (Array.isArray(row)) {
                            row.forEach(seat => {
                              if (seat && seat.id) count++;
                            });
                          }
                        });
                        return count;
                      })()} students placed
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
  // Initialize classroom seating chart with exactly 26 seats per row
  const initializeSeatingChart = () => {
    const chart = [];
    for (let i = 0; i < TOTAL_ROWS; i++) {
      chart[i] = new Array(26).fill(null);
    }
    return chart;
  };

  const [seatingChart, setSeatingChart] = useState(initializeSeatingChart());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [layoutName, setLayoutName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [zoom, setZoom] = useState(50);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [compactMode, setCompactMode] = useState(true);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [showSavedLayouts, setShowSavedLayouts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLayoutId, setCurrentLayoutId] = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);

  const majors = ['Computer Science', 'Information Technology', 'Cybersecurity', 'DSBA'];

  useEffect(() => {
    loadSavedLayouts();
    loadAutoSavedState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (isLoading) return;
    
    const autoSaveData = {
      seatingChart,
      zoom,
      canvasOffset,
      layoutName,
      selectedMajor,
      searchTerm,
      compactMode
    };
    
    localStorage.setItem('roomLayout_autoSave', JSON.stringify(autoSaveData));
  }, [seatingChart, zoom, canvasOffset, layoutName, selectedMajor, searchTerm, compactMode, isLoading]);

  const loadAutoSavedState = () => {
    try {
      const savedData = localStorage.getItem('roomLayout_autoSave');
      
      if (savedData) {
        const autoSaveData = JSON.parse(savedData);
        
        // Load saved state
        if (autoSaveData.seatingChart) {
          setSeatingChart(autoSaveData.seatingChart);
        } else {
          setSeatingChart(initializeSeatingChart());
        }
        
        setZoom(autoSaveData.zoom || 50);
        setCanvasOffset(autoSaveData.canvasOffset || { x: 0, y: 0 });
        setLayoutName(autoSaveData.layoutName || '');
        setSelectedMajor(autoSaveData.selectedMajor || '');
        setSearchTerm(autoSaveData.searchTerm || '');
        setCompactMode(autoSaveData.compactMode !== undefined ? autoSaveData.compactMode : true);
      } else {
        // No saved data, start fresh
        setSeatingChart(initializeSeatingChart());
        setZoom(50);
        setCanvasOffset({ x: 0, y: 0 });
        setLayoutName('');
        setSelectedMajor('');
        setSearchTerm('');
        setCompactMode(true);
      }
    } catch (error) {
      console.error('Error loading auto-saved state:', error);
      // Fallback to fresh state on error
      setSeatingChart(initializeSeatingChart());
      setZoom(50);
      setCanvasOffset({ x: 0, y: 0 });
      setLayoutName('');
      setSelectedMajor('');
      setSearchTerm('');
      setCompactMode(true);
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
      setSeatingChart(layoutData.seatingChart || initializeSeatingChart());
      setZoom(layoutData.zoom || 50);
      setCanvasOffset(layoutData.canvasOffset || { x: 0, y: 0 });
      setLayoutName(layout.layout_name);
      setCurrentLayoutId(layout.id);
      setSelectedSeat(null);
      setSelectedStudentData(null);
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

  const assignStudentToSeat = (rowIndex, seatIndex, studentData) => {
    setSeatingChart(prev => {
      const newChart = [...prev];
      if (!newChart[rowIndex]) {
        newChart[rowIndex] = Array(26).fill(null);
      } else {
        newChart[rowIndex] = [...newChart[rowIndex]];
      }
      // Ensure the array has 26 seats
      while (newChart[rowIndex].length < 26) {
        newChart[rowIndex].push(null);
      }
      newChart[rowIndex][seatIndex] = studentData;
      return newChart;
    });
  };

  const removeStudentFromSeat = (rowIndex, seatIndex) => {
    setSeatingChart(prev => {
      const newChart = [...prev];
      if (!newChart[rowIndex]) {
        newChart[rowIndex] = Array(26).fill(null);
      } else {
        newChart[rowIndex] = [...newChart[rowIndex]];
      }
      // Ensure the array has 26 seats
      while (newChart[rowIndex].length < 26) {
        newChart[rowIndex].push(null);
      }
      newChart[rowIndex][seatIndex] = null;
      return newChart;
    });
    
    const seatId = `${rowIndex}-${seatIndex}`;
    if (selectedSeat === seatId) {
      setSelectedSeat(null);
      setSelectedStudentData(null);
    }
  };

  const handleSeatSelect = (seatId) => {
    const [rowIndex, seatIndex] = seatId.split('-').map(Number);
    const student = seatingChart[rowIndex] && seatingChart[rowIndex][seatIndex] ? seatingChart[rowIndex][seatIndex] : null;
    
    if (!compactMode) {
      setSelectedSeat(seatId);
      return;
    }

    if (selectedSeat === seatId) {
      setSelectedSeat(null);
      setSelectedStudentData(null);
    } else {
      setSelectedSeat(seatId);
      if (student) {
        setSelectedStudentData(student);
      }
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedSeat(null);
      setSelectedStudentData(null);
    }
  };

  const getSeatedStudents = useCallback(() => {
    const seated = [];
    seatingChart.forEach(row => {
      row.forEach(student => {
        if (student) {
          seated.push(student);
        }
      });
    });
    return seated;
  }, [seatingChart]);

  useEffect(() => {
    const seatedStudents = getSeatedStudents();
    const seatedStudentIds = seatedStudents.map(student => student.id);
    let filtered = students.filter(student => !seatedStudentIds.includes(student.id));

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
  }, [students, seatingChart, searchTerm, selectedMajor, getSeatedStudents]);

  const onDragStart = (event, student) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(student));
    event.dataTransfer.effectAllowed = 'move';
  };

  const clearLayout = () => {
    // Clear localStorage and reset to fresh state
    localStorage.removeItem('roomLayout_autoSave');
    setSeatingChart(initializeSeatingChart());
    setSelectedSeat(null);
    setSelectedStudentData(null);
    setCurrentLayoutId(null);
    setLayoutName('');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 100));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const resetView = () => {
    setZoom(50);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedSeat(null);
      setSelectedStudentData(null);
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
        seatingChart: seatingChart,
        zoom: zoom,
        canvasOffset: canvasOffset,
        compactMode: compactMode
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
      setSelectedSeat(null);
      setSelectedStudentData(null);
      
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = canvasRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Classroom Layout: ${layoutName || 'Untitled'}`, 15, 15);
      
      const yOffset = 25;
      const maxImgHeight = pdfHeight - yOffset - 40;
      const finalImgHeight = Math.min(imgHeight, maxImgHeight);
      
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, finalImgHeight);
      
      pdf.save(`classroom-layout-${layoutName?.replace(/[^a-z0-9]/gi, '_') || Date.now()}.pdf`);
      
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
    <div className="h-screen bg-apple-50" style={{ display: 'flex', width: '100vw' }}>
      {/* Student List Sidebar */}
      <div className={`${isFullscreen ? 'hidden' : ''} bg-white shadow-lg border-r border-apple-200 flex flex-col`} style={{ width: isFullscreen ? '0px' : '320px', flexShrink: 0 }}>
        <div className="p-4 border-b border-apple-200">
          <h2 className="text-lg font-semibold text-apple-900 mb-4">Available Students</h2>
          
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

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {availableStudents.map((student) => (
              <div
                key={student.id}
                draggable
                onDragStart={(e) => onDragStart(e, student)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoverPosition({ 
                    x: rect.right + 10, 
                    y: rect.top + rect.height / 2 
                  });
                  setHoveredStudent(student.id);
                }}
                onMouseLeave={() => {
                  setHoveredStudent(null);
                  setHoverPosition({ x: 0, y: 0 });
                }}
                className="relative p-3 bg-apple-50 rounded-lg border border-apple-200 cursor-grab hover:bg-apple-100 hover:shadow-md transition-all active:cursor-grabbing"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0 relative">
                    {student.profile_picture_url ? (
                      <img
                        src={student.profile_picture_url}
                        alt={student.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-sm">${student.full_name.charAt(0)}</div>`;
                        }}
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
            
            {/* Enlarged Profile Picture Overlay */}
            {hoveredStudent && hoverPosition.x > 0 && (
              (() => {
                const student = availableStudents.find(s => s.id === hoveredStudent);
                if (!student?.profile_picture_url) return null;
                
                // Calculate position to ensure it doesn't go off screen
                const overlayWidth = 280; // 240px + padding
                const overlayHeight = 320; // 240px + text + padding
                
                let finalX = hoverPosition.x;
                let finalY = hoverPosition.y - overlayHeight / 2;
                
                // Adjust if going off right edge of screen
                if (finalX + overlayWidth > window.innerWidth - 20) {
                  finalX = hoverPosition.x - overlayWidth - 20; // Show on left side instead
                }
                
                // Adjust if going off top/bottom of screen
                if (finalY < 20) finalY = 20;
                if (finalY + overlayHeight > window.innerHeight - 20) {
                  finalY = window.innerHeight - overlayHeight - 20;
                }
                
                return (
                  <div 
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                      left: `${finalX}px`,
                      top: `${finalY}px`
                    }}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 animate-in fade-in duration-200">
                      <div className="w-60 h-60 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white mx-auto">
                        <img
                          src={student.profile_picture_url}
                          alt={student.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('bg-gradient-to-br', 'from-primary-400', 'to-primary-600', 'flex', 'items-center', 'justify-center');
                            e.target.parentElement.innerHTML = `<span class="text-white font-bold text-6xl">${student.full_name.charAt(0)}</span>`;
                          }}
                        />
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-lg font-semibold text-gray-800 truncate">{student.full_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{student.major}</p>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
            
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Toolbar */}
        <div className="bg-white shadow-sm border-b border-apple-200 px-6 py-4">
          {/* Top Row - Layout Name and View Mode */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Layout name..."
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                className="px-4 py-2 border border-apple-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64 text-sm"
              />
              
              <button
                onClick={() => {
                  setCompactMode(!compactMode);
                  setSelectedSeat(null);
                  setSelectedStudentData(null);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  compactMode 
                    ? 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100' 
                    : 'bg-apple-50 text-apple-700 border-apple-200 hover:bg-apple-100'
                }`}
              >
                {compactMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>{compactMode ? 'Compact' : 'Tooltip'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Row - Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Layout Actions Group */}
              <div className="flex items-center bg-slate-50 rounded-lg p-1 space-x-1">
                <button
                  onClick={saveLayout}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                
                <button
                  onClick={() => setShowSavedLayouts(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Load</span>
                </button>
                
                <button
                  onClick={clearLayout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Clear</span>
                </button>
                
                <button
                  onClick={exportToPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF</span>
                </button>
              </div>

              {/* Zoom Controls Group */}
              <div className="flex items-center bg-blue-50 rounded-lg p-1 border border-blue-200 space-x-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <div className="px-4 py-2 text-sm font-bold text-blue-800 min-w-[60px] text-center bg-white rounded-md border border-blue-100">
                  {zoom}%
                </div>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={resetView}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="text-sm font-medium">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Canvas - Curved Table Classroom Layout */}
        <div 
          style={{
            flex: 1,
            backgroundColor: '#f8fafc',
            overflow: 'auto',
            width: '100%',
            minWidth: 0
          }}
        >
          <div
            style={{
              width: `${1800 + (zoom === 100 ? 200 : 40)}px`, // Extra space at 100% zoom
              minWidth: `${1800 + (zoom === 100 ? 200 : 40)}px`,
              height: `${1000 + (zoom === 100 ? 300 : 100)}px`, // Extra height at 100% zoom
              padding: '20px',
              position: 'relative'
            }}
          >
            <div 
              ref={canvasRef}
              style={{
                width: '1800px',
                minWidth: '1800px',
                padding: '40px',
                transform: `scale(${zoom / 100}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
                transformOrigin: 'top left',
                backgroundColor: 'white',
                position: 'absolute',
                top: '20px',
                left: '20px'
              }}
              onMouseDown={handleCanvasMouseDown}
              onClick={handleCanvasClick}
            >
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-apple-200">
              {/* Front of Classroom */}
              <div className="text-center mb-16">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-6 rounded-lg inline-block font-bold text-xl shadow-lg">
                  WHITEBOARD
                </div>
              </div>
              
              {/* Curved Table Classroom Layout */}
              <div className="space-y-12">
                {CLASSROOM_LAYOUT.map((rowConfig, rowIndex) => {
                  const { row: rowLetter, tableWidth } = rowConfig;
                  
                  if (!seatingChart[rowIndex]) {
                    return null;
                  }
                  
                  return (
                    <div key={rowIndex} className="flex items-center justify-center">
                      {/* Row Label */}
                      <div className="w-16 h-16 flex items-center justify-center mr-8">
                        <div className="w-12 h-12 bg-white border-2 border-apple-300 text-apple-700 rounded-lg flex items-center justify-center font-bold text-lg shadow-md hover:shadow-lg transition-shadow">
                          {rowLetter}
                        </div>
                      </div>
                      
                      {/* Curved Table */}
                      <div className="relative">
                        {/* SVG Curved Table */}
                        <svg 
                          width={tableWidth} 
                          height="140" 
                          className="absolute top-0 left-0"
                          style={{ zIndex: 1 }}
                        >
                          <defs>
                            <linearGradient id={`tableGrad-${rowIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{ stopColor: '#f1f5f9', stopOpacity: 1 }} />
                              <stop offset="50%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
                            </linearGradient>
                            <filter id={`shadow-${rowIndex}`} x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00000020"/>
                            </filter>
                          </defs>
                          
                          {/* Main U-curved table surface */}
                          <path
                            d={(() => {
                              // Create path that matches seat positioning curve
                              const points = [];
                              const backPoints = [];
                              const curveDepth = 60;
                              
                              // Generate points along the same U-curve as seats
                              for (let i = 0; i <= 25; i++) {
                                const progress = i / 25;
                                const xPos = 40 + progress * (tableWidth - 80);
                                const normalizedProgress = (progress - 0.5) * 2;
                                const yOffset = curveDepth * (1 - normalizedProgress * normalizedProgress);
                                
                                points.push(`${xPos},${85 - yOffset}`);
                                backPoints.unshift(`${xPos},${115 - yOffset}`);
                              }
                              
                              return `M ${points[0]} L ${points.slice(1).join(' L ')} L ${backPoints.join(' L ')} Z`;
                            })()}
                            fill={`url(#tableGrad-${rowIndex})`}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            filter={`url(#shadow-${rowIndex})`}
                          />
                          
                          {/* Table front edge highlight - U-curve */}
                          <path
                            d={(() => {
                              const points = [];
                              const curveDepth = 60;
                              
                              for (let i = 0; i <= 25; i++) {
                                const progress = i / 25;
                                const xPos = 40 + progress * (tableWidth - 80);
                                const normalizedProgress = (progress - 0.5) * 2;
                                const yOffset = curveDepth * (1 - normalizedProgress * normalizedProgress);
                                points.push(`${xPos},${85 - yOffset}`);
                              }
                              
                              return `M ${points.join(' L ')}`;
                            })()}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="3"
                          />
                          
                          {/* Table back edge - U-curve */}
                          <path
                            d={(() => {
                              const points = [];
                              const curveDepth = 60;
                              
                              for (let i = 0; i <= 25; i++) {
                                const progress = i / 25;
                                const xPos = 40 + progress * (tableWidth - 80);
                                const normalizedProgress = (progress - 0.5) * 2;
                                const yOffset = curveDepth * (1 - normalizedProgress * normalizedProgress);
                                points.push(`${xPos},${115 - yOffset}`);
                              }
                              
                              return `M ${points.join(' L ')}`;
                            })()}
                            fill="none"
                            stroke="#64748b"
                            strokeWidth="1"
                          />
                        </svg>
                        
                        {/* Students positioned along the curved table */}
                        <div 
                          className="relative"
                          style={{ 
                            width: `${tableWidth}px`,
                            height: '140px',
                            zIndex: 2 
                          }}
                        >
                          {/* Force render all 26 seats */}
                          {Array.from({ length: 26 }, (_, seatIndex) => {
                            let student = null;
                            try {
                              if (seatingChart[rowIndex] && Array.isArray(seatingChart[rowIndex]) && seatIndex < seatingChart[rowIndex].length) {
                                student = seatingChart[rowIndex][seatIndex];
                              }
                            } catch (error) {
                              console.error('Error accessing seat data:', error);
                              student = null;
                            }
                            
                            // Calculate position along the U-curve
                            const progress = 26 > 1 ? seatIndex / (26 - 1) : 0.5;
                            const xPosition = 40 + progress * (tableWidth - 80);
                            // Create a U-curve: deeper curve in the middle, shallower at ends
                            const curveDepth = 60; // Increased curve depth for U-shape
                            // Use a parabolic curve for U-shape: y = 4*depth*(x-0.5)^2
                            const normalizedProgress = (progress - 0.5) * 2; // -1 to 1
                            const yOffset = curveDepth * (1 - normalizedProgress * normalizedProgress);
                            
                            return (
                              <div
                                key={`${rowIndex}-${seatIndex}`}
                                className="absolute"
                                style={{
                                  left: `${xPosition - 24}px`,
                                  top: `${85 - yOffset - 24}px`, // Align with table front edge
                                  zIndex: 3
                                }}
                              >
                                <Seat
                                  rowLetter={rowLetter}
                                  rowIndex={rowIndex}
                                  seatIndex={seatIndex}
                                  student={student}
                                  onAssignStudent={assignStudentToSeat}
                                  onRemoveStudent={removeStudentFromSeat}
                                  zoom={100}
                                  isSelected={selectedSeat === `${rowIndex}-${seatIndex}`}
                                  onSelect={handleSeatSelect}
                                  isBlurred={compactMode && selectedSeat && selectedSeat !== `${rowIndex}-${seatIndex}`}
                                  compactMode={compactMode}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Footer Info */}
              <div className="mt-16 pt-8 border-t border-apple-200">
                <div className="flex justify-center items-center space-x-8 text-sm text-apple-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-dashed border-apple-300 bg-apple-50 rounded"></div>
                    <span>Available Seat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-primary-300 bg-white rounded"></div>
                    <span>Occupied Seat</span>
                  </div>
                </div>
                <div className="text-center mt-4 text-xs text-apple-500">
                  Curved table classroom layout • 156 total seats (26 per row × 6 rows) • Drag students to assign seats
                </div>
              </div>
            </div>
          </div>
          </div>
          
          {/* Student Profile Card */}
          {compactMode && selectedStudentData && selectedSeat && (
            <StudentProfileCard
              student={selectedStudentData}
              onClose={() => {
                setSelectedSeat(null);
                setSelectedStudentData(null);
              }}
              canvasRef={canvasRef}
              studentPosition={{ x: 900, y: 400 }}
              zoom={zoom}
              canvasOffset={canvasOffset}
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-white border-t border-apple-200 px-4 py-2">
          <div className="flex items-center justify-between text-sm text-apple-600">
            <div className="flex items-center space-x-4">
              <span>Students seated: {getSeatedStudents().length}</span>
              <span>Available: {availableStudents.length}</span>
              <span>Capacity: 156 seats</span>
              <span>Mode: {compactMode ? 'Compact' : 'Tooltip'}</span>
              {currentLayoutId && <span className="text-green-600">● Layout saved</span>}
            </div>
            <div className="flex items-center space-x-4">
              <span>Zoom: {zoom}%</span>
              <span>
                {compactMode 
                  ? 'Click seats to view student profile • Drag students to seats • Double-click to remove'
                  : 'Hover seats for profile • Drag students to seats • Double-click to remove'
                }
              </span>
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

export default RoomLayout;