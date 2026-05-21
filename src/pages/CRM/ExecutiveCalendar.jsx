import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, Phone, MessageSquare, Calendar as CalendarIcon, Edit2, Check, X } from 'lucide-react';
import { 
  format, isSameDay, parseISO, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  addMonths, subMonths, isToday 
} from 'date-fns';
import { NotificationContext } from '../../contexts/NotificationContext';
import crmApi from '../../api/crmApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getStageConfig } from '../../utils/crmConstants';

const ExecutiveCalendar = ({ isGlobalView = false }) => {
  const { showNotification } = useContext(NotificationContext);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [remarks, setRemarks] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Per-card inline follow-up editing state
  const [editingFollowUp, setEditingFollowUp] = useState(null); // leadId
  const [editDate, setEditDate] = useState('');
  const [editComment, setEditComment] = useState('');
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  useEffect(() => {
    if (isGlobalView) fetchExecutives();
  }, [isGlobalView]);

  useEffect(() => {
    fetchVisits();
  }, [currentMonth, selectedExecutive, isGlobalView]);

  const fetchExecutives = async () => {
    try {
      const execs = await crmApi.getExecutives();
      setExecutives(execs);
    } catch (err) {
      console.warn('Could not load executives', err);
    }
  };

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');
      
      let data;
      if (isGlobalView) {
        data = await crmApi.getGlobalCalendarVisits(formattedStart, formattedEnd, selectedExecutive);
      } else {
        data = await crmApi.getCalendarVisits(formattedStart, formattedEnd);
      }
      setRemarks(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.message?.includes('cancelled') || err?.message?.includes('canceled')) return;
      showNotification('Failed to load calendar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });
  const getRemarksForDay = (day) =>
    remarks.filter(r => r.followUpDate && isSameDay(parseISO(r.followUpDate), day));
  const selectedDayRemarks = getRemarksForDay(selectedDay);

  const startEditFollowUp = (remark) => {
    setEditingFollowUp(remark.leadId);
    setEditDate(remark.followUpDate || '');
    setEditComment('');
  };

  const cancelEditFollowUp = () => {
    setEditingFollowUp(null);
    setEditDate('');
    setEditComment('');
  };

  const saveFollowUp = async (leadId) => {
    if (!editDate) return;
    setSavingFollowUp(true);
    try {
      await crmApi.updateFollowUpDate(leadId, editDate, editComment, isGlobalView);
      showNotification('Follow-up date updated', 'success');
      setEditingFollowUp(null);
      setEditDate('');
      setEditComment('');
      fetchVisits(); // Refresh calendar
    } catch (err) {
      showNotification('Failed to update follow-up', 'error');
    } finally {
      setSavingFollowUp(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 p-3 sm:p-6 gap-4">

      {/* ── Calendar Card ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
              <CalendarIcon size={18} />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-gray-800">
              {isGlobalView ? 'Global Calendar — ' : ''}{format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isGlobalView && (
              <select
                value={selectedExecutive}
                onChange={(e) => setSelectedExecutive(e.target.value)}
                className="text-xs sm:text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none max-w-[150px]"
              >
                <option value="">All Executives</option>
                {executives.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={goToToday}
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
            >
              Today
            </button>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button onClick={prevMonth} className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-colors text-gray-600">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-colors text-gray-600">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="py-2 text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <LoadingSpinner size="xl" />
          </div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-[minmax(56px,1fr)] sm:auto-rows-[minmax(90px,1fr)]">
            {daysInGrid.map((day, i) => {
              const dayRemarks = getRemarksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);
              const isSelected = isSameDay(day, selectedDay);

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`border-r border-b border-gray-100 p-1 sm:p-2 relative cursor-pointer transition-colors
                    ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white active:bg-gray-50'}
                    ${isSelected ? 'ring-2 ring-inset ring-primary-400 bg-primary-50/20' : ''}
                  `}
                >
                  <span className={`
                    w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-semibold
                    ${isDayToday ? 'bg-primary-600 text-white shadow-sm' :
                      isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
                  `}>
                    {format(day, 'd')}
                  </span>

                  {dayRemarks.length > 0 && (
                    <>
                      {/* Mobile: colored dots */}
                      <div className="flex gap-0.5 mt-1 sm:hidden">
                        {dayRemarks.slice(0, 3).map((r, idx) => {
                          const cfg = getStageConfig(r.leadStatus);
                          return <span key={idx} className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />;
                        })}
                        {dayRemarks.length > 3 && <span className="text-[8px] text-gray-400 font-bold leading-none ml-0.5">+{dayRemarks.length - 3}</span>}
                      </div>
                      {/* Desktop: event pills */}
                      <div className="hidden sm:block mt-1 space-y-1 overflow-hidden max-h-[60px]">
                        {dayRemarks.slice(0, 2).map((remark, idx) => {
                          const cfg = getStageConfig(remark.leadStatus);
                          return (
                            <div key={idx} className={`px-1.5 py-1 text-[10px] rounded-md ${cfg.calBg} ${cfg.calText} border border-current/10 truncate font-medium flex items-center gap-1`}>
                              <span className={`w-1 h-1 rounded-full ${cfg.dot} shrink-0`} />
                              {remark.leadName}
                            </div>
                          );
                        })}
                        {dayRemarks.length > 2 && (
                          <div className="text-[10px] font-medium text-gray-400 pl-1">+{dayRemarks.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Selected Day Panel ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600">
              {format(selectedDay, 'EEEE')}
            </p>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-800 mt-0.5">
              {format(selectedDay, 'd MMMM')}
            </h3>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
            selectedDayRemarks.length > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {selectedDayRemarks.length} follow-up{selectedDayRemarks.length !== 1 && 's'}
          </span>
        </div>

        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {selectedDayRemarks.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-gray-400">
              <CalendarIcon size={32} className="mb-2 text-gray-300" strokeWidth={1.5} />
              <p className="text-sm">No follow-ups on this day</p>
              <p className="text-xs text-gray-300 mt-1">Tap any date on the calendar</p>
            </div>
          ) : (
            selectedDayRemarks.map((remark, i) => {
              const cfg = getStageConfig(remark.leadStatus);
              const isEditingThis = editingFollowUp === remark.leadId;
              return (
                <div key={i} className={`rounded-2xl p-4 border ${cfg.calBg} border-current/10`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeStyle}`}>{cfg.title}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">{remark.leadName || 'Unknown Lead'}</h4>
                      {isGlobalView && remark.leadAssignedUserName && (
                        <p className="text-[11px] text-primary-600 font-medium mt-0.5">
                          Assigned to: {remark.leadAssignedUserName}
                        </p>
                      )}

                      {/* FIX #2: Inline follow-up date editor */}
                      {isEditingThis ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="flex-1 border border-primary-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                            />
                            <button
                              onClick={() => saveFollowUp(remark.leadId)}
                              disabled={savingFollowUp || !editDate}
                              className="w-8 h-8 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 disabled:opacity-50"
                            >
                              {savingFollowUp ? <LoadingSpinner size="sm" color="white" /> : <Check size={13} />}
                            </button>
                            <button
                              onClick={cancelEditFollowUp}
                              className="w-8 h-8 bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-300"
                            >
                              <X size={13} />
                            </button>
                          </div>
                          {/* Comment field */}
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="Add a comment (optional) — e.g. Client asked to reschedule…"
                            rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white placeholder-gray-400"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditFollowUp(remark)}
                          className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-primary-600 hover:text-primary-800 bg-white/70 hover:bg-white px-2.5 py-1.5 rounded-lg transition-colors border border-primary-200/50"
                        >
                          <Edit2 size={11} />
                          Move Follow-up Date
                        </button>
                      )}
                    </div>

                    {remark.leadPhone && (
                      <div className="flex gap-1.5 shrink-0">
                        <a href={`tel:${remark.leadPhone}`} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl">
                          <Phone size={14} />
                        </a>
                        <a href={`https://wa.me/${remark.leadPhone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                          className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
                          <MessageSquare size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCalendar;
