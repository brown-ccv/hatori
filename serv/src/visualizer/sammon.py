"""
Sammon's Mapping
"""

# author: Poom Chiarawongse <eight1911@gmail.com>
# license: whatever

import warnings

from sklearn.base import BaseEstimator
from sklearn.metrics import euclidean_distances
from sklearn.utils import check_random_state, check_array, check_symmetric

import numpy as np
from scipy.stats.mstats import gmean

class Sammon(BaseEstimator):
    """Sammon Mapping

    Read more in the :ref:`User Guide <sammon_mapping>`.

    Parameters
    ----------
    n_components : int, optional, default: 2
        Number of dimensions in which to immerse the dissimilarities.

    l_rate : float, optional, default: 0.8
        The learning rate of Newton's gradient descent.

    decay : float, optional, default: 0.005
        The learning rate decay of Newton's gradient descent.


    base_rate : float, optional, default: 0.1
        The base learning rate. The learning rate will never drop below this.

    max_iter : int, optional, default: 300
        Maximum number of iterations of newton-raphson gradient descent.

    sensitivity : float, optional, default: 1e-5
        For converting zero entries when dividing.

    verbose : int, optional, default: 0
        Level of verbosity.

    eps : float, optional, default: 1e-3
        Relative tolerance with respect to stress at which to declare
        convergence.


    random_state : int, RandomState instance or None, optional, default: None
        The generator used to initialize the centers.  If int, random_state is
        the seed used by the random number generator; If RandomState instance,
        random_state is the random number generator; If None, the random number
        generator is the RandomState instance used by `np.random`.

    dissimilarity : 'euclidean' | 'precomputed', optional, default: 'euclidean'
        Dissimilarity measure to use:

        - 'euclidean':
            Pairwise Euclidean distances between points in the dataset.

        - 'precomputed':
            Pre-computed dissimilarities are passed directly to ``fit`` and
            ``fit_transform``.

    Attributes
    ----------
    embedding_ : array-like, shape (n_components, n_samples)
        Stores the position of the dataset in the embedding space.

    stress_ : float
        The final value of the stress (sum of squared distance of the
        disparities and the distances for all constrained points).


    Reference
    ---------
    Sammon J.W. (1969) A non-linear mapping for data structure analysis.
    IEEE Transactions on Computers, 18, 401-409. pdf

    """

    def __init__(self, n_components=2, max_iter=1500, l_rate=0.6, decay=0.0025,
                 base_rate=0.1, verbose=0, eps=1e-9, random_state=None,
                 sensitivity=1e-5, dissimilarity="euclidean"):
        self.n_components = n_components
        self.random_state = random_state
        self.dissimilarity = dissimilarity
        self.sensitivity = sensitivity
        self.max_iter = max_iter
        self.verbose = verbose
        self.base_rate = base_rate
        self.l_rate = l_rate
        self.decay = decay
        self.eps = eps

    @property
    def _pairwise(self):
        return self.kernel == "precomputed"

    def fit(self, X, y=None, init=None):
        """
        Computes the position of the points in the embedding space

        Parameters
        ----------
        X : array, shape (n_samples, n_features) or (n_samples, n_samples)
            Input data. If ``dissimilarity=='precomputed'``, the input should
            be the dissimilarity matrix.

        y: Ignored

        init : ndarray, shape (n_samples,), optional, default: None
            Starting configuration of the embedding.
        """
        self.fit_transform(X, init=init)
        return self

    def fit_transform(self, X, y=None, init=None):
        """
        Fit the data from X, and returns the embedded coordinates

        Parameters
        ----------
        X : array, shape (n_samples, n_features) or (n_samples, n_samples)
            Input data. If ``dissimilarity=='precomputed'``, the input should
            be the dissimilarity matrix.

        y: Ignored

        init : ndarray, shape (n_samples,), optional, default: None
            Starting configuration of the embedding.
        """
        X = check_array(X)
        if X.shape[0] == X.shape[1] and self.dissimilarity != "precomputed":
            warnings.warn("The Sammon API has changed. ``fit`` "
                          "now constructs a dissimilarity matrix from data. "
                          "To use a custom dissimilarity matrix, set "
                          "``dissimilarity='precomputed'``.")

        if self.dissimilarity == "precomputed":
            self.dissimilarity_matrix_ = X
        elif self.dissimilarity == "euclidean":
            self.dissimilarity_matrix_ = euclidean_distances(X)
        else:
            raise ValueError("Proximity must be 'precomputed' or 'euclidean'."
                             " Got %s instead" % str(self.dissimilarity))

        self.embedding_, self.stress_, self.n_iter_ = sammon(
            self.dissimilarity_matrix_,
            self.n_components,
            sensitivity=self.sensitivity,
            random_state=self.random_state,
            base_rate=self.base_rate,
            max_iter=self.max_iter,
            verbose=self.verbose,
            l_rate=self.l_rate,
            decay=self.decay,
            eps=self.eps,
            init=init)

        return self.embedding_


def sammon(dissimilarity_matrix, n_components,
           init, l_rate, decay, base_rate,
           max_iter, verbose, eps, sensitivity, random_state):
    dissimilarity_matrix = check_array(dissimilarity_matrix)
    dissimilarity_matrix = check_symmetric(
        dissimilarity_matrix, raise_exception=True)
    random_state = check_random_state(random_state)
    n_samples = dissimilarity_matrix.shape[0]

    if init is None:
        # Randomly choose initial configuration
        X = random_state.rand(n_samples * n_components)
        X = X.reshape((n_samples, n_components))
        X -= np.mean(X, axis=0)
        X *= np.mean(dissimilarity_matrix)
    else:
        n_components = init.shape[1]
        if n_samples != init.shape[0]:
            raise ValueError("init matrix should be of shape (%d, %d)" %
                             (n_samples, n_components))
        X = init

    if hasattr(init, '__array__'):
        init = np.asarray(init).copy()

    pos, stress, n_iter_ = _sammon(
        dissimilarity_matrix,
        X,
        sensitivity=sensitivity,
        random_state=random_state,
        max_iter=max_iter,
        base_rate=base_rate,
        verbose=verbose,
        l_rate=l_rate,
        decay=decay,
        eps=eps)

    return pos, stress, n_iter_


def _sammon(dissimilarity_matrix, init, l_rate, decay, base_rate,
            max_iter, verbose, eps, sensitivity, random_state):
    """
    Computes Sammon's mapping by alternating between first and second
    order gradient descent methods to ensure good convergence.
    """

    n_samples, n_components = init.shape

    if n_samples == 1:
        return init - np.sum(init, axis=0) / len(init), 0.0, 0.0

    points = init[:]
    dissimilarity_matrix = np.maximum(dissimilarity_matrix, sensitivity)
    total_sum = dissimilarity_matrix.sum()
    total_delta = eps * 2
    for n_iter in range(max_iter):

        lo_dists = euclidean_distances(points)
        lo_dists = np.maximum(lo_dists, sensitivity)
        prod = dissimilarity_matrix * lo_dists
        diff = dissimilarity_matrix - lo_dists
        ratio = diff / prod

        l_rate *= 1 - decay
        true_rate = l_rate + base_rate

        # randomize coordinate order
        samples = np.argsort(random_state.rand(n_samples))

        # alternate between second order and first order method
        # to ensure good convergence
        if n_iter // 50 % 2 == 0:
            for a in samples:
                coord_diff = (points - points[a]).T
                prime = (ratio[a] * coord_diff).sum(axis=1)

                left = (coord_diff * coord_diff) / lo_dists[a]
                right = 1.0 + diff[a] / lo_dists[a]
                grad_prime = (diff[a] - right * left) / prod[a]
                grad_prime = grad_prime.sum(axis=1)
                # checks to make sure that delta doesnt blow up
                padding = 0.1 * true_rate * np.sign(grad_prime)
                delta = prime / (padding + grad_prime)
                points[a] += true_rate * delta

            # add small randomness points to prevent
            # getting stuck in local minima
            if n_iter < max_iter * 0.75:
                random_element = random_state.rand(n_samples)
                random_element = random_element ** (0.04 * l_rate)
                random_element /= gmean(random_element)
                points = (points.T * random_element.T).T
        else:
            for a in samples:
                coord_diff = (points - points[a]).T
                prime = (ratio[a] * coord_diff).sum(axis=1)
                points[a] -= true_rate * prime / total_sum * 4

        total_diff = np.sqrt((prime*prime).sum() / n_samples)
        total_delta *= 0.99
        total_delta = max(total_delta, total_diff / total_sum)

        if total_delta < eps:
            break

        stress = (diff * diff).sum() * 100
        if verbose and (n_iter * verbose) % 50 == 0:
            print("iteration", n_iter,
                  "with stress", stress / total_sum,
                  "and delta", total_delta)

    return points, stress, n_iter
