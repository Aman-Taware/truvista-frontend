import React, { useState, useEffect, useContext } from 'react';
import { Search, Phone, Mail, ChevronRight, MessageSquare, Building2, MessageCircle, KanbanSquare } from 'lucide-react';
import { NotificationContext } from '../../contexts/NotificationContext';
import crmApi from '../../api/crmApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import LeadDetailDrawer from './LeadDetailDrawer';

import { PIPELINE_STAGES } from '../../utils/crmConstants';

const ExecutivePipeline = ({ isGlobalView = false }) => {
  const { showNotification } = useContext(NotificationContext);

  const [leads, setLeads] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');

  const [selectedLead, setSelectedLead] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (isGlobalView) {
      fetchExecutives();
    }
  }, [isGlobalView]);

  useEffect(() => {
    fetchLeads();
  }, [selectedExecutive, isGlobalView]);

  const fetchExecutives = async () => {
    try {
      const execs = await crmApi.getExecutives();
      setExecutives(execs);
    } catch (err) {
      console.warn('Could not load executives', err);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let data;
      if (isGlobalView) {
        data = await crmApi.getGlobalPipeline(selectedExecutive);
      } else {
        data = await crmApi.getMyLeads();
      }
      setLeads(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      // Ignore cancelled/duplicate requests silently
      if (err?.message?.includes('cancelled') || err?.message?.includes('canceled')) return;
      showNotification('Failed to load pipeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleStatusChange = async (leadId, statusData, isAdmin = false) => {
    try {
      await crmApi.updateLeadStatus(leadId, statusData, isAdmin);
      showNotification('Status updated', 'success');
      const newStatus = typeof statusData === 'string' ? statusData : statusData.status;
      const newDetails = typeof statusData === 'object' ? statusData.visitedPropertyDetails : undefined;
      const updated = leads.map(l => {
        if (l.id !== leadId) return l;
        return {
          ...l,
          status: newStatus,
          ...(newDetails !== undefined && { visitedPropertyDetails: newDetails }),
        };
      });
      setLeads(updated);
      const updatedLead = updated.find(l => l.id === leadId);
      if (selectedLead?.id === leadId) setSelectedLead(updatedLead);
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleRemarkAdded = (leadId, newRemark) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      return { ...l, remarks: [...(l.remarks || []), newRemark] };
    }));
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => ({ ...prev, remarks: [...(prev.remarks || []), newRemark] }));
    }
  };

  const filteredLeads = leads.filter(l => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.email?.toLowerCase().includes(q);
    const matchStage = !filterStage || l.status === filterStage;
    return matchSearch && matchStage;
  });

  const totalByStage = (stageId) => filteredLeads.filter(l => l.status === stageId).length;

  return (
    <div className="flex flex-col min-h-full bg-gray-50">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 shrink-0">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-display font-semibold text-primary-800 leading-tight">
              {isGlobalView ? 'Global Pipeline' : 'My Pipeline'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {filteredLeads.length} lead{filteredLeads.length !== 1 && 's'}
            </p>
          </div>
          {isGlobalView && (
            <select
              value={selectedExecutive}
              onChange={(e) => setSelectedExecutive(e.target.value)}
              className="text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none max-w-[160px]"
            >
              <option value="">All Executives</option>
              {executives.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search leads by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none bg-gray-50"
          />
        </div>

        {/* Stage filter chips — horizontal scroll on mobile */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setFilterStage('')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              !filterStage ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({leads.length})
          </button>
          {PIPELINE_STAGES.map(s => {
            const count = leads.filter(l => l.status === s.id).length;
            if (count === 0) return null;
            return (
              <button
                key={s.id}
                onClick={() => setFilterStage(filterStage === s.id ? '' : s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterStage === s.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : `${s.headerBg} ${s.headerText} hover:opacity-80`
                }`}
              >
                {s.title} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <LoadingSpinner size="xl" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
          <KanbanSquare size={40} strokeWidth={1.5} className="mb-3 text-gray-300" />
          <p className="text-sm">No leads found</p>
        </div>
      ) : (
        <>
          {/* ── Mobile: vertical grouped list ─────────────────── */}
          <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4">
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.status === stage.id);
              if (stageLeads.length === 0) return null;
              return (
                <div key={stage.id}>
                  {/* Stage header */}
                  <div className={`flex items-center gap-2 mb-2 px-1`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${stage.headerText}`}>{stage.title}</span>
                    <span className="text-xs text-gray-400">· {stageLeads.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageLeads.map(lead => (
                      <MobileLeadCard
                        key={lead.id}
                        lead={lead}
                        stage={stage}
                        onClick={() => handleLeadClick(lead)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop: horizontal Kanban ─────────────────────── */}
          <div className="hidden lg:flex flex-1 overflow-x-auto bg-gray-50 p-4">
            <div className="flex gap-4 h-full min-w-max">
              {PIPELINE_STAGES.map(stage => {
                const stageLeads = filteredLeads.filter(l => l.status === stage.id);
                return (
                  <div key={stage.id} className={`w-72 flex flex-col h-full bg-white rounded-2xl shadow-sm border-t-4 ${stage.color} overflow-hidden`}>
                    <div className={`${stage.headerBg} px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                        <h3 className={`font-semibold text-sm ${stage.headerText}`}>{stage.title}</h3>
                      </div>
                      <span className="bg-white/80 border border-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                      {stageLeads.length === 0 ? (
                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-xs text-gray-400">
                          Empty
                        </div>
                      ) : stageLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead} onClick={() => handleLeadClick(lead)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Drawer */}
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
        isAdmin={isGlobalView}
      />
    </div>
  );
};

// ─── Mobile Lead Card ──────────────────────────────────────────────────────────
const MobileLeadCard = ({ lead, stage, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all overflow-hidden"
  >
    <div className={`h-1 w-full ${stage.dot.replace('bg-', 'bg-')}`} />
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 text-sm truncate">{lead.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <a
              href={`tel:${lead.phone}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-blue-600 font-medium"
            >
              <Phone size={11} />
              {lead.phone}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          <a
            href={`tel:${lead.phone}`}
            className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl"
          >
            <Phone size={16} />
          </a>
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
            target="_blank" rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center bg-green-50 text-green-600 rounded-xl"
          >
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
      {lead.remarks?.length > 0 && (
        <p className="mt-2 text-[11px] text-gray-400 italic line-clamp-1">
          "{lead.remarks[lead.remarks.length - 1].remarkText}"
        </p>
      )}
    </div>
  </div>
);

// ─── Desktop Lead Card ─────────────────────────────────────────────────────────
const LeadCard = ({ lead, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white border border-gray-200 rounded-xl p-3.5 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group"
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-semibold text-gray-800 text-sm group-hover:text-primary-700 transition-colors line-clamp-1 flex-1 mr-1">
        {lead.name}
      </h4>
      {lead.source && (
        <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded shrink-0">
          {lead.source}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <div className="flex items-center text-xs text-gray-500">
        <Phone size={11} className="mr-1.5 text-gray-400 shrink-0" />{lead.phone}
      </div>
      {lead.email && (
        <div className="flex items-center text-xs text-gray-400">
          <Mail size={11} className="mr-1.5 shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
      )}
    </div>
    {lead.visitedPropertyDetails && (
      <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-start gap-1.5">
        <Building2 size={11} className="text-teal-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-teal-700 line-clamp-2">{lead.visitedPropertyDetails}</p>
      </div>
    )}
    {lead.remarks?.length > 0 && (
      <div className="mt-2 flex items-start gap-1.5">
        <MessageSquare size={11} className="text-primary-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-gray-400 line-clamp-2 italic">
          "{lead.remarks[lead.remarks.length - 1].remarkText}"
        </p>
      </div>
    )}
    <div className="mt-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
        <a href={`tel:${lead.phone}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Phone size={14} />
        </a>
        <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <MessageCircle size={14} />
        </a>
      </div>
      <span className="text-[11px] font-medium text-primary-600 flex items-center">
        Details <ChevronRight size={12} className="ml-0.5" />
      </span>
    </div>
  </div>
);

export default ExecutivePipeline;
