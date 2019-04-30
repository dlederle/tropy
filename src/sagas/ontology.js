'use strict'

require('../common/promisify')

const { Database } = require('../common/db')
const { debug, info, warn } = require('../common/log')
const { ONTOLOGY } = require('../constants')
const { exec } = require('./cmd')
const { fail } = require('../dialog')
const { user } = require('../path')
const mod = require('../models')
const act = require('../actions')
const { call, cps, fork, take } = require('redux-saga/effects')
const { unlink } = require('fs')

const command = ({ type, error, meta }) =>
  (!error && meta && meta.cmd === 'ontology') || type === ONTOLOGY.RESET


function *reset(db) {
  info('*ontology resetting db...')

  yield call(db.close)
  yield cps(unlink, db.path)

  db = new Database(db.path)
  yield call(mod.ontology.create, db)
  yield call(exec, { db }, act.ontology.load())

  return db
}

function *ontology({ file = user(ONTOLOGY.DB), ...opts } = {}) {
  try {
    debug('*ontology started')
    var db = new Database(file, 'w+', opts)

    if (yield call(db.empty)) {
      yield call(mod.ontology.create, db)
    } else {
      try {
        yield call(db.migrate, ONTOLOGY.MIGRATIONS)
      } catch (error) {
        warn('failed to migrate ontology database', { stack: error.stack })
        yield call(fail, error, 'ontology.migrate')
      }
    }

    yield call(exec, { db }, act.ontology.load())

    while (true) {
      const action = yield take(command)

      switch (action.type) {
        case ONTOLOGY.RESET:
          db = yield call(reset, db)
          break
        default:
          yield fork(exec, { db }, action)
      }
    }

  } catch (e) {
    warn(`unexpected error in *ontology: ${e.message}`, {
      stack: e.stack
    })

  } finally {
    if (db) {
      yield call(mod.ontology.vocab.prune, db)
      yield call(mod.ontology.label.prune, db)
      yield call(db.close)
    }

    debug('*ontology terminated')
  }
}

module.exports = {
  ontology
}
