import api from './index';

const crmApi = {
  // --- Admin Endpoints ---
  
  uploadLeads: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/api/admin/crm/leads/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      _skipDuplicate: true,
    });
  },

  exportLeads: async () => {
    return await api.get('/api/admin/crm/leads/export', { responseType: 'blob', _skipDuplicate: true });
  },

  createLead: async (leadData) => {
    return await api.post('/api/admin/crm/leads', leadData, { _skipDuplicate: true });
  },

  updateLead: async (leadId, leadData) => {
    return await api.put(`/api/admin/crm/leads/${leadId}`, leadData, { _skipDuplicate: true });
  },

  deleteLead: async (leadId) => {
    return await api.delete(`/api/admin/crm/leads/${leadId}`, { _skipDuplicate: true });
  },

  getAdminDashboardStats: async () => {
    return await api.get('/api/admin/crm/leads/dashboard', { _skipDuplicate: true });
  },

  getAllLeads: async (page = 0, size = 20, status = '', assigned = null) => {
    const params = { page, size };
    if (status) params.status = status;
    if (assigned !== null) params.assigned = assigned;
    return await api.get('/api/admin/crm/leads', { params, _skipDuplicate: true });
  },

  assignLead: async (leadId, executiveId) => {
    return await api.put(`/api/admin/crm/leads/${leadId}/assign`, { executiveId }, { _skipDuplicate: true });
  },

  bulkAssignLeads: async (leadIds, executiveId) => {
    return await api.post('/api/admin/crm/leads/bulk-assign', { leadIds, executiveId }, { _skipDuplicate: true });
  },

  getExecutives: async () => {
    const page = await api.get('/api/admin/users', { params: { size: 200 }, _skipDuplicate: true });
    const allUsers = page?.content || [];
    return allUsers.filter(u => u.role === 'EXECUTIVE' || u.role === 'ADMIN');
  },

  getGlobalPipeline: async (executiveId = '') => {
    const params = executiveId ? { executiveId } : {};
    return await api.get('/api/admin/crm/leads/pipeline', { params, _skipDuplicate: true });
  },

  getGlobalCalendarVisits: async (startDate, endDate, executiveId = '') => {
    const params = { startDate, endDate };
    if (executiveId) params.executiveId = executiveId;
    return await api.get('/api/admin/crm/leads/calendar', { params, _skipDuplicate: true });
  },

  // --- Executive Endpoints ---
  
  getMyLeads: async (status = '') => {
    const params = status ? { status } : {};
    return await api.get('/api/executive/crm/leads', { params, _skipDuplicate: true });
  },

  updateLeadStatus: async (leadId, statusData) => {
    const payload = typeof statusData === 'string' ? { status: statusData } : statusData;
    return await api.put(`/api/executive/crm/leads/${leadId}/status`, payload, { _skipDuplicate: true });
  },

  addLeadRemark: async (leadId, remarkData) => {
    return await api.post(`/api/executive/crm/leads/${leadId}/remarks`, remarkData, { _skipDuplicate: true });
  },

  getCalendarVisits: async (startDate, endDate) => {
    return await api.get('/api/executive/crm/leads/calendar', {
      params: { startDate, endDate },
      _skipDuplicate: true,
    });
  },
};

export default crmApi;


