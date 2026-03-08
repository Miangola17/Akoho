export interface VentePoulet {
  id: number;
  lot_id: number;
  lot_nom?: string;
  race_nom?: string;
  date_vente: string;
  nombre_vendus: number;
  montant_total: number;
  created_at?: string;
}

export interface VenteOeuf {
  id: number;
  oeuf_id: number;
  lot_id?: number;
  lot_nom?: string;
  date_pondement?: string;
  date_vente: string;
  nombre_vendus: number;
  montant_total: number;
  created_at?: string;
}

export interface ResumeVentes {
  date: string;
  poulets: {
    nombre_vendus: number;
    montant_total: number;
  };
  oeufs: {
    nombre_vendus: number;
    montant_total: number;
  };
  montant_total_jour: number;
}

export interface EstimationLot {
  lot_id: number;
  lot_nom: string;
  race_nom: string;
  nombre_vivants: number;
  prix_unitaire_akoho: number;
  estimation_vente: number;
  poids_moyen_g: number;
}

export interface EstimationOeuf {
  oeuf_id: number;
  lot_nom: string;
  date_pondement: string;
  nombre_oeufs_bons: number;
  prix_unitaire_oeuf: number;
  estimation_vente: number;
}

export interface Estimation {
  date_estimation: string;
  poulets: {
    lots: EstimationLot[];
    total_estimation: number;
  };
  oeufs: {
    entries: EstimationOeuf[];
    total_estimation: number;
  };
  total_estimation_global: number;
}
