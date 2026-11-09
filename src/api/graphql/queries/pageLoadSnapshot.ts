export const PAGE_LOAD_SNAPSHOT_QUERY = `
  query PageLoadSnapshot {
    pageLoadSnapshot {
      participantCount {
        value
        suppressed
      }
    }
  }
`;

/** `value` is null when the count is suppressed below the reporting threshold. */
interface SnapshotCount {
  value: number | null;
  suppressed: boolean;
}

export interface PageLoadSnapshotData {
  pageLoadSnapshot: {
    participantCount: SnapshotCount;
  } | null;
}
