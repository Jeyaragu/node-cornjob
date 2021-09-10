const express   = require('express');
const rest      = require('restler');
const cron      = require('node-cron');

const fundschema = require('../model/entirefundmaster');


var fundmaster = cron.schedule('* * * * * *',()=>{
  console.log('Cron Started...!')
  rest.post('https://trade.cholawealthdirect.com/CholaWMSAPI/PortfolioService.svc/RadarSchemeLumpsum',{
    headers:{
      "Content-Type":"application/json"
    }
  }).on('complete',(data,response)=>{
    if(response.statusCode !=200){
      console.log(response)
    }
    if(response.statusCode==200){
      data.forEach((value)=>{
        console.log(value.scheme.length);
        value.scheme.forEach((result)=>{
          fundschema.insertMany(result)
          .then((value)=>{
            console.log("Data Inserted Successfully..!")
          })
          .catch((err)=>{
            console.log(err)
          })
        })
      })
      fundmaster.stop();
      console.log('API is Success')
    }
  })
},null,true)
