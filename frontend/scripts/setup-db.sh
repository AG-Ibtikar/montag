#!/bin/bash

# Drop the database if it exists
psql -U postgres -c "DROP DATABASE IF EXISTS montag;"

# Create the database
psql -U postgres -c "CREATE DATABASE montag;"

# Create the schema
psql -U postgres -d montag -c "CREATE SCHEMA IF NOT EXISTS public;"

# Grant privileges
psql -U postgres -d montag -c "GRANT ALL ON SCHEMA public TO postgres;"
psql -U postgres -d montag -c "GRANT ALL ON SCHEMA public TO public;" 