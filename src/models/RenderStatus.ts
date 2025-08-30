import mongoose, { Schema } from 'mongoose';

const renderStatusSchema = new Schema({
    title: { type: String, required: true, default: '' },
    artist: { type: String, required: true, default: '' },
    album: { type: String, required: true, default: '' },
    StartAt: { type: String, default: '' },

    status: { type: String, default: '' },
    progress: { type: Number, default: 0 },
    duration: { type: String, default: '' },

    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('RenderStatus', renderStatusSchema, 'RenderStatus');