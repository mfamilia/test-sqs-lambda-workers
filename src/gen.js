import AWS from 'aws-sdk'

const { round, pow } = Math

const config = {
  endpoint: new AWS.Endpoint('http://localhost:9324'),
  accessKeyId: 'na',
  secretAccessKey: 'na',
  region: 'REGION',
  retryDelayOptions: {
    customBackoff: (attemptsMade) => round((pow(2, attemptsMade) - 1) * 1000)
  },
  maxRetries: 4
}

const sqs = new AWS.SQS(config)
const QueueUrl = 'http://localhost:9324/queue/queue'

sqs.sendMessage({
  MessageBody: JSON.stringify({hello: 'world'}),
  QueueUrl
}, (err, data) => (err) ? console.log('Error', err) : console.log('Success', data.MessageId));