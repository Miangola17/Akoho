export interface BilanLot {
  lot_id: number;
  lot_nom: string;
  race_nom: string;
  date_creation: string;
  nombre_initial: number;
  nombre_morts: number;
  nombre_vivants: number;
  prix_achat_unitaire: number;
  prix_unitaire_akoho: number;
  prix_unitaire_oeuf: number;
  prix_nourriture_par_gramme: number;
  cout_achat_total: number;
  cout_nourriture_total: number;
  poids_cumule_g: number;
  nombre_akoho_a_vendre: number;
  revenu_vente_akoho: number;
  revenu_oeufs: number;
  cout_morts: number;
  // calculés côté API
  revenu_total: number;
  cout_total: number;
  benefice_brut: number;
  resultat_net: number;
  est_benefice: boolean;
}

export interface BilanGlobal {
  lots: BilanLot[];
  totaux: {
    benefice_total: number;
    perte_totale: number;
    resultat_net_global: number;
    date_filtre: string;
  };
}
