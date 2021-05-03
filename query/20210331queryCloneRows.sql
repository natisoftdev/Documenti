INSERT INTO TipiComponentiMestieri(Ordine, Descrizione, UM, IdCommessa, IdComponenteMestiere)
SELECT     Ordine, Descrizione, UM, IdCommessa, IdComponenteMestiere
FROM         TipiComponentiMestieri
WHERE    
(IdCommessa = 3) 
AND (DuplicatoPDA IS NULL OR DuplicatoPDA != 1)
and UM like 'Euro/ora'
and Fattore is not null
ORDER BY Ordine, Codice, Descrizione
