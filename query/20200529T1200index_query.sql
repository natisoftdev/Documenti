SET ANSI_NULLS ON
<LupdateGO>
SET QUOTED_IDENTIFIER ON
<LupdateGO>    

CREATE NONCLUSTERED INDEX [_dta_index_Contabilit‡_5_549576996__K2_K3_K1_K6] ON [dbo].[Contabilit‡]
(
	[NumOrdine] ASC,
	[AnnoOrdine] ASC,
	[IDCommessa] ASC,
	[DataContabilit‡] ASC
)WITH (SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
<LupdateGO>

CREATE NONCLUSTERED INDEX [_dta_index_Contabilit‡_5_549576996__K1_K6_K2_K3] ON [dbo].[Contabilit‡]
(
	[IDCommessa] ASC,
	[DataContabilit‡] ASC,
	[NumOrdine] ASC,
	[AnnoOrdine] ASC
)WITH (SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
<LupdateGO>

CREATE NONCLUSTERED INDEX [_dta_index_Ordini_5_466100701__K1_K42_K43_K44] ON [dbo].[Ordini]
(
	[IDCommessa] ASC,
	[IDCommessaRichiesta] ASC,
	[NumRichiesta] ASC,
	[AnnoRichiesta] ASC
)WITH (SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
<LupdateGO>

CREATE NONCLUSTERED INDEX [_dta_index_Richieste_5_1362103893__K99_K1_K2_K8_K3_K4_K39] ON [dbo].[Richieste]
(
	[IdAffidatario] ASC,
	[IDCommessa] ASC,
	[Localizzazione] ASC,
	[DataRichiesta] ASC,
	[NumRichiesta] ASC,
	[AnnoRichiesta] ASC,
	[IdMestiere] ASC
)WITH (SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
<LupdateGO>

CREATE NONCLUSTERED INDEX [_dta_index_tblPgContrattiRifAffidatariAttiv_5_1950629992__K5_K1_K4_K3] ON [dbo].[tblPgContrattiRifAffidatariAttivit‡Edifici]
(
	[IdAttivit‡Mestiere] ASC,
	[IdCommessa] ASC,
	[IdEdificio] ASC,
	[IdPgContrattoRifAffidatario] ASC
)WITH (SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
<LupdateGO>


DELETE FROM _versione;
INSERT INTO _versione (numero, numero2) VALUES (229, 1327)
<LupdateGO>  