Server for Mensa Hamburg App
============================

This is the backend server for the Mensa Hamburg App Project.


Overview: 
---------

````
    index.js
       |
    source/server.js        - content negotiation
       |
    source/get.js           - get requested content, decide to retrieve from web or database
       |    \
      db     source/retriever.js  - load page
              \
               source/parser.js   - parse date
````

TODO:
--
- Document
- clean up
- high level Documentation
✓ change storage to retrieve all mensen in one single request
- write extensive tests
- write monitoring tests
x use standard modifiedSince header and stuff
✓ compress output: no version, no id, no whitespace, no weekno
