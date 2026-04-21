export const PIPELINE_STAGES = [
  { id: 'NEW',           title: 'New',          color: 'border-t-blue-400',   headerBg: 'bg-blue-50',   headerText: 'text-blue-700',   dot: 'bg-blue-400', badgeStyle: 'bg-blue-100 text-blue-700', calBg: 'bg-blue-100', calText: 'text-blue-800' },
  { id: 'CONTACTED',     title: 'Contacted',    color: 'border-t-yellow-400', headerBg: 'bg-yellow-50', headerText: 'text-yellow-700', dot: 'bg-yellow-400', badgeStyle: 'bg-yellow-100 text-yellow-700', calBg: 'bg-yellow-100', calText: 'text-yellow-800' },
  { id: 'INTERESTED',    title: 'Interested',   color: 'border-t-purple-400', headerBg: 'bg-purple-50', headerText: 'text-purple-700', dot: 'bg-purple-400', badgeStyle: 'bg-purple-100 text-purple-700', calBg: 'bg-purple-100', calText: 'text-purple-800' },
  { id: 'NOT_INTERESTED',title: 'Not Interested',color: 'border-t-gray-400',  headerBg: 'bg-gray-50',   headerText: 'text-gray-700',   dot: 'bg-gray-400', badgeStyle: 'bg-gray-100 text-gray-500', calBg: 'bg-gray-100', calText: 'text-gray-600' },
  { id: 'VISIT_PLANNED', title: 'Visit Planned',color: 'border-t-indigo-400', headerBg: 'bg-indigo-50', headerText: 'text-indigo-700', dot: 'bg-indigo-400', badgeStyle: 'bg-indigo-100 text-indigo-700', calBg: 'bg-indigo-100', calText: 'text-indigo-800' },
  { id: 'VISIT_DONE',    title: 'Visit Done',   color: 'border-t-teal-400',   headerBg: 'bg-teal-50',   headerText: 'text-teal-700',   dot: 'bg-teal-400', badgeStyle: 'bg-teal-100 text-teal-700', calBg: 'bg-teal-100', calText: 'text-teal-800' },
  { id: 'NEGOTIATION',   title: 'Negotiation',  color: 'border-t-orange-400', headerBg: 'bg-orange-50', headerText: 'text-orange-700', dot: 'bg-orange-400', badgeStyle: 'bg-orange-100 text-orange-700', calBg: 'bg-orange-100', calText: 'text-orange-800' },
  { id: 'WON',           title: 'Won ✓',        color: 'border-t-green-400',  headerBg: 'bg-green-50',  headerText: 'text-green-700',  dot: 'bg-green-400', badgeStyle: 'bg-green-100 text-green-700', calBg: 'bg-green-100', calText: 'text-green-800' },
  { id: 'LOST',          title: 'Lost',         color: 'border-t-red-300',    headerBg: 'bg-red-50',    headerText: 'text-red-600',    dot: 'bg-red-300', badgeStyle: 'bg-red-100 text-red-700', calBg: 'bg-red-100', calText: 'text-red-800' },
];

export const getStageConfig = (statusId) => PIPELINE_STAGES.find(s => s.id === statusId) || PIPELINE_STAGES[0];
