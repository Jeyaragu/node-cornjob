const express   = require('express');
const rest      = require('restler');
const cron      = require('node-cron');
const router    = express.Router();

// Stock's model
const stocks = require('../model/stocks');

// Logger
const {logger,errorlooger} = require('./logs');
const { response } = require('express');

// cron.schedule('*/10 * * * * *',()=>{ 
//   console.log('Cron Running for every 1mints',new Date().toISOString())
// },null,true);


cron.schedule('*/5 * * * * *',()=>{ 
  console.log(new Date().toLocaleString() +':'+ ' MF Holding Cron Started');
  let uid = { "ClientCode":"100932" }  ;
 logger.info(new Date().toLocaleString() + 'MF Holding Cron Started')
  rest.post('https://trade.cholawealthdirect.com/CholaWMSAPI/PortfolioService.svc/StocksReport',{
    headers:{
      "Content-Type":"application/json"
    },
    data:JSON.stringify(uid)
  })
  .on('complete',(data,response)=>{
    if(response.statusCode !=200){
      errorlooger.error('MF Holding Scheduler: ' + new Date().toLocaleString() + ' Error Occured: ')
    }
    if(response.statusCode == 200){
      data.forEach((value)=>{
        console.log(value.data.length);
        value.data.forEach((result)=>{
          stocks.remove().then((recordinsert)=>{
          stocks.insertMany(result)
          .then((output)=>{
            logger.info('MF Holding Scheduler: ' + new Date().toISOString() + 'Success: ', output);
          })
          .catch((error)=>{
            errorlooger.error('MF Holding Scheduler: ' + new Date().toLocaleString() + ' Error Occured: ',error)
            })
          }).catch((err)=>{
            errorlooger.error('MF Holding Scheduler: ' + new Date().toLocaleString() + ' Error  While Removing the Reocrd: ',error)
          })
        })  
      })
      // logger.info(new Date().toLocaleString() + 'MF Hodling Scheduler Ended')
    }
  })
},null,true);

 
module.exports = router;