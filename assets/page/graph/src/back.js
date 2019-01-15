// TODO:
//  a.) Client-Side Routing for Word Url
//  b.) Mobile View
//  c.) Arrow Highlight for Selection
//  d.) Loading Bar
//  e.) Migrate to Template


import Vue from 'vue'
import Navigo from 'navigo'
import request from 'browser-request'
// import { bb } from 'billboard.js'

import { Searcher, Queue } from './util.js'



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
    console.log(this.chart)
    console.log("loaded")
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


  add(word) {
    this.addqueue(() => this._add(word))
  }

  del(word) {
    this.addqueue(() => this._del(word))
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

  constructor(chart) {


    function makevue(self) {
      return new Vue({
        el: '#mainapp',
        data: {
          search: '',
          normalized: true,
          hits: [],
          shown: [],
          app: self
        }
      })
    }


    function main(self, chart) {
      const keys = Object.keys(chart.word)
      keys.sort()

      self.vue = makevue(self)
      self.chart = chart
      self.searcher = new Searcher(keys)
      self.searchkey = ''
      const items = [...chart.shown]
      items.sort()
      self.vue.shown = items.map(w => ({ text : w }))
      self.shown = new Set(items)
    }

    return main(this, chart)
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



let data, chart, app
request.get("./graph.json", (e, r) => {
  data = JSON.parse(r.body)
  chart = new Chart(data)
  window.app = app = new App(chart)

  const add = text => {
    app.vue.search = text
    app.add()
  }

  add("strong")

  // chart.denormalize()
  // chart.normalize()
})


console.log(app)