setup:
	npm install

serve:
	forever -e error.log -o output.log .

test: 
	make serve
	make runtest && make unserve || make unserve

runtest: 
	node_modules/.bin/mocha
	
# extrem naiver Test ob die Tests stabil sind - also ob die Tests immer das gleiche Ergebnis liefern
test-stable:
	make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && make runtest > test-stable-log && rm test-stable-log && echo stable || cat test-stable-log

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
	-rm -r release/*
	-rm -r App/source-cov

log: 
	git log --format="%ad %s" --date=short

.PHONY: test
