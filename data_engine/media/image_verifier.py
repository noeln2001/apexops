import io
import math
import hashlib
from typing import Dict, Any, Tuple, Optional
import numpy as np
from PIL import Image
import cv2

class ImageQualityVerifier:
    """
    Automated UHD resolution, visual clarity, sharpness, and artifact verification engine.
    Uses computer vision algorithms (Laplacian variance, 2D FFT spectral density, and DCT boundary analysis)
    to verify real resolution and detect stretched/interpolated thumbnails.
    """

    DEFAULT_CONFIG = {
        "uhd_min_width": 3840,
        "uhd_min_height": 2160,
        "portrait_uhd_min_width": 2160,
        "portrait_uhd_min_height": 3840,
        "fhd_min_width": 1920,
        "fhd_min_height": 1080,
        "sharpness_threshold_excellent": 110.0,
        "sharpness_threshold_good": 55.0,
        "sharpness_threshold_review": 20.0,
        "max_blockiness_ratio": 1.95,
        "min_high_freq_spectral": 38.0
    }

    @classmethod
    def verify_image_bytes(
        cls, 
        image_bytes: bytes, 
        filename: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Inspects the raw image bytes on the backend, performing decoding,
        resolution verification, sharpness measurement, and upscaling detection.
        """
        cfg = dict(cls.DEFAULT_CONFIG)
        if config:
            cfg.update(config)

        if not image_bytes or len(image_bytes) < 1000:
            return {
                "is_valid": False,
                "classification": "REJECTED",
                "rejection_reason": "Empty or truncated image file (< 1 KB)."
            }

        # 1. SHA-256 calculation for deduplication
        sha256_hash = hashlib.sha256(image_bytes).hexdigest()
        file_size_bytes = len(image_bytes)
        file_size_mb = round(file_size_bytes / (1024 * 1024), 2)

        # 2. Decode with Pillow to inspect headers and format
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_format = pil_img.format or "JPEG"
            width, height = pil_img.size
            mode = pil_img.mode
            
            # Convert to RGB if needed
            if mode != "RGB":
                pil_img = pil_img.convert("RGB")
        except Exception as e:
            return {
                "is_valid": False,
                "classification": "REJECTED",
                "sha256": sha256_hash,
                "rejection_reason": f"Corrupt image file or unsupported format: {e}"
            }

        # 3. Decode into OpenCV numpy array for computer vision processing
        np_arr = np.frombuffer(image_bytes, np.uint8)
        cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if cv_img is None:
            return {
                "is_valid": False,
                "classification": "REJECTED",
                "sha256": sha256_hash,
                "rejection_reason": "Failed to decode raster pixels with OpenCV."
            }

        # 4. Aspect Ratio and Orientation
        aspect_ratio = round(width / max(1, height), 2)
        is_landscape = width >= height
        is_portrait = height > width
        orientation = "LANDSCAPE" if is_landscape else "PORTRAIT"

        # 5. Resolution Verification
        is_landscape_uhd = is_landscape and (width >= cfg["uhd_min_width"] and height >= cfg["uhd_min_height"])
        is_portrait_uhd = is_portrait and (width >= cfg["portrait_uhd_min_width"] and height >= cfg["portrait_uhd_min_height"])
        is_genuine_uhd = is_landscape_uhd or is_portrait_uhd
        is_qhd = (width >= 2560 and height >= 1440) or (is_portrait and height >= 2560)
        is_fhd = (width >= cfg["fhd_min_width"] and height >= cfg["fhd_min_height"]) or (is_portrait and height >= cfg["fhd_min_width"])

        # 6. Computer Vision Clarity & Sharpness Assessment
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        
        # Laplacian variance (standard measure of focus and edge sharpness)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        sharpness_score = round(float(laplacian.var()), 1)

        # Tenengrad gradient magnitude (Sobel energy)
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobelx**2 + sobely**2)
        edge_energy = round(float(np.mean(gradient_magnitude)), 2)

        # 7. Upscaling & Stretched Thumbnail Detector (2D FFT High-Frequency Density)
        f_transform = np.fft.fft2(gray)
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1e-9)
        
        h_mid, w_mid = gray.shape[0] // 2, gray.shape[1] // 2
        y_coords, x_coords = np.ogrid[:gray.shape[0], :gray.shape[1]]
        dist_from_center = np.sqrt((x_coords - w_mid)**2 + (y_coords - h_mid)**2)
        high_freq_mask = dist_from_center > (min(h_mid, w_mid) * 0.4)
        
        high_freq_mean = float(np.mean(magnitude_spectrum[high_freq_mask])) if np.any(high_freq_mask) else 0.0
        # If high resolution but very low high-frequency content, it is artificially upscaled
        is_upscaled = (high_freq_mean < cfg["min_high_freq_spectral"]) and (sharpness_score < 40.0)

        # 8. JPEG Blocking Artifact Metric (8x8 pixel boundary gradient differences)
        blockiness_score = 1.0
        if pil_format.upper() in ("JPEG", "JPG") and gray.shape[0] >= 32 and gray.shape[1] >= 32:
            row_8 = gray[7::8, :]
            row_9 = gray[8::8, :]
            len_h = min(row_8.shape[0], row_9.shape[0])
            if len_h > 0:
                diff_h = np.abs(row_8[:len_h, :] - row_9[:len_h, :])
                
                row_4 = gray[4::8, :]
                row_5 = gray[5::8, :]
                len_non = min(row_4.shape[0], row_5.shape[0])
                if len_non > 0:
                    diff_non_h = np.abs(row_4[:len_non, :] - row_5[:len_non, :])
                    mean_boundary = float(np.mean(diff_h))
                    mean_interior = max(0.1, float(np.mean(diff_non_h)))
                    blockiness_score = round(mean_boundary / mean_interior, 2)

        has_excessive_compression = blockiness_score > cfg["max_blockiness_ratio"]

        # 9. Quality Classification
        # - EXCELLENT: Genuine UHD 4K+ (>=3840x2160), sharp (>=110), clean edges, no upscaling
        # - GOOD: High resolution (QHD or FHD), sharp (>=55), usable
        # - REVIEW: Resolution passes, but sharpness is questionable (20-55) or moderate compression
        # - REJECTED: Sub-HD (<1920x1080), excessive blur (<20), fake upscaling, or corrupt
        reasons = []

        if is_upscaled:
            classification = "REJECTED"
            reasons.append("Fake upscaling detected: Image lacks high-frequency spectral detail.")
        elif not is_fhd:
            classification = "REJECTED"
            reasons.append(f"Insufficient resolution ({width}x{height} is below 1080p FHD minimum).")
        elif sharpness_score < cfg["sharpness_threshold_review"]:
            classification = "REJECTED"
            reasons.append(f"Excessive blur detected (Laplacian score: {sharpness_score} < {cfg['sharpness_threshold_review']}).")
        elif is_genuine_uhd and sharpness_score >= cfg["sharpness_threshold_excellent"] and not has_excessive_compression:
            classification = "EXCELLENT"
            reasons.append("Pristine UHD 4K+ image with exceptional edge sharpness and clarity.")
        elif is_genuine_uhd and sharpness_score >= cfg["sharpness_threshold_good"] and not has_excessive_compression:
            classification = "GOOD"
            reasons.append("Genuine UHD 4K+ resolution with good visual sharpness.")
        elif (is_qhd or is_fhd) and sharpness_score >= cfg["sharpness_threshold_good"] and not has_excessive_compression:
            classification = "GOOD"
            reasons.append("High-resolution file meeting FHD/QHD clarity standards.")
        elif is_genuine_uhd or is_qhd or is_fhd:
            classification = "REVIEW"
            if sharpness_score < cfg["sharpness_threshold_good"]:
                reasons.append("Resolution passes, but sharpness is soft/motion-blurred; manual review recommended.")
            if has_excessive_compression:
                reasons.append(f"High JPEG blocking artifacts detected ({blockiness_score} ratio).")
        else:
            classification = "REJECTED"
            reasons.append(f"Visual quality check failed (sharpness {sharpness_score}).")

        resolution_label = "4K UHD" if is_genuine_uhd else "2K QHD" if is_qhd else "1080p FHD" if is_fhd else "SUB-HD"
        if width >= 5120:
            resolution_label = "5K UHD+"

        return {
            "is_valid": classification != "REJECTED",
            "classification": classification,
            "width": width,
            "height": height,
            "aspect_ratio": aspect_ratio,
            "orientation": orientation,
            "resolution_label": resolution_label,
            "is_uhd": is_genuine_uhd,
            "file_size_bytes": file_size_bytes,
            "file_size_mb": file_size_mb,
            "format": pil_format,
            "sha256": sha256_hash,
            "metrics": {
                "sharpness_laplacian": sharpness_score,
                "edge_energy": edge_energy,
                "high_frequency_spectral_mean": round(high_freq_mean, 1),
                "blockiness_ratio": blockiness_score,
                "is_upscaled": is_upscaled
            },
            "reasons": reasons,
            "config_applied": cfg
        }
