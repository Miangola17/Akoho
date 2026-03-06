const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

/**
 * Calcule le bilan complet de tous les lots (ou d'un lot) 
 * avec filtre optionnel par date.
 * 
 * Query params:
 *   - date  (optionnel) : filtre les données jusqu'à cette date
 *   - lot_id (optionnel) : filtre sur un lot précis
 */
router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const dateFilter = req.query.date || null;
    const lotFilter = req.query.lot_id ? parseInt(req.query.lot_id) : null;

    // Construire la condition de filtre date
    const dateCond = dateFilter ? "AND s.date_stat <= @date" : "";
    const oeufDateCond = dateFilter ? "AND o.date_pondement <= @date" : "";
    const lotCond = lotFilter ? "AND l.id = @lot_id" : "";

    const query = `
      SELECT
        l.id AS lot_id,
        l.nom AS lot_nom,
        r.nom AS race_nom,
        l.date_creation,
        l.nombre_initial,
        l.nombre_morts,
        (l.nombre_initial - l.nombre_morts) AS nombre_vivants,
        l.prix_achat_unitaire,
        r.prix_unitaire_akoho,
        r.prix_unitaire_oeuf,
        r.prix_nourriture_par_gramme,

        -- Coût total d'achat
        (l.nombre_initial * l.prix_achat_unitaire) AS cout_achat_total,

        -- Coût nourriture : SUM nourriture_g puis multiplier par prix_nourriture_par_gramme de la race
        ISNULL((
          SELECT SUM(s.nourriture_g)
          FROM statistiques_lot s
          WHERE s.lot_id = l.id ${dateCond}
        ), 0) * r.prix_nourriture_par_gramme AS cout_nourriture_total,

        -- Poids cumulé
        ISNULL((
          SELECT SUM(s.poids_g)
          FROM statistiques_lot s
          WHERE s.lot_id = l.id ${dateCond}
        ), 0) AS poids_cumule_g,

        -- Nombre akoho à vendre = vivants si au moins une semaine >0 avec poids=0
        CASE WHEN EXISTS (
          SELECT 1 FROM statistiques_lot s
          WHERE s.lot_id = l.id AND s.poids_g = 0 AND s.semaine > 0 ${dateCond}
        ) THEN (l.nombre_initial - l.nombre_morts) ELSE 0 END AS nombre_akoho_a_vendre,

        -- Prix vente total akoho
        CASE WHEN EXISTS (
          SELECT 1 FROM statistiques_lot s
          WHERE s.lot_id = l.id AND s.poids_g = 0 AND s.semaine > 0 ${dateCond}
        ) THEN (l.nombre_initial - l.nombre_morts) * r.prix_unitaire_akoho ELSE 0 END AS revenu_vente_akoho,

        -- Revenu total oeufs à vendre
        ISNULL((
          SELECT SUM((o.nombre_oeufs - o.nombre_oeufs_morts))
          FROM oeufs o
          WHERE o.lot_id = l.id AND o.type = 'vendre' ${oeufDateCond}
        ), 0) * r.prix_unitaire_oeuf AS revenu_oeufs,

        -- Perte liée aux morts
        (l.nombre_morts * r.prix_unitaire_akoho) AS cout_morts

      FROM lots l
      JOIN races r ON r.id = l.race_id
      WHERE 1=1 ${lotCond}
      ORDER BY l.date_creation DESC
    `;

    const reqDb = pool.request();
    if (dateFilter) reqDb.input('date', sql.Date, dateFilter);
    if (lotFilter) reqDb.input('lot_id', sql.Int, lotFilter);

    const result = await reqDb.query(query);
    const lots = result.recordset;

    // Calcul bénéfice / perte pour chaque lot
    const lotsAvecBilan = lots.map(lot => {
      const revenu_total = parseFloat(lot.revenu_vente_akoho) + parseFloat(lot.revenu_oeufs);
      const cout_total = parseFloat(lot.cout_achat_total) + parseFloat(lot.cout_nourriture_total);
      const benefice_brut = revenu_total - cout_total;
      const resultat_net = benefice_brut - parseFloat(lot.cout_morts);
      return {
        ...lot,
        revenu_total,
        cout_total,
        benefice_brut,
        resultat_net,
        est_benefice: resultat_net >= 0,
      };
    });

    // Totaux globaux
    const totalBenefice = lotsAvecBilan
      .filter(l => l.resultat_net >= 0)
      .reduce((acc, l) => acc + l.resultat_net, 0);
    const totalPerte = lotsAvecBilan
      .filter(l => l.resultat_net < 0)
      .reduce((acc, l) => acc + Math.abs(l.resultat_net), 0);
    const resultatNetGlobal = totalBenefice - totalPerte;

    res.json({
      lots: lotsAvecBilan,
      totaux: {
        benefice_total: totalBenefice,
        perte_totale: totalPerte,
        resultat_net_global: resultatNetGlobal,
        date_filtre: dateFilter || 'toutes les dates',
      }
    });
  } catch (err) { next(err); }
});

module.exports = router;
