const parseTime = (timeStr) => {
  const m = (timeStr || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ampm = (m[3] || '').toUpperCase();
  if (ampm === 'AM' && hh === 12) hh = 0;
  if (ampm === 'PM' && hh !== 12) hh += 12;
  return hh * 60 + mm;
};

export const getPhaseProgress = (phase, nextPhase) => {
  if (!phase?.time) return 0;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const phaseStart = parseTime(phase.time);
  const phaseEnd = nextPhase ? parseTime(nextPhase.time) - 1 : phaseStart + 59;
  
  if (currentMinutes < phaseStart) return 0;
  if (currentMinutes > phaseEnd) return 100;
  
  const progress = ((currentMinutes - phaseStart) / (phaseEnd - phaseStart)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
};