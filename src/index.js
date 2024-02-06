const express=require('express');

const bodyParser= require('body-parser');
const {PORT}=require('./config/serverConfig');
const {sendBasicEmail}=require('./services/email-service');
const cron=require('node-cron');
const TicketController=require('./controller/ticket-controller');
const {EMAIL_ID,EMAIL_PASSWORD}=require('./config/serverConfig')


const setupAndStartServer =() =>{
    const app=express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    const jobs=require('./utils/jobs');

    app.post('/api/v1/tickets',TicketController.create);

    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
        // console.log(EMAIL_ID," ",EMAIL_PASSWORD);

        // sendBasicEmail(
        //     'support@admin.com',
        //     'aman.srivastava.378.sa@gmail.com',
        //     'This is a testing email',
        //     'Hey, how are you , I hope you like the support',

        // );
        jobs();

        
    })
}

setupAndStartServer();
