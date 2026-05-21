import React, { useState, useEffect, useContext } from 'react';
import { X, Phone, Mail, Calendar, Clock, Send, Building2, MessageSquare, RefreshCw } from 'lucide-react';
import crmApi from '../../api/crmApi';
import { NotificationContext } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const LeadDetailDrawer = ({ isOpen, onClose, lead, onStatusChange, onRemarkAdded, onFollowUpChanged, pipelineStages, isAdmin = false }) => {
  const { showNotification } = useContext(NotificationContext);

  const [newRemark, setNewRemark] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpComment, setFollowUpComment] = useState('');
  const [visitedDetails, setVisitedDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [updatingFollowUp, setUpdatingFollowUp] = useState(false);

  useEffect(() => {
    if (lead) {
      setVisitedDetails(lead.visitedPropertyDetails || '');
      // Pre-fill follow-up date picker with current value
      setFollowUpDate(lead.followUpDate || '');
    }
  }, [lead?.id]);

  if (!lead) return null;

  const handleSubmitRemark = async (e) => {
    e.preventDefault();
    if (!newRemark.trim()) return;
    setSubmitting(true);
    try {
      const payload = { remarkText: newRemark };
      // If a follow-up date is set in the remark form, include it — it will overwrite lead.followUpDate
      if (followUpDate) payload.followUpDate = followUpDate;
      const updatedLead = await crmApi.addLeadRemark(lead.id, payload);
      onRemarkAdded(lead.id, updatedLead);
      setNewRemark('');
      if (followUpDate) {
        // Sync displayed follow-up date if it was changed via remark
        setFollowUpDate(updatedLead?.followUpDate || followUpDate);
        if (onFollowUpChanged) onFollowUpChanged(lead.id, followUpDate);
      }
      showNotification('Remark added', 'success');
    } catch (err) {
      showNotification('Failed to add remark', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFollowUp = async () => {
    setUpdatingFollowUp(true);
    try {
      await crmApi.updateFollowUpDate(lead.id, followUpDate || null, followUpComment, isAdmin);
      if (onFollowUpChanged) onFollowUpChanged(lead.id, followUpDate || null);
      setFollowUpComment('');
      showNotification(followUpDate ? 'Follow-up date updated' : 'Follow-up date cleared', 'success');
    } catch (err) {
      showNotification('Failed to update follow-up date', 'error');
    } finally {
      setUpdatingFollowUp(false);
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

  const currentFollowUpChanged = followUpDate !== (lead.followUpDate || '');

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
          <div>
            {/* FIX #3: Explicit text-white on the name */}
            <h2 className="text-lg font-bold leading-tight text-white">{lead.name}</h2>
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

            {/* FIX #1: Follow-up Date — single editable section, always visible */}
            <Section title="Follow-up Date">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white"
                  />
                </div>
                {followUpDate && (
                  <button
                    type="button"
                    onClick={() => setFollowUpDate('')}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs"
                    title="Clear follow-up"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleUpdateFollowUp}
                  disabled={updatingFollowUp || !currentFollowUpChanged}
                  className="px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {updatingFollowUp ? <LoadingSpinner size="sm" color="white" /> : <RefreshCw size={13} />}
                  Update
                </button>
              </div>
              {/* Optional comment for the follow-up change */}
              <textarea
                value={followUpComment}
                onChange={(e) => setFollowUpComment(e.target.value)}
                placeholder="Add a comment (optional) — e.g. Client asked to push visit to next week…"
                rows={2}
                className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none text-gray-700 placeholder-gray-400 bg-gray-50/50"
              />
              {lead.followUpDate && (
                <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1">
                  <Calendar size={11} />
                  Current: {new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </Section>

            {/* Visited Property Details — shown when VISIT_DONE */}
            {lead.status === 'VISIT_DONE' && (
              <Section title="Property Visited">
                <textarea
                  value={visitedDetails}
                  onChange={(e) => setVisitedDetails(e.target.value)}
                  placeholder="e.g. Visited 3BHK Unit 502, Tower A. Client liked the view and floor plan..."
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
                  {savingDetails ? <><LoadingSpinner size="sm" />Saving…</> : <><Building2 size={15} />Save Property Details</>}
                </button>
              </Section>
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

        {/* Sticky Input Bar — remark only, follow-up handled in section above */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
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
  </div>
);

export default LeadDetailDrawer;
