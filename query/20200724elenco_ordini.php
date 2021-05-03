<?php
$andWhereRichieste = "";

if ( $chkFiltroPerDate && $DataOraInizio!="NULL" ) $andWhereRichieste .= " AND (Richieste.DataInizioP>=$DataOraInizio OR (Richieste.DataInizioP IS NULL AND Richieste.DataRichiesta>=$DataOraInizio)) ";
if ( $chkFiltroPerDate && $DataOraFine!="NULL" ) $andWhereRichieste .= " AND (Richieste.DataInizioP<=$DataOraFine OR (Richieste.DataInizioP IS NULL AND Richieste.DataRichiesta<=$DataOraFine)) ";

if ( $chkFiltroPerPiano && is_numeric($IdEdificio) && is_numeric($IdPiano) ) 
	$andWhereRichieste .= " AND Richieste.Localizzazione=$IdEdificio AND Richieste.IdLivello=$IdPiano ";


$sql = <<< sql
SELECT    CONCAT(Richieste.NumRichiesta, '-', Richieste.AnnoRichiesta)  AS RicTrapN, Richieste.DataRichiesta, Richieste.DataInizioP, 
                      TabellaGradoUrgenza.Descrizione AS GradoUrgenza, Stati.DesStato AS StatoRich, StatiOrdini.DesStato AS StatoOrd, tblUtPersonale.Codice AS CodiceUtente, 
                      tblUtPersonale.Nome AS Utente1, Richieste.PersonaEsteso AS Utente2, Risorse.NOME AS Operatore,  CONCAT(edif1.EdificioBreve, ' - ', 
                      desusopiani1.Destinazione, ' - ', desusoamb1.Destinazione, ' - ',  amb1.CodiceAssAmbiente)  AS LuogoPrelievo, reparti1.Nome AS RepartoPrelievo,  CONCAT(edif2.EdificioBreve, ' - ', 
                      desusopiani2.Destinazione, ' - ', desusoamb2.Destinazione, ' - ',  amb2.CodiceAssAmbiente)  AS LuogoDestinazione, reparti2.Nome AS RepartoDestinazione,
					  Richieste.IdRich,
					  StatiOrdini.IDStato,
					
					Ordini.IdOrd, Ordini.DataInizio, Ordini.DataPresaInCarico, Ordini.DataAssegnazioneRisorsa
					  
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
		AND dbo.SoloData(Richieste.DataInizioP) = dbo.DataOggi()
		AND Richieste.IDCommessa=$IdCommessa
		AND Ordini.StatoOrd=35
		$andWhereRichieste
	ORDER BY Richieste.DataInizioP
sql;

// aggiunto riga 50

$query = ntxQuery($sql);

$table = <<< table
	<table class=gridSmall>
		<tr>	
			<th style="position:sticky;top:0;z-index:8">
			<th style="position:sticky;top:0;z-index:8">
			<th style="position:sticky;top:0;z-index:8">Segui
			<th style="position:sticky;top:0;z-index:8">Sel.
			<th style="position:sticky;top:0;z-index:8">Vedi
			<th style="position:sticky;top:0;z-index:8">RicTraspN
			<th style="position:sticky;top:0;z-index:8">DataRicTrasp
			<th style="position:sticky;top:0;z-index:8">DataInizioTrasp Prev
			<th style="position:sticky;top:0;z-index:8">Data Assegnazione Operatore
			<th style="position:sticky;top:0;z-index:8">Data Presa Incarico
			<th style="position:sticky;top:0;z-index:8">DataInizioTrasp Effettivo
			<th style="position:sticky;top:0;z-index:8">Grado Urgenza
			<th style="position:sticky;top:0;z-index:8">Stato
			<th style="position:sticky;top:0;z-index:8">CodiceUtente
			<th style="position:sticky;top:0;z-index:8">Utente
			<th style="position:sticky;top:0;z-index:8">Operatore
			<th style="position:sticky;top:0;z-index:8">Luogo di prelievo
			<th style="position:sticky;top:0;z-index:8">Reparto/Servizio
			<th style="position:sticky;top:0;z-index:8">Luogo di destinazione
			<th style="position:sticky;top:0;z-index:8">Reparto/Servizio
table;

$alternate = false;

$VisualizzaRichieste = explode(",", $_POST[VisualizzaRichieste]);

if ( !is_array($VisualizzaRichieste) ) $VisualizzaRichieste = array();

$SelezionaRichieste = explode(",", $_POST[SelezionaRichieste]);

if ( !is_array($SelezionaRichieste) ) $SelezionaRichieste = array();

$IdRichiestaSelezionata = $_POST[optMappaTipo]=="IdRichiesta" && is_numeric($_POST[optMappaValore]) ? (int)$_POST[optMappaValore] : "";

while( $query && $rs = ntxRecord($query) )
{
	$rs[NumOrdine] = (int)$rs[NumOrdine];
	
	$rs[DataRichiesta] = ntxDateTime($rs[DataRichiesta]);
	$rs[DataInizioP] = ntxDateTime($rs[DataInizioP]);
	
	$rs[DataAssegnazioneRisorsa] = ntxDateTime($rs[DataAssegnazioneRisorsa]);
	$rs[DataPresaInCarico] = ntxDateTime($rs[DataPresaInCarico]);
	$rs[DataInizio] = ntxDateTime($rs[DataInizio]);
	
	$classTr = $alternate ? "class=alternate" : "";
	
	foreach($rs as $k=>$v)
		$html[$k] = htmlentities($v);
	
	$Stato = $html[StatoOrd] ? $html[StatoOrd] : $html[StatoRich];
	$Utente = $html[Utente2] ? $html[Utente2] : $html[Utente1];
	
	$optChecked = $IdRichiestaSelezionata!="" && $rs[IdRich]==$IdRichiestaSelezionata ? "checked" : "";
	$visChecked = !isset($_POST[VisualizzaRichieste]) || in_array($rs[IdRich], $VisualizzaRichieste) ? "checked" : "";
	$selChecked = !isset($_POST[SelezionaRichieste]) || in_array($rs[IdRich], $SelezionaRichieste) ? "checked" : "";
	
	$optColor = $optChecked ? "background:#AAFFAA" : "";
	$selColor = $selChecked ? "background:#AAAAFF" : "";
	
	$img = "folder"; 
	
	if ( $rs[IDStato]<35 )
		$img = "rosso";
	elseif ( $rs[IDStato]==35 )
		$img = "arancio";
	elseif ( $rs[IDStato]==37 )
		$img = "giallo";
	elseif ( $rs[IDStato]==40 )
		$img = "verde";
	elseif ( $rs[IDStato]>=50 && $rs[IDStato]<>60 )
		$img = "accept";
	
	$table .= <<< table
		<tr $classTr>
			<td style="text-align:center"><button onclick="SettaOperatore('$html[IdOrd]')"><img src="img/user.png"></button>
			<td style="text-align:center"><button onclick="Dettaglio('IdRichiesta', $html[IdRich])"><img src="img/exclamation.png"></button>
			<td style="text-align:center;$optColor"><input type=radio name=optMappa Tipo=IdRichiesta Valore=$html[IdRich] $optChecked onclick="Dettaglio('IdRichiesta', $html[IdRich])">
			<td style="text-align:center;$selColor"><input type=checkbox scelta_operatore SelezionaRichiesta=$html[IdRich] $selChecked>
			<td style="text-align:center"><input type=checkbox scelta_operatore VisualizzaRichiesta=$html[IdRich] $visChecked>
			<td>$html[RicTrapN]
			<td>$html[DataRichiesta]
			<td>$html[DataInizioP]
			<td>$html[DataAssegnazioneRisorsa]
			<td>$html[DataPresaInCarico]
			<td>$html[DataInizio]
			<td>$html[GradoUrgenza]
			<td><img src="img/$img.png" />$Stato
			<td>$html[CodiceUtente]
			<td>$Utente
			<td>$html[Operatore]
			<td>$html[LuogoPrelievo]
			<td>$html[RepartoPrelievo]
			<td>$html[LuogoDestinazione]
			<td>$html[RepartoDestinazione]
table;

	$alternate = !$alternate;
}

$table .= "</table>";

$result["richieste-scelta_operatore"] = $table;

?>
