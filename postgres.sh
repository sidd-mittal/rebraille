#!/bin/bash

# Name of the Docker container
CONTAINER_NAME="postgres-container"

# Docker volume for persistent data
VOLUME_NAME="postgres-data"

# PostgreSQL password (change if needed)
POSTGRES_PASSWORD="password"

# Check if the volume exists, if not, create it
docker volume inspect $VOLUME_NAME &>/dev/null || docker volume create $VOLUME_NAME

# Check if the container is already running
if [[ $(docker ps -q -f name=$CONTAINER_NAME) ]]; then
    echo "PostgreSQL container is already running."
else
    # Run the PostgreSQL container
    echo "Starting PostgreSQL container..."
    docker run --name $CONTAINER_NAME -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -d -p 5432:5432 -v $VOLUME_NAME:/var/lib/postgresql/data postgres
    echo "PostgreSQL container started successfully."
fi
