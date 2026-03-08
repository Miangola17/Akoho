-- ============================================================
-- INIT SQL -- Akoho Manager
-- Exécuté automatiquement par Docker au premier démarrage
-- Idempotent : ne recrée pas ce qui existe déjà
-- ============================================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AkohoDB')
BEGIN
    CREATE DATABASE AkohoDB;
END
GO

USE AkohoDB;
GO

-- ── TABLE : races ─────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'races')
BEGIN
    CREATE TABLE races (
        id                         INT IDENTITY(1,1) PRIMARY KEY,
        nom                        NVARCHAR(100) NOT NULL UNIQUE,
        prix_unitaire_akoho        DECIMAL(18,2) NOT NULL,
        prix_unitaire_oeuf         DECIMAL(18,2) NOT NULL,
        prix_nourriture_par_gramme DECIMAL(18,4) NOT NULL,
        prix_poussins              DECIMAL(18,2) NOT NULL DEFAULT 0,
        created_at                 DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- ── TABLE : lots ──────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'lots')
BEGIN
    CREATE TABLE lots (
        id                  INT IDENTITY(1,1) PRIMARY KEY,
        nom                 NVARCHAR(100) NOT NULL,
        race_id             INT NOT NULL REFERENCES races(id) ON DELETE CASCADE,
        date_creation       DATE NOT NULL,
        date_sortie         DATE NULL,
        nombre_initial      INT NOT NULL,
        nombre_morts        INT NOT NULL DEFAULT 0,
        prix_achat_unitaire DECIMAL(18,2) NOT NULL,
        description         NVARCHAR(500) NULL,
        created_at          DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- ── TABLE : statistiques_lot ──────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'statistiques_lot')
BEGIN
    CREATE TABLE statistiques_lot (
        id           INT IDENTITY(1,1) PRIMARY KEY,
        lot_id       INT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
        semaine      INT NOT NULL,
        date_stat    DATE NOT NULL,
        poids_g      DECIMAL(10,2) DEFAULT 0,
        nourriture_g DECIMAL(10,2) DEFAULT 0,
        CONSTRAINT uq_stat UNIQUE (lot_id, semaine)
    );
END
GO

-- ── TABLE : oeufs ─────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'oeufs')
BEGIN
    CREATE TABLE oeufs (
        id                 INT IDENTITY(1,1) PRIMARY KEY,
        lot_id             INT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
        date_pondement     DATE NOT NULL,
        nombre_oeufs       INT NOT NULL DEFAULT 0,
        nombre_oeufs_morts INT NOT NULL DEFAULT 0,
        type               NVARCHAR(20) NOT NULL CHECK (type IN ('vendre', 'incuber')),
        created_at         DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- ── TABLE : morts_lot ─────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'morts_lot')
BEGIN
    CREATE TABLE morts_lot (
        id        INT IDENTITY(1,1) PRIMARY KEY,
        lot_id    INT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
        date_mort DATE NOT NULL,
        nombre    INT NOT NULL DEFAULT 0
    );
END
GO
-- ── TABLE : ventes_poulet ────────────────────────
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
END
GO

-- ── TABLE : ventes_oeuf ──────────────────────────
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
END
GO
-- ── VUES ──────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vue_poids_cumule')
BEGIN
    EXEC('
        CREATE VIEW vue_poids_cumule AS
        SELECT
            s.lot_id,
            s.semaine,
            s.date_stat,
            SUM(s.poids_g) OVER (PARTITION BY s.lot_id ORDER BY s.semaine
                                 ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS poids_cumule_g
        FROM statistiques_lot s
    ');
END
GO

IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vue_cout_nourriture_lot')
BEGIN
    EXEC('
        CREATE VIEW vue_cout_nourriture_lot AS
        SELECT
            sl.lot_id,
            SUM(sl.nourriture_g) AS total_nourriture_g,
            SUM(sl.nourriture_g) * r.prix_nourriture_par_gramme AS cout_total_nourriture
        FROM statistiques_lot sl
        JOIN lots l ON l.id = sl.lot_id
        JOIN races r ON r.id = l.race_id
        GROUP BY sl.lot_id, r.prix_nourriture_par_gramme
    ');
END
GO
