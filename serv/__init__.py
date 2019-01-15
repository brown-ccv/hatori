import os
import json
import flask
import flask_cors
import src

# src.g.save("data/", "../assets/json/")
app = flask.Flask(__name__)
cor = flask_cors.CORS(app)

@app.route("/")
def main():
	args = flask.request.args.get("topic_ids")
	if args is None:
		ids = []
	else:
		ids = sorted(set(int(i) for i in args.split(",")))
	return json.dumps(src.g.topics(ids))

if __name__ == "__main__":
	port = int(os.environ.get('PORT', 5000))
	app.run(debug=True, host="0.0.0.0", port=port)