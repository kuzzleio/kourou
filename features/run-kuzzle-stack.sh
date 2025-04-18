#!/bin/bash

set -e

# Create the folder where will be stored snapshots
mkdir -p /tmp/snapshots
chmod 777 -R /tmp/snapshots

# Launch the kuzzle stack
docker compose -f features/docker/docker-compose.yml up -d

echo "Starting Kuzzle..."
while ! curl -f -s -o /dev/null http://localhost:7512
do
    echo "Still trying to connect to Kuzzle..."
    sleep 5
done
