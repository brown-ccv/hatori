
import pickle

from src.util import setproperty, DictObject

DELIMITER = "\t"
SPACE = " "

class TextData:

    __slots__ = [
        "_doclist",
        "_statelist",
        "_counts",
        "_sorts",
        "_sums",

        "large",
        "namestate",
        "namedocs",
    ]

    def __init__(self, namestate, namedocs):
        self.namestate = namestate
        self.namedocs = namedocs
        self.large = False

    def docstream(self):
        """
        returns an iterator over a list of document metadata
        i.e., each iteration returns

            (name, date and year, num_tokens)

        """
        if hasattr(self, "_doclist"):
            return iter(self._doclist)
        docs = open(self.namedocs)
        for line in docs:
            splitted = line.split(DELIMITER)
            if len(splitted) != 3:
                yield (None, None, None)
                continue
            name, year, text = splitted
            index = name.rfind(SPACE)
            year = round(float(year))
            name, date = name[:index], name[index+1:]
            yield name, year, date#, text.count(SPACE) + 1
        docs.close()

    @setproperty
    def doclist(self):
        """
        returns a list of a tuples of document metadata
            
            (name, date and year, num_tokens)

        """
        return [*self.docstream()]

    def statestream(self):
        "return a streaming iterator over the states"
        if hasattr(self, "_statelist"):
            return iter(self._statelist)
        state = open(self.namestate)
        next(state), next(state), next(state)  # keys, alphas, betas
        for iteration, line in enumerate(state):
            doc, _, _, _, word, topic = line.split(SPACE)
            if word.lower() == "williewaiola":
                word = "substitute_word"
            doc, topic = int(doc), int(topic)
            yield doc, topic, word
        state.close()

    @setproperty
    def statelist(self):
        if not self.large:
            raise ValueError("TextData.large must be set to true.")
        return [*self.docstream()]

    @setproperty
    def yearrange(self):
        """
        get (start year, end year) of documents in the data
        """
        lo_range = min(year for _, year, _ in self.doclist)
        hi_range = max(year for _, year, _ in self.doclist)
        return (lo_range, hi_range + 1)

    @setproperty
    def numtopics(self):
        return max(topic for _, topic, _ in self.statestream())

    @setproperty
    def counts(self):

        def addcount(dictionary, key, value):
            if key not in dictionary:
                dictionary[key] = {}
            d_key = dictionary[key]
            if value in d_key:
                d_key[value] += 1
            else:
                d_key[value] = 1

        def main(self):
            message = "counting relations at word"
            yt, ty = {}, {}
            wy, yw = {}, {}
            tw, wt = {}, {}
            dt, td = {}, {}
            doclist = self.doclist
            stream = enumerate(self.statestream())
            for i, (doc, topic, word) in stream:
                if i % 500000 == 0:
                    print(message, i, flush=True)
                _, year, _ = doclist[doc]
                addcount(yt, year, topic)
                addcount(ty, topic, year)
                addcount(tw, topic, word)
                addcount(wt, word, topic)
                addcount(dt, doc, topic)
                addcount(td, topic, doc)
                addcount(yw, year, word)
                addcount(wy, word, year)
            return DictObject({
                "doc"  : DictObject({ "topic" : dt }),
                "year" : DictObject({ "topic" : yt, "word" : yw }),
                "word" : DictObject({ "topic" : wt, "year" : wy }),
                "topic": DictObject({
                    "year" : ty,
                    "word" : tw,
                    "doc"  : td
                }),
            })

        return main(self)

    @setproperty
    def sorts(self):
        "returns a dictionary of items sorted by importance"

        def counter(dictionary):
            return {
                key : sorted(dictvals, key=lambda k: -dictvals[k])
                for key, dictvals in dictionary.items()
            }

        def main(self):
            tw = counter(self.counts.topic.word)
            wt = counter(self.counts.word.topic)
            yt = counter(self.counts.year.topic)
            ty = counter(self.counts.topic.year)
            wy = counter(self.counts.word.year)
            yw = counter(self.counts.year.word)
            td = counter(self.counts.topic.doc)
            dt = counter(self.counts.doc.topic)
            return DictObject({
                "doc"  : DictObject({ "topic" : dt }),
                "year" : DictObject({ "topic" : yt, "word" : yw }),
                "word" : DictObject({ "topic" : wt, "year" : wy }),
                "topic": DictObject({
                    "year" : ty,
                    "word" : tw,
                    "doc"  : td
                }),
            })

        return main(self)

    @setproperty
    def sums(self):

        def counter(dictionary):
            return {
                key : sum(dictvals.values())
                for key, dictvals in dictionary.items()
            }

        return DictObject({
            "doc"   : counter(self.counts.doc.topic),
            "word"  : counter(self.counts.word.year),
            "year"  : counter(self.counts.year.topic),
            "topic" : counter(self.counts.topic.year),
        })

    def save(self, name):
        "save object into file named 'name'"
        with open(name, "wb") as f:
            pickle.dump(self, f)
