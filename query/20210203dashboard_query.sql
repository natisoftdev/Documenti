select DataScadenza from ordini 
INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
where DataScadenza is not null
and (UtentiEdifici.IdUtente = 1)

select DataScadenza from ordini 
INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
where DataScadenza is not null
and cast(DataFine as date) <= cast(DataScadenza as date)
and (UtentiEdifici.IdUtente = 1)



SELECT Commesse.DesComm, ElencoEdifici.Latitudine, ElencoEdifici.Longitudine
FROM  ElencoEdifici INNER JOIN
               Commesse ON ElencoEdifici.IdCommessa = Commesse.IDCommessa
ORDER BY Commesse.DesComm


SELECT COUNT(Richieste.IdRich) AS Expr1
FROM  Richieste INNER JOIN
               Stati ON Richieste.Stato = Stati.IDStato INNER JOIN
               UtentiEdifici ON Richieste.IDCommessa = UtentiEdifici.IdCommessa AND Richieste.Localizzazione = UtentiEdifici.IdEdificio
WHERE (Richieste.Stato IN (1, 4, 5, 18))
and  (UtentiEdifici.IdUtente = 1)


-- finite in tempo
SELECT COUNT(*) AS Expr1
FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NOT NULL) AND (CAST(Ordini.DataFine AS date) <= CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)

-- finite in ritardo
SELECT COUNT(*) AS Expr1
FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NOT NULL) AND (CAST(Ordini.DataFine AS date) > CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)

-- quelle non ancora terminate
SELECT COUNT(*) AS Expr1
FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NULL) AND (CAST(GETDATE() AS date) > CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)

SELECT Richieste.Localizzazione, COUNT(*) AS Expr1
FROM  Richieste INNER JOIN
               UtentiEdifici ON Richieste.IDCommessa = UtentiEdifici.IdCommessa AND Richieste.Localizzazione = UtentiEdifici.IdEdificio
GROUP BY Richieste.Localizzazione, UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)







##################
use mpnet_build_fsi

-- finite in tempo (4)
SELECT COUNT(*) AS Expr1
FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NOT NULL) AND (CAST(Ordini.DataFine AS date) <= CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)

-- finite in ritardo (3)
SELECT Ordini.CodEdificio, COUNT(*) AS Expr1
FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NOT NULL) AND (CAST(Ordini.DataFine AS date) > CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente, Ordini.CodEdificio
HAVING (UtentiEdifici.IdUtente = 1)
order by Ordini.CodEdificio

-- quelle non ancora terminate in ritardo (1)
SELECT COUNT(*) AS Expr1
FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NULL) AND (CAST(GETDATE() AS date) > CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)

-- quelle non ancora terminate ma in tempo (2)
SELECT COUNT(*) AS Expr1
FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NULL) AND (CAST(GETDATE() AS date) <= CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)

##################
SELECT  top 20 ElencoEdifici.Codice, ElencoEdifici.EdificioBreve, Ordini.CodEdificio, 
isnull((SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NULL) AND (CAST(GETDATE() AS date) > CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)
), 0) as NoTermInRit,
isnull((SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NULL) AND (CAST(GETDATE() AS date) <= CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)
), 0) as NoTermInTemp,
isnull((SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NOT NULL) AND (CAST(o.DataFine AS date) > CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)
), 0) as FinInRit,
isnull((SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NOT NULL) AND (CAST(o.DataFine AS date) <= CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)
), 0) as FinInTemp,
(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP')
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)
) as Totale,

isnull(((100.0*(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NULL) AND (CAST(GETDATE() AS date) > CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1))/(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP')
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)))), 0) as NoTermInRitPerc,


isnull(((100.0*(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NULL) AND (CAST(GETDATE() AS date) <= CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1))/(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP')
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)))), 0) as NoTermInTempPerc,



isnull(((100.0*(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NOT NULL) AND (CAST(o.DataFine AS date) > CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1))/(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP')
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)))), 0) as FinInRitPerc,



isnull(((100.0*(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP') AND (o.DataFine IS NOT NULL) AND (CAST(o.DataFine AS date) <= CAST(o.DataFineProg AS date))
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1))/(SELECT  COUNT(*) 
FROM  Ordini as o INNER JOIN
               UtentiEdifici ON o.IDCommessa = UtentiEdifici.IdCommessa AND o.CodEdificio = UtentiEdifici.IdEdificio
WHERE (o.GradoUrgenza = 'MP')
and o.CodEdificio = ordini.CodEdificio
GROUP BY UtentiEdifici.IdUtente
HAVING (UtentiEdifici.IdUtente = 1)))), 0) as FinInTempPerc




FROM  Ordini INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio
			   inner join ElencoEdifici on Ordini.IDCommessa = ElencoEdifici.IdCommessa AND Ordini.CodEdificio = ElencoEdifici.ID
WHERE (Ordini.GradoUrgenza = 'MP') AND (Ordini.DataFine IS NULL) AND (CAST(GETDATE() AS date) > CAST(Ordini.DataFineProg AS date))
GROUP BY UtentiEdifici.IdUtente,ElencoEdifici.Codice, ElencoEdifici.EdificioBreve, Ordini.CodEdificio
HAVING (UtentiEdifici.IdUtente = 1)

order by NoTermInRitPerc











select codedificio, IDORD, (select  top 1 1 from Contabilità 
where numordine=ordini.numordine and AnnoOrdine=ordini.AnnoOrdine and IDCommessa=ordini.IDCommessa) AS CONT
from ordini
INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio

 where statoord>= 50 and Contabiliz = 'Extracanone' 

 and (UtentiEdifici.IdUtente = 1)
 --and codedificio=100
 order by CodEdificio
 


 