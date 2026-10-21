import socket
import ipaddress
import urllib.parse
from typing import Tuple, Optional, Dict, Any, Union
import requests

# Disallowed CGNAT range (RFC 6598)
CGNAT_NETWORK = ipaddress.ip_network("100.64.0.0/10")

def is_disallowed_ip(ip: Union[ipaddress.IPv4Address, ipaddress.IPv6Address]) -> Tuple[bool, Optional[str]]:
    """
    Checks if an IP address belongs to any private, loopback, link-local,
    multicast, reserved, unspecified, or CGNAT network.
    Unwraps IPv4-mapped IPv6 addresses first.
    """
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
        ip = ip.ipv4_mapped

    if ip.is_private or ip.is_loopback:
        return True, f"private/loopback address disallowed: {ip}"
    if ip.is_link_local:
        return True, f"Link-local address disallowed: {ip}"
    if ip.is_multicast:
        return True, f"Multicast address disallowed: {ip}"
    if ip.is_reserved:
        return True, f"Reserved address disallowed: {ip}"
    if ip.is_unspecified:
        return True, f"Unspecified address disallowed: {ip}"
    if isinstance(ip, ipaddress.IPv4Address) and ip in CGNAT_NETWORK:
        return True, f"Shared CGNAT address disallowed: {ip}"

    return False, None

def parse_literal_ip(host: str) -> Optional[Union[ipaddress.IPv4Address, ipaddress.IPv6Address]]:
    """
    Attempts to parse hostname as standard IPv4, IPv6, decimal integer,
    hexadecimal, or octal IP notation.
    """
    clean_host = host.strip("[]")
    # Standard dotted-decimal IPv4 or bracketed IPv6
    try:
        return ipaddress.ip_address(clean_host)
    except ValueError:
        pass

    # Decimal, hex (0x...), or octal (0...) integer representation
    try:
        val = int(clean_host, 0)
        if 0 <= val <= 0xFFFFFFFF:
            return ipaddress.IPv4Address(val)
    except ValueError:
        pass

    # Standard C library socket.inet_aton for unusual formats
    try:
        raw = socket.inet_aton(clean_host)
        return ipaddress.IPv4Address(raw)
    except (OSError, socket.error):
        pass

    return None

def is_safe_url(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validates that a URL is safe to retrieve, preventing SSRF attacks
    and ensuring only HTTP/HTTPS public internet addresses are accessed.
    Handles decimal-IP, hex-IP, IPv4-mapped IPv6, CGNAT, metadata, and loopback.
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

    # Prevent access to localhost or common internal service names
    lowered_host = hostname.lower().strip("[]")
    if lowered_host in ("localhost", "metadata.google.internal", "instance-data"):
        return False, f"Access to internal host '{hostname}' is prohibited."

    # 1. Check if hostname is directly an IP (literal, decimal, hex, IPv4-mapped)
    literal_ip = parse_literal_ip(hostname)
    if literal_ip is not None:
        disallowed, reason = is_disallowed_ip(literal_ip)
        if disallowed:
            return False, reason
        return True, None

    # 2. Hostname is a domain name: resolve DNS and verify all addresses
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        if not addr_info:
            return False, f"No DNS records resolved for hostname: {hostname}"

        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            disallowed, reason = is_disallowed_ip(ip_obj)
            if disallowed:
                return False, f"Hostname '{hostname}' resolves to disallowed address ({ip_str}): {reason}"
    except socket.gaierror:
        return False, f"Could not resolve hostname: {hostname}"
    except Exception as ex:
        return False, f"Address resolution validation error: {ex}"

    return True, None

def safe_download_bytes(
    url: str,
    max_hops: int = 3,
    timeout: float = 15.0,
    max_bytes: int = 40 * 1024 * 1024,
    headers: Optional[Dict[str, str]] = None
) -> Tuple[bytes, str]:
    """
    Performs an SSRF-hardened HTTP GET request:
    - Validates safety of initial URL and every single redirect hop.
    - Manually follows redirects with allow_redirects=False (up to max_hops).
    - Defends against DNS rebinding by re-validating before each request.
    - Streams and enforces byte limit (default 40MB).
    Returns (raw_bytes, final_url).
    """
    current_url = url
    session = requests.Session()
    req_headers = headers or {"User-Agent": "ApexOps-Platform/1.2"}

    for hop in range(max_hops + 1):
        # 1. Validate safety of current URL
        safe, reason = is_safe_url(current_url)
        if not safe:
            raise ValueError(f"SSRF safety validation failed at hop {hop} for {current_url}: {reason}")

        # 2. Make request with allow_redirects=False
        try:
            resp = session.get(
                current_url,
                headers=req_headers,
                timeout=timeout,
                stream=True,
                allow_redirects=False
            )
        except requests.RequestException as e:
            raise IOError(f"Network error requesting {current_url}: {e}")

        # 3. Check for redirects (301, 302, 303, 307, 308)
        if resp.status_code in (301, 302, 303, 307, 308):
            location = resp.headers.get("Location")
            if not location:
                raise ValueError(f"Redirect response {resp.status_code} missing Location header.")
            next_url = urllib.parse.urljoin(current_url, location)
            if hop >= max_hops:
                raise ValueError(f"Exceeded maximum allowed redirect hops ({max_hops}).")
            current_url = next_url
            continue

        if resp.status_code >= 400:
            raise IOError(f"HTTP error {resp.status_code} requesting {current_url}")

        # 4. Stream response and check byte limit
        content_length = resp.headers.get("Content-Length")
        if content_length and int(content_length) > max_bytes:
            raise ValueError(f"Content length exceeds limit: {content_length} > {max_bytes} bytes")

        chunks = []
        total_read = 0
        for chunk in resp.iter_content(chunk_size=65536):
            if chunk:
                total_read += len(chunk)
                if total_read > max_bytes:
                    raise ValueError(f"Downloaded bytes exceeded maximum limit ({max_bytes} bytes).")
                chunks.append(chunk)

        return b"".join(chunks), current_url

    raise ValueError(f"Exceeded maximum redirect hops: {max_hops}")
