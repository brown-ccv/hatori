
import Vue from 'vue'
import LazyLoad from 'lazyload'


class App {

  constructor() {

    function loadapp(self) {
      const tmpl = Vue.compile(require('../tmpl/index.vue'))
      const length = 100
      const data = {
        items : self.items,
        shown : new Set(self.items.map(i => i.id)),
        app   : self,
        query : "",
        sort  : "prop"
      }
      const options = {
        el              : '#mainapp',
        data            : data,
        render          : tmpl.render,
        staticRenderFns : tmpl.staticRenderFns,
      }
      return new Vue(options)
    }

    function makeitems(self) {
      const items = []
      const data = require("../../../json/front.json")
      const max = Math.max(...data.map(d => d.prop))
      let total = 0
      for (const d of data)
        total += d.prop
      return data.map(item => ({
        id : item.id,
        prop : item.prop / total,
        width : item.prop / max,
        word : item.word,
        mean : item.mean
      })).sort((a, b) => b.prop - a.prop)
    }

    function main(self) {
      self.temp = { sortkey: "prop", asc:false, query:'' }
      self.data = makeitems(self)
      self.items = self.data.map(i => i)
      self.ids = self.data.map(i => i.id)
      self.vue = loadapp(self)
      setTimeout(() => self.lazy = new LazyLoad(), 100)
    }

    return main(this)
  }

  reload() {
    setTimeout(() => this.lazy.loadImages(), 100)
  }

  _sort(key, asc) {
    this.temp.asc = asc
    this.temp.sortkey = key
    this.vue.items.sort((a, b) => b[key] - a[key])
    if (asc)
      this.vue.items.reverse()
  }

  _search(word) {
    this.temp.query = word.toLowerCase()
    word = word.toLowerCase()
    const shown = this.vue.items
      .filter(i => i.word.some(w => w.includes(word)))
      .map(i => i.id)
    this.vue.shown = new Set(shown)
  }

  sort(key) {
    const asc = this.temp.sortkey === key
      ? !this.temp.asc
      : true
    console.log(key, asc)
    this._sort(key, asc)
    this.reload()
  }

  search(word) {
    this._search(word)
    this.reload()
  }
}

const app = window.app = new App()
