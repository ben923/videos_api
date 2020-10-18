DO
$do$
BEGIN
   IF EXISTS (SELECT FROM pg_database WHERE datname = 'videos') THEN
      RAISE NOTICE 'Database already exists';  -- optional
   ELSE
      PERFORM dblink_exec('dbname=' || current_database()  -- current db
                        , 'CREATE DATABASE videos');
   END IF;
END
$do$;
CREATE USER benjamin WITH PASSWORD 'root1337489417';
GRANT ALL PRIVILEGES ON DATABASE "videos" to benjamin;