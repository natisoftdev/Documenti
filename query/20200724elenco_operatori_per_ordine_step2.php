<?php

$andCheckAltreAssegnazioni = "";

if ( !$_POST[chkMostraOperatoriAssegnati] )
	$andCheckAltreAssegnazioni = <<< andCheckAltreAssegnazioni
			AND (
						SELECT TOP 1 1
						FROM Ordini
						WHERE IdOrd<>$IdOrdine 
						AND IdCommessa=$IdCommessa
						AND IdRisorsa=Risorse.ID
						AND (StatoOrd<50 OR StatoOrd=60)
						AND ISNULL(DataInizio, DataOraInizioTeorica)<='$DataOraFinePrev' 
						AND ISNULL(DataFine, DataOraDisponibilitaTeorica)>='$DataOraInizioPrev'
					) IS NULL	
andCheckAltreAssegnazioni;

$sql = <<< sql
	SELECT     Ditte.Ditta, Risorse.ID, Risorse.NOME, 
			
			turni.Data DataTurno,
			
			orari.Ora1, orari.Ora2
			
	FROM Risorse INNER JOIN Ditte ON Risorse.CodDitta = Ditte.IDDitta 
		INNER JOIN EN_TurniRisorse AS turni  ON turni.IdRisorsa=Risorse.ID
		INNER JOIN EN_TurniRisorseOrari AS orari ON turni.ID = orari.IdTurnoRisorsa
	WHERE isnull(turni.Assenza,0)=0
		AND Ditte.IDDitta=$Assegnazione
		AND turni.Data='$DataInizioPrev'
		AND orari.ora1<='$OraInizioPrev'
		AND orari.ora2>='$OraInizioPrev'
		AND (select top 1 1 from RisorseEdifici where IdRisorsa=Risorse.ID and IdCommessa=$IdCommessa and IdEdificio=$IdEdificio)=1
		$andCheckAltreAssegnazioni
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
					AND tblContrattiFornitori.IdCommessa=$IdCommessa
			)=1
			
	ORDER BY Risorse.NOME
sql;

$query = ntxQuery($sql);

?>