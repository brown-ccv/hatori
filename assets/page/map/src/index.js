
import Navigo from 'navigo'
import Vue from 'vue'

class App {

  constructor() {

    function loadapp(self) {

      const keys = Object.keys(self.data).sort().reverse()
      const tmpl = Vue.compile(require('../tmpl/map.vue'))
      const dummy = Object.keys(self.data[keys[0]])[0]
      const data = {
        keys : keys,
        curr : 0,
        app  : self,
        currname : dummy
      }

      const computed = {
        data      : () => self.data[keys[data.curr]]
      }


      const options = {
        el              : '#mainapp',
        data            : data,
        computed        : computed,
        render          : tmpl.render,
        staticRenderFns : tmpl.staticRenderFns,
      }
      console.log(keys)

      return new Vue(options)
    }

    function loadrouter(self, hash) {
      const router = new Navigo('./topic/', true, hash)
      // router
      //  .on('topic', () => router.navigate(first))
      // setTimeout(() => router.resolve(), 0)
      return router
    }

    function preprocess(raw) {
      const data = {}
      for (const [method, values] of Object.entries(raw)) {
        const x = values.map(([n, f, x, y]) => x)
        const y = values.map(([n, f, x, y]) => y)
        const max_x = Math.max(...x)
        const max_y = Math.max(...y)
        const min_x = Math.min(...x)
        const min_y = Math.min(...y)
        const s = Math.max(max_y - min_y, max_x - min_x)
        const my = min_y / s
        const mx = min_x / s
        data[method] = values.map(([n, f, x, y]) => [n, f, x/s - mx, y/s - my])
      }

      return data
    }

    function main(self) {
      self.raw = require('../../../json/embed.json')
      self.data = preprocess(self.raw)
      console.log(self.data)
      self.vue = loadapp(self)
      self.hash = "#!"
      self.router = loadrouter(self, self.hash)
    }

    return main(this)

  }

  change(index) {
    this.vue.curr = index
  }

  setimg(name) {
    this.vue.currname = name
  }

}

const app = new App()