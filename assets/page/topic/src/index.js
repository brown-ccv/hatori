
import Navigo from 'navigo'
import request from 'browser-request'
import Vue from 'vue'

import { bb } from 'billboard.js'

const ENDPOINT = "https://datasci.brown.edu/hatori/"
class Data {

  constructor() {
    this.data = {}
    this.shared = require("../../../../assets/json/shared.json")
    this.template = Vue.compile(require('../tmpl/topic.vue').default)
  }

  topic(id, z, call=()=>{}) {
    // id is a string
    // todo: check for empty id
    // if (id in this.data)
    //   return setTimeout(() => call(this.data[id]), 200)
    console.log("new id", id)
    const url = id.length
      ? `${ENDPOINT}?topic_ids=${id}&z=${z}`
      : ENDPOINT
    request(url, (e, r) => {
      const data = JSON.parse(r.body)
      this.data[id] = data
      call(data)
    })
  }

}

class App {

  renavigate(sort) {
    if (sort)
      this.vue.id.sort((a, b) => a-b)
    const url = `/${this.vue.id.join(",")}/${this.vue.inp_z}`
    this.router.navigate(url)
    this.vue.inp_id = ""
  }

  add_id () {
    const id = parseInt(this.vue.inp_id)
    if (!this.data.shared.ids.includes(id))
      return alert("id unknown")
    else if (this.vue.id.includes(id))
      return alert("id already added")

    this.vue.id.push(id)
    this.renavigate(true)
  }

  set_z () {
    const z = parseFloat(this.vue.inp_z)
    if (isNaN(z))
      return alert("z is not a number")
    this.renavigate(true)
  }

  remove(id) {
    this.vue.id.splice(this.vue.id.indexOf(id), 1);
    this.renavigate(false)
  }

  constructor() {

    function loadapp(self) {
      const tmpl = self.data.template
      const data = {
        app    : self,
        id     : [],
        doc    : [],
        word   : [],
        count  : 0,
        maxdoc : 1,
        inp_id : "",
        inp_z  : ""
      }

      const computed = {
        prop  : () => data.count / self.data.shared.total,
        width : () => data.count / self.data.shared.max,
      }

      const options = {
        el              : '#mainapp',
        data            : data,
        computed        : computed,
        render          : tmpl.render,
        staticRenderFns : tmpl.staticRenderFns,
      }

      return new Vue(options)
    }

    function loadrouter(self, hash) {
      const first = `/${self.data.shared.ids[0]}/`
      const router = new Navigo('./topic/', true, hash)
      router
        .on('topic', () => router.navigate(first))
        .on(`/:id/`, ({id}) => router.navigate(`/${id}/0/`))
        .on(`/:id/:z/`, ({id, z}) => self.load(id, z))
        .on('/',     () => self.load(''))
      setTimeout(() => router.resolve(), 0)
      return router
    }

    function loadchart(self) {
      const bindto = '#chart'
      const data =  {
        "x": "x-axis",
        "columns": [],
        "type": "area-spline"
      }
      return bb.generate({
        data, bindto,
        "point": { "show": false },
      })

    }

    function main(self) {
      self.data = new Data()
      self.vue = loadapp(self)
      self.hash = "#!"
      self.router = loadrouter(self, self.hash)
      self.chart = loadchart(self)

      self.load_time = null
      self.load_hash = null
    }

    return main(this)

  }

  load(id, z) {
    const dictmap = ({name, date, token, count}) =>
      ({ name : name ? name.toLowerCase() : '', date, token, count })
    const formword = (max, total) => ([word, count]) =>
      ({ word, width : count / max, prop : count / total })

    function makechart(self, data) {
      console.log(data)
      const ysums = self.data.shared.ysums
      const years = Object
        .keys(ysums)
        .map(x => parseInt(x))
        .sort()
      const ymap = (c, i) => 10000 * c / ysums[years[i]]
      const x = ['x-axis', ...years]
      const y = [`per 10,000 words`,...data.year.map(ymap)]
      self.chart.load({ columns : [x, y] })
    }

    function main(self) {
      const load_time = (new Date()).getTime()
      const load_hash = Math.random()
      self.load_time = load_time + 0
      self.load_hash = load_hash + 0
      self.data.topic(id, z, data => {
        if (load_time != self.load_time ||load_hash != self.load_hash)
          return
        const wordcounts = data.word
          .map(([word, count]) => count)
        const wordmax = Math.max(...wordcounts)
        const doccounts = data.doc.map(({count}) => count)
        self.vue.id = data.id
        self.vue.doc = data.doc.map(dictmap)
        self.vue.word = data.word.map(formword(wordmax, data.count))
        self.vue.count = data.count
        // self.vue.maxdoc = Math.max(...doccounts.map(d => d.countd.tokens))
        makechart(self, data)
      })
    }

    return main(this)
  }

}

const app = new App()
window.app = app