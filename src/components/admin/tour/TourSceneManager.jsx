import React, { useState, useRef } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Plus, Upload, Trash2, Edit2, Save, X, Image as ImageIcon, Hash, Eye, MapPin } from 'lucide-react';
import tourApi from '../../../api/tourApi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../../utils/media';

const TourSceneManager = ({ propertyId, scenes, activeScene, onSceneAdded, onSceneUpdated, onSceneDeleted }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const resetForm = () => {
    setName('');
    setDisplayOrder('');
    setFile(null);
    setPreviewUrl(null);
    setIsAdding(false);
    setIsEditing(false);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
      } else {
        toast.error('Please drop an image file');
      }
    }
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
    setDisplayOrder((scenes.length * 10).toString());
  };

  const handleStartEdit = () => {
    if (!activeScene) return;
    resetForm();
    setIsEditing(true);
    setName(activeScene.name);
    setDisplayOrder(activeScene.displayOrder.toString());
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!name || !file) {
      toast.error('Name and panorama image are required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('displayOrder', displayOrder || '0');
      formData.append('panorama', file);

      const newScene = await tourApi.addScene(propertyId, formData);
      toast.success('Scene added successfully');
      resetForm();
      if (onSceneAdded) onSceneAdded(newScene);
    } catch (error) {
      console.error('Error adding scene:', error);
      toast.error('Failed to add scene');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);
      await tourApi.updateScene(activeScene.id, {
        name,
        displayOrder: parseInt(displayOrder) || 0,
        initialYaw: activeScene.initialYaw,
        initialPitch: activeScene.initialPitch
      });
      
      toast.success('Scene updated successfully');
      resetForm();
      if (onSceneUpdated) onSceneUpdated();
    } catch (error) {
      console.error('Error updating scene:', error);
      toast.error('Failed to update scene');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeScene) return;
    if (!window.confirm(`Are you sure you want to delete scene "${activeScene.name}"? This will also remove any hotspots pointing to it.`)) {
      return;
    }

    try {
      setLoading(true);
      await tourApi.deleteScene(activeScene.id);
      toast.success('Scene deleted successfully');
      if (onSceneDeleted) onSceneDeleted(activeScene.id);
    } catch (error) {
      console.error('Error deleting scene:', error);
      toast.error('Failed to delete scene');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card hover={false}>
      <Card.Header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 flex justify-between items-center">
        <h3 className="font-semibold text-base sm:text-lg text-neutral-900">Scene Manager</h3>
        {!isAdding && !isEditing && (
          <Button
            size="sm"
            onClick={handleStartAdd}
            className="flex items-center gap-1.5 !text-xs sm:!text-sm"
          >
            <Plus size={15} /> <span className="hidden sm:inline">Add</span> Scene
          </Button>
        )}
      </Card.Header>

      <Card.Body className="p-4 sm:p-6">
        {(isAdding || isEditing) ? (
          /* ── Add / Edit Form ──────────────────────────────────────── */
          <form onSubmit={isAdding ? handleSubmitAdd : handleSubmitEdit} className="space-y-4 sm:space-y-5">
            {/* Scene Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Scene Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                placeholder="e.g., Living Room, Master Bedroom"
                required
              />
            </div>
            
            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Display Order</label>
              <input 
                type="number" 
                value={displayOrder} 
                onChange={e => setDisplayOrder(e.target.value)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                placeholder="e.g., 10"
              />
            </div>

            {/* Upload Area (only for new scenes) */}
            {isAdding && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Panorama Image
                  <span className="text-neutral-400 font-normal ml-1">(360° Equirectangular)</span>
                </label>
                <div
                  className={`relative mt-1 flex justify-center px-4 sm:px-6 py-6 sm:py-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
                    isDragging
                      ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
                      : previewUrl
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-neutral-300 bg-neutral-50/50 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                  onDragEnter={handleDragIn}
                  onDragLeave={handleDragOut}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-2 text-center">
                    {previewUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto h-24 sm:h-32 rounded-lg object-contain shadow-sm border border-neutral-200"
                        />
                        <button
                          type="button"
                          onClick={() => { setFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                        >
                          <X size={12} />
                        </button>
                        <p className="text-xs text-emerald-600 font-medium mt-2">
                          ✓ {file?.name}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isDragging ? 'bg-primary-100' : 'bg-neutral-100'
                        }`}>
                          <Upload className={`h-5 w-5 transition-colors ${isDragging ? 'text-primary-500' : 'text-neutral-400'}`} />
                        </div>
                        <div className="text-sm text-neutral-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 transition-colors">
                            <span>Upload a file</span>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              className="sr-only" 
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                          <span className="text-neutral-400"> or drag and drop</span>
                        </div>
                        <p className="text-xs text-neutral-400">JPG, PNG up to 100MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} disabled={loading} size="sm" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} size="sm" className="flex items-center justify-center gap-1.5 w-full sm:w-auto">
                <Save size={15} /> {loading ? 'Saving...' : 'Save Scene'}
              </Button>
            </div>
          </form>

        ) : activeScene ? (
          /* ── Scene Detail View ────────────────────────────────────── */
          <div className="space-y-4">
            {/* Panorama Preview */}
            <div className="relative rounded-xl overflow-hidden bg-neutral-100 group">
              <div className="aspect-video sm:aspect-[2.2/1]">
                <img 
                  src={getImageUrl(activeScene.panoramaUrl)} 
                  alt={activeScene.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Scene name on image */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <h4 className="text-white font-semibold text-sm sm:text-base drop-shadow-md">
                  {activeScene.name}
                </h4>
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-2">
                <button 
                  onClick={handleStartEdit}
                  className="p-2 sm:p-2.5 bg-white/90 hover:bg-white active:bg-neutral-100 rounded-lg text-neutral-700 hover:text-primary-600 shadow-sm backdrop-blur-sm transition-all duration-150"
                  title="Edit Scene"
                  style={{ minWidth: 40, minHeight: 40 }}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-2 sm:p-2.5 bg-white/90 hover:bg-white active:bg-neutral-100 rounded-lg text-neutral-700 hover:text-red-600 shadow-sm backdrop-blur-sm transition-all duration-150"
                  title="Delete Scene"
                  style={{ minWidth: 40, minHeight: 40 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {/* Scene Metadata Chips */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Edit2 size={12} className="text-neutral-400" />
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Name</span>
                </div>
                <span className="text-sm font-medium text-neutral-800 truncate block">{activeScene.name}</span>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Hash size={12} className="text-neutral-400" />
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Order</span>
                </div>
                <span className="text-sm font-medium text-neutral-800">{activeScene.displayOrder}</span>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye size={12} className="text-neutral-400" />
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">View</span>
                </div>
                <span className="text-sm font-medium text-neutral-800 font-mono">
                  {activeScene.initialYaw?.toFixed(1) || '0'}, {activeScene.initialPitch?.toFixed(1) || '0'}
                </span>
              </div>
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={12} className="text-neutral-400" />
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Hotspots</span>
                </div>
                <span className="text-sm font-medium text-neutral-800">{activeScene.hotspots?.length || 0}</span>
              </div>
            </div>
          </div>

        ) : (
          /* ── Empty State ─────────────────────────────────────────── */
          <div className="text-center py-10 sm:py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
              <ImageIcon size={28} className="text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-medium mb-1">
              {scenes.length === 0 ? 'No scenes added yet' : 'Select a scene'}
            </p>
            <p className="text-neutral-400 text-sm">
              {scenes.length === 0
                ? "Click 'Add Scene' above to create your first panoramic scene"
                : "Choose a scene from the sidebar to view its details"
              }
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TourSceneManager;
