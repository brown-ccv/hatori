import os
import json
import flask
import flask_cors
import src

src.g.save("data/", "../assets/json/")
app = flask.Flask(__name__)
cor = flask_cors.CORS(app)


@app.route("/")
def main():
    # limit = flask.request.args.get("limit",)
    zval = flask.request.args.get("z", 0)
    args = flask.request.args.get("topic_ids")
    if args is None:
        ids = []
    else:
        ids = sorted(set(int(i) for i in args.split(",")))
    data = src.g.topics(ids, float(zval))
    return json.dumps(data)


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
