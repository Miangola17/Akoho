const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET morts d'un lot
router.get('/lot/:lot_id', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('lot_id', sql.Int, req.params.lot_id)
      .query('SELECT * FROM morts_lot WHERE lot_id = @lot_id ORDER BY date_mort DESC');
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// POST enregistrer des morts dans un lot
router.post('/', async (req, res, next) => {
  try {
    const { lot_id, date_mort, nombre } = req.body;
    if (!lot_id || !date_mort || !nombre) {
      return res.status(400).json({ error: 'lot_id, date_mort et nombre sont obligatoires' });
    }
    const pool = await getPool();
    const t = await pool.transaction();
    await t.begin();
    try {
      await t.request()
        .input('lot_id', sql.Int, lot_id)
        .input('date_mort', sql.Date, date_mort)
        .input('nombre', sql.Int, nombre)
        .query(`
          INSERT INTO morts_lot (lot_id, date_mort, nombre)
          VALUES (@lot_id, @date_mort, @nombre)
        `);

      // Mettre à jour le nombre_morts dans le lot
      await t.request()
        .input('lot_id', sql.Int, lot_id)
        .input('nombre', sql.Int, nombre)
        .query(`
          UPDATE lots SET nombre_morts = nombre_morts + @nombre
          WHERE id = @lot_id
        `);

      await t.commit();
      res.status(201).json({ message: `${nombre} mort(s) enregistré(s)` });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) { next(err); }
});

module.exports = router;
