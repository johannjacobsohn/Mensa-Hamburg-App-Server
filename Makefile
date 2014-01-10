setup:
	-apt-get update && apt-get install poppler-utils
	npm install -g forever
	npm install

start:
	NODE_ENV=production forever -e logs/error.log -o logs/output.log -l forever.log -a start .

start-dev:
	forever -w -e ./logs/error.log -o ./logs/output.log -l forever.log -a start .

stop:
	forever stop `pwd`

restart: stop start

test:
	node_modules/.bin/mocha -R spec

lint:
	node_modules/.bin/jshint .

check-coverage:
	node_modules/.bin/istanbul check-coverage --statement -26 --branch -24 --function 90

coverage:
	node_modules/.bin/istanbul cover node_modules/mocha/bin/_mocha

clean:
	-rm -r coverage
	-rm -r node_modules

deploy: clean setup test
	# deploy files
	rsync -rb index.js source package.json Makefile root@menu.mensaapp.org:mensaapp-server
	# restart app
	ssh root@menu.mensaapp.org "cd mensaapp-server && make setup && make restart"

travis:
	make setup
	make lint
	make test
	make check-coverage

log:
	git log --format="%ad %s" --date=short

.PHONY: test coverage
