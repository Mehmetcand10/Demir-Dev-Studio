export const DISPUTE_STATUS = {
  OPEN: 'open',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const;

export type DisputeStatus = (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

export function getDisputeStatusLabel(status: string): string {
  switch (status) {
    case DISPUTE_STATUS.OPEN:
      return 'Açık';
    case DISPUTE_STATUS.REVIEWING:
      return 'İncelemede';
    case DISPUTE_STATUS.RESOLVED:
      return 'Çözüldü';
    case DISPUTE_STATUS.REJECTED:
      return 'Reddedildi';
    default:
      return status;
  }
}

export function isDisputeOpen(status: string): boolean {
  return status === DISPUTE_STATUS.OPEN || status === DISPUTE_STATUS.REVIEWING;
}
