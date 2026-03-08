-- ============================================================
-- MIGRATION SQL - Ajout des nouveaux champs et tables
-- Exécuter ce script sur la base AkohoDB existante
-- ============================================================

USE AkohoDB;
GO

-- ============================================================
-- 1. Ajouter colonne prix_poussins à la table races
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('races') AND name = 'prix_poussins')
BEGIN
    ALTER TABLE races ADD prix_poussins DECIMAL(18,2) NOT NULL DEFAULT 0;
    PRINT 'Colonne prix_poussins ajoutée à races';
END
ELSE
    PRINT 'Colonne prix_poussins existe déjà';
GO

-- ============================================================
-- 2. Ajouter colonne date_sortie à la table lots
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('lots') AND name = 'date_sortie')
BEGIN
    ALTER TABLE lots ADD date_sortie DATE NULL;
    PRINT 'Colonne date_sortie ajoutée à lots';
END
ELSE
    PRINT 'Colonne date_sortie existe déjà';
GO

-- ============================================================
-- 3. Créer la table ventes_poulet
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ventes_poulet')
BEGIN
    CREATE TABLE ventes_poulet (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        lot_id          INT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
        date_vente      DATE NOT NULL,
        nombre_vendus   INT NOT NULL,
        montant_total   DECIMAL(18,2) NOT NULL,
        created_at      DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table ventes_poulet créée';
END
ELSE
    PRINT 'Table ventes_poulet existe déjà';
GO

-- ============================================================
-- 4. Créer la table ventes_oeuf
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ventes_oeuf')
BEGIN
    CREATE TABLE ventes_oeuf (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        oeuf_id         INT NOT NULL REFERENCES oeufs(id) ON DELETE CASCADE,
        date_vente      DATE NOT NULL,
        nombre_vendus   INT NOT NULL,
        montant_total   DECIMAL(18,2) NOT NULL,
        created_at      DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table ventes_oeuf créée';
END
ELSE
    PRINT 'Table ventes_oeuf existe déjà';
GO

-- ============================================================
-- Vérification finale
-- ============================================================
PRINT '--- Vérification des tables ---';
SELECT 'races' AS [Table], COUNT(*) AS [Colonnes] FROM sys.columns WHERE object_id = OBJECT_ID('races')
UNION ALL
SELECT 'lots', COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID('lots')
UNION ALL
SELECT 'ventes_poulet', COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID('ventes_poulet')
UNION ALL
SELECT 'ventes_oeuf', COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID('ventes_oeuf');

PRINT 'Migration terminée avec succès!';
GO
