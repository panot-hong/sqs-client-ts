# Sample of using SQS

This demonstrate how to add/pop/delete message from SQS queue with localstack docker. 

## Pre-requisites

Make sure to install AWS CLI in order to execute command below.

```bash
aws configure
```
Feel free to input whatever for Id and Secret. Region could be anything I guess, if you do not know one then input 'eu-west-1' and just enter blank for the rest.

Execute below command to spin up SQS with Localstack on docker
```npm
npm run start:local:dependencies
```
Once the container successfully up then execute following command to create a new queue in local SQS 
```npm
npm run create:local:queue
```

## Test

Look into test folder and run test with
```npm
npm t
```
or
```npm
npm run test
```
It will compile typescript and run tests.

## Usage
Either remain usage of config file and update LOCAL = 0 or simply remove LOCAL case in sqs-client.ts function getQueueUrl for connecting to SQS on AWS.

## License
[MIT](https://choosealicense.com/licenses/mit/)