import io
import zipfile

from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)

def test_gallery_sources_endpoint():
    """Verify that source compliance and licensing audit endpoint works."""
    response = client.get("/api/v1/gallery/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["sources"]) >= 4
    names = [s["name"] for s in data["sources"]]
    assert "Wikimedia Commons" in names
    assert "Red Bull Content Pool" in names
    assert "Formula 1 Official (formula1.com)" in names

def test_gallery_images_list():
    """Verify listing verified gallery images with default filters."""
    response = client.get("/api/v1/gallery/images")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "images" in data
    assert data["total"] >= 1
    # Check fields of verified items
    first = data["images"][0]
    assert "width" in first
    assert "height" in first
    assert "sha256" in first
    assert "metrics" in first
    assert "classification" in first
    assert first["classification"] in ("EXCELLENT", "GOOD", "REVIEW")

def test_gallery_manifest_download():
    """Verify downloadable JSON manifest endpoint."""
    response = client.get("/api/v1/gallery/manifest")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    manifest = response.json()
    assert manifest["platform"] == "ApexOps Motorsport Technology & Intelligence Platform"
    assert "images" in manifest

def test_gallery_export_zip():
    """Verify that exporting selected images generates a valid zip file."""
    # List images first to get an ID
    list_res = client.get("/api/v1/gallery/images")
    images = list_res.json()["images"]
    if images:
        target_id = images[0]["id"]
        zip_res = client.post("/api/v1/gallery/export-zip", json={"image_ids": [target_id]})
        assert zip_res.status_code == 200
        assert zip_res.headers["content-type"] == "application/zip"
        # Verify valid zip format
        z = zipfile.ZipFile(io.BytesIO(zip_res.content))
        assert "manifest.json" in z.namelist()
