<?php

$sql = <<< sql
	SELECT     Ditte.Ditta, Risorse.ID, Risorse.NOME
			
	FROM Risorse INNER JOIN Ditte ON Risorse.CodDitta = Ditte.IDDitta 
	WHERE   (
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

$table = <<< table
	<table class=gridSmall>
		<tr>	
			<th style="position:sticky;top:0;z-index:8">
			<th style="position:sticky;top:0;z-index:8">Segui
			<th style="position:sticky;top:0;z-index:8">Sel.
			<th style="position:sticky;top:0;z-index:8">Vedi
			<th style="position:sticky;top:0;z-index:8">Id
			<th style="position:sticky;top:0;z-index:8">Squadra
			<th style="position:sticky;top:0;z-index:8">Operatore
			<th style="position:sticky;top:0;z-index:8">Data/Ora
			<th style="position:sticky;top:0;z-index:8">Luogo
			<th style="position:sticky;top:0;z-index:8">Reparto/Servizio
			<th style="position:sticky;top:0;z-index:8">RicTrapN
			<th style="position:sticky;top:0;z-index:8">Ausilio
table;

$alternate = false;

$VisualizzaOperatori = explode(",", $_POST[VisualizzaOperatori]);

if ( !is_array($VisualizzaOperatori) ) $VisualizzaOperatori = array();

$SelezionaOperatori = explode(",", $_POST[SelezionaOperatori]);

if ( !is_array($SelezionaOperatori) ) $SelezionaOperatori = array();

$IdOperatoreSelezionato = $_POST[optMappaTipo]=="IdOperatore" && is_numeric($_POST[optMappaValore]) ? (int)$_POST[optMappaValore] : "";

while( $query && $rs = ntxRecord($query) )
{
	$rs[Data] = ntxDateTimeAndSecond($rs[Data]);
	
	$classTr = $alternate ? "class=alternate" : "";
	
	foreach($rs as $k=>$v)
		$html[$k] = htmlentities($v);
	
	$optChecked = $IdOperatoreSelezionato!="" && $rs[ID]==$IdOperatoreSelezionato ? "checked" : "";
	$visChecked = !isset($_POST[VisualizzaOperatori]) || in_array($rs[ID], $VisualizzaOperatori) ? "checked" : "";
	$selChecked = !isset($_POST[SelezionaOperatori]) || in_array($rs[ID], $SelezionaOperatori) ? "checked" : "";
	
	$optColor = $optChecked ? "background:#AAFFAA" : "";
	$selColor = $selChecked ? "background:#AAAAFF" : "";
	
	$table .= <<< table
		<tr $classTr>
			<td style="text-align:center"><button onclick="Dettaglio('IdOperatore', $html[ID])"><img src="img/exclamation.png"></button>
			<td style="text-align:center;$optColor"><input type=radio name=optMappa Tipo=IdOperatore Valore=$html[ID] $optChecked onclick="Dettaglio('IdOperatore', $html[ID])">
			<td style="text-align:center;$selColor"><input type=checkbox SelezionaOperatore=$html[ID] $selChecked>
			<td style="text-align:center"><input type=checkbox VisualizzaOperatore=$html[ID] $visChecked>
			<td>$html[ID]
			<td>$html[Ditta]
			<td>$html[NOME]
			<td>$html[Data]
			<td>$html[Luogo]
			<td>$html[Reparto]
			<td>$html[RicTrapN]
			<td>$html[Ausilio]
table;

	$alternate = !$alternate;
}

$table .= "</table>";

$result[operatori] = $table;

?>
