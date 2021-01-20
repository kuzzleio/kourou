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
        docker_ps=( $(docker ps -a | grep kuzzle_1) )
        length=${#docker_ps[@]}
        docker logs ${docker_ps[$length-1]}

        exit 1
    fi

    sleep 1
done
