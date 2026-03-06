export interface StatistiqueLot {
  id: number;
  lot_id: number;
  semaine: number;
  date_stat: string;
  poids_g: number;
  nourriture_g: number;
  poids_cumule_g?: number;
  nourriture_cumule_g?: number;
}
