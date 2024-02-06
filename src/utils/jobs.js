const cron =require('node-cron');
const emailService =require('../services/email-service');
const {sender}=require('../config/email-Config')

/*
    10:00 am
    Every 5 mins
    We will check are their any pending emails which was 
    expected to be sent by now and is pending


*/

// const setupJobs= ()=>{
//     cron.schedule('*/2 * * * *',async ()=>{
//         const responce=await emailService.fetchPendingEmails();
        

//         responce.forEach((email) => {
//             console.log("This is the enail iterator",email)
//             sender.sendMail({
//                 to:email.recepientEmail,
//                 subject:email.subject,
//                 text:email.content
//             },async (err,data)=>{
//                 if(err){
//                     console.log(err);
//                 }
//                 else{
//                     console.log("Hi this is from the callback");

//                     console.log(data);
//                     emailService.updateTicket(email.id,{status:"SUCCESS"});
                    
//                 }
//             }
            
            
            
//             );
//         });
//     })
// }
const setupJobs = () => {
    cron.schedule('*/2 * * * *', async () => {
        const response = await emailService.fetchPendingEmails();
        response.forEach(async (email) => {
            await emailService.updateTicket(email.id, {status: "SUCCESS"});
            // sender.sendMail({
            //     to: email.recepientEmail,
            //     subject: email.subject,
            //     text: email.content
            // }, async (err, data) => {
            //     if(err) {
            //         console.log(err);
            //     } else {
            //         console.log(data);
            //         await emailService.updateTicket(email.id, {status: "SUCCESS"});
            //     }
            //});
        });
        //console.log(response);
    });    
}
module.exports=setupJobs;