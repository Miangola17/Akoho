export interface Lot {
  id: number;
  nom: string;
  race_id: number;
  race_nom?: string;
  date_creation: string;
  date_sortie?: string;
  nombre_initial: number;
  nombre_morts: number;
  prix_achat_unitaire: number;
  description?: string;
  nombre_vivants?: number;
  cout_achat_total?: number;
  prix_unitaire_akoho?: number;
  prix_unitaire_oeuf?: number;
  prix_nourriture_par_gramme?: number;
  prix_poussins?: number;
  created_at?: string;
}
