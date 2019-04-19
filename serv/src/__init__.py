import functools
import pickle
import heapq
import math

import numpy as np

import src.generator
import src.reader

read = False

def setseed():
    np.random.seed(0)
    random.seed(0)

if read:
    namestate = "../huge-data/debates/topic_state_500"
    namedocs  = "../huge-data/debates/mc-20170814-stemmed.txt"

    data = src.reader.TextData(namestate, namedocs)
    data.counts
    data.sorts
    data.sums
    data.save("data/data.p")

with open("data/data.p", "rb") as f:
    print("reading", flush=True)
    data = pickle.load(f)
    print("read", flush=True)

g = src.generator.Generator(data)
# v = src.generator.Visualizer(data, "../assets/")
# g.save("data/", "../assets/json/")

# v.front("front/")
# v.wordcloud("cloud/")