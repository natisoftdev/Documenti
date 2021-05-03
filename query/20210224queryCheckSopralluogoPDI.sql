set language italian


select distinct --top 1 
SopralluogoPDI.DataInizio
, IdEdificio 
, SopralluogoPDI.Durata
, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0)
, DATEADD(month, SopralluogoPDI.Durata, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0)) as DataFine

, DAY(DATEADD(month, DATEDIFF(month, 0, SopralluogoPDI.DataInizio), 0)) AS InizioMeseInizio
, DAY(SopralluogoPDI.DataInizio) as GiornoInizio 
, DAY(EOMONTH(SopralluogoPDI.DataInizio)) as FineMeseInizio

, MONTH(SopralluogoPDI.DataInizio) as MeseInizio 
, YEAR(SopralluogoPDI.DataInizio) as AnnoInizio 

--, IIF(DAY(EOMONTH(SopralluogoPDI.DataInizio)) = 28, 'x', 'y')
--, IIF(DAY(EOMONTH(SopralluogoPDI.DataInizio)) = 29, 'x', 'y')
--, IIF(DAY(EOMONTH(SopralluogoPDI.DataInizio)) = 30, 'x', 'y')
--, IIF(DAY(EOMONTH(SopralluogoPDI.DataInizio)) = 31, 'x', 'y')


, IIF(DAY(DATEADD(month, DATEDIFF(month, 0, SopralluogoPDI.DataInizio), 0)) < DAY(SopralluogoPDI.DataInizio) AND DAY(SopralluogoPDI.DataInizio) < DAY(EOMONTH(SopralluogoPDI.DataInizio))
, MONTH(DATEADD(month, SopralluogoPDI.Durata, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0)))
, MONTH(DATEADD(day, -1, DATEADD(month, SopralluogoPDI.Durata, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0)))) 
) AS MeseFine
, IIF(DAY(DATEADD(month, DATEDIFF(month, 0, SopralluogoPDI.DataInizio), 0)) < DAY(SopralluogoPDI.DataInizio) AND DAY(SopralluogoPDI.DataInizio) < DAY(EOMONTH(SopralluogoPDI.DataInizio))
, YEAR(DATEADD(month, SopralluogoPDI.Durata, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0)))
, YEAR(DATEADD(day, -1, DATEADD(month, SopralluogoPDI.Durata, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0)))) 
) AS AnnoFine


-- 28 - 2
-- 29 - 2
-- 30 - 4,6,9,11
-- 31 - 1,3,5,7,8,10,12


--, MONTH(DATEADD(month, SopralluogoPDI.Durata, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0))) AS MeseFine 
--, YEAR(DATEADD(month, SopralluogoPDI.Durata, DATEADD(mm, DATEDIFF(mm, 0, SopralluogoPDI.DataInizio), 0))) AS AnnoFine 

, tblMestieri.Idmestiere
, tblMestieri.Descrizione
, ISNULL(MeseErogGen, 0) as MeseErogGen
, ISNULL(MeseErogFeb, 0) as MeseErogFeb
, ISNULL(MeseErogMar, 0) as MeseErogMar
, ISNULL(MeseErogApr, 0) as MeseErogApr
, ISNULL(MeseErogMag, 0) as MeseErogMag
, ISNULL(MeseErogGiu, 0) as MeseErogGiu
, ISNULL(MeseErogLug, 0) as MeseErogLug
, ISNULL(MeseErogAgo, 0) as MeseErogAgo
, ISNULL(MeseErogSet, 0) as MeseErogSet
, ISNULL(MeseErogOtt, 0) as MeseErogOtt
, ISNULL(MeseErogNov, 0) as MeseErogNov
, ISNULL(MeseErogDic, 0) as MeseErogDic 

from SopralluogoPDI left join TipiComponentiMestieri on TipiComponentiMestieri.IdCommessa = SopralluogoPDI.IdCommessaEdificio and TipiComponentiMestieri.IdTipoComponenteMestiere = SopralluogoPDI.IdTipoComp left join tblComponetiMestiere on tblComponetiMestiere.IdCommessa = TipiComponentiMestieri.IdCommessa and TipiComponentiMestieri.IdComponenteMestiere = tblComponetiMestiere.IdComponenteMestiere left join tblMestieri on tblMestieri.IdCommessa = tblComponetiMestiere.IdCommessa and tblComponetiMestiere.IdMestiere = tblMestieri.IdMestiere 

where 

IdCommessaEdificio = 1 
and IdOfferta = 2
--and IdEdificio = 126 
--and tblMestieri.IdMestiere = 5

order by IdEdificio, tblMestieri.IdMestiere


