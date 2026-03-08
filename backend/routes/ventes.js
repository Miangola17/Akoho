const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// ============================================================
// VENTES POULET
// ============================================================

// GET toutes les ventes de poulets (optionnel: filtre par lot et/ou date)
router.get('/poulet', async (req, res, next) => {
  try {
    const pool = await getPool();
    const lotId = req.query.lot_id;
    const date = req.query.date;
    let query = `
      SELECT vp.*, l.nom AS lot_nom, r.nom AS race_nom
      FROM ventes_poulet vp
      JOIN lots l ON l.id = vp.lot_id
      JOIN races r ON r.id = l.race_id
      WHERE 1=1
    `;
    if (lotId) query += ' AND vp.lot_id = @lot_id';
    if (date) query += ' AND vp.date_vente = @date';
    query += ' ORDER BY vp.date_vente DESC';
    
    const req2 = pool.request();
    if (lotId) req2.input('lot_id', sql.Int, lotId);
    if (date) req2.input('date', sql.Date, date);
    const result = await req2.query(query);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// GET ventes poulet par période
router.get('/poulet/periode', async (req, res, next) => {
  try {
    const pool = await getPool();
    const { date_debut, date_fin } = req.query;
    const result = await pool.request()
      .input('date_debut', sql.Date, date_debut || '1900-01-01')
      .input('date_fin', sql.Date, date_fin || new Date().toISOString().slice(0, 10))
      .query(`
        SELECT vp.*, l.nom AS lot_nom, r.nom AS race_nom
        FROM ventes_poulet vp
        JOIN lots l ON l.id = vp.lot_id
        JOIN races r ON r.id = l.race_id
        WHERE vp.date_vente BETWEEN @date_debut AND @date_fin
        ORDER BY vp.date_vente DESC
      `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// POST créer une vente de poulet
router.post('/poulet', async (req, res, next) => {
  try {
    const { lot_id, date_vente, nombre_vendus, montant_total } = req.body;
    if (!lot_id || !date_vente || nombre_vendus == null || montant_total == null) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('lot_id', sql.Int, lot_id)
      .input('date_vente', sql.Date, date_vente)
      .input('nombre_vendus', sql.Int, nombre_vendus)
      .input('montant_total', sql.Decimal(18, 2), montant_total)
      .query(`
        INSERT INTO ventes_poulet (lot_id, date_vente, nombre_vendus, montant_total)
        OUTPUT INSERTED.*
        VALUES (@lot_id, @date_vente, @nombre_vendus, @montant_total)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) { next(err); }
});

// DELETE vente poulet
router.delete('/poulet/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM ventes_poulet WHERE id = @id');
    res.json({ message: 'Vente supprimée' });
  } catch (err) { next(err); }
});

// ============================================================
// VENTES OEUF
// ============================================================

// GET toutes les ventes d'oeufs (optionnel: filtre par date)
router.get('/oeuf', async (req, res, next) => {
  try {
    const pool = await getPool();
    const date = req.query.date;
    let query = `
      SELECT vo.*, o.lot_id, o.date_pondement, l.nom AS lot_nom
      FROM ventes_oeuf vo
      JOIN oeufs o ON o.id = vo.oeuf_id
      JOIN lots l ON l.id = o.lot_id
      WHERE 1=1
    `;
    if (date) query += ' AND vo.date_vente = @date';
    query += ' ORDER BY vo.date_vente DESC';
    
    const req2 = pool.request();
    if (date) req2.input('date', sql.Date, date);
    const result = await req2.query(query);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// GET ventes oeuf par période
router.get('/oeuf/periode', async (req, res, next) => {
  try {
    const pool = await getPool();
    const { date_debut, date_fin } = req.query;
    const result = await pool.request()
      .input('date_debut', sql.Date, date_debut || '1900-01-01')
      .input('date_fin', sql.Date, date_fin || new Date().toISOString().slice(0, 10))
      .query(`
        SELECT vo.*, o.lot_id, o.date_pondement, l.nom AS lot_nom
        FROM ventes_oeuf vo
        JOIN oeufs o ON o.id = vo.oeuf_id
        JOIN lots l ON l.id = o.lot_id
        WHERE vo.date_vente BETWEEN @date_debut AND @date_fin
        ORDER BY vo.date_vente DESC
      `);
    res.json(result.recordset);
  } catch (err) { next(err); }
});

// POST créer une vente d'oeuf
router.post('/oeuf', async (req, res, next) => {
  try {
    const { oeuf_id, date_vente, nombre_vendus, montant_total } = req.body;
    if (!oeuf_id || !date_vente || nombre_vendus == null || montant_total == null) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('oeuf_id', sql.Int, oeuf_id)
      .input('date_vente', sql.Date, date_vente)
      .input('nombre_vendus', sql.Int, nombre_vendus)
      .input('montant_total', sql.Decimal(18, 2), montant_total)
      .query(`
        INSERT INTO ventes_oeuf (oeuf_id, date_vente, nombre_vendus, montant_total)
        OUTPUT INSERTED.*
        VALUES (@oeuf_id, @date_vente, @nombre_vendus, @montant_total)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) { next(err); }
});

// DELETE vente oeuf
router.delete('/oeuf/:id', async (req, res, next) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM ventes_oeuf WHERE id = @id');
    res.json({ message: 'Vente supprimée' });
  } catch (err) { next(err); }
});

// ============================================================
// RÉSUMÉ DES VENTES PAR DATE
// ============================================================
router.get('/resume', async (req, res, next) => {
  try {
    const pool = await getPool();
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    
    // Ventes poulet du jour
    const ventesPoulet = await pool.request()
      .input('date', sql.Date, date)
      .query(`
        SELECT 
          SUM(nombre_vendus) AS total_poulets_vendus,
          SUM(montant_total) AS total_montant_poulet
        FROM ventes_poulet
        WHERE date_vente = @date
      `);
    
    // Ventes oeuf du jour
    const ventesOeuf = await pool.request()
      .input('date', sql.Date, date)
      .query(`
        SELECT 
          SUM(nombre_vendus) AS total_oeufs_vendus,
          SUM(montant_total) AS total_montant_oeuf
        FROM ventes_oeuf
        WHERE date_vente = @date
      `);

    const poulet = ventesPoulet.recordset[0] || { total_poulets_vendus: 0, total_montant_poulet: 0 };
    const oeuf = ventesOeuf.recordset[0] || { total_oeufs_vendus: 0, total_montant_oeuf: 0 };

    res.json({
      date,
      poulets: {
        nombre_vendus: poulet.total_poulets_vendus || 0,
        montant_total: poulet.total_montant_poulet || 0
      },
      oeufs: {
        nombre_vendus: oeuf.total_oeufs_vendus || 0,
        montant_total: oeuf.total_montant_oeuf || 0
      },
      montant_total_jour: (poulet.total_montant_poulet || 0) + (oeuf.total_montant_oeuf || 0)
    });
  } catch (err) { next(err); }
});

// ============================================================
// ESTIMATION DE VENTE (si on vendait aujourd'hui)
// ============================================================
router.get('/estimation', async (req, res, next) => {
  try {
    const pool = await getPool();
    
    // Estimation poulets: nombre vivants × prix unitaire akoho par lot
    const estimationPoulets = await pool.request().query(`
      SELECT 
        l.id AS lot_id,
        l.nom AS lot_nom,
        r.nom AS race_nom,
        (l.nombre_initial - l.nombre_morts) AS nombre_vivants,
        r.prix_unitaire_akoho,
        (l.nombre_initial - l.nombre_morts) * r.prix_unitaire_akoho AS estimation_vente,
        ISNULL((SELECT SUM(poids_g) FROM statistiques_lot WHERE lot_id = l.id), 0) AS poids_moyen_g
      FROM lots l
      JOIN races r ON r.id = l.race_id
      WHERE l.date_sortie IS NULL
    `);

    // Estimation oeufs: oeufs à vendre non encore vendus
    const estimationOeufs = await pool.request().query(`
      SELECT 
        o.id AS oeuf_id,
        l.nom AS lot_nom,
        o.date_pondement,
        (o.nombre_oeufs - o.nombre_oeufs_morts) AS nombre_oeufs_bons,
        r.prix_unitaire_oeuf,
        (o.nombre_oeufs - o.nombre_oeufs_morts) * r.prix_unitaire_oeuf AS estimation_vente
      FROM oeufs o
      JOIN lots l ON l.id = o.lot_id
      JOIN races r ON r.id = l.race_id
      WHERE o.type = 'vendre'
    `);

    const totalPoulets = estimationPoulets.recordset.reduce((acc, lot) => acc + parseFloat(lot.estimation_vente || 0), 0);
    const totalOeufs = estimationOeufs.recordset.reduce((acc, oeuf) => acc + parseFloat(oeuf.estimation_vente || 0), 0);

    res.json({
      date_estimation: new Date().toISOString().slice(0, 10),
      poulets: {
        lots: estimationPoulets.recordset,
        total_estimation: totalPoulets
      },
      oeufs: {
        entries: estimationOeufs.recordset,
        total_estimation: totalOeufs
      },
      total_estimation_global: totalPoulets + totalOeufs
    });
  } catch (err) { next(err); }
});

module.exports = router;
