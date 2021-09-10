'use strict'
const CronJob = require('cron').CronJob
const moment = require('moment')
const util = require('util')
const logger = require('./logger')
const db = require('../database/mysql')
const path = require('path')
const fs = require('fs')
const Op = db.Sequelize.Op
const request = require("request")
const postRequest = util.promisify(request.post)
const constants = require('./constants')
const _ = require('lodash')

// Cron runs on every day at 1 am to check quotes submitted more than 7 days or not
new CronJob('0 1 * * *', () => { // eslint-disable-line
  logger.info(util.format('Cron started for expire quote check'))
  return new Promise((resolve, reject) => {
    const startdate = moment().subtract(14, 'days').format('YYYY-MM-DD')
    db.sequelize.models.quoteHistory.findAll({
      where: {
        is_booked: false,
        is_expired: false,
        created_at: {
          [Op.lte]: startdate
        }
      },
      raw: true
    }).then(dateExceed => {
      dateExceed.map(elem => {
        const obj = {}
        obj.is_expired = true
        obj.updated_at = moment().utc().format('YYYY-MM-DDTHH:mm:ss')
        db.sequelize.models.quoteHistory.update(obj, {
          where: {
            quote_id: elem.quote_id
          }
        }).then(quoteExpired => {
          logger.info(util.format('Quote expired cron run successfully and expired status updated'))
          resolve(true)
        }).catch(error => {
          logger.error(util.format('Error at the time of expired status update', error))
          reject(error)
        })
      })
    })
  })
}, null, true)

// Cron runs on every day at 2 am to clear all pdf in upload folder
new CronJob('0 2 * * *', () => { // eslint-disable-line
  logger.info(util.format('Cron started for remove pdf in upload folder'))
  return new Promise((resolve, reject) => {
    function fromDir (startPath, filter) {
      if (!fs.existsSync(startPath)) {
        logger.info(util.format("no dir ", startPath))
        return
      }
      const files = fs.readdirSync(startPath)
      for (let i = 0; i < files.length; i++) {
        const filename = path.join(startPath, files[i])
        if (filename.indexOf(filter) >= 0) {
          logger.info(util.format('PDF file found: ', filename))
          fs.unlink(filename, (err) => {
            if (err) {
              logger.error(util.format('Err at the time of file remove'))
              reject(err)
            } else {
              logger.info(util.format('File deleted', filename))
              resolve(true)
            }
          })
        } else {
          logger.info(util.format('No file found'))
          resolve(true)
        }
      }
    }
    fromDir(process.cwd() + '/upload', '.pdf')
  })
}, null, true)

// Cron runs on every day at 12:30 am to sync cargowise database with our database
new CronJob('30 00 * * *', () => { // eslint-disable-line
  logger.info(util.format('Cron to sync container and shipment from cargowise database'))
  return new Promise(async (resolve, reject) => { // eslint-disable-line
    const { sqlConnect } = require('../database/sqlconnection')
    const sqlpool = await sqlConnect
    if (sqlpool) {
      await sqlpool.request().query(`SELECT jc.JC_ContainerNum, js.JS_UniqueConsignRef, js.JS_HouseBill, (case js.JS_BookingReference when '' then 'NA' else js.JS_BookingReference end) as JS_BookingReference, js.JS_PackingMode, 'VIKPROGRR' AS company_code, (CONCAT((SELECT RL_PortName FROM RefUNLOCO ru WHERE RL_Code = js.JS_RL_NKOrigin), ' (', js.JS_RL_NKOrigin, ')')) AS JS_RL_NKOrigin, (CONCAT((SELECT RL_PortName FROM RefUNLOCO ru WHERE RL_Code = js.JS_RL_NKDestination ), ' (', js.JS_RL_NKDestination, ')')) AS JS_RL_NKDestination, js.JS_TransportMode, js.JS_ScreeningStatus, js.JS_SystemLastEditTimeUtc, (SELECT count(JC.JC_ContainerNum) FROM JobPackLines AS JPL JOIN JobContainerPackPivot AS JCPP ON JCPP.J6_JL = JPL.JL_PK JOIN JobContainer AS JC ON JC.JC_PK = JCPP.J6_JC where JL_JS = js.JS_PK) AS container_count, (STUFF((SELECT CAST(', ' + JC.JC_ContainerNum AS VARCHAR(MAX)) FROM JobPackLines AS JPL JOIN JobContainerPackPivot AS JCPP ON JCPP.J6_JL = JPL.JL_PK JOIN JobContainer AS JC ON JC.JC_PK = JCPP.J6_JC where JL_JS = js.JS_PK FOR XML PATH ('')), 1, 2, '')) AS container_numbers, (SELECT TOP  1 JPL.JL_ActualVolume FROM JobPackLines AS JPL JOIN JobContainerPackPivot AS JCPP ON JCPP.J6_JL = JPL.JL_PK JOIN JobContainer AS JC ON JC.JC_PK = JCPP.J6_JC where JL_JS = js.JS_PK) AS actual_volume FROM JobContainer jc JOIN JobContainerPackPivot AS jcpp ON jcpp.J6_JC = jc.JC_PK JOIN JobPackLines AS jpl ON jpl.JL_PK = jcpp.J6_JL JOIN JobShipment AS js ON js.JS_PK = jpl.JL_JS where CAST( jc.JC_SystemCreateTimeUtc AS Date) = '${moment().subtract(1, 'days').format('YYYY-MM-DD')}'`).then(async dataRecord => {
        if (dataRecord.recordset.length > 0) {
          logger.info(util.format('Successfully getting result for the date: ', moment().subtract(1, 'days').format('YYYY-MM-DD')))
          dataRecord.recordset = dataRecord.recordset.filter(function (item) {
            return item.JS_UniqueConsignRef.includes("SVNI")
          })
          dataRecord.recordset = _.uniqBy(dataRecord.recordset, 'JC_ContainerNum')
          if (dataRecord.recordset.length > 0) {
            logger.info(util.format(dataRecord.recordset.length + ' import shipment data received for the date: ', moment().subtract(1, 'days').format('YYYY-MM-DD')))
            db.sequelize.models.cargowise_containers.bulkCreate(dataRecord.recordset).then(dataInserted => {
              logger.info(util.format('Successfully inserted import shipment data in the table for new shipments'))
              resolve(dataInserted)
              dataRecord.recordset.forEach(element => {
                const bodyObj = {}
                // bodyObj.scacCode = element.scac_code
                bodyObj.scacCode = ""
                postRequest(
                  "https://api.opentrack.co/v1/containers/" + element.JC_ContainerNum,
                  {
                    json: {
                      ...bodyObj
                    },
                    headers: {
                      'Content-Type': 'application/json',
                      'Opentrack-API-Key': constants.OPEN_TRACK_KEY
                    }
                  }
                ).then(response => {
                  logger.info(util.format('Container initialized. Container number: ', element.JC_ContainerNum))
                }).catch(error => {
                  logger.error(util.format('Error at the time of opentrack API call', error))
                })
              })
            }).catch(error => {
              if (error && error.name === 'SequelizeUniqueConstraintError') {
                logger.error(util.format('Same container ID already exists. Error: ', error))
                reject(error)
              } else {
                logger.error(util.format('Error at the time of data insertion. Error: ', error))
                reject(error)
              }
            })
          } else {
            logger.info(util.format('No import shipment to insert'))
          }
        } else {
          logger.info(util.format('No new container added on: ', moment().subtract(1, 'days').format('YYYY-MM-DD')))
        }
      }).catch(error => {
        logger.error(util.format('Error at the time of getting result', error))
        reject(error)
      })
    } else {
      logger.info(util.format('Database connection failed'))
    }
  })
}, null, true)
