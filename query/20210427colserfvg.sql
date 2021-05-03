use mpnet_colser_regionefvg

declare @IdCommessa int = 2
declare @IdOfferta int = 11
declare @DaIdEdificio int = 285
declare @AIdEdificio int = 286
declare @MesiErogContratto float = 7
declare @DataInizioErogazione datetime = '20211216'
declare @DataFineErogazione datetime = '20251201'
declare @MesiErogazioneAnno int = null
declare @MesiErogazioneAnnoF float = 8.25
declare @DataInizio datetime = '20210701'
declare @DataFine datetime = '20230731'
declare @Durata int = 26
declare @DurataF float = 24.5


UPDATE    SopralluogoPDI
SET              
	Durata = @Durata
	,DataFine = @DataFine

FROM         tblComponetiMestiere INNER JOIN
                      TipiComponentiMestieri ON tblComponetiMestiere.IdCommessa = TipiComponentiMestieri.IdCommessa AND
                      tblComponetiMestiere.IdComponenteMestiere = TipiComponentiMestieri.IdComponenteMestiere INNER JOIN
                      SopralluogoPDI ON TipiComponentiMestieri.IdCommessa = SopralluogoPDI.IdCommessaEdificio AND
                      TipiComponentiMestieri.IdCommessa = SopralluogoPDI.IdCommessaTipoComp AND
                      TipiComponentiMestieri.IdTipoComponenteMestiere = SopralluogoPDI.IdTipoComp
WHERE     
(SopralluogoPDI.IdCommessaOfferta = @IdCommessa) 
AND (SopralluogoPDI.IdOfferta = @IdOfferta) 
AND (SopralluogoPDI.IdEdificio BETWEEN @DaIdEdificio AND @AIdEdificio)
AND  (tblComponetiMestiere.IdMestiere IN (5,12))


UPDATE    OfferteEdificiMestieri
SET              
	Durata = @Durata
	,DataFine = @DataFine

WHERE     (IdCommessaEdificio = @IdCommessa) AND (IdOfferta = @IdOfferta)
AND (IdEdificio BETWEEN @DaIdEdificio AND @AIdEdificio) 
AND (IdMestiere IN (5,12))

--
--

SELECT
IdTipoComp
,IdTipoComponenteMestiere
,IdMestiere
,SopralluogoPDI.MesiErogContratto
,SopralluogoPDI.DataFine
,SopralluogoPDI.DataInizioErogazione
,SopralluogoPDI.DataFineErogazione
, SopralluogoPDI.MesiErogazioneAnno
, SopralluogoPDI.MesiErogazioneAnnoF
, SopralluogoPDI.DataInizio
, SopralluogoPDI.DataFine
, SopralluogoPDI.Durata
, SopralluogoPDI.DurataF
FROM tblComponetiMestiere INNER JOIN TipiComponentiMestieri ON tblComponetiMestiere.IdCommessa = TipiComponentiMestieri.IdCommessa AND tblComponetiMestiere.IdComponenteMestiere = TipiComponentiMestieri.IdComponenteMestiere INNER JOIN SopralluogoPDI ON TipiComponentiMestieri.IdCommessa = SopralluogoPDI.IdCommessaEdificio AND TipiComponentiMestieri.IdCommessa = SopralluogoPDI.IdCommessaTipoComp AND TipiComponentiMestieri.IdTipoComponenteMestiere = SopralluogoPDI.IdTipoComp
WHERE 
SopralluogoPDI.IdCommessaOfferta=@IdCommessa 
AND SopralluogoPDI.IdOfferta=@IdOfferta 
AND (SopralluogoPDI.IdEdificio BETWEEN @DaIdEdificio AND @AIdEdificio)
AND  tblComponetiMestiere.IdMestiere in (5,12)



SELECT  
MesiErogContratto, 
DataInizio, 
DataFine,
Durata,
DurataF
FROM OfferteEdificiMestieri
WHERE     
(IdCommessaEdificio = @IdCommessa) 
AND (IdOfferta = @IdOfferta)
AND (IdEdificio BETWEEN @DaIdEdificio AND @AIdEdificio) 
AND (IdMestiere IN (5,12))
