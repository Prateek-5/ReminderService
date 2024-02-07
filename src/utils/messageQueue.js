const amqplib = require('amqplib');
const { MESSAGE_BROKER_URL, EXCHANGE_NAME} = require('../config/serverConfig');

const createChannel = async () => {
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        //Using the connection object we are creating the channel
        const channel = await connection.createChannel(); 
        //The purpose of assertExcahnge is to create an exchange if the given exchange doesn't exist
        await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
        return channel;
    } catch (error) {
        throw error;
    }
}

const subscribeMessage = async (channel, service,  binding_key) => {
    try {
        const applicationQueue = await channel.assertQueue('REMINDER_QUEUE');

        channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

        channel.consume(applicationQueue.queue, msg => {
            console.log('received data ji');
            //console.log(msg.content.toString());
            
            const payload = JSON.parse(msg.content.toString());
            //console.log(payload);
            service(payload);
            channel.ack(msg);
        });
    } catch (error) {
        throw error;
    }

}

const publishMessage = async (channel, binding_key, message) => {
    try {
        await channel.assertQueue('REMINDER_QUEUE');
        //The following method is taking the channel object 
        //Exchange name to identify the exchange to which we have to send the message
        //binding_key is to identify to which queue we are sending the message
        //Buffer.from() is used to send the message in the required formate


        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
    } catch (error) {
        throw error;
    }
}

module.exports = {
    subscribeMessage,
    createChannel,
    publishMessage
}