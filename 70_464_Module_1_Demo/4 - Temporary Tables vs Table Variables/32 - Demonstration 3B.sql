-- Demonstration 3B

-- Step 1: Open a new query window to the tempdb database

USE tempdb;
GO

-- Step 2: Create a temporary table

CREATE TABLE #Squares
( Number int PRIMARY KEY,
  NumberSquared int
);
GO

-- Step 3: Populate the table

DECLARE @Counter int = 0;

WHILE @Counter < 1000 BEGIN
  INSERT #Squares (Number, NumberSquared)
    VALUES (@Counter, @Counter * @Counter);
  SET @Counter += 1;
END;
GO

-- Step 4: Query the table

SELECT * FROM #Squares;
GO

-- Step 5: Disconnect and reconnect 
--         (right-click the query window and choose Connection then Disconnect,
--          then right-click the query window and choose Connection then Connect,
--          in the Connect to Server window, click Connect)

-- Step 6: Attempt to query the table again (this will fail)

USE tempdb;
GO

SELECT * FROM #Squares;
GO

*** ACTION ***
-- Do the same with a Table Variable