const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// GET tous les oeufs (optionnel: filtre par lot)
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const lotId = req.query.lot_id;
    let query = `
      SELECT o.*, l.nom AS lot_nom, r.prix_unitaire_oeuf,
             (o.nombre_oeufs - o.nombre_oeufs_morts) AS nombre_oeufs_bons,
             CASE WHEN o.type = 'vendre'
               THEN (o.nombre_oeufs - o.nombre_oeufs_morts) * r.prix_unitaire_oeuf
               ELSE 0 END AS revenu_oeufs
      FROM oeufs o
      JOIN lots l ON l.id = o.lot_id
      JOIN races r ON r.id = l.race_id
    `;
    if (lotId) query += ' WHERE o.lot_id = @lot_id';
    query += ' ORDER BY o.date_pondement DESC';
    const req2 = pool.request();
    if (lotId) req2.input('lot_id', sql.Int, lotId);
    const result = await req2.query(query);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// GET oeufs d'un lot jusqu'à une date
router.get('/lot/:lot_id/date/:date', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('lot_id', sql.Int, req.params.lot_id)
      .input('date', sql.Date, req.params.date)
      .query(`
        SELECT o.*, r.prix_unitaire_oeuf,
               (o.nombre_oeufs - o.nombre_oeufs_morts) AS nombre_oeufs_bons,
               CASE WHEN o.type = 'vendre'
                 THEN (o.nombre_oeufs - o.nombre_oeufs_morts) * r.prix_unitaire_oeuf
                 ELSE 0 END AS revenu_oeufs
        FROM oeufs o
        JOIN lots l ON l.id = o.lot_id
        JOIN races r ON r.id = l.race_id
        WHERE o.lot_id = @lot_id AND o.date_pondement <= @date
        ORDER BY o.date_pondement
      `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// POST créer un enregistrement d'oeufs
router.post('/', async (req, res, next) => {
  try {
    const { lot_id, date_pondement, nombre_oeufs, nombre_oeufs_morts, type } = req.body;
    if (!lot_id || !date_pondement || nombre_oeufs == null || !type) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    if (!['vendre', 'incuber'].includes(type)) {
      return res.status(400).json({ error: "Type doit être 'vendre' ou 'incuber'" });
    }
    const pool = await getPool();
    const t = await pool.transaction();
    await t.begin();
    try {
      const result = await t.request()
        .input('lot_id', sql.Int, lot_id)
        .input('date_pondement', sql.Date, date_pondement)
        .input('nombre_oeufs', sql.Int, nombre_oeufs)
        .input('nombre_oeufs_morts', sql.Int, nombre_oeufs_morts || 0)
        .input('type', sql.NVarChar(20), type)
        .query(`
          INSERT INTO oeufs (lot_id, date_pondement, nombre_oeufs, nombre_oeufs_morts, type)
          OUTPUT INSERTED.*
          VALUES (@lot_id, @date_pondement, @nombre_oeufs, @nombre_oeufs_morts, @type)
        `);

      // Si type = 'incuber', créer automatiquement un nouveau lot pour ces oeufs
      if (type === 'incuber') {
        const parentLot = await t.request()
          .input('lot_id', sql.Int, lot_id)
          .query(`SELECT l.*, r.nom AS race_nom FROM lots l JOIN races r ON r.id = l.race_id WHERE l.id = @lot_id`);

        const pl = parentLot.recordset[0];
        const nbOeufsViables = nombre_oeufs - (nombre_oeufs_morts || 0);

        if (nbOeufsViables > 0) {
          await t.request()
            .input('nom', sql.NVarChar(100), `Lot issu incubation - ${pl.nom} (${date_pondement})`)
            .input('race_id', sql.Int, pl.race_id)
            .input('date_creation', sql.Date, date_pondement)
            .input('nombre_initial', sql.Int, nbOeufsViables)
            .input('prix_achat_unitaire', sql.Decimal(18, 2), 0)
            .input('description', sql.NVarChar(500), `Créé automatiquement depuis ${nbOeufsViables} oeufs incubés du lot "${pl.nom}"`)
            .query(`
              INSERT INTO lots (nom, race_id, date_creation, nombre_initial, prix_achat_unitaire, description)
              VALUES (@nom, @race_id, @date_creation, @nombre_initial, @prix_achat_unitaire, @description)
            `);
        }
      }

      await t.commit();
      res.status(201).json(result.recordset[0]);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  } catch (err) { next(err); }
});

// PUT update oeuf
router.put('/:id', async (req, res, next) => {
  try {
    const { date_pondement, nombre_oeufs, nombre_oeufs_morts, type } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('date_pondement', sql.Date, date_pondement)
      .input('nombre_oeufs', sql.Int, nombre_oeufs)
      .input('nombre_oeufs_morts', sql.Int, nombre_oeufs_morts || 0)
      .input('type', sql.NVarChar(20), type)
      .query(`
        UPDATE oeufs
        SET date_pondement = @date_pondement, nombre_oeufs = @nombre_oeufs,
            nombre_oeufs_morts = @nombre_oeufs_morts, type = @type
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (!result.recordset.length) return res.status(404).json({ error: 'Oeuf non trouvé' });
    res.json(result.recordset[0]);
  } catch (err) { next(err); }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, req.params.id)
      .query('DELETE FROM oeufs WHERE id = @id');
    res.json({ message: 'Supprimé' });
  } catch (err) { next(err); }
});

module.exports = router;
