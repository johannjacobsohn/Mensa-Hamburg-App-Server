setup:
	-apt-get update && apt-get install poppler-utils daemontools daemontools-run
	npm install

start:
	svc -u /etc/service/mensa

stop:
	svc -k /etc/service/mensa

restart: stop start

test:
	node_modules/.bin/mocha -R spec

lint:
	node_modules/.bin/jshint .

check-coverage:
	npm test --check-coverage

coverage:
	npm test --coverage

coverall:
	node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

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
	make coverall

log:
	git log --format="%ad %s" --date=short

.PHONY: test coverage
