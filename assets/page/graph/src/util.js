

class Searcher {

  constructor(keys, depth=2) {

    function makedict(keys) {
      const dict = {}
      for (const word of keys) {
        const prefix = word.slice(0, depth)
        prefix in dict
          ? dict[prefix].push(word)
          : dict[prefix] = [word]
      }
      return dict
    }

    function main(self, keys) {
      self.keys = keys
      self.dict = makedict(keys)
      self.depth = depth
    }

    main(this, keys)
  }

  lookup(word) {
    const depth = this.depth
    const len = word.length
    if (word.length < depth)
      throw "word shorter than searcher's depth"
    const hits = this.dict[word.slice(0, depth)] || []
    return word.length === depth
      ? hits
      : hits.filter(w => w.slice(0, len) === word)
  }

}

// amortized constant time queues
// using two stacks
class Queue {

  constructor() {
    this.popper = []
    this.pusher = []
  }

  push(item) {
    this.pusher.push(item)
  }

  pop(item) {
    if (this.empty())
      return undefined
    if (!this.popper.length) {
      const popper = this.popper
      const pusher = this.pusher
      pusher.reverse()
      this.popper = pusher
      this.pusher = popper
    }
    return this.popper.pop()
  }

  peek() {
    const poplen = this.popper.length
    return poplen
      ? this.popper[poplen - 1]
      : this.pusher[0]
  }

  empty() {
    return !(this.popper.length
           + this.pusher.length)
  }

}

function parse(query="") {
  return query
    .split("&")
    .map(str => str.split("[]="))
    .map(([_, val]) => val)
}

function encode(list) {
  return list
    .map(w => `words[]=${w}`)
    .join("&")
}



module.exports = { Searcher, Queue, parse, encode }


