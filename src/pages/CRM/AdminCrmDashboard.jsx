import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  UploadCloud, Users, CheckCircle, AlertCircle,
  UserCheck, Eye, Search, ChevronDown, Plus, X, Edit, Trash2, Phone, MessageCircle, Download, Calendar
} from 'lucide-react';
import { NotificationContext } from '../../contexts/NotificationContext';
import crmApi from '../../api/crmApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LeadDetailDrawer from './LeadDetailDrawer';

import { PIPELINE_STAGES, getStageConfig } from '../../utils/crmConstants';

const AdminCrmDashboard = () => {
  const { showNotification } = useContext(NotificationContext);

  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssigned, setFilterAssigned] = useState(null); // null=all, true=assigned, false=unassigned
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk Actions
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Manual Lead Creation & Edit State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '', source: '', followUpDate: '', followUpComment: '' });
  const [savingLead, setSavingLead] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);

  // Drawer State
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fileInputRef = useRef(null);
  const PAGE_SIZE = 15;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage, filterStatus, filterAssigned]);

  const fetchData = async () => {
    fetchStats();
    fetchExecutives();
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await crmApi.getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      showNotification('Failed to load CRM statistics', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLeads = async (page = 0) => {
    try {
      setLoadingLeads(true);
      const data = await crmApi.getAllLeads(page, PAGE_SIZE, filterStatus, filterAssigned);
      const leadsArr = data.content || data || [];
      setLeads(leadsArr);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      if (err?.message?.includes('cancelled') || err?.message?.includes('canceled')) return;
      showNotification('Failed to load leads', 'error');
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchExecutives = async () => {
    try {
      const execs = await crmApi.getExecutives();
      setExecutives(execs);
    } catch (err) {
      console.warn('Could not load executives', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0] || e;
    if (!file || !file.name) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showNotification('Please upload a valid Excel or CSV file', 'warning');
      return;
    }
    setUploading(true);
    try {
      const response = await crmApi.uploadLeads(file);
      const msg = typeof response === 'string' ? response : `Imported leads successfully`;
      showNotification(msg, 'success');
      fetchStats();
      fetchLeads(0);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to import leads', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleAssign = async (leadId, executiveId) => {
    if (!executiveId) return;
    setAssigning(leadId);
    try {
      await crmApi.assignLead(leadId, executiveId);
      showNotification('Lead assigned successfully', 'success');
      setLeads(leads.map(l => {
        if (l.id === leadId) {
          const exec = executives.find(e => String(e.id) === String(executiveId));
          return { ...l, assignedUserId: exec?.id, assignedUserName: exec?.name };
        }
        return l;
      }));
      fetchStats();
    } catch (err) {
      showNotification('Failed to assign lead', 'error');
    } finally {
      setAssigning(null);
    }
  };

  const handleBulkAssign = async (executiveId) => {
    if (selectedLeads.length === 0) return;
    setBulkAssigning(true);
    try {
      await crmApi.bulkAssignLeads(selectedLeads, executiveId);
      showNotification(`Successfully assigned ${selectedLeads.length} leads`, 'success');
      setSelectedLeads([]);
      fetchStats();
      fetchLeads(currentPage);
    } catch (err) {
      showNotification('Failed to bulk assign leads', 'error');
    } finally {
      setBulkAssigning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    setBulkDeleting(true);
    setShowBulkDeleteConfirm(false);
    try {
      await crmApi.bulkDeleteLeads(selectedLeads);
      showNotification(`Deleted ${selectedLeads.length} leads`, 'success');
      setSelectedLeads([]);
      fetchStats();
      fetchLeads(currentPage);
    } catch (err) {
      showNotification('Failed to delete leads', 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map(l => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (e, id) => {
    e.stopPropagation();
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]);
  };

  const handleExportLeads = async () => {
    try {
      const response = await crmApi.exportLeads();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('Leads exported successfully', 'success');
    } catch (err) {
      showNotification('Failed to export leads', 'error');
    }
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone) {
      showNotification('Name and Phone are required', 'warning');
      return;
    }
    setSavingLead(true);
    try {
      if (editingLeadId) {
        await crmApi.updateLead(editingLeadId, leadData);
        // Save follow-up date + comment if provided
        if (leadData.followUpDate !== undefined) {
          await crmApi.updateFollowUpDate(
            editingLeadId,
            leadData.followUpDate || null,
            leadData.followUpComment || '',
            true // isAdmin
          );
        }
        showNotification('Lead updated successfully', 'success');
      } else {
        await crmApi.createLead(leadData);
        showNotification('Lead created successfully', 'success');
      }
      closeModal();
      fetchStats();
      fetchLeads(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save lead', 'error');
    } finally {
      setSavingLead(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    try {
      await crmApi.deleteLead(leadId);
      showNotification('Lead deleted successfully', 'success');
      fetchStats();
      fetchLeads(currentPage);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete lead', 'error');
    }
  };

  const openAddModal = () => {
    setLeadData({ name: '', phone: '', email: '', source: '', followUpDate: '', followUpComment: '' });
    setEditingLeadId(null);
    setShowAddModal(true);
  };

  const openEditModal = (e, lead) => {
    e.stopPropagation(); // Prevent opening drawer
    setLeadData({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      source: lead.source || '',
      followUpDate: lead.followUpDate || '',
      followUpComment: '',
    });
    setEditingLeadId(lead.id);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingLeadId(null);
    setLeadData({ name: '', phone: '', email: '', source: '', followUpDate: '', followUpComment: '' });
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = async (leadId, statusData, isAdmin = true) => {
    try {
      await crmApi.updateLeadStatus(leadId, statusData, isAdmin);
      showNotification('Status updated', 'success');
      fetchLeads(currentPage);
      fetchStats();

      const newStatus = typeof statusData === 'string' ? statusData : statusData.status;
      const newDetails = typeof statusData === 'object' ? statusData.visitedPropertyDetails : undefined;

      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => ({
          ...prev,
          status: newStatus,
          ...(newDetails !== undefined && { visitedPropertyDetails: newDetails })
        }));
      }
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleRemarkAdded = (leadId, newRemark) => {
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => ({ ...prev, remarks: [...(prev.remarks || []), newRemark] }));
    }
  };

  // Status is filtered server-side via fetchLeads; only search is done client-side here
  const filteredLeads = leads.filter(l => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.phone?.includes(searchTerm) ||
      l.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8 relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-3xl font-display font-semibold text-primary-800">CRM Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Import, assign, edit and monitor all leads.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 font-medium rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus size={18} /> Add Lead
          </button>
          <button
            onClick={handleExportLeads}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 font-medium rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Download size={18} /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-xl shadow-sm shadow-primary-700/30 transition-all active:scale-95"
          >
            <UploadCloud size={18} /> Import
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={stats?.totalLeads} icon={Users} bg="bg-blue-50" fg="text-blue-600" loading={loadingStats} />
        <StatCard title="Assigned" value={stats?.assignedLeads} icon={UserCheck} bg="bg-indigo-50" fg="text-indigo-600" loading={loadingStats} />
        <StatCard title="Site Visits Done" value={stats?.visitDoneLeads} icon={Eye} bg="bg-teal-50" fg="text-teal-600" loading={loadingStats} />
        <StatCard title="Conversions (Won)" value={stats?.wonLeads} icon={CheckCircle} bg="bg-green-50" fg="text-green-600" loading={loadingStats} />
      </div>

      {/* Secondary mini-stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Unassigned" value={stats?.unassignedLeads} color="text-orange-500" loading={loadingStats} />
        <MiniStat label="Interested" value={stats?.interestedLeads} color="text-purple-500" loading={loadingStats} />
        <MiniStat label="Visit Planned" value={stats?.visitPlannedLeads} color="text-indigo-500" loading={loadingStats} />
        <MiniStat label="Lost" value={stats?.lostLeads} color="text-red-500" loading={loadingStats} />
      </div>

      {/* Leads Table */}
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">

          {/* Bulk Actions Bar */}
          {selectedLeads.length > 0 && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-primary-50 border-b border-primary-100 px-4 py-3 flex items-center justify-between shadow-sm animate-fade-in-down">
              <div className="flex items-center gap-3">
                <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-md">{selectedLeads.length}</span>
                <span className="text-sm font-semibold text-primary-900">Leads Selected</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Bulk Assign */}
                <select
                  onChange={(e) => handleBulkAssign(e.target.value === 'unassign' ? null : Number(e.target.value))}
                  value=""
                  disabled={bulkAssigning || bulkDeleting}
                  className="px-3 py-1.5 border border-primary-200 rounded-lg text-sm bg-white text-primary-800 outline-none focus:ring-2 focus:ring-primary-500/30 font-medium"
                >
                  <option value="" disabled>— Assign To —</option>
                  <option value="unassign">⚠️ Unassign</option>
                  {executives.map(exec => (
                    <option key={exec.id} value={exec.id}>{exec.name}</option>
                  ))}
                </select>
                {/* Bulk Delete */}
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  disabled={bulkDeleting || bulkAssigning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {bulkDeleting
                    ? <LoadingSpinner size="sm" color="white" />
                    : <Trash2 size={14} />}
                  Delete
                </button>
                <button
                  onClick={() => setSelectedLeads([])}
                  className="p-1.5 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Table controls */}
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
              {/* Row 1: Search + Status filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search name, phone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(0); }}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 outline-none bg-white text-gray-600"
                  >
                    <option value="">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="VISIT_PLANNED">Visit Planned</option>
                    <option value="VISIT_DONE">Visit Done</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Row 2: Assignment filter chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-500 mr-1">Assignment:</span>
                {[
                  { label: 'All', value: null, icon: '👥' },
                  { label: 'Unassigned', value: false, icon: '⚠️' },
                  { label: 'Assigned', value: true, icon: '✓' },
                ].map(({ label, value, icon }) => (
                  <button
                    key={label}
                    onClick={() => { setFilterAssigned(value); setCurrentPage(0); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      filterAssigned === value
                        ? value === false
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : value === true
                          ? 'bg-green-500 text-white border-green-500 shadow-sm'
                          : 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                    {/* Show live count badge */}
                    {value === false && stats && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        filterAssigned === false ? 'bg-white/30 text-white' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {stats.unassignedLeads}
                      </span>
                    )}
                    {value === true && stats && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        filterAssigned === true ? 'bg-white/30 text-white' : 'bg-green-100 text-green-600'
                      }`}>
                        {stats.assignedLeads}
                      </span>
                    )}
                  </button>
                ))}
                {/* Clear all filters */}
                {(filterStatus || filterAssigned !== null) && (
                  <button
                    onClick={() => { setFilterStatus(''); setFilterAssigned(null); setCurrentPage(0); }}
                    className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
              {loadingLeads ? (
                <div className="flex justify-center items-center h-56"><LoadingSpinner /></div>
              ) : filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 text-gray-400">
                  <Users size={40} className="mb-3 opacity-20" />
                  <p className="text-sm">No leads found.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <table className="hidden md:table w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="px-4 py-3 font-medium w-10">
                          <input 
                            type="checkbox" 
                            checked={filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </th>
                        <th className="px-4 py-3 font-medium">Lead</th>
                        <th className="px-4 py-3 font-medium">Contact</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Assign To</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                          onClick={() => handleLeadClick(lead)}
                        >
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={selectedLeads.includes(lead.id)}
                              onChange={(e) => handleSelectLead(e, lead.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800">{lead.name}</p>
                            <p className="text-xs text-gray-400">{lead.source}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-700 font-medium">{lead.phone}</p>
                            {lead.email && (
                              <p className="text-xs text-gray-400 truncate max-w-[150px]" title={lead.email}>{lead.email}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            {assigning === lead.id ? (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <LoadingSpinner size="sm" /> Saving...
                              </div>
                            ) : (
                              <select
                                value={lead.assignedUserId || ''}
                                onChange={(e) => handleAssign(lead.id, e.target.value)}
                                className={`w-full border rounded-lg px-2 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors ${lead.assignedUserId
                                  ? 'border-primary-200 bg-primary-50 text-primary-800'
                                  : 'border-gray-200 bg-white text-gray-500'
                                  }`}
                              >
                                <option value="" disabled>
                                  {lead.assignedUserName ? `✓ ${lead.assignedUserName}` : '— Assign —'}
                                </option>
                                {executives.map(exec => (
                                  <option key={exec.id} value={exec.id}>{exec.name}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Actions */}
                              <a
                                href={`tel:${lead.phone}`}
                                title="Call"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Phone size={15} />
                              </a>
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                target="_blank" rel="noreferrer" title="WhatsApp"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <MessageCircle size={15} />
                              </a>
                              <div className="w-px h-4 bg-gray-200 mx-1"></div>
                              <button
                                onClick={(e) => openEditModal(e, lead)}
                                className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
                                title="Edit Lead"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                title="Delete Lead"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="md:hidden flex flex-col divide-y divide-gray-100">
                    {filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer space-y-3"
                        onClick={() => handleLeadClick(lead)}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-3">
                            <div className="mt-1" onClick={e => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                checked={selectedLeads.includes(lead.id)}
                                onChange={(e) => handleSelectLead(e, lead.id)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-base">{lead.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{lead.source}</p>
                            </div>
                          </div>
                          <StatusBadge status={lead.status} />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-700 font-medium flex items-center gap-1.5">
                              <Phone size={14} className="text-gray-400"/>
                              {lead.phone}
                            </p>
                            {lead.email && <p className="text-xs text-gray-500 mt-1">{lead.email}</p>}
                          </div>
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <a href={`tel:${lead.phone}`} className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                              <Phone size={16} />
                            </a>
                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                              <MessageCircle size={16} />
                            </a>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-3" onClick={e => e.stopPropagation()}>
                          <div className="flex-1">
                            {assigning === lead.id ? (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <LoadingSpinner size="sm" /> Saving...
                              </div>
                            ) : (
                              <select
                                value={lead.assignedUserId || ''}
                                onChange={(e) => handleAssign(lead.id, e.target.value)}
                                className={`w-full border rounded-lg px-2 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors ${lead.assignedUserId
                                  ? 'border-primary-200 bg-primary-50 text-primary-800'
                                  : 'border-gray-200 bg-white text-gray-500'
                                  }`}
                              >
                                <option value="" disabled>
                                  {lead.assignedUserName ? `✓ ${lead.assignedUserName}` : '— Assign —'}
                                </option>
                                {executives.map(exec => (
                                  <option key={exec.id} value={exec.id}>{exec.name}</option>
                                ))}
                              </select>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={(e) => openEditModal(e, lead)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteLead(lead.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </div>

          {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">Page {currentPage + 1} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Add / Edit Lead Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">{editingLeadId ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={leadData.name}
                  onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  value={leadData.phone}
                  onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={leadData.email}
                  onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source / Requirement</label>
                <input
                  type="text"
                  value={leadData.source}
                  onChange={e => setLeadData({ ...leadData, source: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  placeholder="e.g. Website, 2BHK"
                />
              </div>

              {/* Follow-up Date + Comment — shown in both Add and Edit */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary-500" /> Follow-up Date
                  <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="date"
                    value={leadData.followUpDate}
                    onChange={e => setLeadData({ ...leadData, followUpDate: e.target.value })}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm"
                  />
                  {leadData.followUpDate && (
                    <button
                      type="button"
                      onClick={() => setLeadData({ ...leadData, followUpDate: '', followUpComment: '' })}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Clear follow-up"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <textarea
                  value={leadData.followUpComment}
                  onChange={e => setLeadData({ ...leadData, followUpComment: e.target.value })}
                  placeholder="Add a comment — e.g. Client requested a site visit next week…"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm resize-none placeholder-gray-400"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead || !leadData.name || !leadData.phone}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {savingLead ? <LoadingSpinner size="sm" color="white" /> : <CheckCircle size={18} />}
                  {savingLead ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">Delete {selectedLeads.length} Lead{selectedLeads.length !== 1 ? 's' : ''}?</h2>
                  <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin view of Lead Details Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={selectedLead}
        onStatusChange={handleStatusChange}
        onRemarkAdded={handleRemarkAdded}
        onFollowUpChanged={(leadId, date) => {
          setLeads(prev => prev.map(l => l.id === leadId ? { ...l, followUpDate: date } : l));
          if (selectedLead?.id === leadId) setSelectedLead(prev => ({ ...prev, followUpDate: date }));
        }}
        pipelineStages={PIPELINE_STAGES}
        isAdmin
      />
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, bg, fg, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl ${bg} ${fg} flex items-center justify-center shrink-0`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      {loading
        ? <div className="h-7 w-14 bg-gray-100 rounded animate-pulse mt-1" />
        : <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>}
    </div>
  </div>
);

const MiniStat = ({ label, value, color, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    {loading
      ? <div className="h-5 w-8 bg-gray-100 rounded animate-pulse" />
      : <span className={`text-lg font-bold ${color}`}>{value ?? '—'}</span>}
  </div>
);

const StatusBadge = ({ status }) => {
  const config = getStageConfig(status);
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${config.badgeStyle}`}>
      {config.title}
    </span>
  );
};

export default AdminCrmDashboard;
