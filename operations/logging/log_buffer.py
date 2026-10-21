import re
import logging
import time
from collections import deque
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from threading import RLock

# Regex patterns to redact sensitive credentials, tokens, and authorization headers
SENSITIVE_PATTERNS = [
    (re.compile(r'(authorization:\s*bearer\s+)[^\s,]+', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(token["\']?\s*[:=]\s*["\']?)[^"\'\s,]+', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(password["\']?\s*[:=]\s*["\']?)[^"\'\s,]+', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(api[_-]?key["\']?\s*[:=]\s*["\']?)[^"\'\s,]+', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(secret["\']?\s*[:=]\s*["\']?)[^"\'\s,]+', re.IGNORECASE), r'\1[REDACTED]')
]

def redact_sensitive_data(message: str) -> str:
    redacted = message
    for pattern, replacement in SENSITIVE_PATTERNS:
        redacted = pattern.sub(replacement, redacted)
    return redacted

class InMemoryLogHandler(logging.Handler):
    """
    Thread-safe circular log buffer for real-time operational log inspection and querying.
    Captures log messages, redacts secrets, and enables search by severity, text, or correlation ID.
    """
    def __init__(self, capacity: int = 1000):
        super().__init__()
        self.capacity = capacity
        self.buffer: deque = deque(maxlen=capacity)
        self._buffer_lock = RLock()

    def emit(self, record: logging.LogRecord):
        try:
            msg = self.format(record)
            safe_msg = redact_sensitive_data(msg)
            
            # Extract correlation ID if present in the message or record
            correlation_id = getattr(record, "correlation_id", None)
            if not correlation_id:
                cid_match = re.search(r'CID:\s*([a-f0-9\-]+)', safe_msg)
                if cid_match:
                    correlation_id = cid_match.group(1)

            entry = {
                "id": f"{int(time.time() * 1000)}-{record.relativeCreated:.0f}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "message": safe_msg,
                "correlation_id": correlation_id or "N/A"
            }
            with self._buffer_lock:
                self.buffer.append(entry)
        except Exception:
            self.handleError(record)

    def search_logs(
        self,
        level: Optional[str] = None,
        query: Optional[str] = None,
        correlation_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        with self._buffer_lock:
            results = []
            normalized_level = level.upper() if level and level.upper() != "ALL" else None
            normalized_query = query.lower() if query else None

            # Iterate newest first
            for entry in reversed(self.buffer):
                if normalized_level and entry["level"] != normalized_level:
                    continue
                if correlation_id and entry["correlation_id"] != correlation_id:
                    continue
                if normalized_query and normalized_query not in entry["message"].lower() and normalized_query not in entry["logger"].lower():
                    continue

                results.append(entry)
                if len(results) >= limit:
                    break

            return results

# Singleton log handler
operational_log_handler = InMemoryLogHandler(capacity=1500)
operational_log_handler.setLevel(logging.INFO)
operational_log_handler.setFormatter(logging.Formatter('%(message)s'))
