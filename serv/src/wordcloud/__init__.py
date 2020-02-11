import math
from wordcloud import WordCloud


def generate(freq, path, dark=0.5):
    light = 1 - dark
    def scale(m, M): return int((M - m) * light + m)
    scaled_freq = {word: math.log(2 + freq[word]) for word in freq}
    r = scale(70, 130)
    g = scale(130, 220)
    b = scale(150, 255)
    wordcloud = WordCloud(
        width=1000,
        height=1000,
        stopwords={},
        background_color=None,
        relative_scaling=1.0,
        color_func=lambda *kwds, **args: (r, g, b, 255),
        min_font_size=50,
        normalize_plurals=False,
        mode="RGBA"
    ).generate_from_frequencies(scaled_freq)
    image = wordcloud.to_image()
    image.save(path)
