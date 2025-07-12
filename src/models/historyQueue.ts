import mongoose from 'mongoose';

const Queue = new mongoose.Schema(
    {
        identifier: { type: String, required: true },
        trackId: { type: String, required: true },
    }
);

export = mongoose.model("historyQueue", Queue);