-- ***********************************************************
-- ##### https://www.youtube.com/watch?v=UMSay1XvjgI&t=1664s
-- ***********************************************************

CREATE DATABASE demodb
GO
USE demodb;
GO

-- 2

CREATE TABLE dbo.Customer
(
	CustomerID INT IDENTITY(1,1) PRIMARY KEY,
	CustomerName nvarchar(50) NOT NULL
);
GO
INSERT dbo.Customer
	VALUE ('Ugo Mezzogori'), ('Franco Pancalli');
GO

CREATE TABLE dbo.CustomerOrder
(
	CustomerOrderID int IDENTITY(1000001,1) PRIMARY KEY,
	CustomerID int NOT NULL
		FOREIGN KEY REFERENCES dbo.Customer (CustomerID),
	OrderAmount decimal(18,2) NOT NULL
);


-- 3

SELECT *
FROM dbo.Customer;
GO

INSERT INTO dbo.CustomerOrder (CustomerID, OrderAmount)
	VALUES (1, 12.50), (2, 14.70);
GO

SELECT *
FROM dbo.CustomerOrder;
GO

INSERT INTO dbo.CustomerOrder (CustomerID, OrderAmount)
	VALUES (3, 15.50);
GO

DELETE FROM dbo.Customer WHERE CustomerID = 1;

ALTER TABLE dbo.CustomerOrder
	DROP CONSTRAINT FK_CustomerO_Custo_24927208; -- Devo beccare il codice che salta a video
GO

ALTER TABLE dbo.CustomerOrder
	ADD CONSTRAINT FK_CustomerOrder_Customer;
	FOREIGN KEY (CustomerID)
	REFERENCES dbo.Customer (CustomerID)
	ON DELETE CASCADE;
GO

SELECT * FROM dbo.Customer;
SELECT * FROM dbo.CustomerOrder;
GO
DELETE FROM dbo.Customer WHERE CustomerID=1;
GO


DROP TABLE dbo.Customer;
GO


-- master data file *.MDF
-- fast disk file --> FASTDISK nella stessa cartella degli altri
-- 


-- *************************************************
-- WORKING WITH SCHEMAS
-- *************************************************
-- NAME BOUNDARY: [SERVER].[DATABASE].SCHEMA.OBJECT
-- SECURITY BOUNDARY: GRANT EXECUTE ON SCHEMA::Sales

USE demodb;
GO

CREATE SCHEMA Reporting AUTHORIZATION dbo;
GO

CREATE SCHEMA Opertions AUTHORIZATION dbo
	CREATE TABLE Flights (
		FlightID int IDENTITY(1,1) PRIMARY KEY,
		Origin nvarchar(3),
		Destination nvarchar(3)
	);
GO

DROP TABLE Operations.Flights;
GO


CREATE TABLE Reporting.Flights (
		FlightID int IDENTITY(1,1) PRIMARY KEY,
		Origin nvarchar(3),
		Destination nvarchar(3)
	);
GO

-- *************************************************
-- What are Views?
-- *************************************************

CREATE VIEW HumanResources.EmployeeList (EmployeeID, FamilyName, GivenName)
AS
SELECT EmployeeID, LastName, FirstName
FROM HumanResources.Employee

USE AdventureWorks;
GO

CREATE VIEW Person.IndividualsWithEmail
AS
SELECT p.BusinessEntityID, TITLE, FirstName, MiddleName, LastName
FROM Person.Person AS p
JOIN Person.EmailAddress as e
on p.BusinessEntityID = e.BusinessEntityID;
GO

SELECT * FROM Person.IndividualsWithEmail;
GO

SELECT * FROM Person.IndividualsWithEmail;
ORDER BY LastName;
GO

-- query the view definition via object_definition
SELECT OBJECT_DEFINITION(OBJECT_ID(N'Person.IndividualsWithEmail',N'V'));
GO 

ALTER VIEW Person.IndividualsWithEmail
WITH ENCRYPTION

-- tasto dx su una table/view --> Script VIEW as --> CREATE TO --> New Query Editor Window

ALTER VIEW Person.IndividualsWithEmail
WITH ENCRYPTION
AS
SELECT p.BusinessEntityID, Title, FirstName, MiddleName, LastName
FROM Person.Person AS p
JOIN Person.EmailAddress AS e
ON p.BusinessEntityID = e.BusinessEntityID;
GO

-- query the view definition via object_definition
SELECT OBJECT_DEFINITION(OBJECT_ID(N'Person.IndividualsWithEmail',N'V'));
GO 

-- *************************************************
-- TEMPORARY TABLE
-- *************************************************

CREATE TABLE #tmpProducts
(ProductID INTEGER, 
ProductName varchar(50));

USE people
GO

CREATE TABLE #People
(
personid UNIQUEIDENTIFIER,
firstname VARCHAR(80),
lastname VARCHAR(80),
dob DATETIME,
dod DATETIME,
sex CHAR(1)
);
GO

INSERT #People
SELECT TOP(250) *
FROM dbo.people
GO

SELECT COUNT(*)
FROM #People
GO


-- *************************************************
-- COMMON TABLE EXPRESSIONS (CTE)
-- *************************************************

USE TSQL;
GO

WITH CTE_year AS
(
	SELECT YEAR(orderdate) AS orderyear, custid
	FROM Sales.Orders
)
SELECT orderyear, COUNT(DISTINCT custid) AS cust_count
FROM CTE_year
GROUP BY orderyear;

WITH EmpOrg_CTE AS -- like CREATE VIEW = WITH
(
	SELECT empid, mgrid, lastname, firstname
	FROM HR.Employees
	WHERE empid = 5

	UNION ALL

	SELECT child.empid, child.mgrid, child.lastname, child.firstname
	FROM EmpOrg_CTE AS parent
	JOIN HR.Employee AS child ON child.mgrid = parent.empid

SELECT empid, mgrid, lastname, firstname
FROM EmpOrg_CTE;

-- *************************************************
-- PARTITIONED TABLE
-- *************************************************


USE DemoDB
GO

ALTER DATABASE DemoDB ADD FILEGROUP FG0000
GO
ALTER DATABASE DemoDB ADD FILE(NAME=F0000, FILENAME='C:\temp\F0000.ndf', SIZE=3MB, ...)
GO
ALTER DATABASE DemoDB ADD FILEGROUP FG2000
GO
ALTER DATABASE DemoDB ADD FILE(NAME=F2000, FILENAME='C:\temp\F2000.ndf', SIZE=3MB, ...)
GO
ALTER DATABASE DemoDB ADD FILEGROUP FG2001
GO
ALTER DATABASE DemoDB ADD FILE(NAME=F2001, FILENAME='C:\temp\F2001.ndf', SIZE=3MB, ...)
GO
ALTER DATABASE DemoDB ADD FILEGROUP FG2002
GO
ALTER DATABASE DemoDB ADD FILE(NAME=F2002, FILENAME='C:\temp\F2002.ndf', SIZE=3MB, ...)
GO
ALTER DATABASE DemoDB ADD FILEGROUP FG2003
GO
ALTER DATABASE DemoDB ADD FILE(NAME=F2003, FILENAME='C:\temp\F2003.ndf', SIZE=3MB, ...)
GO


CREATE PARTITION FUNCTION PF (int)  AS RANGE RIGHT FOR VALUES (20000101,20010101,20020101,20030101)
CREATE PARTITION SCHEME PS AS PARTITION PF TO (FG0000, FG2000, FG2001, FG2002, FG2003);


CREATE TABLE dbo.order_table
(
	datakey int,
	amount int
)
ON PS(datakey);
GO

INSERT dbo.order_table VALUES (20000101, 100);
INSERT dbo.order_table VALUES (20001231, 100);
INSERT dbo.order_table VALUES (20010101, 100);
INSERT dbo.order_table VALUES (20010403, 100);
GO


--  [...]


-- *************************************************
-- INDEX FUNDAMENTALS
-- *************************************************

USE tempdb;
GO

CREATE TABLE dbo.PhoneLog
(
PhoneLogID int IDENTITY(1,1),
LogRecorded datetime2 NOT NULL,
PhoneNumberCalled nvarchar(100) NOT NULL,
CallDurationMs int NOT NULL
);
GO

SELECT * FROM dbo.PhoneLog

DROP TABLE dbo.PhoneLog


CREATE TABLE dbo.PhoneLog
(
PhoneLogID int IDENTITY(1,1) PRIMARY KEY,
LogRecorded datetime2 NOT NULL,
PhoneNumberCalled nvarchar(100) NOT NULL,
CallDurationMs int NOT NULL
);
GO

SELECT * FROM dbo.PhoneLog

DROP TABLE dbo.PhoneLog


SELECT * FROM sys.indexes WHERE OBJECT_NAME(object_id) = N'PhoneLog';
GO
SELECT * FROM sys.key_constraints WHERE OBJECT_NAME(parent_object_id) = N'PhoneLog';
GO

DROP TABLE dbo.PhoneLog
GO


-- *************************************************
-- NON CLUSTERED INDEXES
-- *************************************************

USE tempdb;
GO

CREATE TABLE dbo.Book
(
ISBN nvarchar(20) PRIMARY KEY,
Title nvarchar(50) NOT NULL,
ReleaseDate date NOT NULL,
PublisherID int NOT NULL
);
GO

CREATE NONCLUSTERED INDEX IX_Book_Publisher
	ON dbo.Book (PublisherID, ReleaseDate DESC);
GO

SELECT PublisherID, Title, ReleaseDate
FROM dbo.Book
WHERE ReleaseDate > DATEADD(year, -1, SYSDATETIME())
ORDER BY PublisherID, ReleaseDate DESC;
GO


CREATE NONCLUSTERED INDEX IX_Book_Publisher
	ON dbo.Book (PublisherID, ReleaseDate DESC);
	INCLUDE (Title)
	WITH DROP_EXISTING;
GO

USE AdventureWorks;
GO

SELECT * FROM sys.index_columns;

SELECT s.name AS SchemaName,
	OBJECT_NAME(i.object_id) AS TableOrViewName,
	i.name AS IndexName,
	c.name AS ColumnName
FROM sys.indexes AS i
INNER JOIN sys.index_columns AS ic ON i.object_id = ic.object_id
INNER JOIN sys.columns AS c ON ic.object_id = c.object_id and ic.column_id = c.column_id
INNER JOIN sys.object AS o ON i.object_id = o.object_id
INNER JOIN sys.schema AS s ON o.schema_id = s.schema_id
WHERE ic.is_included_column <> 0
AND s.name <> 'sys'
ORDER BY SchemaName, TableOrViewName, i.index_id, ColumnName

-- *************************************************
-- INDEX DMVs
-- *************************************************

sys.dm_db_index_physical_stats
sys.dm_db_index_operational_stats
sys.dm_db_index_usage_stats

USE master
GO
DROP DATABASE demodb
GO
CREATE DATABASE demodb;
GO
USE demodb
GO

CREATE TABLE dbo.PhoneLog
(
PhoneLogID int IDENTITY(1,1) PRIMARY KEY,
LogRecorded datetime2 NOT NULL,
PhoneNumberCalled nvarchar(100) NOT NULL,
CallDurationMs int NOT NULL
);
GO

CREATE NONCLUSTERED INDEX IX_LogRecorded
	ON dbo.PhoneLog (LogRecorded);
GO

SET NOCOUNT ON;

DECLARE @COUNTER INT = 0;

WHILE @COUNTER < 10000 BEGIN
	INSERT dbo.PhoneLog (LogRecorded, PhoneNumberCalled, CallDurationMs)
	VALUES (SYSDATETIME(), '999-9999', CAST(RAND()*1000 AS INT));
	SET @COUNTER += 1;
END;
GO

SELECT * FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID('dbo.PhoneLog'), NULL, NULL, NULL)
GO

SELECT * FROM sys.dm_db_index_operational_stats(DB_ID(), NULL, NULL, NULL) AS A
GO

SELECT CONVERT(VARCHAR(120), OBJECT_NAME(ios.object_id)) AS [Object Name],
	i.[name] AS [Index Name],
	SUM (ios.range_scan_count + ios.singleton_lookup_count) AS 'Reads',
	SUM (ios.leaf_insert_count + ios.leaf_update_count + ios.leaf_delete_count) AS 'Write'
FROM sys.dm_db_index_operational_stats (db_id(), NULL, NULL, NULL) ios
INNER JOIN sys.indexes AS i ON i.object_id = ios.object_id AND i.index_id = ios.index_id
WHERE OBJECTPROPERTY(ios.object_id, 'IsUserTable') = 1
GROUP BY object_name(ios.object_id, 'IsUserTable'), i.name
ORDER BY Reads ASC, Writes DESC


-- *************************************************
-- FILTERED INDEXES ore 02:00 del video
-- *************************************************

CREATE NONCLUSTERED INDEX NC_EMP_ADDRESS
ON HR.Address
(
AddressLine1,
AddressLine2
)
WHERE City='New York'


-- *************************************************
-- INDEXES FRAGMENTATION
-- *************************************************
-- INTERNAL --> PAGES ARE NOT FULL
-- EXTERNAL --> PAGES ARE NOT IN LOGICAL
-- # DETECTING FRAGMENTATION
-- INDEX PROPERTIES --> sys.dm_db_index_physical_stats

ALTER TABLE Person.Contact
ADD CONSTRAINT PK_Contact_ContactID
PRIMARY KEY CLUSTERED
(
ContactID ASC
) WITH (PAD_INDEX = ON, FILLFACTOR = 70);
GO

-- FILLFACTOR --> leaves space in index leaf-level pages for new data to avoid page splits
-- PAD_INDEX


-- REMOVING FRAGMENTATION

ALTER INDEX IX_Contact_LastName
ON Person.Contact
REBUILD
WITH (ONLINE = ON, MAXDOP = 4);
-- REBUILD ENTIRE INDEX
-- NEEDS FREE SPACE
-- PERFORMS IN A SINGLE TRANSACTION

ALTER INDEX IX_Contact_LastName
ON Person.Contact
REORGANIZE;
-- SORT THE PAGES AND IS ALWAYS ONLINE
-- LESS TRANSACTION LOG USAGE
-- WORK ISN'T LOST IF INTERRUPTED


-- *************************************************
-- STATISTICS
-- *************************************************
dbcc show_statistics ('people', stat_lastname)

-- AUTO_UPDATE_STATISTICS
-- UPDATE_STATISTICS
-- sp_updatestats
-- ALTER INDEX REBUILD

SELECT * FROM sys.dm_db_index_physical_stats(DB_ID(),OBJECT_NAME('dbo.PhoneLog'), NULL, NULL, 'DETAILED')
GO

ALTER INDEX ALL ON dbo.PhoneLog REBUILD;
GO
-- elimina la frammentazione

SELECT * FROM sys.dm_db_index_physical_stats(DB_ID(),OBJECT_NAME('dbo.PhoneLog'), NULL, NULL, 'DETAILED')
GO


-- Argomenti
-- # database_id | NULL | 0 | PREDEFINITA
-- ID del database. database_id è smallint. Gli input validi sono il numero di ID di un database, NULL, 0 o DEFAULT. Il valore predefinito è 0. NULL, 0 e DEFAULT sono valori equivalenti in questo contesto.
-- Specificare NULL per restituire informazioni per tutti i database presenti nell'istanza di SQL Server. Se si specifica NULL per database_id, è necessario specificare null anche per object_id, index_ide partition_number.
-- È possibile specificare la funzione predefinita DB_ID. Quando si utilizza DB_ID senza specificare un nome di database, il livello di compatibilità del database corrente deve essere 90 o un valore superiore.
-- # object_id | NULL | 0 | PREDEFINITA
-- ID oggetto della tabella o vista in cui si trova l'indice. object_id è di tipo int.
-- Gli input validi sono il numero di ID di una tabella o vista, NULL, 0 o DEFAULT. Il valore predefinito è 0. NULL, 0 e DEFAULT sono valori equivalenti in questo contesto. A partire SQL Server 2016 (13.x)da, gli input validi includono anche il nome della coda di Service Broker o il nome della tabella interna della coda. Quando vengono applicati parametri predefiniti, ovvero tutti gli oggetti, tutti gli indici e così via, le informazioni sulla frammentazione per tutte le code sono incluse nel set di risultati.
-- Specificare NULL per restituire le informazioni per tutte le tabelle e le viste nel database specificato. Se si specifica NULL per object_id, è necessario specificare null anche per index_id e partition_number.
-- # index_id | 0 | NULL | -1 | PREDEFINITA
-- ID dell'indice. index_id è di tipo int. Gli input validi sono il numero di ID di un indice, 0 se object_id è un heap, null,-1 o default. Il valore predefinito è -1. NULL,-1 e DEFAULT sono valori equivalenti in questo contesto.
-- Specificare NULL per restituire le informazioni per tutti gli indici per una vista o tabella di base. Se si specifica NULL per index_id, è necessario specificare null anche per partition_number.
-- # partition_number | NULL | 0 | PREDEFINITA
-- Numero di partizione nell'oggetto. partition_number è di tipo int. Gli input validi sono la partion_number di un indice o di un heap, null, 0 o default. Il valore predefinito è 0. NULL, 0 e DEFAULT sono valori equivalenti in questo contesto.
-- Specificare NULL per restituire le informazioni per tutte le partizioni dell'oggetto.
-- partition_number è in base 1. Un indice o heap non partizionato ha partition_number impostato su 1.
-- # modalità | NULL | PREDEFINITA
-- Nome della modalità. mode specifica il livello di analisi utilizzato per ottenere le statistiche. mode è di tipo sysname. Gli input validi sono DEFAULT, NULL, LIMITED, SAMPLED o DETAILED. Il valore predefinito (NULL) è LIMITED.



-- *************************************************
-- STORE PROCEDURE
-- *************************************************

CREATE PROCEDURE Sales.GetSalespersonNames
AS
BEGIN
	SELECT 
	sp.SalesPersonID
	,c.LastName
	,c.FirstName
	FROM SalesPerson AS sp
	INNER JOIN Person.Contact AS C ON sp.SalesPersonID = c.ContactID
	WHERE sp.TerritoryID IS NOT NULL
	ORDER BY sp.SalesPersonID
	
END;
GO

EXEC Sales.GetSalespersonNames;
GO

CREATE PROCEDURE Sales.GetSalespersonNames
AS
BEGIN
	SELECT 
	sp.SalesPersonID
	,c.LastName
	,c.FirstName
	FROM SalesPerson AS sp
	INNER JOIN Person.Contact AS C ON sp.SalesPersonID = c.ContactID
	WHERE sp.TerritoryID IS NOT NULL
	ORDER BY sp.SalesPersonID
	
	SELECT 
	sp.SalesPersonID
	,c.LastName
	,c.FirstName
	FROM SalesPerson AS sp
	INNER JOIN Person.Contact AS C ON sp.SalesPersonID = c.ContactID
	WHERE sp.TerritoryID IS NOT NULL
	ORDER BY sp.SalesPersonID
END;
GO


USE AdventureWorks;
GO

CREATE PROC Production.GetBlueProducts
AS
BEGIN
	SELECT 
		p.ProductID
		, p.Name
		, p.Size
		, p.ListPrice
	FROM Production.Product AS p
	WHERE p.Color = N'Blue'
	ORDER BY p.ProductID;
END;
GO

EXEC Production.GetBlueProducts;
GO

CREATE PROC Production.GetBlueProductsAndModels
AS
BEGIN
	SELECT 
		p.ProductID
		, p.Name
		, p.Size
		, p.ListPrice
	FROM Production.Product AS p
	WHERE p.Color = N'Blue'
	ORDER BY p.ProductID;
	
	SELECT 
		p.ProductID
		, pm.ProductModelID
		, pm.Name AS ModelName
	FROM Production.Product	AS p
	INNER JOIN Production.ProductModel AS pm ON p.ProductModelID = pm.ProductModelID
	ORDER BY p.ProductID, PM.ProductModelID
END;
GO

EXEC Production.GetBlueProductsAndModels;
GO

-- query per vedere tutta la lista delle store procedures
SELECT 
	SCHEMA_NAME(schema_id) AS SchemaName
	, name AS ProcedureName
FROM sys.procedures;
GO


-- *************************************************
-- USING INPUT PARAMETERS
-- *************************************************

-- @NOME_PARAMETRO TIPO = VALORE_DEFAULT

CREATE PROCEDURE Sales.OrderDateStatus
	@DueDate datetime, @Status tinyint = 5
AS
SELECT SalesOrderID, OrderDate, CustomerID
FROM Sales.SalesOrderHeader AS soh
WHERE soh.DueDate = @DueDate AND soh.[Status] = @Status
GO


CREATE PROCEDURE Sales.GetOrderCountByDueDate
	@DueDate datetime, @orderCount int OUTPUT
AS
SELECT (OrderCount = COUNT(1))
FROM Sales.SalesOrderHeader AS soh
WHERE soh.DueDate = @DueDate
GO

DECLARE @DueDate datetime '20050713';
DECLARE @orderCount int;
EXEC Sales.GetOrderCountByDueDate @DueDate, @orderCount OUTPUT;

SELECT @OrderCount;
GO

USE AdventureWorks;
GO

DROP PROC Production.GetBlueProducts;
DROP PROC Production.GetBlueProductsAndModels;
DROP PROC Production.GetBlueProductsAndModelsByColor;
GO

CREATE PROC Production.GetBlueProductsAndModelsByColor
@Color nvarchar(15)
AS
BEGIN
	SELECT
		p.ProductID
		,p.Name
		,p.Size
		,p.ListPrice
	FROM Production.Product AS p
	WHERE p.Color = @Color
	ORDER BY p.ProductID;

	SELECT
		p.ProductID
		,pm.ProductModelID
		,pm.Name AS ModelName
	FROM Production.Product AS p
	INNER JOIN Production.ProductModel AS pm ON p.ProductModelID = pm.ProductModelID
	WHERE p.Color = @Color
	ORDER BY p.ProductID, pm.ProductModelID;
END;
GO

EXEC Production.GetProductsAndModelsByColor 'Red'
GO

EXEC Production.GetProductsAndModelsByColor NULL
GO


-- *************************************************
-- PARAMETERS SNIFFING AND PERFORMANCE
-- *************************************************

-- CREATE PROCEDURE XYZ WITH RECOMPILE
-- EXEC XYZ WITH RECOMPILE
-- OPTION (OPTIMIZE FOR)

USE peoplePS
GO

ALTER PROCEDURE dbo.usp_countrysearch
@country varchar(80)
AS
SELECT
	p.lastname
	,p.dob
	,p.sex
	,c.country
FROM people AS p
JOIN country c ON p.personid = c.personid
WHERE  c.country = @country
GO

DBCC FREEPROCCACHE
GO
EXEC usp_countrysearch 'UK'
GO

DBCC FREEPROCCACHE
GO
EXEC usp_countrysearch 'US'
GO

EXEC usp_countrysearch 'US' WITH RECOMPILE
GO

ALTER PROCEDURE dbo.usp_countrysearch
@country varchar(80)
AS
SELECT
	p.lastname
	,p.dob
	,p.sex
	,c.country
FROM people AS p
JOIN country c ON p.personid = c.personid
WHERE  c.country = @country
OPTION (RECOMPILE);
GO

ALTER PROCEDURE dbo.usp_countrysearch
@country varchar(80)
AS
SELECT
	p.lastname
	,p.dob
	,p.sex
	,c.country
FROM people AS p
JOIN country c ON p.personid = c.personid
WHERE  c.country = @country
OPTION (OPTIMIZE FOR (@country = 'UK'));
GO

-- *************************************************
-- WHAT IS FUNCTION?
-- *************************************************

USE master;
GO
DROP DATABASE demodb;
GO
CREATE DATABASE demodb;
GO
USE demodb;
GO

-- SCALAR FUNCTION
CREATE FUNCTION dbo.EndOfPreviousMonth (@DateToTest date)
RETURN date
AS
	BEGIN
		RETURN DATEADD(day, 0 - DAY(@DateToTest), @DataToTest);
	END;
GO


SELECT dbo.EndOfPreviousMonth(SYSDATETIME());
SELECT dbo.EndOfPreviousMonth('2010-01-01');
GO

SELECT OBJECTPROPERTY(OBJECT_ID('dbo.EndOfPreviousMonth'), 'IsDeterministic');
GO

DROP FUNCTION dbo.EndOfPreviousMonth;
GO

-- TABLE VALUE FUNCTION
USE AdventureWorks;
GO
CREATE FUNCTION Sales.GetLastOrdersForCustomer
(@CustomerID int, @NumberOfOrders int)
RETURN TABLE
AS
RETURN (
	SELECT TOP(@NumberOfOrders)
		soh.SalesOrderID
		,soh.OrderDate
		,soh.PurchaseOrderNumber
	FROM Sales.SalesOrderHeader AS soh
	WHERE soh.CustomerID = @CustomerID
	ORDER BY soh.OrderDate DESC
);
GO

SELECT * FROM Sales.GetLastOrdersForCustomer(17288,2);
GO

-- *************************************************
-- MANAGING TRANSACTION
-- *************************************************
-- BEGIN/COMMIT/ROLLBACK TRANSACTION

BEGIN TRY
	INSERT INTO sales.orders --> transaction
	INSERT INTO sales.orderdetails --> transaction
END TRY
BEGIN CATCH
	SELECT ERROR_NUMBER() ...
END CATCH
GO

USE TSQL;
GO

IF OBJECT_ID('dbo.SimpleOrderDetails','U') IS NOT NULL
	DROP TABLE dbo.SimpleOrderDetails;
IF OBJECT_ID('dbo.SimpleOrders','U') IS NOT NULL
	DROP TABLE dbo.SimpleOrders;
GO

CREATE TABLE  dbo.SimpleOrders
(
	orderid int IDENTITY(1,1) NOT NULL PRIMARY KEY
	,custid int NOT NULL FOREIGN KEY REFERENCES Sales.Customers(custid)
	,empid int NOT NULL FOREIGN KEY REFERENCES HR.Employee(empid)
	,orderdate datetime NOT NULL
);
GO

CREATE TABLE dbo.SimpleOrderDetails
(
	orderid int NOT NULL FOREIGN KEY REFERENCES dbo.SimpleOrders(orderid)
	,productid int NOT NULL	FOREIGN KEY REFERENCES Production.Product(productid)
	,unitprice money NOT NULL
	,qty smallint NOT NULL
	,CONSTRAINT PK_OrderDetails PRIMARY KEY (orderid, productid)
);
GO

-- TRANSACTION
BEGIN TRY
	INSERT INTO dbo.SimpleOrders(custid, empid, orderdate) VALUE (68,9,'2020-05-13')
	INSERT INTO dbo.SimpleOrders(custid, empid, orderdate) VALUE (12,13,'2020-05-13')
END TRY
BEGIN CATCH
	SELECT 
		ERROR_NUMBER() AS ErrNum
		,ERROR_MESSAGE() AS ErrMsg;
END CATCH;


IF OBJECT_ID('dbo.SimpleOrderDetails','U') IS NOT NULL
	DROP TABLE dbo.SimpleOrderDetails;
IF OBJECT_ID('dbo.SimpleOrders','U') IS NOT NULL
	DROP TABLE dbo.SimpleOrders;
GO


CREATE TABLE  dbo.SimpleOrders
(
	orderid int IDENTITY(1,1) NOT NULL PRIMARY KEY
	,custid int NOT NULL FOREIGN KEY REFERENCES Sales.Customers(custid)
	,empid int NOT NULL FOREIGN KEY REFERENCES HR.Employee(empid)
	,orderdate datetime NOT NULL
);
GO

CREATE TABLE dbo.SimpleOrderDetails
(
	orderid int NOT NULL FOREIGN KEY REFERENCES dbo.SimpleOrders(orderid)
	,productid int NOT NULL	FOREIGN KEY REFERENCES Production.Product(productid)
	,unitprice money NOT NULL
	,qty smallint NOT NULL
	,CONSTRAINT PK_OrderDetails PRIMARY KEY (orderid, productid)
);
GO
-- TRANSACTION
BEGIN TRY
	BEGIN TRANSACTION
		INSERT INTO dbo.SimpleOrders(custid, empid, orderdate) VALUE (68,9,'2020-05-13')
		INSERT INTO dbo.SimpleOrders(custid, empid, orderdate) VALUE (12,13,'2020-05-13')
		[...]
	COMMIT TRANSACTION
END TRY
BEGIN CATCH
	SELECT 
		ERROR_NUMBER() AS ErrNum
		,ERROR_MESSAGE() AS ErrMsg;
	ROLLBACK TRANSACTION
END CATCH;


-- *************************************************
-- MANAGING CONCURRENCY
-- *************************************************
-- CONCURRENCY IS THE ABILITY FOR MULTIPLE PROCESSES TO ACCESS THE SAME DATA AT THE SAME TIME
-- TWO WAYS: PESSIMISTIC vs OPTIMISTIC
-- ANOMALIES:
--	LOST UPDATES
-- 	DIRTY READS
-- 	NON-REPEATABLE
-- 	PHANTOMS


-- *************************************************
-- ISOLATION LEVEL
-- *************************************************
-- READ UNCOMMITTEED
-- READ COMMITTED
-- REPEATABLE READ
-- SERIALIZABLE
-- SNAPSHOT

-- # LOCKING MODES:
-- SHARED
-- EXCLUSIVE
-- UPDATE 
-- INTENT

-- *************************************************
-- LOCKING PROBLEMS
-- *************************************************
DBCC TRACEON (1222, -1)
-- 1204 OR 1222 ENABLE THE TRACE FLAG FOR ALL SESSION

USE TSQL;
GO

SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
GO
BEGIN TRANSACTION
SELECT * FROM HR.Employees
WHERE lastname = 'BUCK'

SELECT 
request_session_id AS Session
,request_database_id AS DBID
,resource_type
,resource_description AS Resource
,request_type AS Type
,request_mode AS Mode
,request_status AS Status
FROM sys.dm_tran_locks
ORDER BY [session]

UPDATE HR.Employees
SET titleofcourtesy = 'Dr.'
WHERE lastname = 'Buck'

SELECT session_id, wait_duration_ms, wait_type, blocking_session_id, resource_description
FROM sys.dm_os_waiting_tasks
where session_id > 50

ROLLBACK TRANSACTION

DBCC TRACEON (1222,-1)
GO


-- caso di deadlock
BEGIN TRANSACTION
	UPDATE HR.Employees
	SET titleofcourtesy = 'Dr.'
	WHERE lastname = 'Buck'

	UPDATE HR.Employees
	SET titleofcourtesy = 'Dr.'
	WHERE lastname = 'King'

BEGIN TRANSACTION
	UPDATE HR.Employees
	SET titleofcourtesy = 'Dr.'
	WHERE lastname = 'King'

	UPDATE HR.Employees
	SET titleofcourtesy = 'Dr.'
	WHERE lastname = 'Buck'


sp_readerrorlog --> vedo tutto il log di sql server2014


-- *************************************************
-- USING BUFFER POOL EXTENSION
-- *************************************************

ALTER SERVER CONFIGURATION
SET BUFFER POOL EXTENSION ON
(FILENAME = 'C:\temp\MyCache.bpe', SIZE = 10GB);

SELECT * FROM sys.dm_os_buffer_pool_extension_configuration;
SELECT * FROM sys.dm_os_buffer_descriptors;

ALTER SERVER CONFIGURATION
SET BUFFER POOL EXTENSION OFF;

SELECT * FROM sys.dm_os_buffer_pool_extension_configuration;


-- *************************************************
-- COLUMNSTORE INDEX SCENARIOS/TYPE
-- *************************************************

SET STATISTICS TIME ON;
SET STATISTICS IO ON;

SELECT *
FROM DATABASE.TABLE1
-- fa apparire i tempi di esecuzione dell'istruzione

SET STATISTICS TIME OFF;
SET STATISTICS IO OFF;


-- *************************************************
-- IN-MEMORY OLTP
-- *************************************************

ALTER DATABASE MyDB
ADD FILEGROUP mem_data CONTAINS MEMORY_OPTIMIZED_DATA;
GO

ALTER DATABASE MyDB
ADD FILE 
(
	NAME = 'MemData'
	FILENAME = 'D:\Data\MyDB_MemData.ndf'
)
TO FILEGROUP mem_data;


CREATE TABLE dbo.MemoryTable
(
	OrderId INTEGER NOT NULL PRIMARY KEY NONCLUSTERED HASH WITH (BUCKET_COUNT = 1000000)
	,OrderDate DATETIME NOT NULL
	,ProductCode INTEGER NULL
	,Quantity INTEGER NULL
)
WITH 
(
	MEMORY_OPTIMIZED = ON, DURABILITY = SCHEMA_AND_DATA
);


--04:13