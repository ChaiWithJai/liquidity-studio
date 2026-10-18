// A read-only planning aid, never a grant of rights or a booking.
export function resourceDisposition(resource, asOf) {
  const confirmation=resource.confirmation, now = Date.parse(asOf), availability = confirmation ? {status:confirmation.availability,start:confirmation.start,end:confirmation.end,timeZone:confirmation.timeZone} : resource.availability || {}, rights = confirmation ? {status:confirmation.permission,evidenceIds:confirmation.evidenceIds} : resource.rights || {};
  const start = Date.parse(availability.start), end = Date.parse(availability.end);
  const reasons = [], denied = [];
  if (!confirmation?.actorId || !Number.isFinite(Date.parse(confirmation?.recordedAt))) reasons.push('Record a manager confirmation for this proposed use.');
  if (availability.status === 'unavailable') denied.push('Reported unavailable.');
  if (rights.status === 'denied' || rights.status === 'unavailable') denied.push('Permission for use is denied.');
  if (Number.isFinite(end) && Number.isFinite(now) && end <= now) denied.push('The recorded availability window has ended.');
  if (!resource.capabilities?.length) reasons.push('Confirm the required capability or role.');
  if (confirmation && !confirmation.purpose) reasons.push('Confirm the intended use.');
  if (!resource.location) reasons.push('Confirm the location.');
  if (!Number.isFinite(now)) reasons.push('The assessment date is unavailable.');
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) reasons.push('Confirm a valid availability window.');
  else if (Number.isFinite(now) && start > now) reasons.push('The recorded availability window has not started.');
  if (!availability.timeZone) reasons.push('Confirm the availability time zone.');
  if (availability.status !== 'confirmed') reasons.push('Availability is not confirmed for the proposed plan.');
  if (rights.status !== 'confirmed') reasons.push('Permission for the intended use is not confirmed.');
  if (!rights.evidenceIds?.length) reasons.push('Add supporting permission evidence.');
  if (resource.verification === 'example') reasons.push('This is a sample resource, not usable supply.');
  return {status: denied.length ? 'unavailable' : reasons.length ? 'needs-information' : 'eligible',
    label: denied.length ? 'Unavailable' : reasons.length ? 'Needs information' : 'Eligible',
    reasons: [...denied, ...reasons], asOf};
}
