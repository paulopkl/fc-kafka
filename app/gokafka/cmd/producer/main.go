package main

import (
	"log"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func NewKafkaProducer() *kafka.Producer {
    configMap := &kafka.ConfigMap{
		"bootstrap.servers":   "host.docker.internal:9092",
		// "bootstrap.servers": "kafka-1:9092",
		"delivery.timeout.ms": "0",
		"acks": 			   "all", // "0" -> nothing | "1" -> just leader acks | "all" -> need's all acks
		"enable.idempotence":  "true", // 
	}
	log.Println(configMap)

	p, err := kafka.NewProducer(configMap)

	if err != nil {
		log.Println(err.Error())
	}

	return p
}

func Publish(producer *kafka.Producer, topic string, key []byte, msg string, deliveryChan chan kafka.Event) error {
	message := &kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Key: key,
		Value: []byte(msg),
	}

	err := producer.Produce(message, deliveryChan)
	if err != nil {
		return err
	}
	
	return nil
}

func DeliveryReport(deliveryChan chan kafka.Event) {
	for e := range deliveryChan {
		switch ev := e.(type) {
		case *kafka.Message:
			if ev.TopicPartition.Error != nil {
				log.Println("Error on send")
			} else {
				log.Println("Message sent: ", ev.TopicPartition)

			}
		}
	}
}

func main() {
	topic := "test"
	// var key string
	message := "hello world"

	deliveryChan := make(chan kafka.Event)

	producer := NewKafkaProducer()
	Publish(producer, topic, nil, message, deliveryChan)

	go DeliveryReport(deliveryChan) // async

	log.Println("\n")

	// e := <- deliveryChan
	// msg := e.(*kafka.Message)
	
	// if msg.TopicPartition.Error != nil {
	// 	log.Println("Error on send")
	// } else {
	// 	log.Println("Message sent: ", msg.TopicPartition)
	// }

	producer.Flush(3000)
}
