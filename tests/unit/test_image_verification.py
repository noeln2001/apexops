import io

import pytest
from PIL import Image, ImageDraw

from data_engine.media.image_verifier import ImageQualityVerifier
from data_engine.media.url_safety import is_safe_url


def create_synthetic_image(width: int, height: int, sharp: bool = True) -> bytes:
    """Helper to create synthetic image bytes with known dimensions and sharpness characteristics."""
    # Create high-contrast pattern
    img = Image.new("RGB", (width, height), color=(20, 20, 20))
    draw = ImageDraw.Draw(img)

    if sharp:
        # Draw high-frequency sharp diagonal lines and shapes (non-multiple of 8 to avoid false grid alignment)
        for x in range(0, width, 37):
            draw.line([(x, 0), (width - x, height)], fill=(240, 240, 240), width=3)
        draw.ellipse([width // 6, height // 6, 5 * width // 6, 5 * height // 6], outline=(255, 20, 30), width=6)
    else:
        # Smooth flat image with no high frequency edges
        pass

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

def test_uhd_genuine_resolution_pass():
    """Verify that a genuine 3840x2160 sharp image passes UHD verification with EXCELLENT classification."""
    img_bytes = create_synthetic_image(3840, 2160, sharp=True)
    res = ImageQualityVerifier.verify_image_bytes(img_bytes, "uhd_test.jpg")

    assert res["is_valid"] is True
    assert res["width"] == 3840
    assert res["height"] == 2160
    assert res["is_uhd"] is True
    assert res["orientation"] == "LANDSCAPE"
    assert res["classification"] in ("EXCELLENT", "GOOD")
    assert res["metrics"]["sharpness_laplacian"] > 50.0

def test_sub_resolution_rejected():
    """Verify that an image below 1080p FHD is rejected for insufficient resolution."""
    img_bytes = create_synthetic_image(800, 600, sharp=True)
    res = ImageQualityVerifier.verify_image_bytes(img_bytes, "sub_res.jpg")

    assert res["is_valid"] is False
    assert res["classification"] == "REJECTED"
    assert any("Insufficient resolution" in r for r in res["reasons"])

def test_empty_or_corrupt_rejected():
    """Verify that corrupted or truncated bytes are rejected gracefully."""
    res = ImageQualityVerifier.verify_image_bytes(b"corrupt non-image header data", "bad.jpg")
    assert res["is_valid"] is False
    assert res["classification"] == "REJECTED"

def test_ssrf_safety_protection(monkeypatch):
    """Verify that SSRF URLs to private networks or localhost are blocked deterministically offline."""
    import socket
    orig_getaddrinfo = socket.getaddrinfo
    def mock_getaddrinfo(host, port, *args, **kwargs):
        if host == "commons.wikimedia.org":
            return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("208.80.154.224", 443))]
        return orig_getaddrinfo(host, port, *args, **kwargs)
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    is_safe, reason = is_safe_url("http://127.0.0.1:8000/internal")
    assert is_safe is False
    assert "localhost" in reason or "private" in reason or "internal" in reason

    is_safe, reason = is_safe_url("http://169.254.169.254/latest/meta-data/")
    assert is_safe is False

    is_safe, reason = is_safe_url("ftp://example.com/test.jpg")
    assert is_safe is False
    assert "Unsupported scheme" in reason

    is_safe, reason = is_safe_url("https://commons.wikimedia.org/wiki/File:Test.jpg")
    assert is_safe is True


def test_ssrf_hardened_edge_cases():
    """Verify that decimal, hex, IPv4-mapped, CGNAT, and metadata IPs are all blocked."""
    # 1. Decimal IP (2130706433 == 127.0.0.1)
    safe, reason = is_safe_url("http://2130706433/test.jpg")
    assert safe is False, f"Decimal IP was not blocked: {reason}"

    # 2. Hex IP (0x7f000001 == 127.0.0.1)
    safe, reason = is_safe_url("http://0x7f000001/test.jpg")
    assert safe is False, f"Hex IP was not blocked: {reason}"

    # 3. IPv4-mapped IPv6 ([::ffff:127.0.0.1])
    safe, reason = is_safe_url("http://[::ffff:127.0.0.1]/test.jpg")
    assert safe is False, f"IPv4-mapped IPv6 was not blocked: {reason}"

    # 4. CGNAT IP (100.64.0.1 in 100.64.0.0/10)
    safe, reason = is_safe_url("http://100.64.0.1/test.jpg")
    assert safe is False, f"CGNAT IP was not blocked: {reason}"

    # 5. Metadata IP (169.254.169.254)
    safe, reason = is_safe_url("http://169.254.169.254/latest/meta-data/")
    assert safe is False, f"Metadata IP was not blocked: {reason}"

def test_ssrf_redirect_to_localhost_blocked(monkeypatch):
    """Verify that redirects leading to localhost or private IPs are blocked on redirect hop."""
    import requests

    from data_engine.media.url_safety import safe_download_bytes

    class MockResponse:
        def __init__(self, status_code, headers):
            self.status_code = status_code
            self.headers = headers
        def iter_content(self, chunk_size=65536):
            return [b"data"]

    # Initial URL is safe, but returns 302 redirecting to http://127.0.0.1/secret.jpg
    def mock_get(self, url, **kwargs):
        if url == "https://public.example.com/initial.jpg":
            return MockResponse(302, {"Location": "http://127.0.0.1/secret.jpg"})
        return MockResponse(200, {})

    # Mock is_safe_url so public.example.com is allowed at hop 0
    from data_engine.media import url_safety
    orig_is_safe = url_safety.is_safe_url

    def mock_is_safe_url(url):
        if "public.example.com" in url:
            return True, None
        return orig_is_safe(url)

    monkeypatch.setattr(requests.Session, "get", mock_get)
    monkeypatch.setattr(url_safety, "is_safe_url", mock_is_safe_url)

    with pytest.raises(ValueError) as excinfo:
        safe_download_bytes("https://public.example.com/initial.jpg")
    assert "SSRF safety validation failed at hop 1" in str(excinfo.value)

