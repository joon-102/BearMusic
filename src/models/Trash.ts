import mongoose from 'mongoose';

const TrashSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artist: { type: String, required: true },
        album: { type: String, required: true },
        trackId: { type: String, required: true },
    }
);

export = mongoose.model("Trash", TrashSchema);

