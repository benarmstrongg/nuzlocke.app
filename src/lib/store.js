/* eslint no-undef: 0 */
import { browser } from '$app/env'
import { writable } from 'svelte/store'

import { uuid } from '$lib/utils/uuid'

const IDS = {
  active: 'nuzlocke',
  saves: 'nuzlocke.saves',
  game: id => `nuzlocke.${id}`
}

const createWritable = (id, f = val => browser && val && localStorage.setItem(id, val), ssDefault = '') => {
  const store = browser ? localStorage.getItem(id) : ssDefault
  const w = writable(store)
  w.subscribe(f)
  return w
}

export const activeGame = createWritable(IDS.active)
export const savedGames = createWritable(IDS.saves)

export const deleteGame = (id) => {
  if (!window.confirm('This will delete all data, are you sure?'))
    return

  localStorage.removeItem(IDS.game(id))
  savedGames.update(g => {
    return g
      .split(',')
      .filter(i => !i.startsWith(id))
      .join(',')
  })
}

export const createGame = (name, game) => (payload) => {
  if (!browser) return

  const id = uuid()
  const games = payload === 'null' || payload === null || payload === 'undefined'
    ? []
    : payload.split(',').filter(i => i.length)
  const gameData = `${id}|${+new Date()}|${name}|${game}`

  if (!localStorage.getItem(IDS.game(id)))
    localStorage.setItem(IDS.game(id), JSON.stringify({}))

  console.log(`Creating new game for ${name} ${game}`)
  return games.concat(gameData).join(',')
}

export const getGame = (id) => createWritable(
  IDS.game(id),
  (val) => {
    if (!browser) return
    if (!val) return
    console.log(`Updating localstorage for game ${id}`, val)
    localStorage.setItem(IDS.game(id), val)
  },
  {}
)

export const patch = (payload) => (data) => {
  console.log('Patching this', JSON.stringify(payload), ' into ', data)
  return JSON.stringify({
    ...JSON.parse(data),
    ...payload
  })
}

export const read = (cb) => (payload) => {
  if (!payload) return
  let data = {}
  try { data = JSON.parse(payload) } catch (e) {}
  cb(data || {})
}
