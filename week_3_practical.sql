CREATE DATABASE bookflow_db;
USE bookflow_db;
CREATE TABLE class(
id INT,
name VARCHAR(30)
);
CREATE TABLE class_info(
id INT,
address VARCHAR(30)
);
INSERT INTO class VALUES
(1,'abhi'),
(2,'adam'),
(4,'alex');
INSERT INTO class_info VALUES
(1,'DELHI'),
(2,'MUMBAI'),
(3,'CHENNAI');

SELECT * FROM class CROSS JOIN class_info;
DROP TABLE class;
INSERT INTO class VALUES
(1,'abhi'),
(2,'adam'),
(3,'alex'),
(4,'anu');
SELECT * FROM class INNER JOIN class_info 
ON class.id=class_info.id;

 SELECT class.name,class_info.address FROM class INNER JOIN class_info
 ON class.id=class_info.id;

SELECT * FROM class NATURAL JOIN class_info;
INSERT INTO class VALUES
(5,'ashish');
INSERT INTO class_info VALUES
(7,'NOIDA'),
(8,'PANIPAT');

SELECT * FROM class LEFT OUTER JOIN class_info
ON class.id=class_info.id;

SELECT * FROM class LEFT JOIN class_info
ON class.id=class_info.id WHERE class_info.id IS NULL;

SELECT * FROM class RIGHT OUTER JOIN class_info
ON class.id=class_info.id;
SELECT * FROM class RIGHT JOIN class_info
ON class.id=class_info.id WHERE class.id is NULL;

SELECT *
FROM class
LEFT JOIN class_info
ON class.id = class_info.id

UNION

SELECT *
FROM class
RIGHT JOIN class_info
ON class.id = class_info.id;

SELECT *
FROM class
LEFT JOIN class_info
ON class.id = class_info.id
WHERE class_info.id IS NULL

UNION

SELECT *
FROM class
RIGHT JOIN class_info
ON class.id = class_info.id
WHERE class.id IS NULL;

CREATE TABLE first_table(
id INT,
name VARCHAR(30)
);
CREATE TABLE second_table(
id INT,
name VARCHAR(30)
);
INSERT INTO first_table VALUES
(1,'abhi'),
(2,'adam');
INSERT INTO second_table VALUES
(2,'adam'),
(3,'chester');

SELECT * FROM first_table
UNION
SELECT * FROM second_table;

SELECT name FROM first_table
UNION
SELECT name FROM second_table;

select * from first_table
union all
select * from second_table;

select count(*)
from
(
select * from first_table
union all
select * from second_table
) A;

SELECT * FROM first_table
INTERSECT 
SELECT * FROM second-table;

SELECT * FROM first_table
MINUS
SELECT * FROM second_table;

