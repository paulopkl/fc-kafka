# Rodar o cluster Kafka localmente usando Docker
```
    cd kafka
    docker compose exec -it kafka /bin/bash
```

    

/opt/kafka/bin/kafka-topics.sh




## Comandos no KAFKA Console

# CRIAR TOPICO
kafka-topics \
    --create \
    --zookeeper zookeeper:2181 \
    --replication-factor 1 \
    --partitions 3 \
    --topic test

# DESCREVER TOPICO
kafka-topics \
    --zookeeper zookeeper:2181 \
    --topic test \
    --describe

# REMOVE TOPICO
kafka-topics \
    --delete
    --zookeeper zookeeper:2181 \
    --topic test

# LISTAR TOPICO
kafka-topics \
    --zookeeper zookeeper:2181 \
    --list

# CONSUMIR UM TOPICO
kafka-console-consumer \
    --bootstrap-server localhost:9092 \
    --topic test \
    --from-beginning

# CONSUMIR UM TOPICO EM UM GRUPO
kafka-console-consumer \
    --bootstrap-server localhost:9092 \
    --topic test \
    --group x

# PRODUZIR MENSAGEM EM UM TOPICO
kafka-console-producer \
    --bootstrap-server localhost:9092 \
    --topic test

# DESCREVER CONSUMIDORES DENTRO DE UM GRUPO EM UM TOPIC
kafka-consumer-groups \
    --bootstrap-server localhost:9092 \
    --describe \
    --group x
