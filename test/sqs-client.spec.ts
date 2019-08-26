import { expect } from 'chai';
import { QUEUE_NAME } from '../config';
import * as sqsClient from '../lib/sqs-client';
import * as AWS from 'aws-sdk';
    
describe('Content-feeds ingested new articles', () => {
    before(() => {
        // This shouldn't be necessary but may required for some development environment
        AWS.config.loadFromPath('./aws-config.json');
        //AWS.config.update({accessKeyId: 'foo', secretAccessKey: 'bar', region: 'eu-west-1'});        
    });
    
	// describe('#deleteIndex', () => {
    // 	const basePath = 'http://test';
    
    describe('add and get message from queue', () => {
        beforeEach(async () => {
            // make sure queue is empty        
            await sqsClient.clearQueue(QUEUE_NAME);
        })

        it('should send message to queue and de-queue with the same message', async () => {
            const message = { id: 123, content: "abc" };
            // add one message to the queue
            await sqsClient.addMessageToQueue(message, QUEUE_NAME);
            // dequeue from the queue
            const batch = await sqsClient.getBatchFromQueue(QUEUE_NAME, 10);
            const { Messages } = batch;
            expect(Messages.length).to.equal(1);
            const dequeueMessage = JSON.parse(Messages[0].Body);
            expect(dequeueMessage).to.deep.equal(message);
        });

        it('should send multiple messages to queue and de-queue with the same multiple messages', async () => {
            const messages = [{ id: 123, content: "abc" }, { id: 456, content: "def" }];
            // add one message to the queue
            await sqsClient.addBatchToQueue(messages, QUEUE_NAME);
            // dequeue from the queue
            const batch = await sqsClient.getBatchFromQueue(QUEUE_NAME, 10);
            const { Messages } = batch;
            expect(Messages.length).to.equal(2);
            const dequeueMessages = Messages.map((msg) => JSON.parse(msg.Body));
            //addBatchToQueue somehow revert the order when adding messages or it probably not guarantee the order so just expect that dequeued messages contain all messages
            expect(dequeueMessages).to.deep.include(messages[0]);
            expect(dequeueMessages).to.deep.include(messages[1]);
        });

        it('should send multiple messages to queue and de-queue with the first message with limit 1', async () => {
            const messages = [{ id: 123, content: "abc" }, { id: 456, content: "def" }];
            // add one message to the queue
            //await sqsClient.addBatchToQueue(messages, QUEUE_NAME);
            await sqsClient.addMessageToQueue(messages[0], QUEUE_NAME);
            await sqsClient.addMessageToQueue(messages[1], QUEUE_NAME);
            // dequeue from the queue
            const batch = await sqsClient.getBatchFromQueue(QUEUE_NAME, 1);
            const { Messages } = batch;
            expect(Messages.length).to.equal(1);
            const dequeueMessage = JSON.parse(Messages[0].Body);
            expect(dequeueMessage).to.deep.equal(messages[0]);
        });
    });

    describe('delete message from queue', () => {
        const messages = [{ id: 123, content: "abc" }, { id: 456, content: "def" }];
        beforeEach(async () => {
            await sqsClient.clearQueue(QUEUE_NAME);
            await sqsClient.addMessageToQueue(messages[0], QUEUE_NAME);
            await sqsClient.addMessageToQueue(messages[1], QUEUE_NAME);
        });

        it('should delete a message with batch and remain one', async () => {
            // dequeue the first message from the queue
            let batch = await sqsClient.getBatchFromQueue(QUEUE_NAME, 1);
            // delete the first message from the queue
            
            const result = await sqsClient.deleteBatchFromQueue(batch.Messages, QUEUE_NAME);
            console.log('result ' + JSON.stringify(result));
            // dequeue the remaining message from the queue
            batch = await sqsClient.getBatchFromQueue(QUEUE_NAME, 2);
            const { Messages } = batch;
            expect(Messages.length).to.equal(1, 'it should remain only one message in the queue');
            const dequeueMessage = JSON.parse(Messages[0].Body);
            expect(dequeueMessage).to.deep.equal(messages[1], 'the remaining message should be the second message');
        });

        it('should delete a message with single message and remain one', async () => {
            // dequeue the first message from the queue
            let batch = await sqsClient.getBatchFromQueue(QUEUE_NAME, 1);
            // delete the first message from the queue            
            const result = await sqsClient.deleteFromQueue(batch.Messages[0].ReceiptHandle, QUEUE_NAME);
            console.log('result ' + JSON.stringify(result));
            // dequeue the remaining message from the queue
            batch = await sqsClient.getBatchFromQueue(QUEUE_NAME, 2);
            const { Messages } = batch;
            expect(Messages.length).to.equal(1, 'it should remain only one message in the queue');
            const dequeueMessage = JSON.parse(Messages[0].Body);
            expect(dequeueMessage).to.deep.equal(messages[1], 'the remaining message should be the second message');
        });
    });
});