
import pickle
import numpy as np
import scipy as sp
import scipy.stats as st
import scipy.spatial.distance as distance
import sklearn.manifold as manifold


import src.visualizer.sammon


class Visualizer:

    def __init__(self, points=[], metric="jensenshannon", make=False):
        self.points = points
        self.metric = metric

        if make:
            print("computing pairwise distance")
            condensed = distance.pdist(points, metric)
            self.pdist = distance.squareform(condensed)
            with open("data/dist.p", "wb") as f:
                pickle.dump(self.pdist, f)
        else:
            print("loading pairwise distance")
            with open("data/dist.p", "rb") as f:
                self.pdist = pickle.load(f)

    def tsne(self):
        trainer = manifold.TSNE(
            n_components=2,
            # perplexity=40.0,
            # learning_rate=1,
            verbose=2,
            n_iter=100000,
            n_iter_without_progress=1500,
            metric='precomputed')
        return trainer.fit_transform(self.pdist)

    def mds(self):
        n = self.pdist.shape[0]
        minimum = min(self.pdist[i, j]
                      for i in range(n)
                      for j in range(i)) * 0.5
        dist = (self.pdist - minimum) ** 3
        trainer = manifold.MDS(2, verbose=1, dissimilarity='precomputed')
        return trainer.fit_transform(dist)

    def sammon(self):
        n = self.pdist.shape[0]
        minimum = min(self.pdist[i, j]
                      for i in range(n)
                      for j in range(i)) * 0.5
        trainer = src.visualizer.sammon.Sammon(
            2, verbose=1, dissimilarity='precomputed')
        dist = (self.pdist - minimum) ** 3
        return trainer.fit_transform(dist)
