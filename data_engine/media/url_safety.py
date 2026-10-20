import socket
import ipaddress
import urllib.parse
from typing import Tuple, Optional

# Disallowed private and special network ranges to prevent SSRF
DISALLOWED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10")
]

def is_safe_url(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validates that a URL is safe to retrieve, preventing SSRF attacks
    and ensuring only HTTP/HTTPS public internet addresses are accessed.
    """
    if not url:
        return False, "URL cannot be empty."

    try:
        parsed = urllib.parse.urlparse(url)
    except Exception as e:
        return False, f"Invalid URL structure: {e}"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported scheme: {parsed.scheme}. Only HTTP and HTTPS are permitted."

    hostname = parsed.hostname
    if not hostname:
        return False, "URL is missing a valid hostname."

    # Prevent access to localhost or common internal names
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "metadata.google.internal"):
        return False, "Access to localhost or internal metadata services is prohibited."

    # Resolve IP address and verify it is not in private or reserved subnets
    try:
        # Get all resolved IP addresses
        addr_info = socket.getaddrinfo(hostname, None)
        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            for net in DISALLOWED_NETWORKS:
                if ip_obj in net:
                    return False, f"Hostname resolves to private/internal IP address ({ip_str}), access denied."
    except socket.gaierror:
        return False, f"Could not resolve hostname: {hostname}"
    except Exception as ex:
        return False, f"Address resolution validation error: {ex}"

    return True, None
