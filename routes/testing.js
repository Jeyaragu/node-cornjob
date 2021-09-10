const express = require('express');
const bodParser = require('body-parser');
const rest  = require('restler')
const router = express.Router();


// const logger = require('../logs/logs');
const {errorlooger,logger} = require('./logs');

router.get('/api/clientDetails/:uid',(req,res)=>{
  let uid     = req.params.uid;
  var myobje  = {"UID":uid}
  var finobje = JSON.stringify(myobje);
  
  rest.post('https://trade.cholawealthdirect.com/CholaWMSAPI/PortfolioService.svc/ClientDetails',{
    headers:{
      "Content-Type":"application/json"
    },
    data:finobje
  })
  .on('complete',(data,response)=>{
    if(response.statusCode != 200){
      res.json({
        "code": 500,
        "data": [],
       "message": "Somthing Went to Wrong..!"
      })
      errorlooger.error('Error from Client Request: ' +  new Date().toISOString(), myobje);
      // errorlooger.error(new Date().toISOString(),'Error from Client Response', response);
      errorlooger.error('Error from Client Response: ' + new Date().toISOString(), response);
    }if(response.statusCode == 200){
      data.forEach((value)=>{
        // res.json({
        //   "code": 200,
        //   "data": value.data,
        //  "message": "Data Fetch Successfully..!"
        // })
        console.log(value.data.length)
        value.data.forEach((result)=>{
          // res.json({
          //   "result": result
          // })
          // console.log(result.length)
        })
        res.json({
          "result": value.data
        })
      })
      logger.info("Cient Details Request: " + new Date().toISOString(), myobje)
      // logger.info(new Date().toISOString(),"Cient Details Response",data)
      logger.info("Cient Details Response: " + new Date().toISOString(),data)
      // logger.log({
      //   'level':'info',
      //   'message':data
      // });
    }
  })
})


module.exports = router;