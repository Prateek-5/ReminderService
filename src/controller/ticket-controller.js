const { response } = require('express');
const TicketService=require('../services/email-service');


const create= async (req ,res)=>{
    try {
        const responce=await TicketService.createNotification(req.body);
        return res.status(201).json({
            success: true,
            data: responce,
            err: {},
            message: 'Successfully registered an email reminder'
        })
    } catch (error) {
        console.log(error,'This is an error for incorrect data');
        return res.status(500).json({
            success: false,
            data: response,
            err: error,
            message: 'Unable to registed an email reminder'
        })
    }
}

module.exports={
    create
}