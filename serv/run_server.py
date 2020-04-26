import os
import json
import flask
import flask_cors
import pickle
import src.generator

DEBUG = False

if __name__ == "__main__":
    with open("data/data.p", "rb") as f:
        data = pickle.load(f)
    
    generator = src.generator.Generator(data)
    app = flask.Flask(__name__)
    cor = flask_cors.CORS(app)

    @app.route("/")
    def main():
        zval = flask.request.args.get("z", 0)
        args = flask.request.args.get("topic_ids")
        if args is None:
            ids = []
        else:
            ids = sorted(set(int(i) for i in args.split(",")))
        data = generator.topics(ids, float(zval))
        return json.dumps(data)


    port = int(os.environ.get('PORT', 5000))
    app.run(debug=DEBUG, host="0.0.0.0", port=port)
