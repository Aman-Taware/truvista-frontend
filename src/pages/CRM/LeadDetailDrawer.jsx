import React, { useState, useEffect, useContext } from 'react';
import { X, Phone, Mail, Calendar, Clock, Send, CheckCircle2, Building2, Tag, MessageSquare } from 'lucide-react';
import crmApi from '../../api/crmApi';
import { NotificationContext } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const STATUS_LABELS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  NOT_INTERESTED: 'Not Interested',
  VISIT_PLANNED: 'Visit Planned',
  VISIT_DONE: 'Visit Done',
  NEGOTIATION: 'Negotiation',
  WON: 'Won ✓',
  LOST: 'Lost',
};

const LeadDetailDrawer = ({ isOpen, onClose, lead, onStatusChange, onRemarkAdded, pipelineStages }) => {
  const { showNotification } = useContext(NotificationContext);

  const [newRemark, setNewRemark] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [visitedDetails, setVisitedDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    if (lead) {
      setVisitedDetails(lead.visitedPropertyDetails || '');
    }
  }, [lead?.id]);

  if (!lead) return null;

  const handleSubmitRemark = async (e) => {
    e.preventDefault();
    if (!newRemark.trim()) return;
    setSubmitting(true);
    try {
      const payload = { remarkText: newRemark };
      if (followUpDate) payload.followUpDate = followUpDate;
      const addedRemark = await crmApi.addLeadRemark(lead.id, payload);
      onRemarkAdded(lead.id, addedRemark);
      setNewRemark('');
      setFollowUpDate('');
      showNotification('Remark added', 'success');
    } catch (err) {
      showNotification('Failed to add remark', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveVisitDetails = async () => {
    setSavingDetails(true);
    try {
      await onStatusChange(lead.id, {
        status: 'VISIT_DONE',
        visitedPropertyDetails: visitedDetails,
      });
      showNotification('Property details saved', 'success');
    } catch (err) {
      showNotification('Failed to save details', 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary-800 to-primary-700 flex justify-between items-start">
          <div className="text-white">
            <h2 className="text-lg font-bold leading-tight">{lead.name}</h2>
            <p className="text-primary-200 text-xs mt-0.5">Lead #{lead.id} · {lead.source || 'Unknown source'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-primary-600 rounded-full transition-colors text-primary-200 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Contact Strip */}
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-3">
            <ContactChip icon={Phone} label={lead.phone} color="blue" />
            {lead.email && <ContactChip icon={Mail} label={lead.email} color="purple" truncate />}
          </div>

          <div className="px-6 pt-5 pb-3 space-y-6">

            {/* Status Section */}
            <Section title="Pipeline Status">
              <select
                value={lead.status}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
              >
                {pipelineStages.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </Section>

            {/* Visited Property Details — shown when VISIT_DONE */}
            {lead.status === 'VISIT_DONE' && (
              <Section title="Property Visited">
                <textarea
                  value={visitedDetails}
                  onChange={(e) => setVisitedDetails(e.target.value)}
                  placeholder="e.g. Visited 3BHK Unit 502, Tower A. Client liked the view and floor plan. Interested in 2BHK alternative..."
                  rows={4}
                  className="w-full p-3 border border-teal-200 bg-teal-50/30 rounded-xl text-sm resize-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none text-gray-700 placeholder-gray-400"
                />
                {lead.visitedPropertyDetails && (
                  <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                    <Building2 size={11} /> Currently saved: "{lead.visitedPropertyDetails.slice(0, 60)}{lead.visitedPropertyDetails.length > 60 ? '…' : ''}"
                  </p>
                )}
                <button
                  onClick={handleSaveVisitDetails}
                  disabled={savingDetails}
                  className="mt-2 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {savingDetails ? <><LoadingSpinner size="sm" /> Saving…</> : <><Building2 size={15} /> Save Property Details</>}
                </button>
              </Section>
            )}

            {/* Follow-up Date (for VISIT_PLANNED) */}
            {lead.status === 'VISIT_PLANNED' && (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-2">Schedule Follow-up / Visit</p>
                <p className="text-xs text-indigo-500">Set a follow-up date in the remark below. It will appear on your Calendar.</p>
              </div>
            )}

            {/* Interaction Timeline */}
            <Section title={`Interaction Log (${lead.remarks?.length || 0})`}>
              {(!lead.remarks || lead.remarks.length === 0) ? (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No interactions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...lead.remarks].reverse().map((remark) => (
                    <RemarkCard key={remark.id} remark={remark} />
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>

        {/* Sticky Input Bar */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
          {/* Follow-up date */}
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <Calendar size={13} className="text-primary-400" />
            Follow-up date (optional):
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="ml-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-primary-400 bg-white"
            />
          </label>

          {/* Remark input */}
          <form onSubmit={handleSubmitRemark} className="relative">
            <textarea
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitRemark(e); } }}
              placeholder="Add a remark… (Enter to send)"
              rows={2}
              className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-14 py-3 text-sm resize-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !newRemark.trim()}
              className="absolute right-2 bottom-2 w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 transition-colors"
            >
              {submitting ? <LoadingSpinner size="sm" color="white" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">{title}</h3>
    {children}
  </div>
);

const ContactChip = ({ icon: Icon, label, color, truncate }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={13} />
      </div>
      <span className={`text-sm text-gray-700 font-medium ${truncate ? 'truncate' : ''}`}>{label}</span>
    </div>
  );
};

const RemarkCard = ({ remark }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-xs font-semibold text-primary-700">
        {remark.createdByName || 'Executive'}
      </span>
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <Clock size={10} />
        {remark.createdAt ? new Date(remark.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
      </div>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">{remark.remarkText}</p>
    {remark.followUpDate && (
      <div className="mt-2 flex items-center gap-1.5 text-indigo-600 bg-indigo-50 rounded-lg px-2.5 py-1.5 text-xs font-medium w-fit">
        <Calendar size={11} />
        Follow-up: {new Date(remark.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    )}
  </div>
);

export default LeadDetailDrawer;
