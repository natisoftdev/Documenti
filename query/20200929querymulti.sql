use mpnet_build_fsi
select *
from Costi
where IdCommessa = 47
and Descrizione like '%testi sergio%'

SELECT DISTINCT 
	tblContrattiFornitoriAttivitàMestiereEdifici.IdContrattoFornitore
FROM  	tblContrattiFornitoriAttivitàMestiereEdifici 
INNER JOIN
    Ordini ON tblContrattiFornitoriAttivitàMestiereEdifici.IdCommessa = Ordini.IDCommessa 
	AND tblContrattiFornitoriAttivitàMestiereEdifici.IdEdificio = Ordini.CodEdificio
INNER JOIN
    tblContrattiFornitori ON tblContrattiFornitoriAttivitàMestiereEdifici.IdCommessa = tblContrattiFornitori.IdCommessa 
	AND tblContrattiFornitoriAttivitàMestiereEdifici.IdContrattoFornitore = tblContrattiFornitori.IdContrattoFornitore
WHERE 	Ordini.IDCommessa = 47 
AND 	Ordini.NumOrdine = 780 
AND 	Ordini.AnnoOrdine = 2020
AND (CAST(GETDATE() AS date) BETWEEN tblContrattiFornitori.DataInizio AND tblContrattiFornitori.DataFine)

SELECT DISTINCT 
Ordini.*
,Ordini.Assegnazione AS IdDitta
FROM      
Ordini
WHERE    
Ordini.IDCommessa = 47
AND Ordini.NumOrdine = 780
AND Ordini.AnnoOrdine = 2020


SELECT DISTINCT
PresenzaIntervento.IDPres AS IdPresenza, PresenzaIntervento.DalleEffetiva, PresenzaIntervento.AlleEffetiva, PresenzaIntervento.DataEffetiva
,TariffeFasce2Ruolo2.ID AS IdTariffaFascia
,ScontiFornitore.IdPrezzo, ScontiFornitore.IdContrattoFornitore, ScontiFornitore.Sconto, ScontiFornitore.Id AS IdScontoFornitore
,Risorse.NOME AS Risorsa
,abs(datediff(minute, PresenzaIntervento.AlleEffetiva, PresenzaIntervento.DalleEffetiva))/60.00 AS diffOre
FROM  
Risorse 
	
INNER JOIN
PresenzaIntervento 
ON Risorse.ID = PresenzaIntervento.IDop 
	
INNER JOIN
Ruolo_Storico 
ON Risorse.ID = Ruolo_Storico.ID_Risorsa 
AND  cast(PresenzaIntervento.DalleEffetiva as time) >=  cast(Ruolo_Storico.Data_Inizio as time) AND  cast(PresenzaIntervento.AlleEffetiva as time) <=  cast(Ruolo_Storico.Data_Fine as time) 
	
INNER JOIN
(
SELECT 
ID, IdCommessa, IdRuolo, DataInizio, DataFine, OraInizio, OraFine, RegolaApproxInizio, RegolaApproxFine, CONVERT(time, OraInizio, 108) AS OraInizioConv, CONVERT(time, OraFine, 108) AS OraFineConv
,DATEADD(day, DATEDIFF(day, 0, DataInizio), OraInizio) AS DataInizioConv, DATEADD(day, DATEDIFF(day, 0, DataFine), OraFine) AS DataFineConv
FROM   
TariffeFasce2Ruolo
) AS TariffeFasce2Ruolo2 
ON PresenzaIntervento.IdCommessa = TariffeFasce2Ruolo2.IdCommessa AND Ruolo_Storico.ID_RuoloTipo = TariffeFasce2Ruolo2.IdRuolo 
--AND cast(PresenzaIntervento.DalleEffetiva as date) BETWEEN cast(TariffeFasce2Ruolo2.DataInizio as date) AND cast(TariffeFasce2Ruolo2.DataFine as date)  
--AND cast(PresenzaIntervento.AlleEffetiva as date) BETWEEN cast(TariffeFasce2Ruolo2.DataInizio as date) AND cast(TariffeFasce2Ruolo2.DataFine as date)    
AND cast(PresenzaIntervento.DataEffetiva as date) BETWEEN cast(TariffeFasce2Ruolo2.DataInizio as date) AND cast(TariffeFasce2Ruolo2.DataFine as date)    
AND cast(PresenzaIntervento.DalleEffetiva as time) BETWEEN OraInizioConv AND OraFineConv 
		
INNER JOIN
ScontiFornitore 
ON TariffeFasce2Ruolo2.ID = ScontiFornitore.IdTariffeFasce2Ruolo 
			   
WHERE 
PresenzaIntervento.IdCommessa = 47
AND PresenzaIntervento.NumOrdine = 780
AND PresenzaIntervento.AnnoOrdine = 2020
AND Risorse.CodDitta = 5
AND ScontiFornitore.IdContrattoFornitore = 493
AND PresenzaIntervento.AlleEffetiva IS NOT NULL
AND PresenzaIntervento.DalleEffetiva IS NOT NULL

SELECT ElencoPrezziInCommessa.*
FROM  
ScontiFornitore 
INNER JOIN
ElencoPrezziInCommessa ON ScontiFornitore.IdCommessa = ElencoPrezziInCommessa.IdCommessa AND ScontiFornitore.IdPrezzo = ElencoPrezziInCommessa.IdPrezzo
WHERE 
ScontiFornitore.Id = 493

SELECT DISTINCT 
TariffeFasce2Ruolo.ID, Ruolo_Tipi.Descrizione AS Ruolo, TariffeFasce2Ruolo.IdRuolo, TariffeFasce2Ruolo.DataInizio, TariffeFasce2Ruolo.DataFine, TariffeFasce2Ruolo.OraInizio, TariffeFasce2Ruolo.OraFine, TariffeFasce2Ruolo.RegolaApproxInizio, TariffeFasce2Ruolo.RegolaApproxFine
,TariffeFasce2Ruolo.IdTariffeFasce2RuoloCopia
,CommesseCopia.IdCommessa AS IdCommesseCopia, CommesseCopia.DesComm AS CommesseCopia
FROM  
TariffeFasce2Ruolo 
INNER JOIN
Ruolo_Tipi ON TariffeFasce2Ruolo.IdRuolo = Ruolo_Tipi.ID
	
LEFT OUTER JOIN	
TariffeFasce2Ruolo AS TariffeFasce2Ruolo_Copia ON TariffeFasce2Ruolo.IdTariffeFasce2RuoloCopia = TariffeFasce2Ruolo_Copia.ID 
LEFT OUTER JOIN	
Commesse AS CommesseCopia ON TariffeFasce2Ruolo_Copia.IdCommessa = CommesseCopia.IDCommessa	
WHERE 
TariffeFasce2Ruolo.IdCommessa = 47

SELECT     ElencoPrezziInCommessa.IdCommessa, ElencoPrezziInCommessa.IdPrezzo, ElencoPrezziInCommessa.Cod, ElencoPrezziInCommessa.Descrizione, 
ElencoPrezziInCommessa.UM, ElencoPrezziInCommessa.PzUnitario, ElencoPrezziInCommessa.DataModifica, ElencoPrezziInCommessa.Gruppo, 
ElencoPrezziInCommessa.Titolo, ElencoPrezziInCommessa.DescrEstesa, ElencoPrezziInCommessa.Prezziario, ElencoPrezziInCommessa.DataInizio,
ElencoPrezziInCommessa.DataFine, ElencoPrezziInCommessa.TipoPrezzo, 
ScontiGestore.Sconto, ScontiGestore.IdTariffeFasce2Ruolo, ScontiGestore.Id AS IdScontiGestore
FROM 
ElencoPrezziInCommessa 
INNER JOIN ScontiGestore ON ElencoPrezziInCommessa.IdCommessa = ScontiGestore.IdCommessa AND ElencoPrezziInCommessa.IdPrezzo = ScontiGestore.IdPrezzo AND ScontiGestore.IdPgContratto = 251
WHERE 
(ElencoPrezziInCommessa.IdCommessa = 47)  AND (ElencoPrezziInCommessa.Sostituito=0 OR ElencoPrezziInCommessa.Sostituito IS NULL)