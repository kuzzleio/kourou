# #!/bin/sh

set -e

tries=0
max_tries=60
echo "[$(date)] - Waiting Kuzzle..."
echo ""

while ! curl -f -s -o /dev/null http://localhost:7512
do
    echo -ne "\r[$(date)] - Still trying to connect to Kuzzle ($tries)"

    ((tries=tries+1))

    if [ $tries -eq $max_tries ]; then
        docker-compose logs
        curl http://localhost:7512?pretty
        echo "Cannot connect to Kuzzle after $tries s. Aborting."
        exit 1
    fi

    sleep 1
done
