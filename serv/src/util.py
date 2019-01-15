import os
import numpy as np
import functools
import json

def setproperty(func):
    name = func.__name__
    newname = "_" + name

    @property
    @functools.wraps(func)
    def helper(self):
        if not hasattr(self, newname):
            setattr(self, newname, func(self))
        return getattr(self, newname)

    return helper


class DictObject:
    "convert dictionary to objects"

    # __slots__ = ["word", "year", "topic", "doc", "dictionary"]

    def __init__(self, dictionary):
        for key, value in dictionary.items():
            setattr(self, key, value)
        self.dictionary = dictionary


def makepath(path):
    if not os.path.exists(path):
        os.makedirs(path)


def writejson(path, name, data):
    makepath(path)
    full = os.path.join(path, name)
    with open(full, "w") as f:
        json.dump(data, f)
    return data


def tolist(item, mapper=lambda x: x):
    if hasattr(item, "__iter__"):
        return [tolist(i) for i in item]
    else:
        return mapper(item)


def merge_sum(values, keys):
    out = {}
    for i in keys:
        for k, v in values[i].items():
            out[k] = v + out.get(k, 0)
    return out
