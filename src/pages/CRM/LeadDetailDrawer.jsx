import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  X, Phone, Mail, Calendar, Clock, Building2, MessageSquare,
  RefreshCw, AlertCircle, Send, CheckCircle2, ChevronDown
} from 'lucide-react';
import crmApi from '../../api/crmApi';
import { NotificationContext } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

/**
 * LeadDetailDrawer — modal popup
 *
 * Changes:
 *  - Status: local pending state, saved via "Save Status" button (not on select change)
 *  - Follow-up Date: has its own "Update Date" button; comment required only when date changes
 *  - Comment: general-purpose sticky bottom bar — freely add remarks at any time
 *    When follow-up date is pending a change, the bottom comment is also used for that (with validation)
 */
const LeadDetailDrawer = ({
  isOpen,
  onClose,
  lead,
  onStatusChange,
  onRemarkAdded,
  onFollowUpChanged,
  pipelineStages,
  isAdmin = false,
}) => {
  const { showNotification } = useContext(NotificationContext);
  const backdropRef = useRef(null);
  const commentRef  = useRef(null);

  // ── Local state ───────────────────────────────────────────────────────────
  const [pendingStatus,    setPendingStatus]    = useState('');
  const [followUpDate,     setFollowUpDate]     = useState('');
  const [visitedDetails,   setVisitedDetails]   = useState('');
  const [newComment,       setNewComment]       = useState('');

  const [savingStatus,     setSavingStatus]     = useState(false);
  const [updatingFollowUp, setUpdatingFollowUp] = useState(false);
  const [savingDetails,    setSavingDetails]    = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // ── Sync when lead changes ────────────────────────────────────────────────
  useEffect(() => {
    if (lead) {
      setPendingStatus(lead.status || '');
      setFollowUpDate(lead.followUpDate || '');
      setVisitedDetails(lead.visitedPropertyDetails || '');
      setNewComment('');
    }
  }, [lead?.id, lead?.status, lead?.followUpDate, lead?.visitedPropertyDetails]);  // re-sync if lead fields change from parent

  // ── Keyboard & scroll lock ────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!lead) return null;

  // ── Derived flags ─────────────────────────────────────────────────────────
  const statusChanged    = pendingStatus !== (lead.status || '');
  const followUpChanged  = followUpDate  !== (lead.followUpDate || '');

  // ── Handlers ─────────────────────────────────────────────────────────────

  /** Save status — only fires when user explicitly clicks "Save Status" */
  const handleSaveStatus = async () => {
    const statusToSave = pendingStatus;
    setSavingStatus(true);
    try {
      await onStatusChange(lead.id, statusToSave, isAdmin);
      // onStatusChange already shows notification + updates parent state
      // Set pendingStatus to the confirmed value so it stays in sync
      setPendingStatus(statusToSave);
    } catch {
      // Revert local state to the last known-good status from the lead
      setPendingStatus(lead.status || '');
      showNotification('Failed to update status', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  /** Update follow-up date — comment required only if date changed */
  const handleUpdateFollowUp = async () => {
    if (followUpChanged && !newComment.trim()) {
      showNotification('Add a comment below before updating the follow-up date', 'warning');
      commentRef.current?.focus();
      return;
    }
    setUpdatingFollowUp(true);
    try {
      await crmApi.updateFollowUpDate(lead.id, followUpDate || null, newComment.trim(), isAdmin);
      if (onFollowUpChanged) onFollowUpChanged(lead.id, followUpDate || null);
      if (newComment.trim() && onRemarkAdded) {
        onRemarkAdded(lead.id, {
          id: Date.now(),
          remarkText: newComment.trim(),
          createdByName: isAdmin ? 'Admin' : 'You',
          createdAt: new Date().toISOString(),
        });
      }
      setNewComment('');
      showNotification(followUpDate ? 'Follow-up date updated' : 'Follow-up date cleared', 'success');
    } catch {
      showNotification('Failed to update follow-up date', 'error');
    } finally {
      setUpdatingFollowUp(false);
    }
  };

  /** General comment submit — also handles follow-up if date is pending */
  const handleSubmitComment = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    // If follow-up date is also pending, piggyback it here
    if (followUpChanged) {
      await handleUpdateFollowUp();
      return;
    }

    setSubmittingComment(true);
    try {
      const updatedLead = await crmApi.addLeadRemark(lead.id, { remarkText: newComment.trim() }, isAdmin);
      if (onRemarkAdded) {
        // backend returns full updated lead; extract last remark or build a local one
        const newRemark = updatedLead?.remarks?.slice(-1)[0] || {
          id: Date.now(),
          remarkText: newComment.trim(),
          createdByName: isAdmin ? 'Admin' : 'You',
          createdAt: new Date().toISOString(),
        };
        onRemarkAdded(lead.id, newRemark);
      }
      setNewComment('');
      showNotification('Comment added', 'success');
    } catch {
      showNotification('Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  /** Save visit details */
  const handleSaveVisitDetails = async () => {
    setSavingDetails(true);
    try {
      await onStatusChange(lead.id, {
        status: 'VISIT_DONE',
        visitedPropertyDetails: visitedDetails,
      }, isAdmin);
      showNotification('Property details saved', 'success');
    } catch {
      showNotification('Failed to save details', 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Modal Panel */}
      <div
        className={`
          fixed z-50 flex flex-col bg-white shadow-2xl
          transition-all duration-300 ease-out rounded-2xl overflow-hidden
          inset-x-3 bottom-3 top-10
          md:inset-x-auto md:right-4 md:top-4 md:bottom-4 md:w-[460px]
          ${isOpen
            ? 'opacity-100 translate-y-0 md:translate-x-0'
            : 'opacity-0 translate-y-4 md:translate-x-4 pointer-events-none'
          }
        `}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 bg-gradient-to-r from-primary-800 to-primary-700 flex justify-between items-start shrink-0">
          <div className="min-w-0 flex-1 mr-2">
            <h2 className="text-base font-bold leading-tight text-white truncate">{lead.name}</h2>
            <p className="text-primary-200 text-xs mt-0.5">
              Lead #{lead.id} · {lead.source || 'Unknown source'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-primary-600 rounded-full transition-colors text-primary-200 hover:text-white shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Contact Strip */}
          <div className="px-5 py-3 border-b border-gray-100 flex gap-3 flex-wrap">
            <ContactChip icon={Phone} label={lead.phone} color="blue" />
            {lead.email && <ContactChip icon={Mail} label={lead.email} color="purple" truncate />}
          </div>

          <div className="px-5 pt-5 pb-4 space-y-5">

            {/* ── Pipeline Status ─────────────────────────────────────────── */}
            <Section title="Pipeline Status">
              <div className="relative">
                <select
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value)}
                  className="w-full p-3 pr-9 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none appearance-none"
                >
                  {pipelineStages.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {statusChanged && (
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  className="mt-2 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingStatus
                    ? <LoadingSpinner size="sm" color="white" />
                    : <CheckCircle2 size={15} />
                  }
                  Save Status Change
                </button>
              )}
            </Section>

            {/* ── Follow-up Date ───────────────────────────────────────────── */}
            <Section title="Follow-up Date">
              {lead.followUpDate && (
                <p className="text-xs text-indigo-600 mb-2 flex items-center gap-1.5 bg-indigo-50 rounded-lg px-3 py-1.5">
                  <Calendar size={11} />
                  Current:{' '}
                  {new Date(lead.followUpDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              )}

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
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
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Clear date"
                  >
                    <X size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleUpdateFollowUp}
                  disabled={updatingFollowUp || !followUpChanged}
                  className="px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {updatingFollowUp ? <LoadingSpinner size="sm" color="white" /> : <RefreshCw size={12} />}
                  Update
                </button>
              </div>

              {/* Hint when date has changed but no comment typed yet */}
              {followUpChanged && !newComment.trim() && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
                  <AlertCircle size={11} />
                  Add a comment below before updating the date
                </div>
              )}
              {followUpChanged && newComment.trim() && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5">
                  <CheckCircle2 size={11} />
                  Comment ready — click "Update" or send from the comment bar
                </div>
              )}
            </Section>

            {/* ── Visited Property Details ─────────────────────────────────── */}
            {lead.status === 'VISIT_DONE' && (
              <Section title="Property Visited">
                <textarea
                  value={visitedDetails}
                  onChange={(e) => setVisitedDetails(e.target.value)}
                  placeholder="e.g. Visited 3BHK Unit 502, Tower A. Client liked the view and floor plan..."
                  rows={3}
                  className="w-full p-3 border border-teal-200 bg-teal-50/30 rounded-xl text-sm resize-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none text-gray-700 placeholder-gray-400"
                />
                {lead.visitedPropertyDetails && (
                  <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                    <Building2 size={11} />
                    Saved: "{lead.visitedPropertyDetails.slice(0, 60)}{lead.visitedPropertyDetails.length > 60 ? '…' : ''}"
                  </p>
                )}
                <button
                  onClick={handleSaveVisitDetails}
                  disabled={savingDetails}
                  className="mt-2 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {savingDetails
                    ? <><LoadingSpinner size="sm" />Saving…</>
                    : <><Building2 size={15} />Save Property Details</>
                  }
                </button>
              </Section>
            )}

            {/* ── Interaction Log ──────────────────────────────────────────── */}
            <Section title={`Interaction Log (${lead.remarks?.length || 0})`}>
              {(!lead.remarks || lead.remarks.length === 0) ? (
                <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                  <MessageSquare size={22} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No interactions yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[...lead.remarks].reverse().map((remark) => (
                    <RemarkCard key={remark.id} remark={remark} />
                  ))}
                </div>
              )}
            </Section>

          </div>
        </div>

        {/* ── Sticky Comment Bar ──────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50/60 px-4 py-3">
          {/* Context hint when follow-up date is pending */}
          {followUpChanged && (
            <p className="text-[11px] text-amber-600 flex items-center gap-1 mb-2">
              <AlertCircle size={10} />
              {newComment.trim()
                ? 'This comment will also save the follow-up date change.'
                : 'Comment required — will be saved with the follow-up date change.'}
            </p>
          )}

          <form onSubmit={handleSubmitComment} className="relative">
            <textarea
              ref={commentRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
              placeholder={
                followUpChanged
                  ? 'Required: add a comment for the follow-up date change…'
                  : 'Add a comment or remark… (Enter to send)'
              }
              rows={2}
              className={`w-full bg-white border rounded-xl pl-4 pr-14 py-3 text-sm resize-none focus:ring-2 outline-none transition-colors placeholder-gray-400 ${
                followUpChanged
                  ? 'border-amber-300 focus:ring-amber-400/30 focus:border-amber-400'
                  : 'border-gray-200 focus:ring-primary-500/30 focus:border-primary-500'
              }`}
            />
            <button
              type="submit"
              disabled={submittingComment || updatingFollowUp || !newComment.trim()}
              className="absolute right-2 bottom-2 w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 transition-colors"
            >
              {(submittingComment || updatingFollowUp)
                ? <LoadingSpinner size="sm" color="white" />
                : <Send size={15} />
              }
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">{title}</h3>
    {children}
  </div>
);

const ContactChip = ({ icon: Icon, label, color, truncate }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={13} />
      </div>
      <span className={`text-sm text-gray-700 font-medium ${truncate ? 'truncate max-w-[160px]' : ''}`}>
        {label}
      </span>
    </div>
  );
};

const RemarkCard = ({ remark }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-semibold text-primary-700">
        {remark.createdByName || 'Executive'}
      </span>
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <Clock size={10} />
        {remark.createdAt
          ? new Date(remark.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : ''}
      </div>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">{remark.remarkText}</p>
  </div>
);

export default LeadDetailDrawer;
