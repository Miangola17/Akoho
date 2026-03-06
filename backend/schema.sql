-- ============================================================
-- SCHEMA SQL Server pour la gestion de AKOHO (poulets)
-- ============================================================

CREATE DATABASE AkohoDB;
GO

USE AkohoDB;
GO

-- ============================================================
-- TABLE : races
-- Définit chaque race de poulet avec ses prix unitaires
-- ============================================================
CREATE TABLE races (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    nom          NVARCHAR(100) NOT NULL UNIQUE,
    prix_unitaire_akoho       DECIMAL(18,2) NOT NULL,  -- prix de vente d'un poulet
    prix_unitaire_oeuf        DECIMAL(18,2) NOT NULL,  -- prix de vente d'un oeuf
    prix_nourriture_par_gramme DECIMAL(18,4) NOT NULL, -- coût nourriture par gramme
    created_at   DATETIME2 DEFAULT GETDATE()
);

-- ============================================================
-- TABLE : lots
-- Un lot = groupe de poulets de même race et même âge
-- ============================================================
CREATE TABLE lots (
    id                   INT IDENTITY(1,1) PRIMARY KEY,
    nom                  NVARCHAR(100) NOT NULL,
    race_id              INT NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    date_creation        DATE NOT NULL,
    nombre_initial       INT NOT NULL,                    -- nombre initial de poulets achetés
    nombre_morts         INT NOT NULL DEFAULT 0,          -- total morts à date
    prix_achat_unitaire  DECIMAL(18,2) NOT NULL,          -- prix d'achat unitaire
    description          NVARCHAR(500) NULL,
    created_at           DATETIME2 DEFAULT GETDATE()
);

-- ============================================================
-- TABLE : statistiques_lot
-- Suivi hebdomadaire du poids et de la nourriture par lot
-- semaine 0 = poids initial uniquement, nourriture=0
-- ============================================================
CREATE TABLE statistiques_lot (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    lot_id       INT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    semaine      INT NOT NULL,             -- numéro de semaine (0,1,2,...)
    date_stat    DATE NOT NULL,            -- date réelle de la mesure
    poids_g      DECIMAL(10,2) DEFAULT 0, -- gain de poids cette semaine (0 pour semaine 0)
    nourriture_g DECIMAL(10,2) DEFAULT 0, -- nourriture consommée cette semaine en grammes
    CONSTRAINT uq_stat UNIQUE (lot_id, semaine)
);

-- ============================================================
-- TABLE : oeufs
-- Gestion du pondement par lot
-- ============================================================
CREATE TABLE oeufs (
    id                 INT IDENTITY(1,1) PRIMARY KEY,
    lot_id             INT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    date_pondement     DATE NOT NULL,
    nombre_oeufs       INT NOT NULL DEFAULT 0,
    nombre_oeufs_morts INT NOT NULL DEFAULT 0,
    type               NVARCHAR(20) NOT NULL CHECK (type IN ('vendre', 'incuber')),
    created_at         DATETIME2 DEFAULT GETDATE()
);

-- ============================================================
-- TABLE : morts_lot
-- Suivi des morts par lot et par date (détail)
-- ============================================================
CREATE TABLE morts_lot (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    lot_id    INT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    date_mort DATE NOT NULL,
    nombre    INT NOT NULL DEFAULT 0
);

-- ============================================================
-- VUES utiles
-- ============================================================

-- Vue : poids cumulé par lot à chaque semaine
CREATE VIEW vue_poids_cumule AS
SELECT
    s.lot_id,
    s.semaine,
    s.date_stat,
    SUM(s.poids_g) OVER (PARTITION BY s.lot_id ORDER BY s.semaine
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS poids_cumule_g
FROM statistiques_lot s;
GO

-- Vue : coût total nourriture par lot
CREATE VIEW vue_cout_nourriture_lot AS
SELECT
    sl.lot_id,
    SUM(sl.nourriture_g) AS total_nourriture_g,
    SUM(sl.nourriture_g) * r.prix_nourriture_par_gramme AS cout_total_nourriture
FROM statistiques_lot sl
JOIN lots l ON l.id = sl.lot_id
JOIN races r ON r.id = l.race_id
GROUP BY sl.lot_id, r.prix_nourriture_par_gramme;
GO

-- Vue : résumé bilan par lot
CREATE VIEW vue_bilan_lot AS
SELECT
    l.id AS lot_id,
    l.nom AS lot_nom,
    r.nom AS race_nom,
    l.nombre_initial,
    l.nombre_morts,
    (l.nombre_initial - l.nombre_morts) AS nombre_vivants,
    l.prix_achat_unitaire,
    (l.nombre_initial * l.prix_achat_unitaire)                           AS cout_achat_total,
    ISNULL(cn.total_nourriture_g, 0)                                      AS total_nourriture_g,
    ISNULL(cn.cout_total_nourriture, 0)                                   AS cout_nourriture_total,
    -- Revenue oeufs à vendre
    ISNULL((
        SELECT SUM((o.nombre_oeufs - o.nombre_oeufs_morts) * r2.prix_unitaire_oeuf)
        FROM oeufs o
        JOIN lots l2 ON l2.id = o.lot_id
        JOIN races r2 ON r2.id = l2.race_id
        WHERE o.lot_id = l.id AND o.type = 'vendre'
    ), 0) AS revenu_oeufs,
    -- Akoho à vendre : ceux dont la semaine courante a poids_g = 0 et semaine > 0
    ISNULL((
        SELECT COUNT(*) * (l.nombre_initial - l.nombre_morts) * r.prix_unitaire_akoho
        FROM statistiques_lot sv
        WHERE sv.lot_id = l.id AND sv.poids_g = 0 AND sv.semaine > 0
    ), 0) AS revenu_vente_akoho
FROM lots l
JOIN races r ON r.id = l.race_id
LEFT JOIN vue_cout_nourriture_lot cn ON cn.lot_id = l.id;
GO
