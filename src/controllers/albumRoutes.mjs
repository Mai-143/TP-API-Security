import express from 'express';
import Album from '../models/album.mjs';
import Photo from '../models/photo.mjs';

const router = express.Router();

// GET /album/:id - Récupérer un album par son ID
router.get('/album/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate('photos');
    if (!album) return res.status(404).json({ message: 'Album non trouvé' });

    res.status(200).json({ message: 'Album récupéré avec succès.', data: album });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /album - Créer un nouvel album
router.post('/album', async (req, res) => {
  try {
    const newAlbum = new Album(req.body);
    const savedAlbum = await newAlbum.save();
    res.status(201).json({ message: 'Album créé avec succès.', data: savedAlbum });
  } catch (error) {
    res.status(400).json({ message: 'Échec de la création de l\'album.', error: error.message });
  }
});

// PUT /album/:id - Mettre à jour un album existant
router.put('/album/:id', async (req, res) => {
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAlbum) {
      return res.status(404).json({ message: 'Album non trouvé.' });
    }
    res.status(200).json({ message: 'Album mis à jour avec succès.', data: updatedAlbum });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'album.', error: error.message });
  }
});

// DELETE /album/:id - Supprimer un album
router.delete('/album/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ message: 'Album à supprimer non trouvé.' });
    }

    await Photo.deleteMany({ album: album._id }); // Supprime les photos liées
    await album.deleteOne(); // Supprime l’album

    res.status(200).json({ message: 'Album et photos associées supprimés avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'album.', error: error.message });
  }
});
// GET /albums - Récupérer tous les albums avec filtre par nom
router.get('/albums', async (req, res) => {
  try {
    const { title } = req.query;
    const filter = title ? { title: new RegExp(title, 'i') } : {};
    const albums = await Album.find(filter);
    res.status(200).json({ message: 'Liste des albums récupérée avec succès.', data: albums });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des albums.', error: error.message });
  }
});

export default router;
