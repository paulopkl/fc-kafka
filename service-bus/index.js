const azureServiceBus = require("@azure/service-bus");
const azureCredentials = require("@azure/identity");
const azureArmServiceBus = require("@azure/arm-servicebus");

// TLS 1.2

// Substitua pelos valores apropriados.
const subscriptionName = "Subscription 1";
const subscriptionId = "<>";

// Resource Group.
const resourceGroupName = "test-service-bus";

// Namespace.
const namespaceName = "test-ns"; // + ".servicebus.windows.net";

// Connection String
const connectionString = `<>`;

// Queue
const queueName = "test-queue";

async function createNamespace() {
  const credential = new azureCredentials.DefaultAzureCredential();

  const serviceBusManagementClient =
    new azureArmServiceBus.ServiceBusManagementClient(
      credential,
      subscriptionId
    );

  // Criação do Namespace
  console.log(`Criando namespace: ${namespaceName}`);

  await serviceBusManagementClient.namespaces.beginCreateOrUpdate(
    resourceGroupName,
    namespaceName,
    {
      location: "East US",
      sku: {
        name: "Standard",
      },
    }
  );

  console.log(`Namespace criado: ${namespaceName}`);
}

async function createQueue() {
  const credential = new azureCredentials.DefaultAzureCredential();
  // {
  //     tenantId: "7ea99adb-4855-4405-ab99-3a841b783ad8"
  // }

  const serviceBusManagementClient =
    new azureArmServiceBus.ServiceBusManagementClient(
      credential,
      subscriptionId
    );

  const parameters = {
    lockDuration: "PT1M",
    maxSizeInMegabytes: 1024,
    requiresDuplicateDetection: false,
    requiresSession: false,
    defaultMessageTimeToLive: "P10675199DT2H48M5.4775807S",
    deadLetteringOnMessageExpiration: true,
    duplicateDetectionHistoryTimeWindow: "PT10M",
    maxDeliveryCount: 10,
    enableBatchedOperations: true,

    defaultMessageTimeToLive: "PT14H",
  };

  console.log(`Criando fila: ${queueName}`);

  const result = await serviceBusManagementClient.queues.createOrUpdate(
    resourceGroupName,
    namespaceName,
    queueName,
    { ...parameters }
  );

  console.log("Fila criada com sucesso:", result);
}

async function sendMessage() {
  const servicebusClient = new azureServiceBus.ServiceBusClient(
    connectionString
  );

  const sender = servicebusClient.createSender(queueName);

  try {
    const message = {
      label: "greeting",
      body: "Hello World, Azure Service Bus!",
      userProperties: {
        myCustomProp: "myCustomValue",
      },
    };

    console.log(`Sending message: ${message.body}`);

    // Sending message
    sender.sendMessages(message).then((response) => {
      console.log({ response });

      console.log("Message sent sucessfully!");
    });
  } catch (err) {
    await sender.close();
    await servicebusClient.close();
  } finally {
    // await sender.close();
    // await servicebusClient.close();
  }
}

async function consumeMessage() {
  const servicebusClient = new azureServiceBus.ServiceBusClient(
    connectionString
  );

  const receiver = servicebusClient.createReceiver(queueName, {
    receiveMode: "peekLock", // "peekLock" or "receiveAndDelete"
  });

  try {
    console.log(`Listening for messages from ${queueName}...`);

    const messages = await receiver.receiveMessages(1); // Receive up to 1 message

    console.log({ messages });
    if (messages.length > 0) {
      console.log("Received message:");
      // console.log(messages[0].body);

      // Process your message here
      // For example, you can log the message content
      console.log(`Message received: ${messages[0].body}`);

      // Complete the message to remove it from the queue
      await receiver.completeMessage(messages[0]);
    } else {
      console.log("No messages received.");
    }
  } catch (err) {
    await servicebusClient.close();
    await receiver.close();
  } finally {
    // Close the receiver and Service Bus client
    await servicebusClient.close();
    await receiver.close();
  }
}

async function consumeMessageAsStream() {
  const servicebusClient = new azureServiceBus.ServiceBusClient(
    connectionString
  );

  const receiver = servicebusClient.createReceiver(queueName, {
    receiveMode: "peekLock", // "peekLock" or "receiveAndDelete"
  });

  try {
    receiver.subscribe({
      processMessage: async (message) => {
        console.log("Received message:");
        console.log(message.body);

        await receiver.completeMessage(message);
      },
      processError: async (error) => {
        console.error("Error occurred: ", error);
      },
    });

    console.log(`Listening for messages on queue: ${queueName}...`);

    await new Promise((resolve) => {
      process.on("SIGINT", resolve);
      process.on("SIGTERM", resolve);
    });
  } catch (err) {
  } finally {
    await servicebusClient.close();
    await receiver.close();
  }
}

async function main() {
  await createNamespace().catch((err) => {
    console.log("Ocorreu um erro: ", err);
  });

  //   await createQueue().catch((err) => {
  //     console.log("Ocorreu um erro: ", err);
  //   });

  await sendMessage().catch((err) => {
    console.log(`Ocorreu um erro: ${err}`);
  });

  //   await consumeMessage().catch((err) => {
  //     console.log(`Ocorreu um erro: ${err}`);
  //   });

  await consumeMessageAsStream().catch((err) => {
    console.log(`Ocorreu um erro: ${err}`);
  });
}

main();
