const express = require('express')
const util = require('util')
const cors = require('cors')
const logger = require('./utils/logger')
const config = require('./configurations/config')
const routes = require('./routes/index')
const db = require('./database/mysql')
const masters = require('./masterData/masterService')
const _ = require('lodash')
const Promise = require('bluebird')

const app = express()

// Global Variable Declarations
const middlewares = require('./middlewares/index')

// use cors
app.use(cors())

// required to get client IP when running via reverse proxy (HA proxy)
app.set('trust proxy', true)

app.use('/download', express.static('./upload'))

// require cron files
require('./utils/crons')

// setup middlewares
middlewares(app)

// setup routes
routes(app)

// Function Call To Sync App Database Tables Before the Start of the Application
db.sequelize.sync().then((status) => {
  logger.info(util.format('My SQL Tables Synced Successfully.'))
  // start Express server
}).then(() => {
  return new Promise(resolve => {
    Promise.all([
      masterAdminMenus(),
      menus(),
      masterCFS(),
      exceptionRules(),
      masterStates(),
      masterCustomerMenus(),
      customerMenu(),
      adminEmail(),
      cutoffTime(),
      tmsExceptionRules()
    ]).then(() => {
      logger.info(util.format('Default data added to My SQL Tables Successfully.'))
      // start Express server
      app.listen(process.env.PORT || config.get('server.port'), function () {
        logger.info(util.format('Vin World Wide API Server with pid: %s listening on port: %s', process.pid, config.get('server.port')))
        logger.info(util.format('Environment: %s', config.get('env')))
      })
    }).catch(error => {
      logger.error(util.format('Error While adding default data in My SQL Tables. Error: %j', error))
    })
  })
}).catch((error) => {
  logger.error(util.format('Error While Syncing My SQL Tables. Error: %j', error))
})

app.timeout = config.get('server.timeout')

process.on('uncaughtException', function (e) {
  logger.error(util.format('uncaught exception:- ', e.stack))
})

// Creating admin master mennus
function masterAdminMenus () {
  return new Promise(resolve => {
    db.sequelize.models.master_admin_menus.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.masterAdminMenus, (data) => {
          return db.sequelize.models.master_admin_menus.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Creating Menus
function menus () {
  return new Promise(resolve => {
    db.sequelize.models.menus.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.menus, (data) => {
          return db.sequelize.models.menus.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Inseting master CFS
function masterCFS () {
  return new Promise(resolve => {
    db.sequelize.models.master_cfs.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.master_cfs, (data) => {
          return db.sequelize.models.master_cfs.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Inserting exception rules
function exceptionRules () {
  return new Promise(resolve => {
    db.sequelize.models.exception_rules.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.exception_rules, (data) => {
          return db.sequelize.models.exception_rules.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Inserting states
function masterStates () {
  return new Promise(resolve => {
    db.sequelize.models.master_state.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.master_state, (data) => {
          return db.sequelize.models.master_state.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

function masterCustomerMenus () {
  return new Promise(resolve => {
    db.sequelize.models.master_customer_menus.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.masterCustomerMenus, (data) => {
          return db.sequelize.models.master_customer_menus.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Inserting customer menu
function customerMenu () {
  return new Promise(resolve => {
    db.sequelize.models.customer_menus.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.customerMenus, (data) => {
          return db.sequelize.models.customer_menus.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Adding default admin email
function adminEmail () {
  return new Promise(resolve => {
    db.sequelize.models.master_admin_email.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.adminEmail, (data) => {
          return db.sequelize.models.master_admin_email.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Adding default cutoff time
function cutoffTime () {
  return new Promise(resolve => {
    db.sequelize.models.master_cutoff_time.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.cutoffTime, (data) => {
          return db.sequelize.models.master_cutoff_time.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}

// Adding tms excception rule
function tmsExceptionRules () {
  return new Promise(resolve => {
    db.sequelize.models.tms_exception_rules.findAll().then(result => {
      if (_.isEmpty(result)) {
        return Promise.map(masters.tms_exception_rules, (data) => {
          return db.sequelize.models.tms_exception_rules.create(data)
        })
      } else {
        return null
      }
    })
    resolve()
  })
}