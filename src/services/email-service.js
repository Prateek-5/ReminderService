const sender=require('../config/email-Config');
const {TicketRepository}=require('../repository/index');

const repo=new TicketRepository();
const sendBasicEmail=async (mailFrom, mailTo, mailSubject,mailBody)=>{
    
    try {
        const responce=await sender.sendMail({
            from:mailFrom,
            to:mailTo,
            subject:mailSubject,
            text:mailBody
    
        })
    } catch (error) {
        console.log(error);

    }
}

const fetchPendingEmails =async (timestamp) =>{
    try {
        //const repo=new TicketRepository();
        const responce=await repo.get({status:"PENDING"});
        console.log(responce);
        return responce;

    } catch (error) {
        console.log("Something went wrong in the service layer");

        throw{error}
    }
}

const createNotification =async (data) =>{
    try {
        const responce= await repo.create(data);
        return responce;

    } catch (error) {
        console.log(error);

    }
}
const subscribeEvents = async (payload) => {
    let service = payload.service;
    console.log(payload);

    let data = payload.data;
    switch(service) {
        case 'CREATE_TICKET':
            await createNotification({
                subject:payload.subject,
                content:payload.content,
                recepientEmail:payload.recepientEmail,
                notificationTime:payload.notificationTime
            });
            break;
        default: 
            console.log('No valid event received');
            break;
    }
}
const updateTicket = async (ticketId, data) => {
    try {
        const response = await repo.update(ticketId, data);
        return response;
    } catch (error) {
        console.log(error);
    }
}




module.exports={
    sendBasicEmail,
    fetchPendingEmails,
    createNotification,
    updateTicket,
    subscribeEvents
}