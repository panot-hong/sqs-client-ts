import { SQS } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import {LOCAL, QUEUE_URL} from '../config';

const formatAdditionEntry = payload => ({
	Id: uuid(),
	MessageBody:
		typeof payload === 'string' ? payload : JSON.stringify(payload),
	DelaySeconds: 0
});

const formatDeletionEntry = ({ MessageId, ReceiptHandle }) => ({
	Id: MessageId,
	ReceiptHandle: ReceiptHandle
});

export const getQueueUrl = async (queueName: string) => {
	if (LOCAL) {
		return Promise.resolve(`${QUEUE_URL}/queue/${queueName}`)
	} else {
		const { QueueUrl } = await new SQS()
		.getQueueUrl({
			QueueName: queueName
		})
		.promise();
		return QueueUrl;
	}	
};

export const addMessageToQueue = async (message, queueName: string) => {
	console.log(`event=ADDING_MESSAGE_TO_QUEUE queue_name=${queueName}`);
	return new SQS()
		.sendMessage({
			QueueUrl: await getQueueUrl(queueName),
			MessageBody: JSON.stringify(message)
		})
		.promise();
};

export const addBatchToQueue = async (batch: Array<any>, queueName: string) => {
	console.log(
		`event=ADDING_BATCH_TO_QUEUE queue_name=${queueName} batch_size=${
			batch.length
		}`
	);
	return new SQS()
		.sendMessageBatch({
			QueueUrl: await getQueueUrl(queueName),
			Entries: batch.map(formatAdditionEntry)
		})
		.promise();
};

export const getBatchFromQueue = async (
	queueName: string,
	maxNumberOfMessages: number = 10
) => {
	console.log(
		`event=GETTING_BATCH queue_name=${queueName} max_number_of_messages=${maxNumberOfMessages}`
	);
	return new SQS()
		.receiveMessage({
			QueueUrl: await getQueueUrl(queueName),
			MaxNumberOfMessages: maxNumberOfMessages
		})
		.promise();
};

export const deleteBatchFromQueue = async (
	batch: Array<SQS.Message>,
	queueName: string
) => {
	console.log(
		`event=DELETING_BATCH_FROM_QUEUE queue_name=${queueName} batch_count=${
			batch.length
		}`
	);
	return new SQS()
		.deleteMessageBatch({
			QueueUrl: await getQueueUrl(queueName),
			Entries: batch.map(formatDeletionEntry)
		})
		.promise();
};

export const deleteFromQueue = async (
	receiptHandle: string,
	queueName: string
) => {
	console.log(
		`event=DELETING_FROM_QUEUE queue_name=${queueName} receiptHandle=${
			receiptHandle
		}`
	);
	return new SQS()
		.deleteMessage({
			QueueUrl: await getQueueUrl(queueName),
			ReceiptHandle: receiptHandle
		})
		.promise();
};

export const clearQueue = async (
	queueName: string
) => {
	console.log(
		`clear all messages in the queue`
	);
	return new SQS()
		.purgeQueue({
			QueueUrl: await getQueueUrl(queueName)	
		})
		.promise();
};