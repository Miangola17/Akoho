export interface Oeuf {
  id: number;
  lot_id: number;
  lot_nom?: string;
  date_pondement: string;
  nombre_oeufs: number;
  nombre_oeufs_morts: number;
  type: 'vendre' | 'incuber';
  nombre_oeufs_bons?: number;
  revenu_oeufs?: number;
  prix_unitaire_oeuf?: number;
}
