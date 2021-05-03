<?php

$sql = <<< sql
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
	WHERE ordini.IDCommessa=$IdCommessa 
		and ordini.IdOrd=$IdOrdine 
sql;

$rsOrdine = ntxRecord(ntxQuery($sql));

$Assegnazione = $rsOrdine[Assegnazione];
$IdEdificio = $rsOrdine[CodEdificio];
$DataInizioPrev = $rsOrdine[DataInizioPrev];
$OraInizioPrev = $rsOrdine[OraInizioPrev];
$DataOraInizioPrev = $rsOrdine[DataOraInizioPrev];
$DataOraFinePrev = $rsOrdine[DataOraFinePrev];

?>