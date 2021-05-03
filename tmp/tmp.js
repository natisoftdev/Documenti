// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

require('log-timestamp');
const os = require('os');
const _ = require('lodash')
const functions = require('firebase-functions');
const iconv = require('iconv-lite');
const { WebhookClient } = require('dialogflow-fulfillment');
const express = require('express');
const bodyParse = require('body-parser');
var odbc = require('./lib/node-odbc/lib/odbc.js');
const cors = require('cors');
const http = require('http');
const https = require('https');
const dialogflow = require('@google-cloud/dialogflow');
// const dialogflow = require('dialogflow');
const uuid = require('uuid');

// #### CONFIGURAZIONE DELL'ODBC
const configurazioni = require('./conf/configurazioni.js');

// #### LIBRERIE CUSTOM
const shellColor = require('./lib/bash.js');
const funLib = require('./lib/lib.js');
const traduttore = require('./lib/traduttore.js');
const querySql = require('./sql/query.js');
const querySqlLog = require('./sql/log/queryLog.js');

let ServerName = 'sviluppo';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const db = new odbc.Database();

// VARIABILI GLOBALI
let IdCommessa = null;
let OdbcName = null;
let IdUtente = null;
let Utente = null;
let Query = null;
let UrlManpronet = null;
let IdDitta = null;
let IdRisorsa = null;
let IdEdificio = null;
let IdMestiere = null;
let AGENT_LANGUAGE = 'it';

JSON.safeStringify = (obj, indent = 2) => {
    let cache = [];
    const retVal = JSON.stringify(
        obj,
        (key, value) =>
        typeof value === "object" && value !== null
            ? cache.includes(value)
            ? undefined // Duplicate reference found, discard key
            : cache.push(value) && value // Store value in our collection
            : value,
        indent
    );
    cache = null;
    return retVal;
};

const app = express();
app.use(cors({origin: 'http://localhost:4000/'}));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// ENTRY POINT DEL SERVER, AVVIO ALL'ASCOLTO DELLA PORTA
app.listen(4000, function () {
    console.log(shellColor.FgMagenta,'SERVER-FRANCO: ON PORT 4000',shellColor.Reset);
});

// ####################
// GESTORE DEGLI INTENT
// ####################
const dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({
        request,
        response
    });

	// var odbc = require("odbc")
	
	
    function handlerGetDataMssql2014(agent) {
        return new Promise((resolve, reject) => {
	        const tabella = agent.parameters.tabella || 'Richieste';
            const codice = agent.parameters.codice || 1;
            const campo = agent.parameters.campo || 'DesStato';
			const anno = agent.parameters.anno || 2020;
			const commessa = IdCommessa || 1;
			
			let query = querySql.statoRichiesta.query(anno, codice, commessa);

			// console.log('\n QUERY: ', query);

			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				// stringa di connessione
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					db.query(query, [], function (error, result, info) {
						console.log("ODBC: WORKS!");
						if (error) {
							console.log(error);
						} else {
							let x = querySql.statoRichiesta.result(result, agent);
							resolve(agent.add(x));							
						}
					});
				});				
			}
      	});
    }
	
	function welcome(agent) {
		return new Promise((resolve, reject) => {
			if (Utente) {
				resolve(agent.add(traduttore[agent.locale].p11+' '+Utente+ ', '+traduttore[agent.locale].p12));
			} else {
				reject(agent.add(traduttore[agent.locale].p2));
			}
      	});
	}
	
	function testDiProva(agent) {
		return new Promise((resolve, reject) => {		
			let conv = agent.conv();
			if (conv) {
				conv.ask('Hi from the Actions on Google client library');
				resolve(agent.add(conv));					
			} else {
				resolve(agent.add(traduttore[agent.locale].p3));
			}
      	});
	}
	
	function tplMonitorScansionaRichieste(agent) {
		return new Promise((resolve, reject) => {
			const commessa = IdCommessa || 1;
			
			let query = querySql.tplOperatoreNull.query(commessa);

			// console.log('\n QUERY: ', query);

			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				// stringa di connessione
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					db.query(query, [], function (error, result, info) {
						console.log("ODBC: WORKS!");
						if (error) {
							console.log(error);
						} else {
							// console.log("QUERY RESULT >>> ",result);
							let x = querySql.tplOperatoreNull.result(result, agent);
							resolve(agent.add(x));							
						}
					});
				});				
			}
      	});
	}
	
	function tplGestioneOperatore(agent) {
		return new Promise((resolve, reject) => {
			const commessa = IdCommessa || 1;
			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";				
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					let query = querySql.tplOperatoreNull.query(commessa);
					db.query(query, [], function (error, result, info) {
						if (error) {
							console.log(error);
						} else {
							console.log("tplOperatoreNull: WORKS!");
							
							let IdEdificio = result && result[0] && result[0]['IdEdi'] ? result[0]['IdEdi'] : '';
							let IDDitta = result && result[0] && result[0]['IdDitta'] ? result[0]['IdDitta'] : '';
							let Data = result && result[0] && result[0]['DataInizioPrev'] ? result[0]['DataInizioPrev'] : '';
							let ora1 = result && result[0] && result[0]['OraInizioPrev'] ? result[0]['OraInizioPrev'] : '';
							let ora2 = result && result[0] && result[0]['OraInizioPrev'] ? result[0]['OraInizioPrev'] : '';
							let DataOraInizioPrev = result && result[0] && result[0]['DataOraInizioPrev'] ? result[0]['DataOraInizioPrev'] : '';
							let DataOraFinePrev = result && result[0] && result[0]['DataOraFinePrev'] ? result[0]['DataOraFinePrev'] : '';
							let IdOrdine = result && result[0] && result[0]['IdOrd'] ? result[0]['IdOrd'] : '';
							let DataOraInizioCorrente = result && result[0] && result[0]['DataOraInizioCorrente'] ? result[0]['DataOraInizioCorrente'] : '';
							let RicTrapN = result && result[0] && result[0]['RicTrapN'] ? result[0]['RicTrapN'] : '';
							
							
							console.log('IdEdificio: ', IdEdificio);
							console.log('IDDitta: ', IDDitta);
							console.log('Data: ', Data);
							console.log('ora1: ', ora1);
							console.log('ora2: ', ora2);
							console.log('DataOraInizioCorrente: ', DataOraInizioCorrente);
							
							if (IdEdificio === '' 
								|| IDDitta === '' 
								|| Data === ''
								|| ora1 === ''
								|| ora2 === ''
								|| DataOraInizioCorrente === '') {
									let x = 'Non ci sono Trasporti da Assegnare';
									resolve(agent.add(x));
								} else {
									// aggiungo due ore perché siamo in italia
									DataOraInizioCorrente.setHours(DataOraInizioCorrente.getHours()+2);
									DataOraInizioCorrente = new Date(DataOraInizioCorrente);
									DataOraInizioCorrente = DataOraInizioCorrente.toISOString().replace('T',' ').replace('Z','');
									
									let query2 = querySql.tplGestioneOperatore.query(commessa, IdEdificio, IDDitta, Data, ora1, ora2, DataOraInizioCorrente, IdOrdine, DataOraInizioPrev, DataOraFinePrev);
									
									let ris1 = querySql.tplOperatoreNull.result(result, agent);
									db.query(query2, [], function (error, result2, info) {
										if (error) {
											console.log(error);
										} else {
											console.log("ODBC tplGestioneOperatore: WORKS!");
											let IdRisorsa = result2 && result2[0] && result2[0]['IdRisorsa'] ? result2[0]['IdRisorsa'] : '';
											
											if (IdRisorsa === '') {
												console.log('tplGestioneOperatoriOccupati: ', IdRisorsa);
												let query3 = querySql.tplGestioneOperatoriOccupati.query(commessa, IdEdificio, IDDitta, Data, ora1, ora2, DataOraInizioCorrente, IdOrdine, DataOraInizioPrev, DataOraFinePrev);

												let ris1 = querySql.tplOperatoreNull.result(result, agent);
												db.query(query3, [], function (error, result3, info) {
													if (error) {
														console.log(error);
													} else {
														console.log("tplOperatoreNull 3lvl: WORKS!");
														console.log('Result: ', JSON.stringify(result3));
														let IdRisorsa = result3 && result3[0] && result3[0]['IdRisorsa'] ? result3[0]['IdRisorsa'] : '';
														if (IdRisorsa !== '') {
															let ctxGestioneOperatore = {name: "ctxgestioneoperatore", lifespan: 5, parameters: {IdRisorsa: IdRisorsa, IdOrdine: IdOrdine}};
															agent.context.set(ctxGestioneOperatore);
															let x = ris1 + querySql.tplGestioneOperatoriOccupati.result(result3, agent);
															agent.add(x);
															resolve(agent);
														} else {
															let opzioniAssistenteGoogleLog = {};
															opzioniAssistenteGoogleLog.Query = Query;
															opzioniAssistenteGoogleLog.Data = funLib.now();
															opzioniAssistenteGoogleLog.IdUtente = IdUtente;
															opzioniAssistenteGoogleLog.IdCommessa = IdCommessa;
															opzioniAssistenteGoogleLog.Url = UrlManpronet;
															opzioniAssistenteGoogleLog.Successo = 1;
															opzioniAssistenteGoogleLog.DataSuccesso = funLib.now();
															opzioniAssistenteGoogleLog.IntentName = Query;
															opzioniAssistenteGoogleLog.IdOrd = IdOrdine;
															db.query(querySqlLog.assistenteGoogleLogCheckIdOrd(opzioniAssistenteGoogleLog), [], function (error, result4, info) {
																if (error) {
																	console.log(error);
																} else {
																	console.log("assistenteGoogleLogCheckIdOrd 4lvl: WORKS!");
																	db.query(querySqlLog.assistenteGoogleLogInsertIdOrd(opzioniAssistenteGoogleLog), [], function (error, result5, info) {
																		if (error) {
																			console.log(error);
																		} else {
																			console.log("assistenteGoogleLogInsertIdOrd 5lvl: WORKS!");
																			
																			let checkIdOrd = result4 && result4[0] && result4[0]['IdOrd'] ? result4[0]['IdOrd'] : '';
																			console.log(checkIdOrd);
																			if (checkIdOrd) {
																				let msg = "Non ci sono risorse in turno per gestire l'ordine "+RicTrapN;
																				agent.add(msg);
																				resolve(agent);																				
																			} else {
																				let query = querySql.tplOperatoreNullCheckIdOrd.query(commessa);
																				db.query(query, [], function (error, result, info) {
																					if (error) {
																						console.log(error);
																					} else {
																						console.log("tplOperatoreNullCheckIdOrd: WORKS!");
																						
																						let IdEdificio = result && result[0] && result[0]['IdEdi'] ? result[0]['IdEdi'] : '';
																						let IDDitta = result && result[0] && result[0]['IdDitta'] ? result[0]['IdDitta'] : '';
																						let Data = result && result[0] && result[0]['DataInizioPrev'] ? result[0]['DataInizioPrev'] : '';
																						let ora1 = result && result[0] && result[0]['OraInizioPrev'] ? result[0]['OraInizioPrev'] : '';
																						let ora2 = result && result[0] && result[0]['OraInizioPrev'] ? result[0]['OraInizioPrev'] : '';
																						let DataOraInizioPrev = result && result[0] && result[0]['DataOraInizioPrev'] ? result[0]['DataOraInizioPrev'] : '';
																						let DataOraFinePrev = result && result[0] && result[0]['DataOraFinePrev'] ? result[0]['DataOraFinePrev'] : '';
																						let IdOrdine = result && result[0] && result[0]['IdOrd'] ? result[0]['IdOrd'] : '';
																						let DataOraInizioCorrente = result && result[0] && result[0]['DataOraInizioCorrente'] ? result[0]['DataOraInizioCorrente'] : '';
																						let RicTrapN = result && result[0] && result[0]['RicTrapN'] ? result[0]['RicTrapN'] : '';
																						
																						
																						console.log('IdEdificio: ', IdEdificio);
																						console.log('IDDitta: ', IDDitta);
																						console.log('Data: ', Data);
																						console.log('ora1: ', ora1);
																						console.log('ora2: ', ora2);
																						console.log('DataOraInizioCorrente: ', DataOraInizioCorrente);
																						
																						if (IdEdificio === '' 
																							|| IDDitta === '' 
																							|| Data === ''
																							|| ora1 === ''
																							|| ora2 === ''
																							|| DataOraInizioCorrente === '') {
																							let x = 'Non ci sono Trasporti da Assegnare';
																							resolve(agent.add(x));
																						} else {
																							// aggiungo due ore perché siamo in italia
																							DataOraInizioCorrente.setHours(DataOraInizioCorrente.getHours()+2);
																							DataOraInizioCorrente = new Date(DataOraInizioCorrente);
																							DataOraInizioCorrente = DataOraInizioCorrente.toISOString().replace('T',' ').replace('Z','');
																							
																							let query2 = querySql.tplGestioneOperatore.query(commessa, IdEdificio, IDDitta, Data, ora1, ora2, DataOraInizioCorrente, IdOrdine, DataOraInizioPrev, DataOraFinePrev);
																							
																							let ris1 = querySql.tplOperatoreNull.result(result, agent);
																							db.query(query2, [], function (error, result2, info) {
																								if (error) {
																									console.log(error);
																								} else {
																									console.log("ODBC tplGestioneOperatore: WORKS!");
																									let IdRisorsa = result2 && result2[0] && result2[0]['IdRisorsa'] ? result2[0]['IdRisorsa'] : '';
																									
																									if (IdRisorsa === '') {
																										console.log('tplGestioneOperatoriOccupati: ', IdRisorsa);
																										let query3 = querySql.tplGestioneOperatoriOccupati.query(commessa, IdEdificio, IDDitta, Data, ora1, ora2, DataOraInizioCorrente, IdOrdine, DataOraInizioPrev, DataOraFinePrev);

																										let ris1 = querySql.tplOperatoreNull.result(result, agent);
																										db.query(query3, [], function (error, result3, info) {
																											if (error) {
																												console.log(error);
																											} else {
																												console.log("tplGestioneOperatoriOccupati 3lvl: WORKS!");
																												console.log('Result: ', JSON.stringify(result3));
																												let IdRisorsa = result3 && result3[0] && result3[0]['IdRisorsa'] ? result3[0]['IdRisorsa'] : '';
																												if (IdRisorsa !== '') {
																													let ctxGestioneOperatore = {name: "ctxgestioneoperatore", lifespan: 5, parameters: {IdRisorsa: IdRisorsa, IdOrdine: IdOrdine}};
																													agent.context.set(ctxGestioneOperatore);
																													let x = ris1 + querySql.tplGestioneOperatoriOccupati.result(result3, agent);
																													agent.add(x);
																													resolve(agent);
																												} else {
																													let opzioniAssistenteGoogleLog = {};
																													opzioniAssistenteGoogleLog.Query = Query;
																													opzioniAssistenteGoogleLog.Data = funLib.now();
																													opzioniAssistenteGoogleLog.IdUtente = IdUtente;
																													opzioniAssistenteGoogleLog.IdCommessa = IdCommessa;
																													opzioniAssistenteGoogleLog.Url = UrlManpronet;
																													opzioniAssistenteGoogleLog.Successo = 1;
																													opzioniAssistenteGoogleLog.DataSuccesso = funLib.now();
																													opzioniAssistenteGoogleLog.IntentName = Query;
																													opzioniAssistenteGoogleLog.IdOrd = IdOrdine;
																													db.query(querySqlLog.assistenteGoogleLogCheckIdOrd(opzioniAssistenteGoogleLog), [], function (error, result4, info) {
																														if (error) {
																															console.log(error);
																														} else {
																															console.log("assistenteGoogleLogCheckIdOrd 4lvl: WORKS!");
																															db.query(querySqlLog.assistenteGoogleLogInsertIdOrd(opzioniAssistenteGoogleLog), [], function (error, result5, info) {
																																if (error) {
																																	console.log(error);
																																} else {
																																	console.log("assistenteGoogleLogInsertIdOrd 5lvl: WORKS!");
																																	
																																	let checkIdOrd = result4 && result4[0] && result4[0]['IdOrd'] ? result4[0]['IdOrd'] : '';
																																	console.log(checkIdOrd);
																																	if (checkIdOrd) {
																																		let msg = traduttore[agent.locale].p13+" "+RicTrapN;
																																		agent.add(msg);
																																		resolve(agent);
																																	} else {
																																		console.log("Salto il turno");
																																	}
																																}
																															});
																														}
																													});
																												}
																											}
																										});
																									} else {
																										console.log('tplGestioneOperatore: ', IdRisorsa);
																										let ctxGestioneOperatore = {name: "ctxgestioneoperatore", lifespan: 5, parameters: {IdRisorsa: IdRisorsa, IdOrdine: IdOrdine}};
																										agent.context.set(ctxGestioneOperatore);
																										let x = ris1 + querySql.tplGestioneOperatore.result(result2, agent);
																										agent.add(x);
																										resolve(agent);
																									}
																								}
																							});
																						}
																					}
																				});
																			}
																		}
																	});
																}
															});
														}
													}
												});			
											} else {
												console.log('tplGestioneOperatore: ', IdRisorsa);
												let ctxGestioneOperatore = {name: "ctxgestioneoperatore", lifespan: 5, parameters: {IdRisorsa: IdRisorsa, IdOrdine: IdOrdine}};
												agent.context.set(ctxGestioneOperatore);
												let x = ris1 + querySql.tplGestioneOperatore.result(result2, agent);
												agent.add(x);
												resolve(agent);
											}
										}
									});
								}
						}
					});
				});
			}
      	});
	}
	
	function tplGestioneOperatoreYes(agent) {
		return new Promise((resolve, reject) => {
			let contextIn = agent.context.get('ctxgestioneoperatore');
			if (contextIn && contextIn.parameters) {
				let IdRisorsa = contextIn.parameters.IdRisorsa ;
				let IdOrdine = contextIn.parameters.IdOrdine;
				const commessa = IdCommessa || 1;
				agent.context.delete('ctxgestioneoperatore');
				
				// DEBUG
				console.log('IdOrdine: ', IdOrdine, 'IdRisorsa: ', IdRisorsa);
				
				if (IdOrdine && IdRisorsa) {
				
					let query = querySql.tplInserimentoOperatore.query(commessa, IdRisorsa, IdOrdine);

					if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
					else {
						let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
						// stringa di connessione
						db.open(configurazioneOdbc, function(err)
						{
							if (err) {
								console.log(err);
								return;
							}
							db.query(query, [], function (error, result, info) {
								console.log("ODBC: WORKS!");
								if (error) {
									console.log(error);
								} else {
									let x = querySql.tplInserimentoOperatore.result(result, agent);
									resolve(agent.add(x));					
								}
							});
						});				
					}					
				} else {
					resolve(agent.add(traduttore[agent.locale].p4));
				}
			} else {
				resolve(agent.add(traduttore[agent.locale].p5));
			}
      	});
	}

	function tplMancanzaPresaIncaricoOperatore(agent) {
		return new Promise((resolve, reject) => {
			const commessa = IdCommessa || 1;
			
			let query = querySql.tplMancanzaPresaIncaricoOperatore.query(commessa);

			// console.log('\n QUERY: ', query);

			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				// stringa di connessione
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					db.query(query, [], function (error, result, info) {
						console.log("ODBC: WORKS!");
						if (error) {
							console.log(error);
						} else {
							if (result[0]) {
								let x = querySql.tplMancanzaPresaIncaricoOperatore.result(result, agent);
								resolve(agent.add(x));															
							} else {
								resolve(agent.add(traduttore[agent.locale].p6));
							}
						}
					});
				});				
			}
      	});
	}
	
	function tplCreateTrasporto(agent) {
		return new Promise((resolve, reject) => {
			let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
			db.open(configurazioneOdbc, function(err)
			{
				if (err) {
					console.log(err);
					return;
				}	
				
				// valori di default
				let oRichiesta = {};	// oggetto con dentro tutti i parametri della richiesta

				oRichiesta.GradoUrgenza = 'NNPRG';
				
				let edificioDa = {};
				edificioDa.nome = agent.parameters.repartoDa;
				edificioDa.IdCommessa = IdCommessa;
				
				db.query(querySql.tplCreateTrasportoEdificioDa.query(edificioDa), [], function (error, result, info) 
				{
                    console.log("tplCreateTrasportoEdificioDa: WORKS!");
                    if (error) {
                        console.log(error);
                    } else {
                        oRichiesta.IdEdificio = result && result[0] && result[0]['IdEdificio'] ? result[0]['IdEdificio'] : '';
                        oRichiesta.IdUtilizzatore = result && result[0] && result[0]['IdUtilizzatore'] ? result[0]['IdUtilizzatore'] : '';
                        let richiedente = {};
                        richiedente.IdEdificio = oRichiesta.IdEdificio;
                        richiedente.IdCommessa = IdCommessa;
                        richiedente.isPaziente = 1;
                        db.query(querySql.tplCreateTrasportoRichiedente.query(richiedente), [], function (error, result, info) {
							if (error) {
								console.log(error);
                            } else {
								console.log("tplCreateTrasportoRichiedente: WORKS!");
                                oRichiesta.IdRichiedente = result && result[0] && result[0]['IdRichiedente'] ? result[0]['IdRichiedente'] : '';
                                oRichiesta.Richiedente = result && result[0] && result[0]['Richiedente'] ? result[0]['Richiedente'] : '';
                                db.query(querySql.tplCreateTrasportoIdMestiere.query(IdCommessa), [], function (error, result, info) {
									if (error) {
										console.log(error);
                                    } else {
										console.log("tplCreateTrasportoIdMestiere: WORKS!");
                                        oRichiesta.IdMestiere = result && result[0] && result[0]['IdMestiere'] ? result[0]['IdMestiere'] : '';
                                        let IdComponenteAttivita = {};
                                        IdComponenteAttivita.tplAttivita = agent.parameters.tplAttivita;
                                        IdComponenteAttivita.tplComponente = agent.parameters.tplComponente;
                                        db.query(querySql.tplCreateTrasportoIdComponenteAttivita.query(IdComponenteAttivita), [], function (error, result, info) {
											if (error) {
												console.log(error);
                                            } else {
												console.log("tplCreateTrasportoIdComponenteAttivita: WORKS!");
                                                oRichiesta.IdAttivitaMestiere = result && result[0] && result[0]['IdAtt'] ? result[0]['IdAtt'] : '';
                                                oRichiesta.IdComponenteMestiere = result && result[0] && result[0]['IdComponenteMestiere'] ? result[0]['IdComponenteMestiere'] : '';
                                                oRichiesta.AttivitaDescrizione = result && result[0] && result[0]['Descrizione'] ? result[0]['Descrizione'] : '';
                                                let IdAffidatario = {};
                                                IdAffidatario.IdCommessa = IdCommessa;
                                                IdAffidatario.IdAttivitaMestiere = oRichiesta.IdAttivitaMestiere;
                                                IdAffidatario.IdEdificio = oRichiesta.IdEdificio;
                                                db.query(querySql.tplCreateTrasportoIdAffidatari.query(IdAffidatario), [], function (error, result, info) {
													if (error) {
														console.log(error);
                                                    } else {
														console.log("tplCreateTrasportoIdAffidatari: WORKS!");
                                                        oRichiesta.IdAff = result && result[0] && result[0]['IdAffidatario'] ? result[0]['IdAffidatario'] : '';
                                                        db.query(querySql.tplCreateTrasportoTecnicoC.query(IdCommessa), [], function (error, result, info) {
															if (error) {
																console.log(error);
                                                            } else {
																console.log("tplCreateTrasportoTecnicoC: WORKS!");
                                                                oRichiesta.Tecnico = result && result[0] && result[0]['Tecnico'] ? result[0]['Tecnico'] : '';
                                                                let edificioA = {};
                                                                edificioA.nome = agent.parameters.repartoA;
                                                                edificioA.IdCommessa = IdCommessa;
                                                                db.query(querySql.tplCreateTrasportoEdificioDa.query(edificioA), [], function (error, result, info) {
																	if (error) {
																		console.log(error);
                                                                    } else {
																		console.log("tplCreateTrasportoEdificioA: WORKS!");
                                                                        oRichiesta.IdEdificio2 = result && result[0] && result[0]['IdEdificio'] ? result[0]['IdEdificio'] : '';
                                                                        oRichiesta.IdUtilizzatore2 = result && result[0] && result[0]['IdUtilizzatore'] ? result[0]['IdUtilizzatore'] : '';
                                                                        db.query(querySql.tplCreateTrasportoAnnoCorrente.query(), [], function (error, result, info) {
																			if (error) {
																				console.log(error);
                                                                            } else {
																				console.log("tplCreateTrasportoAnnoCorrente: WORKS!");
                                                                                oRichiesta.AnnoCorrente = result && result[0] && result[0]['AnnoCorrente'] ? result[0]['AnnoCorrente'] : '';
                                                                                oRichiesta.AnnoCorrente = parseInt(oRichiesta.AnnoCorrente);
                                                                                db.query(querySql.tplCreateTrasportoMaxNumRichieste.query(IdCommessa, oRichiesta.AnnoCorrente), [], function (error, result, info) {
																					if (error) {
																						console.log(error);
                                                                                    } else {
																						console.log("tplCreateTrasportoMaxNumRichieste: WORKS!");
                                                                                        oRichiesta.NewNumRichiesta = result && result[0] && result[0]['NewNumRichiesta'] ? result[0]['NewNumRichiesta'] : '';
                                                                                        oRichiesta.NewNumRichiesta = parseInt(oRichiesta.NewNumRichiesta)+1;
                                                                                        db.query(querySql.tplCreateTrasportoDataInizioFineP.query(IdCommessa, oRichiesta.GradoUrgenza), [], function (error, result, info) {
																							if (error) {
																								console.log(error);
                                                                                            } else {
																								console.log("tplCreateTrasportoDataInizioFineP: WORKS!");
                                                                                                oRichiesta.DataInizioProg = result && result[0] && result[0]['DataInizioProg'] ? result[0]['DataInizioProg'] : '';
                                                                                                oRichiesta.DataFineProg = result && result[0] && result[0]['DataFineProg'] ? result[0]['DataFineProg'] : '';

					
                                                                                                // --repartoDa	CHIRURGIA EST
                                                                                                // --paziente	Mongelli
                                                                                                // --tplAttivita	letto
                                                                                                // --repartoA	CHIRURGIA EST
                                                                                                // --tplComponente	trasporto paziente
                                                                                                oRichiesta.paziente = agent.parameters.paziente;
                                                                            
                                                                                                let richiesta = {};				
                                                                                                richiesta.Richiedente = oRichiesta.Richiedente;
                                                                                                richiesta.IdUtenteInserimento = IdUtente;
                                                                                                richiesta.Utente = Utente;
                                                                                                richiesta.Operatore = Utente;
                                                                                                richiesta.Localizzazione = oRichiesta.IdEdificio;
                                                                                                richiesta.IdRichiedente = oRichiesta.IdRichiedente
                                                                                                richiesta.DataRichiesta = ' GETDATE() ';
                                                                                                richiesta.DataModifica = ' GETDATE() ';
                                                                                                richiesta.DataInserimento = ' GETDATE() ';
                                                                                                richiesta.IdMestiere = oRichiesta.IdMestiere;
                                                                                                richiesta.IdComponenteMestiere = oRichiesta.IdComponenteMestiere;
                                                                                                richiesta.IdAttivitaMestiere = oRichiesta.IdAttivitaMestiere;
                                                                                                richiesta.IdAffidatario = oRichiesta.IdAff;
                                                                                                richiesta.IdUtilizzatore = oRichiesta.IdUtilizzatore;
                                                                                                richiesta.TipoIntervento = 'Consuntivo';
                                                                                                richiesta.Descrizione = agent.parameters.descrizione || '';
                                                                                                richiesta.Descrizione1 = '';
                                                                                                richiesta.Descrizione2 = '';
                                                                                                richiesta.GradoUrgenza = oRichiesta.GradoUrgenza;
                                                                                                richiesta.TecnicoC = oRichiesta.Tecnico;
                                                                                                richiesta.Classificazione = 'Extracanone';
                                                                                                richiesta.Tipo = 'Web';
                                                                                                richiesta.Stato = 18;
                                                                                                richiesta.DataInizioP = funLib.gmt2mssql(oRichiesta.DataInizioProg);
                                                                                                richiesta.DataFineP = funLib.gmt2mssql(oRichiesta.DataFineProg);
                                                                                                richiesta.DataAutorizzazione = ' GETDATE() ';
                                                                                                richiesta.VAutorizzazione = 1;
                                                                                                richiesta.PersonaEsteso = oRichiesta.paziente;
                                                                                                richiesta.IdEdificio2 = oRichiesta.IdEdificio2;
                                                                                                richiesta.DocSanitaria = 0;
                                                                                                richiesta.Salma = agent.parameters.tplComponente.includes('Salme') ? 1 : 0;
                                                                                                richiesta.IdUtilizzatore2 = oRichiesta.IdUtilizzatore2;
                                                                                                richiesta.NumRichiestaFonte = 'NULL';
                                                                                                richiesta.AnnoRichiestaFonte = 'NULL';
                                                                                                richiesta.IdCommessa = IdCommessa;
                                                                                                richiesta.NumRichiesta = oRichiesta.NewNumRichiesta;
                                                                                                richiesta.AnnoRichiesta = oRichiesta.AnnoCorrente;
                                                                                                
																								let semaforoRichiesta = 0;
                                                                                                db.query(querySql.tplCreateTrasportoRichiesta.query(richiesta), [], function (errorRichiesta, resultRichiesta, infoRichiesta) {
																									if (errorRichiesta) {
																										console.log(errorRichiesta);
                                                                                                    } else if (semaforoRichiesta === 0) {
																										console.log("tplCreateTrasportoRichiesta: WORKS!", semaforoRichiesta);
                                                                                                                                    
                                                                                                        let oAssegnazione = {};
																										oAssegnazione.IdCommessa = IdCommessa;
																										oAssegnazione.DataOrdine = ' GETDATE() ';
																										oAssegnazione.IdEdificio = oRichiesta.IdEdificio;
																										oAssegnazione.IdAttivitaMestiere = oRichiesta.IdAttivitaMestiere;
                                                                                                        db.query(querySql.tblCreateTrasportoAssegnazione.query(oAssegnazione),  [], function (error, result, info) {
																											if (error) {
																												console.log(error);
                                                                                                            } else { 
																												console.log("tblCreateTrasportoAssegnazione: WORKS!");
																												oRichiesta.IdFornitore = result && result[0] && result[0]['IdFornitore'] ? result[0]['IdFornitore'] : '';

																												let oDataScadenza = {};
																												oDataScadenza.IdCommessa = IdCommessa;
																												oDataScadenza.NumRichiesta = oRichiesta.NewNumRichiesta;
																												oDataScadenza.AnnoRichiesta = oRichiesta.AnnoCorrente;
																												oDataScadenza.GrUrg = oRichiesta.GradoUrgenza;
																												db.query(querySql.tplCreateTrasportoDataScadenza.query(oDataScadenza),  [], function (error, result, info) {
																													if (error) {
																														console.log(error);
																													} else { 
																														console.log("tplCreateTrasportoDataScadenza: WORKS!");
																														
																														let DataScadenzaPresaInCarico = result && result[0] && result[0]['DataSPC'] ? result[0]['DataSPC'] : '';
																														let DataScadenza = result && result[0] && result[0]['DataScadenza'] ? result[0]['DataScadenza'] : '';
																														let DataScadenzaInterventoTampone = result && result[0] && result[0]['DataScadIntTampone'] ? result[0]['DataScadIntTampone'] : '';
																														let DataScadenzaFineIntervento = result && result[0] && result[0]['DataSFI'] ? result[0]['DataSFI'] : '';
																														let DataScadenzaOriginale = DataScadenza;
																														let DataScadenzaPresaInCaricoOriginale = DataScadenzaPresaInCarico;
																														
																														let semaforoMaxNumOrd = 0;
																														db.query(querySql.tplCreateTrasportoMaxNumOrdine.query(IdCommessa, oRichiesta.AnnoCorrente),  [], function (error, result, info) {
																															if (error) {
																																console.log(error);
																															} else { 
																																if (semaforoMaxNumOrd === 0) {
																																	console.log("tplCreateTrasportoMaxNumOrdine: WORKS!", semaforoMaxNumOrd++);
																																	let NewNumOrdine = result && result[0] && result[0]['NewNumOrdine'] ? result[0]['NewNumOrdine'] : '';
																																	NewNumOrdine = parseInt(NewNumOrdine)+1;
																																	
																																	let ordine = {};
																																	ordine.Contabiliz = 'Extracanone';
																																	ordine.ModalitaAgg = Utente.substr(0, 20);
																																	ordine.CodEdificio = oRichiesta.IdEdificio;
																																	ordine.DittaManuale = '';
																																	ordine.Assegnazione = oRichiesta.IdFornitore;
																																	ordine.IdRisorsa = IdRisorsa;
																																	ordine.DataAssegnazioneRisorsa = ' GETDATE() ';
																																	ordine.ContabilizF = 'Extracanone';
																																	ordine.DataOrdine = ' GETDATE() ';
																																	ordine.DataModifica = ' GETDATE() ';
																																	ordine.IdMestiere = oRichiesta.IdMestiere;
																																	ordine.IdComponenteMestiere = oRichiesta.IdComponenteMestiere;
																																	ordine.IdAttivitaMestiere = oRichiesta.IdAttivitaMestiere;
																																	ordine.IdAffidatario = oRichiesta.IdAff;
																																	ordine.IdUtilizzatore = oRichiesta.IdUtilizzatore;
																																	ordine.DescrizioneIntervento = agent.parameters.descrizione || '';
																																	ordine.DescrizioneIntervento1 = '';
																																	ordine.DescrizioneIntervento2 = '';
																																	ordine.GradoUrgenza = oRichiesta.GradoUrgenza;
																																	ordine.StatoOrd = 35;
																																	ordine.DataInizioProg = funLib.gmt2mssql(oRichiesta.DataInizioProg);
																																	ordine.DataFineProg = funLib.gmt2mssql(oRichiesta.DataFineProg);
																																	ordine.DataScadenza = funLib.gmt2mssql(DataScadenza);
																																	ordine.DataScadenzaOriginale = funLib.gmt2mssql(DataScadenzaOriginale);
																																	ordine.DataScadenzaPresaInCarico = funLib.gmt2mssql(DataScadenzaPresaInCarico);
																																	ordine.DataScadenzaPresaInCaricoOriginale = funLib.gmt2mssql(DataScadenzaPresaInCaricoOriginale);
																																	ordine.DataScadenzaFineIntervento = funLib.gmt2mssql(DataScadenzaFineIntervento);
																																	ordine.DataScadenzaInterventoTampone = funLib.gmt2mssql(DataScadenzaInterventoTampone);
																																	ordine.IdCommessa = IdCommessa;
																																	ordine.IDCommessaRichiesta = IdCommessa;
																																	ordine.NumOrdine = NewNumOrdine;
																																	ordine.AnnoOrdine = oRichiesta.AnnoCorrente;
																																	ordine.NumRichiesta = oRichiesta.NewNumRichiesta;
																																	ordine.AnnoRichiesta = oRichiesta.AnnoCorrente;
																																	
																																	let semaforoOrd = 0;
																																	db.query(querySql.tplCreateTrasportoOrdine.query(ordine), [], function (error, result, info) {
																																		if (error) {
																																			console.log(error);
																																		} else {
																																			if (semaforoOrd === 0) {
																																				console.log("tplCreateTrasportoOrdine: WORKS! ", semaforoOrd++);
																																				let msg = querySql.tplCreateTrasportoOrdine.result(result, agent);
																																				db.close(function () {
																																					console.log('tpl FINITO');
																																					resolve(agent.add(msg));
																																				});																																			
																																			}
																																		}
																																	});
																																}
																																	
																															}
																														});
																													}
																												});
                                                                                                            }
                                                                                                        });
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
				});
			});
      	});
	}
	
	function tplAssegnamentoAutomatico(agent) {
		return new Promise((resolve, reject) => {
			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					let query = querySql.tplOperatoreNullConDitteEdifici.query(IdCommessa);
					db.query(query, [], function (error, result, info) {
						if (error) {
							console.log(error);
						} else {
							console.log("tplOperatoreNullConDitteEdifici: WORKS!");
							let IdEdificio = result && result[0] && result[0]['IdEdi'] ? result[0]['IdEdi'] : '';
							let IDDitta = result && result[0] && result[0]['IdDitta'] ? result[0]['IdDitta'] : '';
							let Data = result && result[0] && result[0]['DataInizioPrev'] ? result[0]['DataInizioPrev'] : '';
							let ora1 = result && result[0] && result[0]['OraInizioPrev'] ? result[0]['OraInizioPrev'] : '';
							let ora2 = result && result[0] && result[0]['OraInizioPrev'] ? result[0]['OraInizioPrev'] : '';
							let DataOraInizioPrev = result && result[0] && result[0]['DataOraInizioPrev'] ? result[0]['DataOraInizioPrev'] : '';
							let DataOraFinePrev = result && result[0] && result[0]['DataOraFinePrev'] ? result[0]['DataOraFinePrev'] : '';
							let IdOrdine = result && result[0] && result[0]['IdOrd'] ? result[0]['IdOrd'] : '';
							let DataOraInizioCorrente = result && result[0] && result[0]['DataOraInizioCorrente'] ? result[0]['DataOraInizioCorrente'] : '';
							let RicTrapN = result && result[0] && result[0]['RicTrapN'] ? result[0]['RicTrapN'] : '';
							
							
							console.log('IdEdificio: ', IdEdificio);
							console.log('IDDitta: ', IDDitta);
							console.log('Data: ', Data);
							console.log('ora1: ', ora1);
							console.log('ora2: ', ora2);
							console.log('DataOraInizioCorrente: ', DataOraInizioCorrente);
							
							if (IdEdificio === '' 
								|| IDDitta === '' 
								|| Data === ''
								|| ora1 === ''
								|| ora2 === ''
								|| DataOraInizioCorrente === '') {
									let msg = traduttore[agent.locale].p7;
									resolve(agent.add(msg));
								} else {
									// aggiungo due ore perché siamo in italia
									DataOraInizioCorrente.setHours(DataOraInizioCorrente.getHours()+2);
									DataOraInizioCorrente = new Date(DataOraInizioCorrente);
									DataOraInizioCorrente = DataOraInizioCorrente.toISOString().replace('T',' ').replace('Z','');
									
									let query2 = querySql.tplGestioneOperatore.query(IdCommessa, IdEdificio, IDDitta, Data, ora1, ora2, DataOraInizioCorrente, IdOrdine, DataOraInizioPrev, DataOraFinePrev);
									db.query(query2, [], function (error, result2, info) {
										if (error) {
											console.log(error);
										} else {
											console.log("tplGestioneOperatore 2lvl: WORKS!");
											let IdRisorsa = result2 && result2[0] && result2[0]['IdRisorsa'] ? result2[0]['IdRisorsa'] : '';
											let operatore = result2 && result2[0] && result2[0]['NOME'] ? result2[0]['NOME'] : '';
											if (IdRisorsa === '') {
												console.log('tplGestioneOperatoriOccupati: ', IdRisorsa);
												let query3 = querySql.tplGestioneOperatoriOccupati.query(IdCommessa, IdEdificio, IDDitta, Data, ora1, ora2, DataOraInizioCorrente, IdOrdine, DataOraInizioPrev, DataOraFinePrev);
												db.query(query3, [], function (error, result3, info) {
													if (error) {
														console.log(error);
													} else {
														console.log("tplGestioneOperatoriOccupati 3lvl: WORKS!");
														let IdRisorsa = result3 && result3[0] && result3[0]['IdRisorsa'] ? result3[0]['IdRisorsa'] : '';
														let operatore = result3 && result3[0] && result3[0]['NOME'] ? result3[0]['NOME'] : '';
														let query4 = querySql.tplInserimentoOperatore.query(IdCommessa, IdRisorsa, IdOrdine);
														db.query(query4, [], function (error, result4, info) {
															if (error) {
																console.log(error);
															} else {
																console.log("tplInserimentoOperatore 4lvl: WORKS!");
																let msg = traduttore[agent.locale].p14+' '+operatore+' '+traduttore[agent.locale].p15+' '+RicTrapN;
																agent.add(msg);
																resolve(agent);
															}
														});
													}
												});
											} else {
												let query4 = querySql.tplInserimentoOperatore.query(IdCommessa, IdRisorsa, IdOrdine);
												db.query(query4, [], function (error, result4, info) {
													if (error) {
														console.log(error);
													} else {
														console.log("tplInserimentoOperatore 4lvl: WORKS!");
                                                        let msg = traduttore[agent.locale].p14+' '+operatore+' '+traduttore[agent.locale].p15+' '+RicTrapN;
														agent.add(msg);
														resolve(agent);
													}
												});
											}
										}
									});
								}
						}
					});
				});
			}
      	});
	}
	
    function fmCreateRichiesta (agent) {
		return new Promise((resolve, reject) => {
			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					
					let count = 0;

					// CHECK PARAMETRI
					let mestiere = '';
					let descrizione = '';
					let edificio = '';
					let gradoUrgenza = '';
					let tipo = '';
					
					if (agent.parameters) {
						mestiere = agent.parameters && agent.parameters.mestiere ? agent.parameters.mestiere : '';
						descrizione = agent.parameters && agent.parameters.descrizione ? agent.parameters.descrizione : '';
						edificio = agent.parameters && agent.parameters.edificio ? agent.parameters.edificio : '';
						gradoUrgenza = agent.parameters && agent.parameters.gradoUrgenza ? agent.parameters.gradoUrgenza : '';
						tipo = agent.parameters && agent.parameters.tipo ? agent.parameters.tipo : '';
					}
					let des1 = descrizione.replace(/'/g," ");
					let des2 = '';
					let des3 = '';
					
					console.log('Parametri: ',agent.parameters)
					
					// INIZIO A INTERROGARE IL DB
                    let oEdificio = {};
                    oEdificio.IdCommessa = IdCommessa;
                    oEdificio.nome = edificio;
                    let queryFmGetIdEdificio = querySql.fmGetIdEdificio.query(oEdificio);
                    db.query(queryFmGetIdEdificio, [], function (error, result2, info) {
                        if (error) {
                            console.log(error);
                        } else {
							// ## DEBUG
							if (result2.length > 1) {
								let aIdEdificio = result2.map(x => x.IdEdificio ? x.IdEdificio : '' )
								let aCodice = result2.map(x => x.Codice ? x.Codice : '' )
								let aedificioEstesa = result2.map(x => x.edificioEstesa ? x.edificioEstesa : '' )
								let aIndirizzo = result2.map(x => x.indirizzo ? x.indirizzo : '' )
								
								let aResEdifici = [];
								for (let i = 0; i < result2.length; i++) {
									aResEdifici[i] = aIdEdificio[i]+'    '+aCodice[i]+' '+aedificioEstesa[i]+' '+aIndirizzo[i]
								}
								aResEdifici.unshift(
									traduttore[agent.locale].p16,
									traduttore[agent.locale].p18+result2.length+traduttore[agent.locale].p17
								);
								
								let ctxparrichiesta = {name: "ctxparrichiesta", lifespan: 2, parameters: agent.parameters };
								agent.context.set(ctxparrichiesta);
								
								agent.add(aResEdifici);
								resolve(agent);
								return
							}
							// ## ---- ##
							
                            console.log("fmGetIdEdificio ",count++,"lvl: WORKS!");
                            let IdEdificio = result2 && result2[0] && result2[0]['IdEdificio'] ? result2[0]['IdEdificio'] : '';
                            let IdUtilizzatore = result2 && result2[0] && result2[0]['IdUtilizzatore'] ? result2[0]['IdUtilizzatore'] : 'null';

							if (IdEdificio === '') {
								let msg = traduttore[agent.locale].p8;
								agent.add(msg);
								resolve(agent);
								return;
							}
                            let oMestiere = {};
                            oMestiere.IdCommessa = IdCommessa;
                            oMestiere.mestiere = mestiere;
                            oMestiere.IdEdificio = IdEdificio;
                            let queryFmCreateTrasportoIdMestiere = querySql.fmCreateTrasportoIdMestiere.query(oMestiere);
                            db.query(queryFmCreateTrasportoIdMestiere, [], function (error, result, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log("fmCreateTrasportoIdMestiere ",count++,"lvl: WORKS!");
                                    let IdMestiere = result && result[0] && result[0]['IdMestiere'] ? result[0]['IdMestiere'] : '';

									if (IdMestiere === '') {
										let msg = traduttore[agent.locale].p9;
										agent.add(msg);
										resolve(agent);
										return;
									}
									
									let queryTplCreateTrasportoTecnicoC = querySql.tplCreateTrasportoTecnicoC.query(IdCommessa);
									db.query(queryTplCreateTrasportoTecnicoC, [], function (error, result, info) {
										if (error) {
											console.log(error);
										} else {
											console.log("tplCreateTrasportoTecnicoC ",count++,"lvl: WORKS!");
											let TecnicoC = result && result[0] && result[0]['Tecnico'] ? result[0]['Tecnico'] : '';
											
											let oRichiedente = {};
											oRichiedente.IdEdificio = IdEdificio;
											oRichiedente.IdCommessa = IdCommessa;
											oRichiedente.IdUtente = IdUtente;
											oRichiedente.fm = 1;
											let queryFmGetRichiedente = querySql.fmGetRichiedente.query(oRichiedente);
											db.query(queryFmGetRichiedente, [], function (error, result, info) {
												if (error) {
													console.log(error);
												} else {
													console.log("fmGetRichiedente ",count++,"lvl: WORKS!");
													let IdRichiedente = result && result[0] && result[0]['IdRichiedente'] ? result[0]['IdRichiedente'] : '';
													let Richiedente = result && result[0] && result[0]['Richiedente'] ? result[0]['Richiedente'] : '';
													
													if (IdRichiedente === '') {
														let msg = traduttore[agent.locale].p10;
														agent.add(msg);
														resolve(agent);
														return;
													}
													
													let oIdAffidatario = {};
													oIdAffidatario.IdCommessa = IdCommessa;
													oIdAffidatario.IdMestiere = IdMestiere;
													oIdAffidatario.IdEdificio = IdEdificio;
													let queryFmGetIdAffidatariByEdificioMestiere = querySql.fmGetIdAffidatariByEdificioMestiere.query(oIdAffidatario);
													db.query(queryFmGetIdAffidatariByEdificioMestiere, [], function (error, result, info) {
														if (error) {
															console.log(error);
														} else {
															console.log("fmGetIdAffidatariByEdificioMestiere ",count++,"lvl: WORKS!");
															let IdAffidatario = result && result[0] && result[0]['IdAffidatario'] ? result[0]['IdAffidatario'] : 'null';
															
															let queryTplCreateTrasportoAnnoCorrente = querySql.tplCreateTrasportoAnnoCorrente.query();
															db.query(queryTplCreateTrasportoAnnoCorrente, [], function (error, result, info) {
																if (error) {
																	console.log(error);
																} else {
																	console.log("tplCreateTrasportoAnnoCorrente ",count++,"lvl: WORKS!");
																	let AnnoCorrente = result && result[0] && result[0]['AnnoCorrente'] ? result[0]['AnnoCorrente'] : '';
																	AnnoCorrente = parseInt(AnnoCorrente);
																	
																	let oGradoUrgenza = {};
																	oGradoUrgenza.IdCommessa = IdCommessa;
																	oGradoUrgenza.gradoUrgenza = gradoUrgenza;
																	let queryFmGetGradoUrgenza = querySql.fmGetGradoUrgenza.query(oGradoUrgenza);
																	db.query(queryFmGetGradoUrgenza, [], function (error, result, info) {
																		if (error) {
																			console.log(error);
																		} else {
																			console.log("fmGetGradoUrgenza ",count++,"lvl: WORKS!");
																			let GradoUrgenza = result && result[0] && result[0]['GradoU'] ? result[0]['GradoU'] : '';

																			let queryTplCreateTrasportoMaxNumRichieste = querySql.tplCreateTrasportoMaxNumRichieste.query(IdCommessa, AnnoCorrente);
																			db.query(queryTplCreateTrasportoMaxNumRichieste, [], function (error, result, info) {
																				if (error) {
																					console.log(error);
																				} else {
																					console.log("tplCreateTrasportoMaxNumRichieste ",count++,"lvl: WORKS!");
																					let NewNumRichiesta = result && result[0] && result[0]['NewNumRichiesta'] ? result[0]['NewNumRichiesta'] : '';
																					NewNumRichiesta = parseInt(NewNumRichiesta)+1;
																					
																					
																					// richiesta intervento
																					// richiesta preventivo
																					// richiesta extracanone
																					let Classificazione = "Canone";
																					let TipoIntervento = "";
																					let Stato = -1;
																					let vedeAffidatario = ' null ';
																					let VAutorizzazione = 0;
																					let IdUtilizzatore = ' null ';
																					switch (tipo) {
																						case "richiesta preventivo":
																							Classificazione = "Extracanone";
																							TipoIntervento = "Preventivo";
																							Stato = 4;
																							vedeAffidatario = 1;
																							break;
																						case "proposta extracanone":
																							Classificazione = "Extracanone";
																							Stato = 2;
																							break;
																						case "richiesta extracanone":
																							Classificazione = "Extracanone";
																							TipoIntervento = "Consuntivo";
																							Stato = 18;
																							VAutorizzazione = 1;
																							break;
																						case "ordine extracanone":
																							Classificazione = "Extracanone";
																							TipoIntervento = "Consuntivo";
																							Stato = 35;
																							VAutorizzazione = 1;
																							break;
																						case "richiesta intervento":
																						default:
																						break;
																					}
																					
																					let oFmRichiesta = {};
																					oFmRichiesta.IdRichiedente = IdRichiedente;
																					oFmRichiesta.Richiedente = Richiedente; // idutente
																					oFmRichiesta.IdAffidatario = IdAffidatario;
																					oFmRichiesta.IdUtente = IdUtente;
																					oFmRichiesta.Utente = Utente;
																					oFmRichiesta.Localizzazione = IdEdificio; // idedificio
																					oFmRichiesta.IdMestiere = IdMestiere;
																					oFmRichiesta.IdComponenteMestiere = ' null ';
																					oFmRichiesta.IdAttivitaMestiere = ' null ';
																					oFmRichiesta.IdLivello = ' null ';  // piano 
																					oFmRichiesta.IdAmbiente = ' null ';
																					oFmRichiesta.IdComponente = ' null '; 
																					oFmRichiesta.IdUtilizzatore = IdUtilizzatore;  // poss null
																					oFmRichiesta.TipoIntervento = TipoIntervento; // extracanone/canone // CAMBIA
																					oFmRichiesta.des1 = des1; // 
																					oFmRichiesta.des2 = des2;
																					oFmRichiesta.des3 = des3;
																					oFmRichiesta.NoteX = '';
																					oFmRichiesta.GradoUrgenza = GradoUrgenza;
																					oFmRichiesta.TecnicoC = TecnicoC; // CAMBIA
																					oFmRichiesta.Classificazione = Classificazione; // CAMBIA
																					oFmRichiesta.Tipo = 'Web';
																					oFmRichiesta.Stato = Stato; // CAMBIA
																					oFmRichiesta.DataAutorizzazione = ' GETDATE() ';
																					oFmRichiesta.VAutorizzazione = VAutorizzazione;
																					oFmRichiesta.IdCommessa = IdCommessa;
																					oFmRichiesta.NumRichiesta = NewNumRichiesta;
																					oFmRichiesta.AnnoRichiesta = AnnoCorrente;
																					oFmRichiesta.DocSanitaria = 0;
																					oFmRichiesta.Salma = 0;
																					oFmRichiesta.NotificaAndroid = 0;
																					oFmRichiesta.IdCommessaPersona = IdCommessa;
																					oFmRichiesta.vedeAffidatario = vedeAffidatario; // CAMBIA
																					
																					// console.log('oFmRichiesta: ',oFmRichiesta);
																					
																					let queryFmCreateRichiesta = querySql.fmCreateRichiesta.query(oFmRichiesta);
																					db.query(queryFmCreateRichiesta, [], function (error, resultfmcreaterichiesta, info) {
																						if (error) {
																							console.log(error);
																						} else {
																							console.log("fmcreaterichiesta ",count++,"lvl: works!");
																							if (tipo === "ordine extracanone") {
																								let oFmOrdine = {};
																								oFmOrdine.Contabiliz = 'Extracanone';
																								oFmOrdine.Utente = Utente;
																								oFmOrdine.IdEdificio = IdEdificio;
																								oFmOrdine.DittaManuale = DittaManuale; //
																								oFmOrdine.IdFornitore = IdFornitore;  //
																								oFmOrdine.IdRisorsa = IdRisorsa;  //
																								oFmOrdine.DataAssegnazioneRisorsa = DataAssegnazioneRisorsa; //
																								oFmOrdine.ContabilizF = ContabilizF; //
																								oFmOrdine.DataOrdine = DataOrdine; //
																								oFmOrdine.DataModifica = DataModifica; //
																								oFmOrdine.IdMestiere = IdMestiere;
																								oFmOrdine.IdComponenteMestiere = ' null ';
																								oFmOrdine.IdAttivitaMestiere = ' null ';
																								oFmOrdine.IdLivello = ' null ';
																								oFmOrdine.IdAmbiente = ' null ';
																								oFmOrdine.IdComponente = ' null ';
																								oFmOrdine.IdAffidatario = IdAffidatario;
																								oFmOrdine.IdUtilizzatore = IdUtilizzatore;
																								oFmOrdine.des1 = des1;
																								oFmOrdine.des2 = des2;
																								oFmOrdine.des3 = des3;
																								oFmOrdine.NoteTecnicheCliente = NoteTecnicheCliente; //
																								oFmOrdine.NoteX = NoteX; //
																								oFmOrdine.GradoUrgenza = GradoUrgenza;
																								oFmOrdine.Tecnico = Tecnico; //
																								oFmOrdine.StatoOrd = 35; //
																								oFmOrdine.DataInizioProg = DataInizioProg; //
																								oFmOrdine.DataFineProg = DataFineProg; //
																								oFmOrdine.DataScadenza = DataScadenza; //
																								oFmOrdine.DataScadenzaOriginale = DataScadenzaOriginale; //
																								oFmOrdine.DataScadenzaPresaInCarico = DataScadenzaPresaInCarico; //
																								oFmOrdine.DataScadenzaPresaInCaricoOriginale = DataScadenzaPresaInCaricoOriginale; //
																								oFmOrdine.DataScadenzaFineIntervento = DataScadenzaFineIntervento; //
																								oFmOrdine.DataScadenzaInterventoTampone = DataScadenzaInterventoTampone; //
																								oFmOrdine.CodIntervento = CodIntervento; //
																								oFmOrdine.DataInizioAccensione = DataInizioAccensione;  //
																								oFmOrdine.DataFineAccensione = DataFineAccensione; //
																								oFmOrdine.NoteAccensione = NoteAccensione;  //
																								oFmOrdine.IdCircuitoAccensione = IdCircuitoAccensione; //
																								oFmOrdine.Via = Via; //
																								oFmOrdine.NoteLocalizzativeStrade = NoteLocalizzativeStrade; //
																								oFmOrdine.IdCommessa = IdCommessa;
																								oFmOrdine.NumOrdine = NumOrdine; //
																								oFmOrdine.AnnoOrdine = AnnoCorrente;
																								oFmOrdine.NumRichiesta = NewNumRichiesta;
																								oFmOrdine.AnnoRichiesta = AnnoCorrente;

																							} else {
																								let msg = querySql.fmCreateRichiesta.result(resultfmcreaterichiesta, agent)
																								+traduttore[agent.locale].p19+oFmRichiesta.NumRichiesta+'-'+oFmRichiesta.AnnoRichiesta;
																								agent.add(msg);
																								resolve(agent);
																							}
																						}
																					});
																				}
																			});
																		}
																	});
																	
																}
															});

														}
													});
												}
											});
											
										}
									});	
									
								}
							});
						}
					});
				});				
			}
      	});
	}
	
	function fmCreateRichiestaEdificio (agent) {
		return new Promise((resolve, reject) => {
			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					
					let count = 0;
					
					// CHECK PARAMETRI
					let mestiere = '';
					let descrizione = '';
					let edificio = '';
					let gradoUrgenza = '';
					let tipo = '';
					let contextIn = agent.context.get('ctxparrichiesta');
					if (contextIn && contextIn.parameters) {
						mestiere = contextIn.parameters && contextIn.parameters.mestiere ? contextIn.parameters.mestiere : '';
						descrizione = contextIn.parameters && contextIn.parameters.descrizione ? contextIn.parameters.descrizione : '';
						gradoUrgenza = contextIn.parameters && contextIn.parameters.gradoUrgenza ? contextIn.parameters.gradoUrgenza : '';
						tipo = contextIn.parameters && contextIn.parameters.tipo ? contextIn.parameters.tipo : '';
						agent.context.delete('ctxparrichiesta');
					}
					
					let des1 = descrizione.replace(/'/g," ");
					let des2 = '';
					let des3 = '';
					
					console.log('Parametri: ',contextIn.parameters)
		
					let oMestiere = {};
					oMestiere.IdCommessa = IdCommessa;
					oMestiere.mestiere = mestiere;
					oMestiere.IdEdificio = IdEdificio;
					let queryFmCreateTrasportoIdMestiere = querySql.fmCreateTrasportoIdMestiere.query(oMestiere);
					db.query(queryFmCreateTrasportoIdMestiere, [], function (error, result2, info) {
						if (error) {
							console.log(error);
						} else {
							console.log("fmCreateTrasportoIdMestiere ",count++,"lvl: WORKS!");
							let IdMestiere = result2 && result2[0] && result2[0]['IdMestiere'] ? result2[0]['IdMestiere'] : '';
							
							// ## DEBUG
							if (result2.length > 1) {
								let aIdMestiere = result2.map(x => x.IdMestiere ? x.IdMestiere : '' )
								let aCodice = result2.map(x => x.Codice ? x.Codice : '' )
								let aDescrizione = result2.map(x => x.descrizione ? x.descrizione : '' )
								
								let aResMestieri = [];
								for (let i = 0; i < result2.length; i++) {
									aResMestieri[i] = aIdMestiere[i]+'    '+aCodice[i]+' '+aDescrizione[i];
								}
								
								aResMestieri.unshift(
									traduttore[agent.locale].p20,
									traduttore[agent.locale].p18+result2.length+traduttore[agent.locale].p21
								);
								
								let ctxparrichiestamestiere = {name: "ctxparrichiestamestiere", lifespan: 2, parameters: {
									descrizione: descrizione,
									IdEdificio: IdEdificio,
									mestiere : mestiere,
									gradoUrgenza : gradoUrgenza,
									tipo : tipo,
								}};
								agent.context.set(ctxparrichiestamestiere);
								
								agent.add(aResMestieri);
								resolve(agent);
								return;
							}
							// ## ---- ##
							
							if (IdMestiere === '') {
								let msg = traduttore[agent.locale].p9;
								agent.add(msg);
								resolve(agent);
								return;
							}
							
							let queryTplCreateTrasportoTecnicoC = querySql.tplCreateTrasportoTecnicoC.query(IdCommessa);
							db.query(queryTplCreateTrasportoTecnicoC, [], function (error, result, info) {
								if (error) {
									console.log(error);
								} else {
									console.log("tplCreateTrasportoTecnicoC ",count++,"lvl: WORKS!");
									let TecnicoC = result && result[0] && result[0]['Tecnico'] ? result[0]['Tecnico'] : '';
									
									let oRichiedente = {};
									oRichiedente.IdEdificio = IdEdificio;
									oRichiedente.IdCommessa = IdCommessa;
									oRichiedente.IdUtente = IdUtente;
									oRichiedente.fm = 1;
									let queryFmGetRichiedente = querySql.fmGetRichiedente.query(oRichiedente);
									db.query(queryFmGetRichiedente, [], function (error, result, info) {
										if (error) {
											console.log(error);
										} else {
											console.log("fmGetRichiedente ",count++,"lvl: WORKS!");
											let IdRichiedente = result && result[0] && result[0]['IdRichiedente'] ? result[0]['IdRichiedente'] : '';
											let Richiedente = result && result[0] && result[0]['Richiedente'] ? result[0]['Richiedente'] : '';
											
											if (IdRichiedente === '') {
												let msg = traduttore[agent.locale].p10;
												agent.add(msg);
												resolve(agent);
												return;
											}
											
											let oIdAffidatario = {};
											oIdAffidatario.IdCommessa = IdCommessa;
											oIdAffidatario.IdMestiere = IdMestiere;
											oIdAffidatario.IdEdificio = IdEdificio;
											let queryFmGetIdAffidatariByEdificioMestiere = querySql.fmGetIdAffidatariByEdificioMestiere.query(oIdAffidatario);
											db.query(queryFmGetIdAffidatariByEdificioMestiere, [], function (error, result, info) {
												if (error) {
													console.log(error);
												} else {
													console.log("fmGetIdAffidatariByEdificioMestiere ",count++,"lvl: WORKS!");
													let IdAffidatario = result && result[0] && result[0]['IdAffidatario'] ? result[0]['IdAffidatario'] : 'null';
													
													let queryTplCreateTrasportoAnnoCorrente = querySql.tplCreateTrasportoAnnoCorrente.query();
													db.query(queryTplCreateTrasportoAnnoCorrente, [], function (error, result, info) {
														if (error) {
															console.log(error);
														} else {
															console.log("tplCreateTrasportoAnnoCorrente ",count++,"lvl: WORKS!");
															let AnnoCorrente = result && result[0] && result[0]['AnnoCorrente'] ? result[0]['AnnoCorrente'] : '';
															AnnoCorrente = parseInt(AnnoCorrente);
															
															let oGradoUrgenza = {};
															oGradoUrgenza.IdCommessa = IdCommessa;
															oGradoUrgenza.gradoUrgenza = gradoUrgenza;
															let queryFmGetGradoUrgenza = querySql.fmGetGradoUrgenza.query(oGradoUrgenza);
															db.query(queryFmGetGradoUrgenza, [], function (error, result, info) {
																if (error) {
																	console.log(error);
																} else {
																	console.log("fmGetGradoUrgenza ",count++,"lvl: WORKS!");
																	let GradoUrgenza = result && result[0] && result[0]['GradoU'] ? result[0]['GradoU'] : '';

																	let queryTplCreateTrasportoMaxNumRichieste = querySql.tplCreateTrasportoMaxNumRichieste.query(IdCommessa, AnnoCorrente);
																	db.query(queryTplCreateTrasportoMaxNumRichieste, [], function (error, result, info) {
																		if (error) {
																			console.log(error);
																		} else {
																			console.log("tplCreateTrasportoMaxNumRichieste ",count++,"lvl: WORKS!");
																			let NewNumRichiesta = result && result[0] && result[0]['NewNumRichiesta'] ? result[0]['NewNumRichiesta'] : '';
																			NewNumRichiesta = parseInt(NewNumRichiesta)+1;

																			// richiesta intervento
																			// richiesta preventivo
																			// richiesta extracanone
																			let Classificazione = "Canone";
																			let TipoIntervento = "";
																			let Stato = -1;
																			let vedeAffidatario = ' null ';
																			let VAutorizzazione = 0;
																			let IdUtilizzatore = ' null ';
																			switch (tipo) {
																				case "richiesta preventivo":
																					Classificazione = "Extracanone";
																					TipoIntervento = "Preventivo";
																					Stato = 4;
																					vedeAffidatario = 1;
																					break;
																				case "proposta extracanone":
																					Classificazione = "Extracanone";
																					Stato = 2;
																					break;
																				case "richiesta extracanone":
																					Classificazione = "Extracanone";
																					TipoIntervento = "Consuntivo";
																					Stato = 18;
																					VAutorizzazione = 1;
																					break;
																				case "ordine extracanone":
																					Classificazione = "Extracanone";
																					TipoIntervento = "Consuntivo";
																					Stato = 35;
																					VAutorizzazione = 1;
																					break;
																				case "richiesta intervento":
																				default:
																				break;
																			}
																			
																			let oFmRichiesta = {};
																			oFmRichiesta.IdRichiedente = IdRichiedente;
																			oFmRichiesta.Richiedente = Richiedente; // idutente
																			oFmRichiesta.IdAffidatario = IdAffidatario;
																			oFmRichiesta.IdUtente = IdUtente;
																			oFmRichiesta.Utente = Utente;
																			oFmRichiesta.Localizzazione = IdEdificio; // idedificio
																			oFmRichiesta.IdMestiere = IdMestiere;
																			oFmRichiesta.IdComponenteMestiere = ' null ';
																			oFmRichiesta.IdAttivitaMestiere = ' null ';
																			oFmRichiesta.IdLivello = ' null ';  // piano 
																			oFmRichiesta.IdAmbiente = ' null ';
																			oFmRichiesta.IdComponente = ' null '; 
																			oFmRichiesta.IdUtilizzatore = IdUtilizzatore;  // poss null
																			oFmRichiesta.TipoIntervento = TipoIntervento; // extracanone/canone // CAMBIA
																			oFmRichiesta.des1 = des1; // 
																			oFmRichiesta.des2 = des2;
																			oFmRichiesta.des3 = des3;
																			oFmRichiesta.NoteX = '';
																			oFmRichiesta.GradoUrgenza = GradoUrgenza;
																			oFmRichiesta.TecnicoC = TecnicoC; // CAMBIA
																			oFmRichiesta.Classificazione = Classificazione; // CAMBIA
																			oFmRichiesta.Tipo = 'Web';
																			oFmRichiesta.Stato = Stato; // CAMBIA
																			oFmRichiesta.DataAutorizzazione = ' GETDATE() ';
																			oFmRichiesta.VAutorizzazione = VAutorizzazione;
																			oFmRichiesta.IdCommessa = IdCommessa;
																			oFmRichiesta.NumRichiesta = NewNumRichiesta;
																			oFmRichiesta.AnnoRichiesta = AnnoCorrente;
																			oFmRichiesta.DocSanitaria = 0;
																			oFmRichiesta.Salma = 0;
																			oFmRichiesta.NotificaAndroid = 0;
																			oFmRichiesta.IdCommessaPersona = IdCommessa;
																			oFmRichiesta.vedeAffidatario = vedeAffidatario; // CAMBIA
																			
																			let queryFmCreateRichiesta = querySql.fmCreateRichiesta.query(oFmRichiesta);
																			db.query(queryFmCreateRichiesta, [], function (error, resultfmcreaterichiesta, info) {
																				if (error) {
																					console.log(error);
																				} else {
																					console.log("fmcreaterichiesta ",count++,"lvl: works!");
																					let msg = querySql.fmCreateRichiesta.result(resultfmcreaterichiesta, agent)
																					+traduttore[agent.locale].p19+oFmRichiesta.NumRichiesta+'-'+oFmRichiesta.AnnoRichiesta;
																					agent.add(msg);
																					resolve(agent);
																				}
																			});
																		}
																	});
																}
															});
															
														}
													});

												}
											});
										}
									});
									
								}
							});	
							
						}
					});

				});				
			}
      	});
	}
	
	function fmCreateRichiestaMestiere (agent) {
		return new Promise((resolve, reject) => {
			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					
					let count = 0;
					
					// CHECK PARAMETRI
					let descrizione = '';
					let edificio = '';
					let gradoUrgenza = '';
					let tipo = '';
					let IdEdificio = '';
					let contextIn = agent.context.get('ctxparrichiestamestiere');
					if (contextIn && contextIn.parameters) {
						mestiere = contextIn.parameters && contextIn.parameters.mestiere ? contextIn.parameters.mestiere : '';
						descrizione = contextIn.parameters && contextIn.parameters.descrizione ? contextIn.parameters.descrizione : '';
						gradoUrgenza = contextIn.parameters && contextIn.parameters.gradoUrgenza ? contextIn.parameters.gradoUrgenza : '';
						tipo = contextIn.parameters && contextIn.parameters.tipo ? contextIn.parameters.tipo : '';
						IdEdificio = contextIn.parameters && contextIn.parameters.IdEdificio ? contextIn.parameters.IdEdificio : '';
						agent.context.delete('ctxparrichiestamestiere');
					}
					
					
					let des1 = descrizione.replace(/'/g," ");
					let des2 = '';
					let des3 = '';
					
					
					// console.log('Parametri: ',contextIn.parameters)
		
					let queryTplCreateTrasportoTecnicoC = querySql.tplCreateTrasportoTecnicoC.query(IdCommessa);
					db.query(queryTplCreateTrasportoTecnicoC, [], function (error, result, info) {
						if (error) {
							console.log(error);
						} else {
							console.log("tplCreateTrasportoTecnicoC ",count++,"lvl: WORKS!");
							let TecnicoC = result && result[0] && result[0]['Tecnico'] ? result[0]['Tecnico'] : '';
							
							let oRichiedente = {};
							oRichiedente.IdEdificio = IdEdificio;
							oRichiedente.IdCommessa = IdCommessa;
							oRichiedente.IdUtente = IdUtente;
							oRichiedente.fm = 1;
							let queryFmGetRichiedente = querySql.fmGetRichiedente.query(oRichiedente);
							db.query(queryFmGetRichiedente, [], function (error, result, info) {
								if (error) {
									console.log(error);
								} else {
									console.log("fmGetRichiedente ",count++,"lvl: WORKS!");
									let IdRichiedente = result && result[0] && result[0]['IdRichiedente'] ? result[0]['IdRichiedente'] : '';
									let Richiedente = result && result[0] && result[0]['Richiedente'] ? result[0]['Richiedente'] : '';
									
									if (IdRichiedente === '') {
										let msg = traduttore[agent.locale].p10;
										agent.add(msg);
										resolve(agent);
										return;
									}
									
									let oIdAffidatario = {};
									oIdAffidatario.IdCommessa = IdCommessa;
									oIdAffidatario.IdMestiere = IdMestiere;
									oIdAffidatario.IdEdificio = IdEdificio;
									let queryFmGetIdAffidatariByEdificioMestiere = querySql.fmGetIdAffidatariByEdificioMestiere.query(oIdAffidatario);
									db.query(queryFmGetIdAffidatariByEdificioMestiere, [], function (error, result, info) {
										if (error) {
											console.log(error);
										} else {
											console.log("fmGetIdAffidatariByEdificioMestiere ",count++,"lvl: WORKS!");
											let IdAffidatario = result && result[0] && result[0]['IdAffidatario'] ? result[0]['IdAffidatario'] : 'null';
											
											let queryTplCreateTrasportoAnnoCorrente = querySql.tplCreateTrasportoAnnoCorrente.query();
											db.query(queryTplCreateTrasportoAnnoCorrente, [], function (error, result, info) {
												if (error) {
													console.log(error);
												} else {
													console.log("tplCreateTrasportoAnnoCorrente ",count++,"lvl: WORKS!");
													let AnnoCorrente = result && result[0] && result[0]['AnnoCorrente'] ? result[0]['AnnoCorrente'] : '';
													AnnoCorrente = parseInt(AnnoCorrente);
													
													let oGradoUrgenza = {};
													oGradoUrgenza.IdCommessa = IdCommessa;
													oGradoUrgenza.gradoUrgenza = gradoUrgenza;
													let queryFmGetGradoUrgenza = querySql.fmGetGradoUrgenza.query(oGradoUrgenza);
													db.query(queryFmGetGradoUrgenza, [], function (error, result, info) {
														if (error) {
															console.log(error);
														} else {
															console.log("fmGetGradoUrgenza ",count++,"lvl: WORKS!");
															let GradoUrgenza = result && result[0] && result[0]['GradoU'] ? result[0]['GradoU'] : '';

															let queryTplCreateTrasportoMaxNumRichieste = querySql.tplCreateTrasportoMaxNumRichieste.query(IdCommessa, AnnoCorrente);
															db.query(queryTplCreateTrasportoMaxNumRichieste, [], function (error, result, info) {
																if (error) {
																	console.log(error);
																} else {
																	console.log("tplCreateTrasportoMaxNumRichieste ",count++,"lvl: WORKS!");
																	let NewNumRichiesta = result && result[0] && result[0]['NewNumRichiesta'] ? result[0]['NewNumRichiesta'] : '';
																	NewNumRichiesta = parseInt(NewNumRichiesta)+1;

																	// richiesta intervento
																	// richiesta preventivo
																	// richiesta extracanone
																	let Classificazione = "Canone";
																	let TipoIntervento = "";
																	let Stato = -1;
																	let vedeAffidatario = ' null ';
																	let VAutorizzazione = 0;
																	let IdUtilizzatore = ' null ';
																	// assistance request 	-- richiesta di intervento
																	// extra fee request 	-- richiesta extracanone
																	// quotation request 	-- richiesta preventivo
																	// extra fee request 	-- richiesta extracanone
																	// extra fee proposal 	-- proposta extracanone
																	// extra fee order 	-- ordine extracanone
																	switch (tipo) {
																		case "quotation request":
																		case "richiesta preventivo":
																			Classificazione = "Extracanone";
																			TipoIntervento = "Preventivo";
																			Stato = 4;
																			vedeAffidatario = 1;
																			break;
																		case "extra fee proposal":
																		case "proposta extracanone":
																			Classificazione = "Extracanone";
																			Stato = 2;
																			break;
																		case "extra fee request":
																		case "richiesta extracanone":
																			Classificazione = "Extracanone";
																			TipoIntervento = "Consuntivo";
																			Stato = 18;
																			VAutorizzazione = 1;
																			break;
																		case "extra fee order":
																		case "ordine extracanone":
																			Classificazione = "Extracanone";
																			TipoIntervento = "Consuntivo";
																			Stato = 35;
																			VAutorizzazione = 1;
																			break;
																		case "assistance request":
																		case "richiesta intervento":
																		default:
																		break;
																	}
																	
																	let oFmRichiesta = {};
																	oFmRichiesta.IdRichiedente = IdRichiedente;
																	oFmRichiesta.Richiedente = Richiedente; // idutente
																	oFmRichiesta.IdAffidatario = IdAffidatario;
																	oFmRichiesta.IdUtente = IdUtente;
																	oFmRichiesta.Utente = Utente;
																	oFmRichiesta.Localizzazione = IdEdificio; // idedificio
																	oFmRichiesta.IdMestiere = IdMestiere;
																	oFmRichiesta.IdComponenteMestiere = ' null ';
																	oFmRichiesta.IdAttivitaMestiere = ' null ';
																	oFmRichiesta.IdLivello = ' null ';  // piano 
																	oFmRichiesta.IdAmbiente = ' null ';
																	oFmRichiesta.IdComponente = ' null '; 
																	oFmRichiesta.IdUtilizzatore = IdUtilizzatore;  // poss null
																	oFmRichiesta.TipoIntervento = TipoIntervento; // extracanone/canone // CAMBIA
																	oFmRichiesta.des1 = des1; // 
																	oFmRichiesta.des2 = des2;
																	oFmRichiesta.des3 = des3;
																	oFmRichiesta.NoteX = '';
																	oFmRichiesta.GradoUrgenza = GradoUrgenza;
																	oFmRichiesta.TecnicoC = TecnicoC; // CAMBIA
																	oFmRichiesta.Classificazione = Classificazione; // CAMBIA
																	oFmRichiesta.Tipo = 'Web';
																	oFmRichiesta.Stato = Stato; // CAMBIA
																	oFmRichiesta.DataAutorizzazione = ' GETDATE() ';
																	oFmRichiesta.VAutorizzazione = VAutorizzazione;
																	oFmRichiesta.IdCommessa = IdCommessa;
																	oFmRichiesta.NumRichiesta = NewNumRichiesta;
																	oFmRichiesta.AnnoRichiesta = AnnoCorrente;
																	oFmRichiesta.DocSanitaria = 0;
																	oFmRichiesta.Salma = 0;
																	oFmRichiesta.NotificaAndroid = 0;
																	oFmRichiesta.IdCommessaPersona = IdCommessa;
																	oFmRichiesta.vedeAffidatario = vedeAffidatario; // CAMBIA
																	
																	let queryFmCreateRichiesta = querySql.fmCreateRichiesta.query(oFmRichiesta);
																	db.query(queryFmCreateRichiesta, [], function (error, resultfmcreaterichiesta, info) {
																		if (error) {
																			console.log(error);
																		} else {
																			console.log("fmcreaterichiesta ",count++,"lvl: works!");
																			let msg = querySql.fmCreateRichiesta.result(resultfmcreaterichiesta, agent)
																			+traduttore[agent.locale].p19+oFmRichiesta.NumRichiesta+'-'+oFmRichiesta.AnnoRichiesta;
																			agent.add(msg);
																			resolve(agent);
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				});				
			}
      	});
	}
	
	
	
	let intentMap = new Map();
    intentMap.set('testDiProva', testDiProva);
	intentMap.set('welcome', welcome);
	intentMap.set('getDataMssql2014', handlerGetDataMssql2014);
	// Gestione monitor intent
	intentMap.set('tplMonitorScansionaRichieste', tplMonitorScansionaRichieste);
	intentMap.set('tplGestioneOperatore', tplGestioneOperatore);
	intentMap.set('tplGestioneOperatoreYes', tplGestioneOperatoreYes);
	intentMap.set('tplMancanzaPresaIncaricoOperatore', tplMancanzaPresaIncaricoOperatore);
	intentMap.set('tplCreateTrasporto', tplCreateTrasporto);
	intentMap.set('tplAssegnamentoAutomatico', tplAssegnamentoAutomatico);
	// Gestione FM
	intentMap.set('fmCreateRichiesta', fmCreateRichiesta);
	intentMap.set('fmCreateRichiestaEdificio', fmCreateRichiestaEdificio);
	intentMap.set('fmCreateRichiestaMestiere', fmCreateRichiestaMestiere);
    agent.handleRequest(intentMap)
		.then(res => console.log('WebHook OK: ', res))
		.catch( err => console.error('WebHook Errore: ', err));
});

app.post('/fulfillment', function (req, res, next) {
	console.log('E\' arrivata una richiesta /fulfillment');
	if (!req.body) return res.sendStatus(400);
	dialogflowFirebaseFulfillment(req,res);
});



// # DIALOGFLOW SESSION CLIENT
// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
  let request = '';
  let aQuery = [];
  if (query.indexOf('#evento#') > -1) {
	aQuery = query.split('#evento#');
	
	request = {
		session: sessionPath,
		queryInput: {
		  event: {
			name: aQuery[1],
			languageCode: languageCode,
		  },
		},
	  };	  
  } else if (query.indexOf('#eparams#') > -1) {
	let evento = query.split("#eparams#")[1].split("?")[0];
	
	if (evento === 'fmCreateRichiestaEdificio' ) {
		IdEdificio = query.split("#eparams#")[1].split("?")[1].split("=")[1];
	}
	else if (evento === 'fmCreateRichiestaMestiere') {
		IdMestiere = query.split("#eparams#")[1].split("?")[1].split("=")[1];
	}
	
	request = {
		session: sessionPath,
		queryInput: {
		  event: {
			name: evento,
			languageCode: languageCode,
		  },
		},
	  };	  
  } else {
	request = {
		session: sessionPath,
		queryInput: {
		  text: {
			text: query,
			languageCode: languageCode,
		  },
		},
	};	  
  }

  // console.log(request, ' ---- ', aQuery, ' ---- ', query);
  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }
  console.log("Richiesta -- Dialogflow");
  const responses = await sessionClient.detectIntent(request);
  // console.log(' Risposta Dialogflow: ', responses)
  return responses[0];
}

let context = '';
async function executeQueries(projectId, sessionId, query, languageCode) {
	// Keeping the context across queries let's us simulate an ongoing conversation with the bot
	let intentResponse;
	try {
	  console.log(`Sending Query: ${query}`);
	  intentResponse = await detectIntent(
		projectId,
		sessionId,
		query,
		context,
		languageCode
	  );
	  console.log('Detected intent');
	  if (intentResponse.queryResult 
	      && intentResponse.queryResult.intent 
		  && intentResponse.queryResult.intent.name) {
		  console.log(
			`Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`,
			`\n INTENT: ${intentResponse.queryResult.intent.name}`
		  );		  
	  } else {
		  console.log('Non trovo l\'intent giusto. :°°°( ');
	  }
	  // Use the context from this response for next queries
	  context = intentResponse.queryResult.outputContexts;
	  // console.log('context: ',context);
	  // console.log('risposta: ', intentResponse);
	  // intentResponse.queryResult.fulfillmentMessages.push({
		  // text: 'cliccami',
		  // postback: 'https://www.youtube.com/watch?v=DrK8njidoqM'
	  // });
	  return intentResponse;
	} catch (error) {
	  console.log(error);
	  return "0";
	}
}
// #**** FINE ****#


// #### DIALOGFLOW ####
// 1. interrogo il db e pulisco i dati che mi tornano
// 2. scarico l'entita che ho su dialogflow
// 3. mergio i due array
// 4. lo rendo univoco
// 5. vado a scrivere su dialogflow
let updateEntityType = async (entityTypeDisplayName, entityTypeId, oQueryCustom, languageCode) => {
    return new Promise((resolve, reject) => {
		// let languageCode 
		switch(languageCode){
			case 'en-US':
				languageCode = 'en';
				break;
			case 'it':
			default:
				break;
		}
        let entityValues = [];
        if (!OdbcName) console.log('ODBC: connessione assente.');
        else {
        let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
        db.open(configurazioneOdbc, function(err)
        {
            if (err) {
            console.log(err);
            return;
            }
            let oParams = {
                IdCommessa: IdCommessa
            };
            let queryCustom = querySql[oQueryCustom.queryCustom].query(oQueryCustom);
            db.query(queryCustom, [], async function (error, result, info) {
                if (error) {
                    console.log(error);
                } else {
                    const client = new dialogflow.EntityTypesClient();
                    const projectId = await client.getProjectId();
                    const name = client.entityTypePath(projectId, entityTypeId);
                    const kind = 'KIND_MAP';
                    let count = 0;
                    
                    console.log(count++,'# ',oQueryCustom.queryCustom ,' WORKS!!!');			
                    
                    for (var i = 0; i < result.length; i++) {
                        entityValues[i] = result[i][oQueryCustom.oParams.p1];
                    }
                    entityValues = _.compact(entityValues);
                    
                    let res = await client.getEntityType({
                        name: name,
                        languageCode: languageCode
                    })

                    let aEntities = res[0].entities
					
                    let entities = [];
                    entityValues.forEach(entityValue => {
                        entities.push({
                        value: entityValue,
                        synonyms: [
                            entityValue
                            ,entityValue.toUpperCase()
                            ,entityValue.toLowerCase()
                            , entityValue.charAt(0).toUpperCase()+entityValue.substr(1, entityValue.length)
                        ],
                        });
                    });

                    entities = aEntities.concat(entities)
                    entities = _.uniqBy(entities, 'value');

                    let request = {
                        entityType: {
                        name: name,
                        displayName: entityTypeDisplayName,
                        kind: kind,
                        autoExpansionMode: 'AUTO_EXPANSION_MODE_DEFAULT',
                        entities: entities
                        },
                        languageCode: languageCode,
                    }
					
					
					// console.log(entities.length, aEntities.length);
					
					if (entities.length !== aEntities.length) {
						let res2 = await client.updateEntityType(request)
						console.log(count++,'# updateEntityType ',oQueryCustom.queryCustom ,' UPDATE WORKS!!!');
					} else {
						console.log(count++,'# updateEntityType ',oQueryCustom.queryCustom ,' NO UPDATE');
					}
                    resolve('WORKS!!!');
                }
            });
        })
        }
    });
}

app.get('/webhook', function (req, response, next) {
	//  PARAMETRI IN ARRIVO DA NATISOFT
	IdCommessa = req.query.IdCommessa;
	OdbcName = req.query.OdbcName;
	Utente = req.query.Utente;
	IdUtente = req.query.IdUtente;
	UrlManpronet = req.query.UrlManpronet;
	IdDitta = req.query.IdDitta;
	IdRisorsa = req.query.IdRisorsa;
	AGENT_LANGUAGE = req.query.AGENT_LANGUAGE;
	
	console.log(shellColor.FgYellow,'ODBC NAME: ', OdbcName, ' - COMMESSA: ', IdCommessa , ' - UTENTE: ', Utente, shellColor.Reset);
	
	
	// Query
	Query = req.query.q;
	Query = decodeURIComponent(Query);
	console.log('QUERY: ', Query);
	querySqlLog.opzioniAssistenteGoogleLog.Query = Query;
	querySqlLog.opzioniAssistenteGoogleLog.Data = funLib.now();
	querySqlLog.opzioniAssistenteGoogleLog.IdUtente = IdUtente;
	querySqlLog.opzioniAssistenteGoogleLog.IdCommessa = IdCommessa;
	querySqlLog.opzioniAssistenteGoogleLog.Url = UrlManpronet;
	
	ServerName = req.query.ServerName;
	
	// ATTENZIONE:
	// vado a recuperare il nome del server
	// bisogna dare lo stesso nome del server anche in configurazioni
	if (ServerName) {
		ServerName = ServerName.split('.')[0];
		console.log(shellColor.FgGreen,'Nome del Server: ',ServerName, ' - LANG: ', AGENT_LANGUAGE, shellColor.Reset);
		// process.env.GOOGLE_APPLICATION_CREDENTIALS = configurazioni[ServerName].pathprivatekey;
	}
	
	// console.log('\nQUERY: ', req.query.IdCommessa);
	console.log('\nCALL DF');
	let url = req.url.replace('/webhook', '');
	// console.log(req.url, '\n', url);

	process.env.GOOGLE_APPLICATION_CREDENTIALS = configurazioni[ServerName].pathprivatekey;
	console.log('Var: ', process.env.GOOGLE_APPLICATION_CREDENTIALS);
	const projectid = configurazioni[ServerName].projectid;
	const sessionid = uuid.v4();
	const queries = Query;
	// const languagecode = 'it-IT';
	let languagecode = AGENT_LANGUAGE;
	let responsedialog;
	
	console.log('Arrivata una query: start');

	// #### UPDATE ENTITA ####
	// devo fare rifornimento, devo irrorare di entità
	let oQueryCustom = {
		IdCommessa: IdCommessa,
		queryCustom: 'qEdifici',
		oParams: {
			p1: 'EdificioBreve',
			p2: 'Indirizzo'
		}
	}
	let promiseEdifici = updateEntityType(configurazioni[ServerName].entita[0].name, configurazioni[ServerName].entita[0].id, oQueryCustom, languagecode);
	
	oQueryCustom = {
		IdCommessa: IdCommessa,
		queryCustom: 'qMestieri',
		oParams: {
			p1: 'Descrizione'
		}
	}
	let promiseMestieri = updateEntityType(configurazioni[ServerName].entita[1].name, configurazioni[ServerName].entita[1].id, oQueryCustom, languagecode);
	
	oQueryCustom = {
		IdCommessa: IdCommessa,
		queryCustom: 'qGradoUrgenza',
		oParams: {
			p1: 'Descrizione'
		}
	}
	let promiseGradoUrgenza = updateEntityType(configurazioni[ServerName].entita[2].name, configurazioni[ServerName].entita[2].id, oQueryCustom, languagecode);
	
	Promise.all([promiseEdifici, promiseMestieri, promiseGradoUrgenza]).then(values => { 
		console.log(' update Entita\' WORKS!!!: ', values);
		// Call start
		(async() => {
			responsedialog = await executeQueries(projectid, sessionid, queries, languagecode);
			let intentName = '';
			
			if (responsedialog === "0")
				querySqlLog.opzioniAssistenteGoogleLog.Successo = 0;
			else 
				querySqlLog.opzioniAssistenteGoogleLog.Successo = 1;
				querySqlLog.opzioniAssistenteGoogleLog.IntentName = responsedialog.queryResult && responsedialog.queryResult.intent && responsedialog.queryResult.intent.displayName ? responsedialog.queryResult.intent.displayName : 'No intent';

				
			if (!OdbcName) resolve(agent.add(traduttore[agent.locale].p1));
			else {
				let configurazioneOdbc = "DRIVER="+configurazioni[ServerName].driver+";DSN="+OdbcName+";SERVER="+configurazioni[ServerName].server+";UID="+configurazioni[ServerName].username+";PWD="+configurazioni[ServerName].password+";DATABASE="+OdbcName+";";
				db.open(configurazioneOdbc, function(err)
				{
					if (err) {
						console.log(err);
						return;
					}
					db.query(querySqlLog.assistenteGoogleLog(querySqlLog.opzioniAssistenteGoogleLog), [], function (error, result, info) {
						console.log("ODBC: LOG WORKS! ");
						if (error) console.log('LOG: ', error);
						else console.log('LOG: salvato');
					});
				});				
			}
			
			response.send(responsedialog);

			console.log('Spedita la query: rimango in attesa.');
		})();
	});
	// ####
});