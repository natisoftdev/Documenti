use mpnet_colser_regionefvg

--DELETE FROM Fatturazione
--DELETE FROM FatturazioneEdifici
--DELETE FROM FatturazioneMeseAnno
--DELETE FROM FatturazioneMestieri
--DELETE FROM FatturazioneDocumenti
--DELETE FROM FatturazioneAffidatari
--DELETE FROM FatturazioneMestieriAffidatari


select * FROM Fatturazione
select * FROM FatturazioneMeseAnno
select * FROM FatturazioneEdifici
select * FROM FatturazioneMestieri
select * FROM FatturazioneDocumenti
select * FROM FatturazioneAffidatari
select * FROM FatturazioneMestieriAffidatari

declare @IdCommessa int = 1
declare @IdOfferta int = 0 --1/4


-- 4B
--select * 
delete
FROM FatturazioneMestieriAffidatari
where IdFatturazioneAffidatari in (
	select IdFatturazioneAffidatari FROM FatturazioneAffidatari
	where IdFatturazioneMeseAnno in (
		select IdFatturazioneMeseAnno FROM FatturazioneMeseAnno
		where IdFatturazione in (
			select IdFatturazione
			FROM Fatturazione
			where 
			IdCommessa = @IdCommessa
			and IdOfferta = @IdOfferta
		)
	)
)



-- 4
--select *
delete
FROM FatturazioneMestieri
--where IdFatturazioneEdifici in (4017, 4018, 4019, 4020, 4021, 4022)
where IdFatturazioneEdifici in (
	select IdFatturazioneEdifici FROM FatturazioneEdifici
	where IdFatturazioneMeseAnno in (
		select IdFatturazioneMeseAnno FROM FatturazioneMeseAnno
		where IdFatturazione in (
			select IdFatturazione
			FROM Fatturazione
			where 
			IdCommessa = @IdCommessa
			and IdOfferta = @IdOfferta
		)
	)
)


-- 3B
--select *
delete
FROM FatturazioneAffidatari
where IdFatturazioneMeseAnno in (
	select IdFatturazioneMeseAnno FROM FatturazioneMeseAnno
	where IdFatturazione in (
		select IdFatturazione
		FROM Fatturazione
		where 
		IdCommessa = @IdCommessa
		and IdOfferta = @IdOfferta
	)
)



-- 3A
--select * 
delete
FROM FatturazioneDocumenti
where IdFatturazioneMeseAnno in (
	select IdFatturazioneMeseAnno FROM FatturazioneMeseAnno
	where IdFatturazione in (
		select IdFatturazione
		FROM Fatturazione
		where 
		IdCommessa = @IdCommessa
		and IdOfferta = @IdOfferta
	)
)


-- 3
--select * 
delete
FROM FatturazioneEdifici
where IdFatturazioneMeseAnno in (
	select IdFatturazioneMeseAnno FROM FatturazioneMeseAnno
	where IdFatturazione in (
		select IdFatturazione
		FROM Fatturazione
		where 
		IdCommessa = @IdCommessa
		and IdOfferta = @IdOfferta
	)
)



-- 2
--select * 
delete
FROM FatturazioneMeseAnno
where IdFatturazione in (
	select IdFatturazione
	FROM Fatturazione
	where 
	IdCommessa = @IdCommessa
	and IdOfferta = @IdOfferta
)



-- 1
--select * 
delete
FROM Fatturazione
where 
IdCommessa = @IdCommessa
and IdOfferta = @IdOfferta
