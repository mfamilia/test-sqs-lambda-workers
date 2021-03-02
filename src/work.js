import AWS from 'aws-sdk'

const { round, pow } = Math

const config = {
  endpoint: new AWS.Endpoint('http://localhost:9324'),
  accessKeyId: 'na',
  secretAccessKey: 'na',
  region: 'REGION'
}

const sqs = new AWS.SQS(config)
const QueueUrl = 'http://localhost:9324/queue/queue'

var params = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: ['All'],
  QueueUrl,
}


sqs.receiveMessage(params, function (err, data) {
  
if (err) {
  console.log('Receive Error', err)
} else {
  // Make sure we have a message
    if (data.Messages != null) {
      const { ReceiptHandle } = data.Messages[0]
      var visibilityParams = {
        QueueUrl,
        ReceiptHandle,
        VisibilityTimeout: 20 // 20 second timeout
      }

      sqs.changeMessageVisibility(visibilityParams, (err, data) => {
          if (err) {
              console.log('Delete Error', err)
          } else {
              console.log('Timeout Changed', data)
          }
      })

      // setTimeout(() => {
      //   var deleteParams = {
      //     QueueUrl,
      //     ReceiptHandle,
      //   }

      //   sqs.deleteMessage(deleteParams, (err, data) => {
      //     if (err) {
      //         console.log('Delete Error', err)
      //     } else {
      //         console.log('Message Deleted', data)
      //     }
      // })
      // }, 5000)
    } else {
      console.log('No messages to change')
    }
  }
})