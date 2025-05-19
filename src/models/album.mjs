import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
}, {
  collection: 'albums',
  minimize: false,
  versionKey: false,
  timestamps: { createdAt: 'createdAt' }
}).set('toJSON', {
  transform: (doc, ret) => {
    const modifiedRet = { ...ret };
    modifiedRet.id = modifiedRet._id;
    delete modifiedRet._id;
    return modifiedRet;
  }
});

const Album = mongoose.model('Album', AlbumSchema);

export default Album;
