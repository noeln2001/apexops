import os
import re
import io
import json
import time
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from data_engine.media.url_safety import is_safe_url, safe_download_bytes
from data_engine.media.image_verifier import ImageQualityVerifier

USER_AGENT = "ApexOpsF1Analytics/1.0 (https://apexops.internal; educational open-data motorsport research)"

# Official source compliance disclosures
SOURCE_COMPLIANCE_CATALOG = [
    {
        "name": "Wikimedia Commons",
        "homepage": "https://commons.wikimedia.org/",
        "access_type": "PUBLIC_API_AND_ORIGINALS",
        "license_compliance": "Creative Commons / Public Domain with full attribution",
        "status": "AVAILABLE",
        "details": "Full original UHD/5K photographic master files accessible with documented reuse permissions."
    },
    {
        "name": "Red Bull Content Pool",
        "homepage": "https://www.redbullcontentpool.com/",
        "access_type": "AUTHENTICATED_EDITORIAL",
        "license_compliance": "Editorial use only with accredited account",
        "status": "LOGIN_RESTRICTED",
        "details": "Public access restricted to web previews; original UHD master files require authenticated press credentials. Respecting terms without bypassing login."
    },
    {
        "name": "Formula 1 Official (formula1.com)",
        "homepage": "https://www.formula1.com/",
        "access_type": "WEB_EDITORIAL",
        "license_compliance": "All rights reserved (FOM)",
        "status": "RESTRICTED_WEB_PREVIEW_ONLY",
        "details": "Public site serves web-optimized editorial banners and thumbnails; UHD raw photography is not offered as unrestricted public downloads."
    },
    {
        "name": "McLaren Racing Downloads",
        "homepage": "https://www.mclaren.com/racing/downloads/",
        "access_type": "PUBLIC_DESKTOP_WALLPAPERS",
        "license_compliance": "Personal non-commercial desktop wallpaper license",
        "status": "AVAILABLE_SELECTIVE",
        "details": "Offers official seasonal desktop wallpapers in HD/UHD formats for personal fan use."
    },
    {
        "name": "Scuderia Ferrari Press Hub",
        "homepage": "https://www.ferrari.com/en-EN/formula1",
        "access_type": "WEB_EDITORIAL",
        "license_compliance": "Editorial press rights",
        "status": "RESTRICTED_WEB_PREVIEW_ONLY",
        "details": "Public galleries feature responsive web assets; full TIFF/UHD downloads require Ferrari Media Center credentials."
    }
]

class ImageDiscoveryService:
    """
    Service for discovering publicly accessible Formula 1 photography,
    retrieving candidate originals, and executing UHD computer vision verification.
    """

    def __init__(self, cache_dir: Optional[str] = None):
        self.cache_dir = cache_dir or os.path.join(os.path.dirname(__file__), "cache")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.verified_candidates: Dict[str, Dict[str, Any]] = {}

    def get_source_compliance_status(self) -> List[Dict[str, Any]]:
        """Returns the honest, documented compliance and access status of target sources."""
        return SOURCE_COMPLIANCE_CATALOG

    def search_wikimedia_commons(
        self,
        driver_name: str = "Max Verstappen",
        team_name: Optional[str] = "Red Bull Racing",
        season: Optional[int] = 2026,
        grand_prix: Optional[str] = None,
        limit: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Queries Wikimedia Commons API for original full-resolution files matching
        driver, team, season, and Grand Prix keywords.
        """
        # Formulate query
        query_terms = [driver_name]
        if team_name:
            query_terms.append(team_name)
        if grand_prix:
            query_terms.append(grand_prix)
        elif season:
            query_terms.append(str(season))

        query_str = " ".join(query_terms)

        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": query_str,
            "gsrnamespace": "6",  # File namespace
            "gsrlimit": str(limit),
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata|mime",
            "format": "json"
        }
        api_url = f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(params)}"

        safe, reason = is_safe_url(api_url)
        if not safe:
            return []

        try:
            req = urllib.request.Request(api_url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            # Fallback or empty on network error
            print(f"[ImageDiscoveryService] Commons search failed: {e}")
            return []

        pages = data.get("query", {}).get("pages", {})
        discovered = []

        for page_id, page_data in pages.items():
            title = page_data.get("title", "")
            imageinfo_list = page_data.get("imageinfo", [])
            if not imageinfo_list:
                continue

            ii = imageinfo_list[0]
            file_url = ii.get("url")
            reported_width = ii.get("width", 0)
            reported_height = ii.get("height", 0)
            mime = ii.get("mime", "")

            # Exclude non-images (e.g. webm video files or svg)
            if not mime.startswith("image/"):
                continue

            # Extract license and attribution
            extmetadata = ii.get("extmetadata", {})
            license_short = extmetadata.get("LicenseShortName", {}).get("value", "Documented Wikimedia License")
            artist = extmetadata.get("Artist", {}).get("value", "Wikimedia Contributor")
            # Clean HTML from artist string
            artist = re.sub(r"<[^>]+>", "", artist).strip()
            description = extmetadata.get("ImageDescription", {}).get("value", title)
            description = re.sub(r"<[^>]+>", "", description).strip()
            date_time = extmetadata.get("DateTimeOriginal", {}).get("value", "")

            clean_title = title.replace("File:", "").replace(".jpg", "").replace(".png", "")

            discovered.append({
                "title": clean_title,
                "driver": driver_name,
                "team": team_name or "Formula 1",
                "season": season or 2026,
                "grand_prix": grand_prix,
                "source_site": "Wikimedia Commons",
                "source_page": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title)}",
                "original_url": file_url,
                "thumbnail_url": file_url,
                "reported_dimensions": f"{reported_width}x{reported_height}",
                "license": license_short,
                "author": artist,
                "description": description[:120],
                "date": date_time
            })

        return discovered

    def verify_remote_image(self, candidate_info: Dict[str, Any], config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Retrieves the actual image bytes from the permitted remote URL,
        validating URL safety, enforcing size boundaries, and performing
        backend OpenCV/Pillow image quality and UHD verification.
        """
        url = candidate_info.get("original_url")
        if not url:
            return {
                **candidate_info,
                "is_valid": False,
                "classification": "REJECTED",
                "rejection_reason": "No original URL provided."
            }

        # 1 & 2. SSRF check, redirect hop re-validation, and streaming download
        MAX_BYTES = 40 * 1024 * 1024  # 40MB
        try:
            raw_bytes, final_url = safe_download_bytes(
                url,
                max_hops=3,
                timeout=20.0,
                max_bytes=MAX_BYTES,
                headers={"User-Agent": USER_AGENT}
            )
            candidate_info["verified_url"] = final_url
        except ValueError as ve:
            return {
                **candidate_info,
                "is_valid": False,
                "classification": "REJECTED",
                "rejection_reason": f"URL Safety violation: {ve}"
            }
        except Exception as e:
            return {
                **candidate_info,
                "is_valid": False,
                "classification": "REJECTED",
                "rejection_reason": f"Download failed: {e}"
            }

        except Exception as ex:
            return {
                **candidate_info,
                "is_valid": False,
                "classification": "REJECTED",
                "rejection_reason": f"Download connection failed: {ex}"
            }

        # 3. Computer Vision Verification
        verification = ImageQualityVerifier.verify_image_bytes(
            raw_bytes, 
            filename=candidate_info.get("title", "f1_image"),
            config=config
        )

        merged_candidate = {
            **candidate_info,
            "id": verification.get("sha256")[:16],
            "sha256": verification.get("sha256"),
            "width": verification.get("width"),
            "height": verification.get("height"),
            "aspect_ratio": verification.get("aspect_ratio"),
            "orientation": verification.get("orientation"),
            "resolution_label": verification.get("resolution_label"),
            "is_uhd": verification.get("is_uhd"),
            "file_size_bytes": verification.get("file_size_bytes"),
            "file_size_mb": verification.get("file_size_mb"),
            "format": verification.get("format"),
            "classification": verification.get("classification"),
            "is_valid": verification.get("is_valid"),
            "metrics": verification.get("metrics"),
            "reasons": verification.get("reasons", []),
            "verified_at": datetime.now(timezone.utc).isoformat()
        }

        self.verified_candidates[merged_candidate["id"]] = merged_candidate
        return merged_candidate

    def discover_and_verify(
        self,
        driver_name: str = "Max Verstappen",
        team_name: Optional[str] = "Red Bull Racing",
        season: Optional[int] = 2026,
        grand_prix: Optional[str] = None,
        limit: int = 10,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes discovery across permitted sources, downloads original bytes,
        verifies quality with computer vision, and compiles results.
        """
        start_time = time.time()
        discovered_candidates = self.search_wikimedia_commons(
            driver_name=driver_name,
            team_name=team_name,
            season=season,
            grand_prix=grand_prix,
            limit=limit
        )

        verified_results = []
        counts = {"EXCELLENT": 0, "GOOD": 0, "REVIEW": 0, "REJECTED": 0}

        for c in discovered_candidates:
            res = self.verify_remote_image(c, config=config)
            verified_results.append(res)
            cls_name = res.get("classification", "REJECTED")
            counts[cls_name] = counts.get(cls_name, 0) + 1

        duration_sec = round(time.time() - start_time, 2)

        return {
            "query": {
                "driver": driver_name,
                "team": team_name,
                "season": season,
                "grand_prix": grand_prix
            },
            "total_discovered": len(discovered_candidates),
            "counts": counts,
            "duration_sec": duration_sec,
            "sources_checked": self.get_source_compliance_status(),
            "images": verified_results
        }
