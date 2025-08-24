import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { NotificationContext } from '../../contexts/NotificationContext';
import adminApi from '../../api/adminApi';

const LandmarkManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useContext(NotificationContext);

    const [landmarks, setLandmarks] = useState([]);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingLandmark, setEditingLandmark] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'EDUCATION',
        distanceInKm: '',
        timeInMinutes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [propertyData, landmarksData] = await Promise.all([
                    adminApi.getPropertyById(id),
                    adminApi.getLandmarksByPropertyId(id)
                ]);
                setProperty(propertyData);
                setLandmarks(landmarksData || []);
            } catch (err) {
                setError('Failed to fetch data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLandmark) {
                const updatedLandmark = await adminApi.updateLandmark(editingLandmark.id, formData);
                setLandmarks(landmarks.map(l => l.id === updatedLandmark.id ? updatedLandmark : l));
                showNotification({ type: 'success', message: 'Landmark updated successfully!' });
            } else {
                const newLandmark = await adminApi.createLandmark(id, formData);
                setLandmarks([...landmarks, newLandmark]);
                showNotification({ type: 'success', message: 'Landmark added successfully!' });
            }
            resetForm();
        } catch (err) {
            showNotification({ type: 'error', message: 'Failed to save landmark.' });
            console.error(err);
        }
    };

    const handleEdit = (landmark) => {
        setEditingLandmark(landmark);
        setFormData({
            name: landmark.name,
            type: landmark.type,
            distanceInKm: landmark.distanceInKm,
            timeInMinutes: landmark.timeInMinutes
        });
    };

    const handleDelete = async (landmarkId) => {
        if (window.confirm('Are you sure you want to delete this landmark?')) {
            try {
                await adminApi.deleteLandmark(landmarkId);
                setLandmarks(landmarks.filter(l => l.id !== landmarkId));
                showNotification({ type: 'success', message: 'Landmark deleted successfully!' });
            } catch (err) {
                showNotification({ type: 'error', message: 'Failed to delete landmark.' });
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setEditingLandmark(null);
        setFormData({
            name: '',
            type: 'EDUCATION',
            distanceInKm: '',
            timeInMinutes: ''
        });
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Landmarks</h1>
                    {property && <p className="text-lg text-gray-600">for property: {property.name}</p>}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add/Edit Landmark Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">{editingLandmark ? 'Edit Landmark' : 'Add New Landmark'}</h2>
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                                    <select name="type" id="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required>
                                        <option value="EDUCATION">Education</option>
                                        <option value="HOSPITAL">Hospital</option>
                                        <option value="MAJOR_LANDMARK">Major Landmark</option>
                                        <option value="MALL_AND_RETAIL">Mall & Retail</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="distanceInKm" className="block text-sm font-medium text-gray-700">Distance (km)</label>
                                    <input type="number" name="distanceInKm" id="distanceInKm" value={formData.distanceInKm} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="timeInMinutes" className="block text-sm font-medium text-gray-700">Time (minutes)</label>
                                    <input type="number" name="timeInMinutes" id="timeInMinutes" value={formData.timeInMinutes} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">{editingLandmark ? 'Update' : 'Add'} Landmark</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Landmark List */}
                    <div className="lg:col-span-2">
                        {loading && <p>Loading landmarks...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && !error && (
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {landmarks.length > 0 ? (
                                        landmarks.map(landmark => (
                                            <li key={landmark.id} className="p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{landmark.name}</p>
                                                    <p className="text-sm text-gray-600">{landmark.type} - {landmark.distanceInKm} km - {landmark.timeInMinutes} mins</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleEdit(landmark)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                    <button onClick={() => handleDelete(landmark.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-4 text-center text-gray-500">No landmarks found for this property.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default LandmarkManager;
