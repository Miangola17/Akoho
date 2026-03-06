const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET toutes les statistiques d'un lot
router.get('/lot/:lot_id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('lot_id', sql.Int, req.params.lot_id)
      .query(`
        SELECT s.*,
          SUM(s.poids_g) OVER (ORDER BY s.semaine ROWS UNBOUNDED PRECEDING) AS poids_cumule_g,
          SUM(s.nourriture_g) OVER (ORDER BY s.semaine ROWS UNBOUNDED PRECEDING) AS nourriture_cumule_g
        FROM statistiques_lot s
        WHERE s.lot_id = @lot_id
        ORDER BY s.semaine
      `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// GET statistiques jusqu'à une date donnée pour un lot
router.get('/lot/:lot_id/date/:date', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('lot_id', sql.Int, req.params.lot_id)
      .input('date', sql.Date, req.params.date)
      .query(`
        SELECT s.*,
          SUM(s.poids_g) OVER (ORDER BY s.semaine ROWS UNBOUNDED PRECEDING) AS poids_cumule_g,
          SUM(s.nourriture_g) OVER (ORDER BY s.semaine ROWS UNBOUNDED PRECEDING) AS nourriture_cumule_g
        FROM statistiques_lot s
        WHERE s.lot_id = @lot_id AND s.date_stat <= @date
        ORDER BY s.semaine
      `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// POST créer une statistique hebdomadaire pour un lot
router.post('/', async (req, res, next) => {
  try {
    const { lot_id, semaine, date_stat, poids_g, nourriture_g } = req.body;
    if (lot_id == null || semaine == null || !date_stat) {
      return res.status(400).json({ error: 'lot_id, semaine et date_stat sont obligatoires' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('lot_id', sql.Int, lot_id)
      .input('semaine', sql.Int, semaine)
      .input('date_stat', sql.Date, date_stat)
      .input('poids_g', sql.Decimal(10, 2), poids_g || 0)
      .input('nourriture_g', sql.Decimal(10, 2), nourriture_g || 0)
      .query(`
        INSERT INTO statistiques_lot (lot_id, semaine, date_stat, poids_g, nourriture_g)
        OUTPUT INSERTED.*
        VALUES (@lot_id, @semaine, @date_stat, @poids_g, @nourriture_g)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) { next(err); }
});

// PUT update statistique
router.put('/:id', async (req, res, next) => {
  try {
    const { poids_g, nourriture_g, date_stat } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('poids_g', sql.Decimal(10, 2), poids_g || 0)
      .input('nourriture_g', sql.Decimal(10, 2), nourriture_g || 0)
      .input('date_stat', sql.Date, date_stat)
      .query(`
        UPDATE statistiques_lot
        SET poids_g = @poids_g, nourriture_g = @nourriture_g, date_stat = @date_stat
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Statistique non trouvée' });
    res.json(result.recordset[0]);
  } catch (err) { next(err); }
});

// DELETE statistique
router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM statistiques_lot WHERE id = @id');
    res.json({ message: 'Statistique supprimée' });
  } catch (err) { next(err); }
});

module.exports = router;
