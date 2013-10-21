setup:
	apt-get update && apt-get install poppler-utils
	npm install

start:
	forever -e logs/error.log -o logs/output.log -l logs/forever.log -a start .

stop:
	forever stop `pwd`

restart: stop start

test: 
	node_modules/.bin/mocha -R spec

lint: 
	node_modules/.bin/jshint .

coverage: mk-cov test-cov clean

mk-cov:
	@jscoverage App/source App/source-cov \
		--no-instrument=package.js \
		--no-instrument=Bookmarks/package.js \
		--no-instrument=Catalog/package.js \
		--no-instrument=CatalogItem/package.js \
		--no-instrument=Contact/package.js \
		--no-instrument=Content/package.js \
		--no-instrument=custom/package.js \
		--no-instrument=conf \
		--no-instrument=Header/package.js \
		--no-instrument=Index/package.js \
		--no-instrument=Page/package.js \
		--no-instrument=Search/package.js \
		--no-instrument=Shelf/package.js \
		--no-instrument=Sidebar/package.js \
		--no-instrument=Slide/package.js \
		--no-instrument=StaticView/package.js \
		--no-instrument=hotspots/package.js \
		--no-instrument=utils
		

test-cov:
	node_modules/.bin/mocha-phantomjs http://localhost:8765/App/test/coverage-runner.html -R json-cov | \
	grep -v enyo.kind | \
	node_modules/.bin/json2htmlcov > coverage.html

clean:
	-rm -r App/source-cov
	-rm -r node_modules

deploy: clean setup test
	# deploy files
	rsync -rb index.js source package.json Makefile root@menu.mensaapp.org:mensaapp-server
	# restart app
	ssh root@menu.mensaapp.org "cd mensaapp-server && make setup && make restart"

log: 
	git log --format="%ad %s" --date=short

.PHONY: test
