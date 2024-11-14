import mongoose from 'mongoose';

const AddSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artist: { type: String, required: true },
        album: { type: String, required: true },
        release: { type: String, required: true },
        imgSrc: { type: String, required: true },
        trackId: { type: String, required: true },
        albumId: { type: String, required: true },
        lyrics: [
            { time: { type: Number, required: true }, lyrics: { type: String, required: true } },
        ],
    }
);

export = mongoose.model("Add", AddSchema);
