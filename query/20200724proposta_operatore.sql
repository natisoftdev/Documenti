#### QUERY 1

SELECT ordini.Assegnazione, ordini.CodEdificio, 
	convert(nvarchar(10), Richieste.DataInizioP, 112) DataInizioPrev, 		
	left(convert(nvarchar(15), Richieste.DataInizioP, 114), 5) OraInizioPrev,
	convert(nvarchar(25), Richieste.DataInizioP, 126 ) DataOraInizioPrev, 
	convert(nvarchar(25), dbo.TttCalcDataFinePrev(IdOrd), 126) DataOraFinePrev
			
FROM Richieste 
	inner join Ordini
	ON Richieste.IDCommessa = Ordini.IDCommessa 
		AND Richieste.NumRichiesta = Ordini.NumRichiesta 
		AND Richieste.AnnoRichiesta = Ordini.AnnoRichiesta
WHERE ordini.IDCommessa= 2 -- idcommessa
	and ordini.IdOrd=625 -- idordine	





#### QUERY 2

SELECT Distinct top 1 IdRisorsa, Risorse.NOME
FROM Ordini inner join StatiOrdini ON StatiOrdini.IDStato=Ordini.StatoOrd
inner join Risorse on Ordini.IdRisorsa = Risorse.id
WHERE IdCommessa=2
AND IdRisorsa IN (
    SELECT     Risorse.ID
	FROM Risorse INNER JOIN Ditte ON Risorse.CodDitta = Ditte.IDDitta 
		INNER JOIN EN_TurniRisorse AS turni  ON turni.IdRisorsa=Risorse.ID
		INNER JOIN EN_TurniRisorseOrari AS orari ON turni.ID = orari.IdTurnoRisorsa
	WHERE isnull(turni.Assenza,0)=0
		AND Ditte.IDDitta=7
		AND turni.Data='20200709'
		AND orari.ora1<='13:10'
		AND orari.ora2>='13:10'
		AND (select top 1 1 from RisorseEdifici where IdRisorsa=Risorse.ID and IdCommessa=2  and IdEdificio=11)=1
		AND (
				SELECT TOP 1 1
				FROM 
					tblContrattiFornitori
					INNER JOIN tblContrattiFornitoriAttivitàMestiereEdifici consistenza
						ON consistenza.IdCommessa=tblContrattiFornitori.IdCommessa
							AND consistenza.IdContrattoFornitore=tblContrattiFornitori.IdContrattoFornitore
					INNER JOIN tblAttivitàMestiere att
						ON consistenza.IdCommessa=att.IdCommessa
							AND consistenza.IdAttivitàMestiere=att.IdAttivitàMestiere
					INNER JOIN tblComponetiMestiere comp
						ON comp.IdCommessa=att.IdCommessa
							AND comp.IdComponenteMestiere=att.IdComponenteMestiere
					INNER JOIN tblMestieri mest
						ON comp.IdCommessa=mest.IdCommessa
							AND comp.IdMestiere=mest.IdMestiere
				WHERE  mest.TPL_TrasportoPazientiELogistica=1
					AND ditte.IDDitta=tblContrattiFornitori.IdFornitore
					AND tblContrattiFornitori.IdCommessa=2
			)=1
	)
AND dbo.SoloData(DataOraInizioTeorica)='20200709'
AND ( DATEADD (minute, -30, '2020-07-09 13:10:00.000') >= DataOraInizioTeorica
OR DATEADD (minute, 30, '2020-07-09 13:10:00.000') <= DataOraInizioTeorica)

-- IdOrd, IdCommessa, IdEdificio, '20200709', '13:10'