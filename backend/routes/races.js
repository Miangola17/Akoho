const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET all races
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM races ORDER BY nom');
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// GET race by id
router.get('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM races WHERE id = @id');
    if (!result.recordset.length) return res.status(404).json({ error: 'Race non trouvée' });
    res.json(result.recordset[0]);
  } catch (err) { next(err); }
});

// POST create race
router.post('/', async (req, res, next) => {
  try {
    const { nom, prix_unitaire_akoho, prix_unitaire_oeuf, prix_nourriture_par_gramme } = req.body;
    if (!nom || prix_unitaire_akoho == null || prix_unitaire_oeuf == null || prix_nourriture_par_gramme == null) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('nom', sql.NVarChar(100), nom)
      .input('prix_unitaire_akoho', sql.Decimal(18, 2), prix_unitaire_akoho)
      .input('prix_unitaire_oeuf', sql.Decimal(18, 2), prix_unitaire_oeuf)
      .input('prix_nourriture_par_gramme', sql.Decimal(18, 4), prix_nourriture_par_gramme)
      .query(`
        INSERT INTO races (nom, prix_unitaire_akoho, prix_unitaire_oeuf, prix_nourriture_par_gramme)
        OUTPUT INSERTED.*
        VALUES (@nom, @prix_unitaire_akoho, @prix_unitaire_oeuf, @prix_nourriture_par_gramme)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) { next(err); }
});

// PUT update race
router.put('/:id', async (req, res, next) => {
  try {
    const { nom, prix_unitaire_akoho, prix_unitaire_oeuf, prix_nourriture_par_gramme } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('nom', sql.NVarChar(100), nom)
      .input('prix_unitaire_akoho', sql.Decimal(18, 2), prix_unitaire_akoho)
      .input('prix_unitaire_oeuf', sql.Decimal(18, 2), prix_unitaire_oeuf)
      .input('prix_nourriture_par_gramme', sql.Decimal(18, 4), prix_nourriture_par_gramme)
      .query(`
        UPDATE races
        SET nom = @nom,
            prix_unitaire_akoho = @prix_unitaire_akoho,
            prix_unitaire_oeuf = @prix_unitaire_oeuf,
            prix_nourriture_par_gramme = @prix_nourriture_par_gramme
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Race non trouvée' });
    res.json(result.recordset[0]);
  } catch (err) { next(err); }
});

// DELETE race
router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM races WHERE id = @id');
    res.json({ message: 'Race supprimée' });
  } catch (err) { next(err); }
});

module.exports = router;
