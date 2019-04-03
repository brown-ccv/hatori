// TODO: 
//  a.) Mobile View
//  b.) Loading Bar

import Vue from 'vue'
import Navigo from 'navigo'
import request from 'browser-request'

const KEYS = new Set(["id", "mean", "word", "prop"])

class Data {

  constructor(data) {
    this.data = data
    this.sorted = data.slice(0)
    this.filted = this.sorted.slice(0)
    this.top = data.reduce((a, b) => a+b.prop, 0)
    this.max = Math.max(...data.map(t => t.prop))

    this.word = ""
    this.sorter = "id"
    this.asc = true
  }

  sort(key, asc) {
    if (asc === undefined)
      asc = this.asc = key === this.sorter 
        ? !this.asc
        : true
    const scale = asc ? 1 : -1
    this.sorter = key
    this.sorted.sort((a, b) => {
      if (a[key] > b[key])
        return scale
      if (a[key] < b[key])
        return -scale
      return 0
    })
    this.search(this.word)
  }

  search(word) {
    this.word = word
    const hasword = word => topic =>
      topic.word.some(w => w.includes(word))
    const keyword = word
      .split("|")
      .map(w => hasword(w.trim()))
    const filt = this.filted =  this.sorted
      .filter(t => keyword.some(f => f(t)))
  }

}

// class act
class App {

  constructor(pagesize=25) {

    function makevue(self) {
      const html = require("../tmpl/front.html")
      const tmpl = Vue.compile(html)
      const data = { 
        topics  : [],
        page    : 0,
        search  : '',
        app     : self
      }
      const options = {
        el              : '#mainapp',
        data            : data,
        render          : tmpl.render,
        staticRenderFns : tmpl.staticRenderFns,
      }

      return new Vue(options)
    }


    function main(self, pagesize) {
      self.vue = makevue(self)
      self.pagesize = pagesize
    }

    return main(this, pagesize)
  }

  initialize(data) {

    function makenav(self) {
      const nav = new Navigo("./front/", true, "#!")
      const call = ({ key, asc, page, word }) => {
        key = (key || "").toLowerCase()
        key = KEYS.has(key) ? key : "id"
        asc = asc === "false" ? false : true
        page = parseInt(page)
        page = page ? page : 0
        word = word || ""
        self.goto(key, asc, page, word)
      }
      nav.on("/:key/:asc/:page/:word", call)
      nav.on("/:key/:asc/:page/", call)
      nav.on("/:key/:asc", call)
      nav.on("/:key", call)
      nav.on("/", call)

      return nav
    }

    function main(self, data) {
      self.data = data
      self.nav = makenav(self)
      self.nav.resolve()
    }

    return main(this, data)
  }

  goto(key, asc, page, word) {
    console.log(asc, key, page, word)
    this.vue.search = word
    this.sort(key, asc)
    this.show(page)
    this.search()
  }

  updateurl() {
    const asc = this.data.asc
    const key = this.data.sorter
    const word = this.data.word
    const page = this.vue.page

    this.nav.pause()
    this.nav.navigate(`/${key}/${asc}/${page}/${word}`)
    // this.nav.resume()
  }

  sort(key, asc) {
    console.log("sort")
    if (!this.data) return
    this.data.sort(key, asc)
    this.show(0)
    this.updateurl()
  }

  search(word) {
    if (!this.data) return
    if (word === undefined)
      word = this.vue.search
    if (this.word === this.data.word)
      return
    console.log(word)
    this.data.search(word)
    this.show(0)
    this.updateurl()
  }

  format({id, word, prop, mean}) {
    return {
      id    : id.toString(),
      rprop : 100 * prop / this.data.max,
      prop  : Math.round(10000 * prop / this.data.top) / 100,
      // graph : `./graph/graph-${id}.png`,
      graph : `../../front/graph-${id}.png`,
      link  : `../topic/#!/${id}/`,
      word  : word.map(word => ({ 
        word, link : `../graph/#!/?words[]=${word}` 
      }))
    }
  }

  show(page) {
    if (!this.data) return
    const start = this.pagesize * page
    const end = start + this.pagesize
    this.vue.topics = this.data.filted
      .slice(start, end)
      .map(t => this.format(t))
    this.loaded = true
    this.vue.page = page
    this.updateurl()
  }

  first() {
    this.show(0)
  }

  next() {
    const start = (this.vue.page + 1) * this.pagesize
    const len = this.data.filted.length
    if (start < len)
      this.show(this.vue.page + 1)
  }

  prev() {
    if (this.vue.page > 0)
      this.show(this.vue.page - 1)
  }

  last() {
    const len = this.data.filted.length - 1
    const page = Math.floor(len / this.pagesize)
    this.show(page)
  }

}

const app = new App()

request.get("../../json/front.json", (e, r) => {
  let data = new Data(JSON.parse(r.body))
  app.initialize(data)
  app.show(0)
})