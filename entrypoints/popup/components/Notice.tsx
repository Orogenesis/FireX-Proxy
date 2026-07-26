import { AlertCircle } from 'lucide-react';

export function Notice({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="noticeRegion">
      <div className="notice" role="alert">
        <AlertCircle className="noticeIcon" size={18} />
        <div className="noticeBody">
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
