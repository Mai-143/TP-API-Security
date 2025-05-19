import express from 'express';
import Photo from '../models/photo.mjs';
import Album from '../models/album.mjs';

const router = express.Router();

// GET /album/:idalbum/photos - Récupérer toutes les photos d'un album
router.get('/album/:idalbum/photos', async (req, res) => {
  try {
    const album = await Album.findById(req.params.idalbum);
    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    const photos = await Photo.find({ album: req.params.idalbum });
    res.status(200).json({
      message: 'Photos récupérées avec succès.',
      data: photos
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});
// GET /album/:idalbum/photo/:idphotos - Récupérer une photo spécifique d'un album
router.get('/album/:idalbum/photo/:idphotos', async (req, res) => {
  try {
    const album = await Album.findById(req.params.idalbum);
    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    const photo = await Photo.findOne({
      _id: req.params.idphotos,
      album: req.params.idalbum
    });
    if (!photo) {
      return res.status(404).json({ message: 'Photo non trouvée' });
    }

    res.status(200).json({
      message: 'Photo récupérée avec succès.',
      data: photo
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// POST /album/:idalbum/photo - Ajouter une nouvelle photo à un album
router.post('/album/:idalbum/photo', async (req, res) => {
  try {
    const album = await Album.findById(req.params.idalbum);
    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }
    const photo = new Photo({
      ...req.body,
      album: req.params.idalbum
    });

    const savedPhoto = await photo.save();

    // Ajouter la photo à l’album
    album.photos.push(savedPhoto._id);
    await album.save();

    res.status(201).json({
      message: 'Photo ajoutée avec succès à l’album.',
      data: savedPhoto
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l’ajout de la photo.', error: error.message });
  }
});

// PUT /album/:idalbum/photo/:idphotos - Mettre à jour une photo existante
router.put('/album/:idalbum/photo/:idphotos', async (req, res) => {
  try {
    const album = await Album.findById(req.params.idalbum);
    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }

    const photo = await Photo.findOneAndUpdate(
      { _id: req.params.idphotos, album: req.params.idalbum },
      req.body,
      { new: true }
    );
    if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });
    res.status(200).json({
      message: 'Photo mise à jour avec succès.',
      data: photo
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour.', error: error.message });
  }
});

// DELETE /album/:idalbum/photo/:idphotos - Supprimer une photo d'un album
router.delete('/album/:idalbum/photo/:idphotos', async (req, res) => {
  try {
    const album = await Album.findById(req.params.idalbum);
    if (!album) {
      return res.status(404).json({ message: 'Album non trouvé' });
    }
    // Supprimer la photo
    const photo = await Photo.findOneAndDelete({
      _id: req.params.idphotos,
      album: req.params.idalbum
    });

    if (!photo) return res.status(404).json({ message: 'Photo non trouvée' });

    // Retirer la référence de l’album
    await Album.findByIdAndUpdate(req.params.idalbum, {
      $pull: { photos: req.params.idphotos }
    });

    res.status(200).json({ message: 'Photo supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
  }
});

export default router;
