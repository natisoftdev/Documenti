select codedificio, (select count(*) from Contabilità where Contabilità.CodEdificio = ordini.codedificio), count(*)
from ordini
INNER JOIN
               UtentiEdifici ON Ordini.IDCommessa = UtentiEdifici.IdCommessa AND Ordini.CodEdificio = UtentiEdifici.IdEdificio

 where statoord>= 50 and Contabiliz = 'Extracanone' 

 and (UtentiEdifici.IdUtente = 1)
group by CodEdificio
 order by CodEdificio

