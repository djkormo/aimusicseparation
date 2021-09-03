from fastapi import APIRouter, File, UploadFile
from common import Injects
from services.music import MusicService
from starlette.responses import StreamingResponse
import io
import numpy as np

def remove(data, model_name="u2net"):
    model = model_u2net

    if model == "u2netp":
        model = model_u2netp

    img = Image.open(io.BytesIO(data))
    roi = detect.predict(model, np.array(img))
    roi = roi.resize((img.size), resample=Image.LANCZOS)

    empty = Image.new("RGBA", (img.size), 0)
    out = Image.composite(img, empty, roi.convert("L"))

    bio = io.BytesIO()
    out.save(bio, "PNG")

    return bio.getbuffer()



router = APIRouter()

@router.get("/api/music")
async def root(music_service: MusicService = Injects(MusicService)):
    return {"message": image_service.process()}


@router.post("/api/files")
async def create_file(file: bytes = File(...)):
    return {"file_size": len(file)}


@router.post("/api/music/{file_name}")
async def create_upload_file(file_name, file: UploadFile = File(...)):
    print(file)
    print(file_name)
    print(file.filename)
    file_data=await file.read()
    file_processed=remove(file_data)
    return StreamingResponse(io.BytesIO(file_processed), media_type="image/png")
