const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET all lots (with race info)
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT l.*, r.nom AS race_nom,
             r.prix_unitaire_akoho, r.prix_unitaire_oeuf, r.prix_nourriture_par_gramme, r.prix_poussins,
             (l.nombre_initial - l.nombre_morts) AS nombre_vivants,
             (l.nombre_initial * l.prix_achat_unitaire) AS cout_achat_total
      FROM lots l
      JOIN races r ON r.id = l.race_id
      ORDER BY l.date_creation DESC
    `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// GET lot by id
router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT l.*, r.nom AS race_nom,
               r.prix_unitaire_akoho, r.prix_unitaire_oeuf, r.prix_nourriture_par_gramme, r.prix_poussins,
               (l.nombre_initial - l.nombre_morts) AS nombre_vivants,
               (l.nombre_initial * l.prix_achat_unitaire) AS cout_achat_total
        FROM lots l
        JOIN races r ON r.id = l.race_id
        WHERE l.id = @id
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Lot non trouvé' });
    res.json(result.recordset[0]);
  } catch (err) { next(err); }
});

// POST create lot
router.post('/', async (req, res, next) => {
  try {
    const { nom, race_id, date_creation, nombre_initial, prix_achat_unitaire, description } = req.body;
    if (!nom || !race_id || !date_creation || !nombre_initial || prix_achat_unitaire == null) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('nom', sql.NVarChar(100), nom)
      .input('race_id', sql.Int, race_id)
      .input('date_creation', sql.Date, date_creation)
      .input('nombre_initial', sql.Int, nombre_initial)
      .input('prix_achat_unitaire', sql.Decimal(18, 2), prix_achat_unitaire)
      .input('description', sql.NVarChar(500), description || null)
      .query(`
        INSERT INTO lots (nom, race_id, date_creation, nombre_initial, prix_achat_unitaire, description)
        OUTPUT INSERTED.*
        VALUES (@nom, @race_id, @date_creation, @nombre_initial, @prix_achat_unitaire, @description)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) { next(err); }
});

// PUT update lot
router.put('/:id', async (req, res, next) => {
  try {
    const { nom, race_id, date_creation, date_sortie, nombre_initial, nombre_morts, prix_achat_unitaire, description } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('nom', sql.NVarChar(100), nom)
      .input('race_id', sql.Int, race_id)
      .input('date_creation', sql.Date, date_creation)
      .input('date_sortie', sql.Date, date_sortie || null)
      .input('nombre_initial', sql.Int, nombre_initial)
      .input('nombre_morts', sql.Int, nombre_morts || 0)
      .input('prix_achat_unitaire', sql.Decimal(18, 2), prix_achat_unitaire)
      .input('description', sql.NVarChar(500), description || null)
      .query(`
        UPDATE lots
        SET nom = @nom, race_id = @race_id, date_creation = @date_creation,
            date_sortie = @date_sortie,
            nombre_initial = @nombre_initial, nombre_morts = @nombre_morts,
            prix_achat_unitaire = @prix_achat_unitaire, description = @description
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Lot non trouvé' });
    res.json(result.recordset[0]);
  } catch (err) { next(err); }
});

// DELETE lot
router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM lots WHERE id = @id');
    res.json({ message: 'Lot supprimé' });
  } catch (err) { next(err); }
});

module.exports = router;
