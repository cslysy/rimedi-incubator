import { useOnlineStatus } from "../hooks/useOnlineStatus";

export function OfflineStatus() {
  const isOnline = useOnlineStatus();

  return (
    <span className={isOnline ? "statusPill online" : "statusPill offline"} aria-live="polite">
      {isOnline ? "Tryb lokalny" : "Offline"}
    </span>
  );
}
