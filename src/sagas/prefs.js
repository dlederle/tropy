import { all, call, cancel, delay, fork, take } from 'redux-saga/effects'
import { debug, warn } from '../common/log'
import { PREFS } from '../constants'
import { ontology } from './ontology'
import { history } from './history'
import { ipc } from './ipc'
import { shell } from './shell'
import { persist, restore } from './storage'

export function *main() {
  // Delayed import with command registation side-effect!
  yield import('../commands/ontology')

  try {
    var aux = yield all([
      fork(ontology, { max: 2 }),
      fork(history),
      fork(ipc),
      fork(shell)
    ])

    aux.START = Date.now()

    yield all([
      call(restore, 'prefs'),
      call(restore, 'settings')
    ])

    debug('*prefs.main ready')
    yield take(PREFS.CLOSE)

  } catch (e) {
    warn({ stack: e.stack }, 'unexpected error in *prefs.main')

  } finally {
    yield all([
      call(persist, 'prefs'),
      call(persist, 'settings')
    ])

    // HACK: Ensure we don't cancel aux tasks too early!
    if (Date.now() - aux.START < 1000) {
      yield delay(1000)
    }

    yield cancel(aux)

    // HACK: We cannot wait for cancelled tasks to complete.
    // See redux-saga#1242
    yield delay(200)

    debug('*prefs.main terminated')
  }
}
