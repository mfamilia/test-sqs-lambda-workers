require('dotenv').config()
const AWS = require('aws-sdk')
const maxRetries = 8
const delay = 1 //second
const QueueUrl = process.env.QUEUE_URL

exports.handler = async (event) => {
  const msg = event.Records[0]
  
  const { ApproximateReceiveCount: attempts } = msg.attributes
  const { retries } = JSON.parse(msg.body)
  
  return new Promise((resolve, reject) => {
    console.log(`Processing: ${retries} with ${attempts} receive count`)

    if (retries <= attempts) {
      console.log('Success')
      return resolve({ statusCode: 200 })
    }

    // bypass setting visibility so message can be moved to dead letter quickly 
    if (maxRetries == attempts) { 
      return reject()
    }

    const { round, pow, random } = Math
    const jitter = round(random() * attempts * 10)
    const VisibilityTimeout = round(pow(2, attempts) + jitter) * delay
    
    const ReceiptHandle = msg.receiptHandle

    var visibilityParams = {
      QueueUrl,
      ReceiptHandle,
      VisibilityTimeout,
    }

    AWS.config.update({ region: 'us-east-1' })
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

    sqs.changeMessageVisibility(visibilityParams, (err) => {
      if (err) {
        console.log('Update Error', err)
        reject(err)
      } else {
        console.log(`Timeout Changed on ${retries}: ${VisibilityTimeout} seconds`)
        reject()
      }
    })
  })
}
