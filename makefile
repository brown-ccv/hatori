
default: 
	source ~/lucie/bin/activate && cd serv && python __init__.py

clean:
	find . -type f -name '*.py[co]' -delete -o -type d -name __pycache__ -delete
