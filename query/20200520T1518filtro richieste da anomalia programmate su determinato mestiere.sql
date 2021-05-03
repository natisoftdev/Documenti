select idrich from richieste 
where (
			(
				SELECT TOP 1 1
				FROM 
					AnomalieOrdiniProgrammati AS anomalie 
					INNER JOIN
					tblOrdiniProgrammati AS prg 
					ON anomalie.IdCommessa = prg.IdCommessa AND anomalie.IdAnomalia = prg.IdAnomalia 

					INNER JOIN
					tblAttivitāMestiere AS attivita 
					ON attivita.IdCommessa = prg.IdCommessa AND attivita.IdAttivitāMestiere = prg.IdAttivitāMestiere

					INNER JOIN
					tblComponetiMestiere AS comp 
					ON comp.IdCommessa = attivita.IdCommessa AND comp.IdComponenteMestiere = attivita.IdComponenteMestiere 
					
				WHERE comp.IdMestiere = 2222222
					and anomalie.IdCommessa=richieste.IDCommessa
					and anomalie.NumRichiesta=richieste.NumRichiesta
					and anomalie.AnnoRichiesta=richieste.AnnoRichiesta
			)=1
			
			OR
			
			(
				SELECT TOP 1 1
				FROM 
					AnomalieOrdiniProgrammati AS anomalie 
					INNER JOIN
					tblOrdiniPrgComp AS prg 
					ON anomalie.IdCommessa = prg.IdCommessa AND anomalie.IdAnomalia = prg.IdAnomalia 

					INNER JOIN
					tblAttivitāMestiere AS attivita 
					ON attivita.IdCommessa = prg.IdCommessa AND attivita.IdAttivitāMestiere = prg.IdAttivitāMestiere

					INNER JOIN
					tblComponetiMestiere AS comp 
					ON comp.IdCommessa = attivita.IdCommessa AND comp.IdComponenteMestiere = attivita.IdComponenteMestiere 
					
				WHERE comp.IdMestiere = 2222222
					and anomalie.IdCommessa=richieste.IDCommessa
					and anomalie.NumRichiesta=richieste.NumRichiesta
					and anomalie.AnnoRichiesta=richieste.AnnoRichiesta
			)=1
	)
	