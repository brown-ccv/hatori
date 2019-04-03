// TODO:
//  a.) Mobile View
//  b.) Arrow Highlight for Selection
//  c.) Loading Bar

import Vue from 'vue'
import Navigo from 'navigo'
import request from 'browser-request'
import { bb } from 'billboard.js'

import { Searcher, Queue, parse, encode } from './util.js'


class Chart {

  constructor(database, bindto="#chart") {
    this.year = database.year
    this.word = database.word
    this.sums = database.sums
    this.x = ["x-axis", ...this.year]

    this.shown = new Set()
    const data =  {
      "x": "x-axis",
      "columns": [],
      "type": "spline"
    }
    this.chart = bb.generate({
      data, bindto,
      "point": { "show": false },
    })
    this.queue = new Queue()
    this.watching = false
    this.normalized = true
  }

  startwatch() {
    if (this.watching)
      return
    this.watching = true
    this.run()
    this.watch = setInterval(() => this.run(), 400)
  }

  stopwatch() {
    if (!this.watching)
      return
    clearInterval(this.watch)
    this.watching = false
  }

  alert(msg) {
    console.warn(msg)
    return false
  }

  run() {
    this.queue.empty()
      ? this.stopwatch()
      : this.queue.pop()()
  }

  _update() {
    const dword = this.word
    const lambda = this.normalized
      ? w => dword[w].map((n, i) => 10000 * n/this.sums[i])
      : w => dword[w].map((n, i) => n)

    const words = [...this.shown]
    const columns = words.map(w => [w, ...lambda(w)])
    columns.push(this.x)
    this.chart.load({ columns })
  }

  addable(word) {
    return(!this.shown.has(word)
         && this.word.hasOwnProperty(word))
  }

  delable(word) {
    return this.shown.has(word)
  }

  _addall(words) {
    const addables = []
    for (const word of words) {
      if (this.shown.has(word)) continue
      if (!this.word.hasOwnProperty(word)) 
        continue
      this.shown.add(word)
      let y = this.word[word]
      if (this.normalized)
        y = y.map((n, y) => 10000 * n/this.sums[y])
      addables.push([word, ...y])
    }
    const columns = this.shown.length
      ? addables
      : [this.x, ...addables]
    this.chart.load({ columns })
  }

  _add(word) {
    if (this.shown.has(word)) return
    if (!this.word.hasOwnProperty(word))
      return this.alert("no word")

    this.shown.add(word)
    let y = this.word[word]
    if (this.normalized)
      y = y.map((n, y) => 10000 * n/this.sums[y])
    const columns = this.shown.length
      ? [[word, ...y]]
      : [this.x, [word, ...y]]
    this.chart.load({ columns })
  }

  _del(word) {
    if (!this.shown.has(word))
      return this.alert("word not shown")
    this.shown.delete(word)
    this.chart.unload({ "ids": word })
  }

  _normalize() {
    if (this.normalized)
      return
    this.normalized = true
    this._update()
  }

  _denormalize() {
    if (!this.normalized)
      return
    this.normalized = false
    this._update()
  }

  addqueue(f) {
    this.queue.push(f)
    this.startwatch()
  }

  del(word) {
    this.addqueue(() => this._del(word))
  }

  add(word) {
    this.addqueue(() => this._add(word))
  }

  addall(words) {
    this.addqueue(() => this._addall(words))
  }

  update() {
    this.addqueue(() => this._update())
  }

  normalize() {
    this.addqueue(() => this._normalize())
  }

  denormalize() {
    this.addqueue(() => this._denormalize())
  }


}


class App {

  constructor() {

    function makevue(self) {
      const html = require("../tmpl/graph.vue")
      const tmpl = Vue.compile(html)
      const data = {
        search: '',
        normalized: true,
        hits: [],
        shown: [],
        app: self
      }
      const options = {
        el              : '#mainapp',
        data            : data,
        render          : tmpl.render,
        staticRenderFns : tmpl.staticRenderFns,
      }

      return new Vue(options)
    }

    function main(self) {
      self.vue = makevue(self)
    }

    return main(this)

  }

  initialize(data) {

    function makenav(self) {
      const baseroot = './graph'
      const usehash = true
      const hash = '#!'
      const nav = new Navigo(baseroot, usehash, hash)
      nav.on("/", q => self.addall(parse(q)))
      // nav.on('*', () => nav.navigate("/"))
      return nav
    }

    function main(self, data) {

      const keys = Object.keys(data.word).sort()

      self.chart = new Chart(data)
      self.searcher = new Searcher(keys)
      self.searchkey = ''
      const items = [...self.chart.shown].sort()

      self.vue.shown = items.map(w => ({ text : w }))
      self.shown = new Set(items)

      self.nav = makenav(self)
      self.nav.resolve()
    }

    return main(this, data)

  }


  search() {
    const word = this.vue.search.trim()
    if (this.searchkey === word && word != '') return
    this.vue.hits = word.length < this.searcher.depth
      ? []
      : this.searcher
          .lookup(word)
          .filter(x => !this.shown.has(x))
          .map(x => ({ text : x }))
  }

  renormalize() {
    this.vue.normalized
      ? this.chart.denormalize()
      : this.chart.normalize()
    this.vue.normalized = !this.vue.normalized
  }

  update() {
    const items = [...this.shown]
    items.sort()
    this.vue.shown = items.map(w => ({ text : w }))

    this.nav.pause(true)
    this.nav.navigate(`/?${encode(items)}`)
    this.nav.pause(false)

  }

  alert(msg) {
    console.log(msg)
    return false
  }



  addword(word) {
    if (this.shown.has(word))
      return this.alert('already has word')
    this.vue.search = ''
    this.search()
    if (!this.chart.addable(word))
      return this.alert('statistic does not exist for the word')
    this.chart.add(word)
    this.shown.add(word)
    this.update()

  }

  addall(words) {
    const addables = new Set()
    const already  = new Set()
    for (const word of words)
      if (this.chart.addable(word))
        addables.add(word)
      else if (this.shown.has(word))
        already.add(word)

    for (const word of this.shown) 
      if (!addables.has(word) && !already.has(word))
        this.del(word)

    for (const word of addables)
      this.shown.add(word)
    // for (const word of already)
    //   this.shown.add(word)

    // console.log("addables", addables)
    this.chart.addall([...addables].sort())
    this.update()
  }

  add() {
    this.addword(this.vue.search)
  }


  del(word) {
    if (!this.shown.has(word))
      return
    this.chart.del(word)
    this.shown.delete(word)
    this.update()
  }

}

const app = new App()
request.get("../../json/graph.json", (e, r) => {
  const data = JSON.parse(r.body)
  window.app = app
  app.initialize(data)
})