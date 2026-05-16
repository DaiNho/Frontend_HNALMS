/**
 * dataSync.ts
 * Utility để đồng bộ dữ liệu real-time giữa các tab và màn hình.
 * Dùng BroadcastChannel API để notify các tab khác reload dữ liệu ngay lập tức.
 */

export type DataSyncEvent =
  | 'FLOORS_UPDATED'
  | 'ROOM_TYPES_UPDATED'
  | 'ROOMS_UPDATED'
  | 'CONTRACTS_UPDATED'
  | 'DEPOSITS_UPDATED'
  | 'REQUESTS_UPDATED'
  | 'INVOICES_UPDATED'
  | 'NOTIFICATIONS_UPDATED'
  | 'VIOLATIONS_UPDATED'
  | 'SERVICES_UPDATED'
  | 'ACCOUNTS_UPDATED'
  | 'CASHFLOW_UPDATED'
  | 'RULES_UPDATED'
  | 'ALL_UPDATED';

const CHANNEL_NAME = 'hnalms_data_sync';

/** Phát broadcast event để các tab khác biết cần reload */
export function broadcastDataChange(eventType: DataSyncEvent) {
  try {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: eventType, timestamp: Date.now() });
    channel.close();
  } catch (e) {
    // BroadcastChannel không được hỗ trợ trong một số môi trường
    console.warn('[dataSync] BroadcastChannel not supported:', e);
  }
}

/**
 * Hook để lắng nghe broadcast events và tự động re-fetch.
 * Sử dụng trong useEffect của component.
 *
 * @param onRefresh - callback sẽ được gọi khi nhận được event cần refresh
 * @param listenFor - danh sách event cần lắng nghe (để trống = lắng nghe tất cả)
 * @returns cleanup function
 */
export function listenForDataChanges(
  onRefresh: () => void,
  listenFor: DataSyncEvent[] = []
): () => void {
  try {
    if (typeof BroadcastChannel === 'undefined') return () => {};

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
      const { type } = event.data || {};
      if (!type) return;

      // Nếu listenFor rỗng → lắng nghe tất cả
      // Nếu có danh sách → chỉ react với events trong danh sách
      if (listenFor.length === 0 || listenFor.includes(type) || type === 'ALL_UPDATED') {
        onRefresh();
      }
    };

    return () => {
      channel.close();
    };
  } catch (e) {
    console.warn('[dataSync] BroadcastChannel not supported:', e);
    return () => {};
  }
}
