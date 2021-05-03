SELECT     Commesse.DesComm AS Commessa, 
 ISNULL(CONVERT(VARCHAR(10), DataRichiesta, 103) + ' '  + convert(VARCHAR(8), DataRichiesta, 14),'') as DataRichiesta,
					   ISNULL(CONVERT(VARCHAR(10), DataInizio, 103) + ' '  + convert(VARCHAR(8), DataInizio, 14),'') as DataInizio,
					    ISNULL(CONVERT(VARCHAR(10), DataFine, 103) + ' '  + convert(VARCHAR(8), DataFine, 14),'') as DataFine,
tblPgPropietari.Nome AS Proprietario,  

replace(replace(replace(replace(ISNULL(Richieste.Descrizione,'')+ISNULL(Richieste.Descrizione1,'')+ISNULL(Richieste.Descrizione2,''),CHAR(13)+CHAR(10),''),char(13),''),char(10),''),';',' ') as Descrizione,
ElencoEdifici.Codice, ISNULL(ElencoEdifici.Indirizzo,'') as Indirizzo,  ISNULL(ElencoEdifici.CITTA,'') as CITTA
					 
					 
					  
					  
					 
					 
FROM         ElencoEdifici INNER JOIN
                      Commesse ON ElencoEdifici.IdCommessa = Commesse.IDCommessa INNER JOIN
                      tblPgPropietari ON ElencoEdifici.IdProprietario = tblPgPropietari.IdPropietario INNER JOIN
                      Richieste ON ElencoEdifici.IdCommessa = Richieste.IDCommessa AND ElencoEdifici.ID = Richieste.Localizzazione INNER JOIN
                      Ordini ON ElencoEdifici.IdCommessa = Ordini.IDCommessa AND ElencoEdifici.ID = Ordini.CodEdificio AND Richieste.IDCommessa = Ordini.IDCommessaRichiesta AND
                       Richieste.NumRichiesta = Ordini.NumRichiesta AND Richieste.AnnoRichiesta = Ordini.AnnoRichiesta
					   --where richieste.annorichiesta=2019 
ORDER BY Commessa, Richieste.DataRichiesta, Ordini.DataInizio, Ordini.DataFine, Proprietario, ElencoEdifici.Codice, ElencoEdifici.EdificioBreve