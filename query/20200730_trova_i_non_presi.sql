SELECT dbo.DataOggi(), CONCAT(Richieste.NumRichiesta, '-', Richieste.AnnoRichiesta)  AS RicTrapN, Richieste.DataRichiesta, Richieste.DataInizioP, 
                      TabellaGradoUrgenza.Descrizione AS GradoUrgenza, Stati.DesStato AS StatoRich, StatiOrdini.DesStato AS StatoOrd, tblUtPersonale.Codice AS CodiceUtente, 
                      tblUtPersonale.Nome AS Utente1, Richieste.PersonaEsteso AS Utente2, Risorse.NOME AS Operatore,  CONCAT(edif1.EdificioBreve, ' - ', 
                      desusopiani1.Destinazione, ' - ', desusoamb1.Destinazione, ' - ',  amb1.CodiceAssAmbiente)  AS LuogoPrelievo, reparti1.Nome AS RepartoPrelievo,  CONCAT(edif2.EdificioBreve, ' - ', 
                      desusopiani2.Destinazione, ' - ', desusoamb2.Destinazione, ' - ',  amb2.CodiceAssAmbiente)  AS LuogoDestinazione, reparti2.Nome AS RepartoDestinazione,
					  Richieste.IdRich,
					  StatiOrdini.IDStato,
					
					Ordini.IdOrd
					, Ordini.DataInizio
					, Ordini.DataPresaInCarico
					, Ordini.DataAssegnazioneRisorsa
					, tblMestieri.Descrizione as DescrMestiere
					, CAST(Richieste.DataInizioP as TIME) as OraInizioP
					, ordini.Assegnazione, ordini.CodEdificio
					,FORMAT(Richieste.DataInizioP,'yyyy-MM-dd HH:mm:ss')  as dattaaa
					,convert(nvarchar(10), Richieste.DataInizioP, 112) DataInizioPrev, 
					left(convert(nvarchar(15), Richieste.DataInizioP, 114), 5) OraInizioPrev,
					convert(nvarchar(25), Richieste.DataInizioP, 126 ) DataOraInizioPrev, 
					convert(nvarchar(25), dbo.TttCalcDataFinePrev(IdOrd), 126) DataOraFinePrev
					,edif1.ID as IdEdi
					,Ordini.Assegnazione as IdDitta
					,dbo.TttCalcDataFinePrev(IdOrd) as DataOraInizioCorrente
FROM         tblUtUtilizzatori AS reparti1 RIGHT OUTER JOIN
                      Ambiente AS amb2 RIGHT OUTER JOIN
                      tblUtPersonale RIGHT OUTER JOIN
                      Richieste 
					  INNER JOIN
					  tblMestieri ON Richieste.IDCommessa=tblMestieri.IDCommessa AND Richieste.IdMestiere=tblMestieri.IdMestiere
					  INNER JOIN
                      ElencoEdifici AS edif1 ON Richieste.IDCommessa = edif1.IdCommessa AND Richieste.Localizzazione = edif1.ID INNER JOIN
                      TabellaGradoUrgenza ON Richieste.GradoUrgenza = TabellaGradoUrgenza.GradoU AND Richieste.IDCommessa = TabellaGradoUrgenza.IdCommessa INNER JOIN
                      Stati ON Richieste.Stato = Stati.IDStato ON tblUtPersonale.IdCommessa = Richieste.IDCommessa AND 
                      tblUtPersonale.IdPersona = Richieste.IdPersona LEFT OUTER JOIN
                      Ordini LEFT OUTER JOIN
                      Risorse ON Ordini.IdRisorsa = Risorse.ID LEFT OUTER JOIN
                      StatiOrdini ON Ordini.StatoOrd = StatiOrdini.IDStato ON Richieste.IDCommessa = Ordini.IDCommessa AND Richieste.NumRichiesta = Ordini.NumRichiesta AND 
                      Richieste.AnnoRichiesta = Ordini.AnnoRichiesta LEFT OUTER JOIN
                      AusilioPazienti ON Richieste.Ausilio = AusilioPazienti.ID LEFT OUTER JOIN
                      RegimePazienti ON Richieste.Regime = RegimePazienti.ID LEFT OUTER JOIN
                      tblUtUtilizzatori AS reparti2 ON Richieste.IDCommessa = reparti2.IdCommessa AND Richieste.IdUtilizzatore2 = reparti2.IdUtilizzatore ON 
                      amb2.IdCommessa = Richieste.IDCommessa AND amb2.IdEdificio = Richieste.IdEdificio2 AND amb2.IDAmbiente = Richieste.IdAmbiente2 LEFT OUTER JOIN
                      DestinazioniDusoLivello AS desusopiani2 RIGHT OUTER JOIN
                      PianoLivello AS piani2 ON desusopiani2.IdCommessa = piani2.IdCommessa AND desusopiani2.IdDUL = piani2.IdDestUso ON 
                      Richieste.IDCommessa = piani2.IdCommessa AND Richieste.IdEdificio2 = piani2.IdEdificio AND Richieste.IdLivello2 = piani2.idPiano LEFT OUTER JOIN
                      ElencoEdifici AS edif2 ON Richieste.IDCommessa = edif2.IdCommessa AND Richieste.IdEdificio2 = edif2.ID ON reparti1.IdCommessa = Richieste.IDCommessa AND 
                      reparti1.IdUtilizzatore = Richieste.IdUtilizzatore LEFT OUTER JOIN
                      Ambiente AS amb1 ON Richieste.IDCommessa = amb1.IdCommessa AND Richieste.Localizzazione = amb1.IdEdificio AND 
                      Richieste.IdAmbiente = amb1.IDAmbiente LEFT OUTER JOIN
                      DestinazioniDusoLivello AS desusopiani1 RIGHT OUTER JOIN
                      PianoLivello AS piani1 ON desusopiani1.IdCommessa = piani1.IdCommessa AND desusopiani1.IdDUL = piani1.IdDestUso ON 
                      Richieste.IDCommessa = piani1.IdCommessa AND Richieste.Localizzazione = piani1.IdEdificio AND Richieste.IdLivello = piani1.idPiano
			
		LEFT JOIN DestinazioniDuso desusoamb1 ON amb1.IdCommessa = desusoamb1.IdCommessa 
			AND amb1.IdDestinazioneduso = desusoamb1.IdDestinazioneuso
			
		LEFT JOIN DestinazioniDuso desusoamb2 ON amb2.IdCommessa = desusoamb2.IdCommessa 
			AND amb2.IdDestinazioneduso = desusoamb2.IdDestinazioneuso
	WHERE     (tblMestieri.TPL_TrasportoPazientiELogistica = 1)
		AND Richieste.IDCommessa= 2
		AND Ordini.StatoOrd=35
		AND (CAST(Richieste.DataInizioP as date ) =dbo.DataOggi() OR (Richieste.DataInizioP IS NULL AND CAST(Richieste.DataRichiesta as date)=dbo.DataOggi()))
		--AND Richieste.DataInizioP=dbo.DataOggi()
		--AND Ordini.IDRisorsa is null
		and Ordini.DataAssegnazioneRisorsa is not null 
	ORDER BY Richieste.DataInizioP desc