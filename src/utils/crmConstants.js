export const PIPELINE_STAGES = [
  { id: 'NEW',          title: 'New',          color: 'border-t-blue-400',   headerBg: 'bg-blue-50',   headerText: 'text-blue-700',   dot: 'bg-blue-400',   badgeStyle: 'bg-blue-100 text-blue-700',   calBg: 'bg-blue-100',   calText: 'text-blue-800' },
  { id: 'CONTACTED',    title: 'Contacted',    color: 'border-t-yellow-400', headerBg: 'bg-yellow-50', headerText: 'text-yellow-700', dot: 'bg-yellow-400', badgeStyle: 'bg-yellow-100 text-yellow-700', calBg: 'bg-yellow-100', calText: 'text-yellow-800' },
  { id: 'VISIT_PLANNED',title: 'Visit Planned',color: 'border-t-indigo-400', headerBg: 'bg-indigo-50', headerText: 'text-indigo-700', dot: 'bg-indigo-400', badgeStyle: 'bg-indigo-100 text-indigo-700', calBg: 'bg-indigo-100', calText: 'text-indigo-800' },
  { id: 'VISIT_DONE',   title: 'Visit Done',   color: 'border-t-teal-400',   headerBg: 'bg-teal-50',   headerText: 'text-teal-700',   dot: 'bg-teal-400',   badgeStyle: 'bg-teal-100 text-teal-700',   calBg: 'bg-teal-100',   calText: 'text-teal-800' },
];

export const getStageConfig = (statusId) => PIPELINE_STAGES.find(s => s.id === statusId) || PIPELINE_STAGES[0];
