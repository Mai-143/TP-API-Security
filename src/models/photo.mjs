import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true } // définit la relation
}, {
  collection: 'photos',
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

const Photo = mongoose.model('Photo', PhotoSchema);
export default Photo;
