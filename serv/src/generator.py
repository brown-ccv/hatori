import os
import heapq
import numpy as np

import src.wordcloud as wordcloud
import src.visualizer as viz
import src.util


# non text assets:
#   front page - time graph
#   home page  - time graph
#   home page  - wordcloud

class Visualizer:

    def __init__(self, data, basepath):
        self.data = data
        self.basepath = basepath

    def join(self, path):
        return os.path.join(self.basepath, path)

    def wordcloud(self, path):
        path  = os.path.join(self.basepath, path)
        twdict = self.data.counts.topic.word
        tsums = self.data.sums.topic
        sorts = sorted([(tsums[i],i) for i in tsums])
        for ind, (_, i) in enumerate(reversed(sorts)):
            print("generating image number", ind, flush=True)
            subpath = f"{path}{i}.png"
            wordcloud.generate(twdict[i], subpath, ind/len(tsums))

    def front(self, path="front/"):
        import matplotlib
        matplotlib.use("TkAgg")
        import matplotlib.pyplot as plt

        def makeplaceholder(self, path):
            x, y = [0, 1], [0, 0]
            src.util.makepath(f"{self.join(path)}")
            name = os.path.join(self.basepath, path, 'placeholder.png')
            plt.plot(x, y, linewidth=3, color="lightblue")
            plt.tight_layout()
            plt.yticks([])
            plt.xticks([])
            plt.axis("off")
            plt.savefig(name,
                transparent=True,
                dpi=100,
                bbox_inches='tight',
                pad_inches=0)
            plt.close()


        def makeplots(self, path):
            tydict = self.data.counts.topic.year
            ysums = self.data.sums.year
            directory = os.path.join(self.basepath, path)
            src.util.makepath(directory)
            for t in sorted(self.data.sums.topic):
                print("plotting topic number", t, flush=True)
                name = os.path.join(directory, f"graph-{t}.png")
                data = tydict[t]
                items = [(y, c / ysums[y]) 
                    for y, c in data.items() 
                    if y is not None]
                x, y = zip(*sorted(items))
                plt.plot(x, y, linewidth=3, color="lightblue")
                plt.tight_layout()
                plt.yticks([])
                plt.xticks([])
                plt.axis("off")
                plt.savefig(
                    name,
                    transparent=True,
                    dpi=100,
                    bbox_inches='tight',
                    pad_inches=0)
                plt.close()

        def main(self, path):
            makeplots(self, path)
            makeplaceholder(self, path)

        return main(self, path)

    def make(front_path="front/", cloud_path="cloud/"):
        visualizer.front(front_path)
        visualizer.wordcloud(cloud_path)


class Generator:

    def __init__(self, data):
        self.data = data
        self.n_docs = 100

    def save(self, path, asset_path):
        ds = self.data.sums
        shared = {
            "ysums" : ds.year,
            "ids"   : sorted(ds.topic),
            "total" : sum(ds.topic.values()),
        }

        data = {
            "embed"  : self.viz(),
            "graph"  : self.graph(),
            "front"  : self.front(),
            "shared" : shared
        }

        for k, v in data.items():
            src.util.writejson(asset_path, f"{k}.json", v)
        return src.util.writejson(path, "data.json", data)

    def front(self, path="front/"):

        # weighted proportions
        def mean(ycount, sums):
            exp = 0
            total = 0
            for year, count in ycount.items():
                if year is None: continue
                prop = (count / sums[year]) 
                total += prop
                exp += year * prop
            return exp / total

        def main(self):
            d = self.data
            return [{
                "id"   : t,
                "prop" : d.sums.topic[t],
                "word" : d.sorts.topic.word[t][:16],
                "mean" : mean(d.counts.topic.year[t], d.sums.year)
            } for t in sorted(d.sums.topic)]

        return main(self)

    # this is the word graphs
    def graph(self, path="graph/"):
        years = sorted([y
            for y in self.data.sums.year
            if y is not None])
        load = lambda d: [d.get(y, 0) for y in years]
        wydict = self.data.counts.word.year
        return {
            "year" : years,
            "word" : {word:load(d) for word, d in wydict.items()},
            "sums" : [self.data.sums.year[y] for y in years]
        }

    def viz(self, newdist=False):

        def tolist(keys, freqs, data):
            data = data.astype(float)
            return [[k, f, *v] for k, f, v in zip(keys, freqs, data)]

        keys = sorted(self.data.sums.topic)
        freqs = np.array([self.data.sums.topic[i] for i in keys])
        freqs = freqs / np.mean(freqs)
        if newdist:
            words   = sorted(self.data.sums.word)
            metric  = "jensenshannon"
            twcount = self.data.counts.topic.word
            data    = {key : [dist.get(word, 0) for word in words]
                               for key, dist in twcount.items()}
            data = [data[item] for item in sorted(data)]
            self.visualizer = viz.Visualizer(data, metric, make=True)
        else:
            self.visualizer = viz.Visualizer(make=False)

        return {
            "sammon" : tolist(keys, freqs, self.visualizer.sammon()),
            "tsne"   : tolist(keys, freqs, self.visualizer.tsne()),
            "mds"    : tolist(keys, freqs, self.visualizer.mds())
        }


    def topics(self, topic_ids):

        # wilson score lower bound
        # of confidence interval
        def value(v, n):
            # if v < 100:
            #     return 0
            # else:
            #     return v/n
            z = 100
            p = v/n
            l = p + z*z/2/n
            r = z*np.sqrt((p*(1-p) + z*z/4/n)/n)
            return (l - r) / (1 + z*z/n)
            # return v/n

        def sortdoc(self, counts):
            sorts  = []
            lim    = range(self.n_docs)
            tokens = self.data.sums.doc
            stream = counts.items()
            for _, (k, v) in zip(lim, stream):
                val = value(v, tokens[k])
                heapq.heappush(sorts, (val, k))
            for k, v in stream:
                val = value(v, tokens[k])
                # this is a little weird
                # but it's faster for
                # smaller n and len(topic_ids)
                if val < sorts[0][0]:
                    continue
                heapq.heappop(sorts)
                heapq.heappush(sorts, (val, k))
            sorts.sort(reverse=True)
            return (k for _, k in sorts)

        def loaddoc(self, topic_ids):
            dct = self.data.counts.topic
            ddict = src.util.merge_sum(dct.doc, topic_ids)
            doclist = self.data.doclist
            output = []
            for d in sortdoc(self, ddict):
                name, year, date = doclist[d]
                output.append({
                    "name"  : name,
                    "date"  : date,
                    "year"  : year,
                    "token" : self.data.sums.doc[d],
                    "count" : ddict[d]
                })
            return output

        def main(self, topic_ids,):
            dct = self.data.counts.topic
            dst = self.data.sums.topic
            years = sorted(y
                for y in self.data.sums.year
                if y is not None)
            tw = src.util.merge_sum(dct.word, topic_ids)
            ty = src.util.merge_sum(dct.year, topic_ids)
            ct = sum(dst[t] for t in topic_ids)
            tw = [(k,v) for k,v in tw.items() if v/ct > 0.0005]
            return {
                "id"    : topic_ids,
                "doc"   : loaddoc(self, topic_ids),
                "word"  : sorted(tw, key=lambda p: -p[1]),
                "year"  : [ty.get(y, 0) for y in years],
                "count" : sum(dst[t] for t in topic_ids)
            }

        return main(self, topic_ids)
