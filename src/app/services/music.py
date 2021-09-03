import sys
from pathlib import Path
import torch as th
import torchaudio as ta
from demucs.separate import load_track, encode_mp3
from demucs.audio import AudioFile, convert_audio_channels
from demucs.pretrained import is_pretrained, load_pretrained
from demucs.utils import apply_model, load_model
from typing import List, Optional
from pydantic import BaseModel
import tempfile
from zipfile import ZipFile

class DemucsConfiguration(BaseModel):
    tracks: List[Path] = []
    name: str = "demucs_quantized"
    verbose: bool = True
    out: Path = Path('separated')
    models: Path = Path('models')
    device: str = "cuda" if th.cuda.is_available() else "cpu"
    shifts: int = 0
    overlap: float = 0.25
    split: bool = True
    float32: bool = True
    int16: bool = False
    mp3: bool = True
    mp3bitrate: int = 320


class MusicService:
    def __init__(self):
        self.config = DemucsConfiguration()
        model_path = self.config.models / (self.config.name + ".th")

        if model_path.is_file():
            self.model = load_model(model_path)
        else:
            if is_pretrained(self.config.name):
                self.model = load_pretrained(self.config.name)
            else:
                raise ValueError(f'No pre-trained model {self.config.name}')

        self.model.to(self.config.device)


    def process(self, stream, bitrate: int = 320):

        with tempfile.NamedTemporaryFile() as tmpfile:
            print(tmpfile.name)
            tmpfile.write(stream)
            wav = load_track(tmpfile.name, self.config.device, self.model.audio_channels, self.model.samplerate)

            ref = wav.mean(0)
            wav = (wav - ref.mean()) / ref.std()
            sources = apply_model(self.model, wav, shifts=self.config.shifts, split=self.config.split,
                                  overlap=self.config.overlap, progress=True)
            sources = sources * ref.std() + ref.mean()

            with tempfile.TemporaryDirectory() as tmpdirname, ZipFile(f"{tmpdirname}.zip",'w') as zipfile:
                print(tmpdirname)
                for source, name in zip(sources, self.model.sources):
                    source = source / max(1.01 * source.abs().max(), 1)
                    if self.config.mp3 or not self.config.float32:
                        source = (source * 2**15).clamp_(-2**15, 2**15 - 1).short()
                    source = source.cpu()
                    stem = f"{tmpdirname}/{name}"
                    if self.config.mp3:
                        stem = f"{stem}.mp3"
                        arcname=f"{name}.mp3"
                        encode_mp3(source, stem,
                                   bitrate=self.config.mp3bitrate,
                                   samplerate=self.model.samplerate,
                                   channels=self.model.audio_channels,
                                   verbose=self.config.verbose)
                    else:
                        stem = f"{stem}.wav"
                        arcname=f"{name}.mp3"
                        ta.save(stem, source, sample_rate=self.model.samplerate)

                    zipfile.write(stem,arcname)

            with open(f"{tmpdirname}.zip",'rb') as f:
                return f.read()


