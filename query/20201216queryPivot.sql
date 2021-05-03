declare @counter int;
declare @maxcounter int;
set @counter = 1;
set @maxcounter = (select count(*)
from
(SELECT   distinct  ElencoEdifici.ID
FROM            ElencoEdifici INNER JOIN
                         OfferteEdificiMestieri ON ElencoEdifici.IdCommessa = OfferteEdificiMestieri.IdCommessaEdificio AND ElencoEdifici.ID = OfferteEdificiMestieri.IdEdificio INNER JOIN
                         CategorieLocalizzazioni ON ElencoEdifici.IdCategoria = CategorieLocalizzazioni.Id AND ElencoEdifici.IdCommessa = CategorieLocalizzazioni.IdCommessa LEFT OUTER JOIN
                         tblPgPropietari ON ElencoEdifici.IdProprietario = tblPgPropietari.IdPropietario
WHERE        (OfferteEdificiMestieri.IdCommessaOfferta = 1) AND (OfferteEdificiMestieri.IdOfferta = 0)
) as tttt);


select *
from
(
--select codice,
--QTA

--from
--(select distinct
--'' as IdEdificio,
--CASE
--WHEN LEN(TipiComponentiMestieri.Codice) > 3 THEN SUBSTRING(TipiComponentiMestieri.Codice, 5, 6)
--ELSE TipiComponentiMestieri.Codice
--END AS Codice,
--0 AS QTA /*
--SUBSTRING(TipiComponentiMestieri.Codice, 4, 6) AS ExtractString, TipiComponentiMestieri.Codice*/
--from tblComponetiMestiere INNER JOIN TipiComponentiMestieri ON tblComponetiMestiere.IdCommessa = TipiComponentiMestieri.IdCommessa
--AND TipiComponentiMestieri.IdCommessa = 1
--AND tblComponetiMestiere.IdComponenteMestiere = TipiComponentiMestieri.IdComponenteMestiere and TipiComponentiMestieri.Codice is not NULL

--UNION

SELECT
IdEdificio,
CASE
    WHEN LEN(TipiComponentiMestieri.Codice) > 3 THEN SUBSTRING(TipiComponentiMestieri.Codice, 5, 6)
ELSE TipiComponentiMestieri.Codice
END AS Codice,
ISNULL(SopralluogoPDI.QTA,'') AS QTA
FROM            tblComponetiMestiere
right JOIN TipiComponentiMestieri ON tblComponetiMestiere.IdCommessa = TipiComponentiMestieri.IdCommessa AND
                         tblComponetiMestiere.IdComponenteMestiere = TipiComponentiMestieri.IdComponenteMestiere
LEFT JOIN SopralluogoPDI ON TipiComponentiMestieri.IdTipoComponenteMestiere = SopralluogoPDI.IdTipoComp AND TipiComponentiMestieri.IdCommessa = SopralluogoPDI.IdCommessaTipoComp

WHERE        (tblComponetiMestiere.IdCommessa = 1) /*AND (tblComponetiMestiere.IdMestiere = 5)*/ AND (TipiComponentiMestieri.FattoreLight <> 0 OR
                         TipiComponentiMestieri.FattoreLight IS NULL)
AND (SopralluogoPDI.IdEdificio in (SELECT   distinct  ElencoEdifici.ID
FROM            ElencoEdifici INNER JOIN
                         OfferteEdificiMestieri ON ElencoEdifici.IdCommessa = OfferteEdificiMestieri.IdCommessaEdificio AND ElencoEdifici.ID = OfferteEdificiMestieri.IdEdificio INNER JOIN
                         CategorieLocalizzazioni ON ElencoEdifici.IdCategoria = CategorieLocalizzazioni.Id AND ElencoEdifici.IdCommessa = CategorieLocalizzazioni.IdCommessa LEFT OUTER JOIN
                         tblPgPropietari ON ElencoEdifici.IdProprietario = tblPgPropietari.IdPropietario
WHERE        (OfferteEdificiMestieri.IdCommessaOfferta = 1) AND (OfferteEdificiMestieri.IdOfferta = 0)))
AND (tblComponetiMestiere.codice not like '%P%')
--) as x
--group by codice
) as sourceTable

PIVOT (
SUM(qta) FOR codice IN (
[A1],
[A2],
[A3],
[A4],
[B1],
[B2],
[B3],
[B4],
[B5],
[B6],
[C1],
[C10],
[C11],
[C12],
[C13],
[C14],
[C2],
[C3],
[C4],
[C5],
[C6],
[C7],
[C8],
[C9],
[D1],
[D2],
[D3],
[D4],
[D5],
[E1],
[E2],
[E3],
[E4],
[F1],
[F2],
[G1],
[G10],
[G11],
[G12],
[G13],
[G14],
[G15],
[G2],
[G3],
[G4],
[G5],
[G6],
[G7],
[G8],
[G9]
)
) as pivotTable


--ORDER BY Codice



/*
select distinct
CASE
    WHEN LEN(TipiComponentiMestieri.Codice) > 3 THEN SUBSTRING(TipiComponentiMestieri.Codice, 5, 6)
ELSE TipiComponentiMestieri.Codice
END AS Codice
from TipiComponentiMestieri
where IdCommessa = 1
and codice not like '%P%'*/

--select count(*)
--from
--(SELECT   distinct  ElencoEdifici.ID
--FROM            ElencoEdifici INNER JOIN
--                         OfferteEdificiMestieri ON ElencoEdifici.IdCommessa = OfferteEdificiMestieri.IdCommessaEdificio AND ElencoEdifici.ID = OfferteEdificiMestieri.IdEdificio INNER JOIN
--                         CategorieLocalizzazioni ON ElencoEdifici.IdCategoria = CategorieLocalizzazioni.Id AND ElencoEdifici.IdCommessa = CategorieLocalizzazioni.IdCommessa LEFT OUTER JOIN
--                         tblPgPropietari ON ElencoEdifici.IdProprietario = tblPgPropietari.IdPropietario
--WHERE        (OfferteEdificiMestieri.IdCommessaOfferta = 1) AND (OfferteEdificiMestieri.IdOfferta = 0)
--) as tttt






SELECT   distinct      ElencoEdifici.Codice, CategorieLocalizzazioni.Categoria
FROM            ElencoEdifici INNER JOIN
                         OfferteEdificiMestieri ON ElencoEdifici.IdCommessa = OfferteEdificiMestieri.IdCommessaEdificio AND ElencoEdifici.ID = OfferteEdificiMestieri.IdEdificio INNER JOIN
                         CategorieLocalizzazioni ON ElencoEdifici.IdCategoria = CategorieLocalizzazioni.Id AND ElencoEdifici.IdCommessa = CategorieLocalizzazioni.IdCommessa LEFT OUTER JOIN
                         tblPgPropietari ON ElencoEdifici.IdProprietario = tblPgPropietari.IdPropietario
WHERE        (OfferteEdificiMestieri.IdCommessaOfferta = 1) AND (OfferteEdificiMestieri.IdOfferta = 0)
ORDER BY ElencoEdifici.Codice, CategorieLocalizzazioni.Categoria