const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"], // Brokers list
});

const createTopic = async () => {
  const topicName = "new-topic-created-by-js";

  const kafkaAdmin = kafka.admin();
  await kafkaAdmin.connect();
  await kafkaAdmin
    .createTopics({
      topics: [
        {
          topic: topicName, // Nome do tópico
          numPartitions: 3, // Número de partições
          replicationFactor: 1, // Fator de replicação
        },
      ],
    })
    .then((_) => {
      console.log(`Topic ${topicName} created secessfully!`);
    });

  await kafkaAdmin.disconnect();
};

async function main() {
  createTopic().catch(console.error);
}

main();
