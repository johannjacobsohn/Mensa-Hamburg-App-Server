Server for Mensa Hamburg App
============================

This is the backend server for the Mensa Hamburg App Project.

[![Dependency Status](https://gemnasium.com/johannjacobsohn/Mensa-Hamburg-App-Server.png)](https://gemnasium.com/johannjacobsohn/Mensa-Hamburg-App-Server)
[![Build Status](https://travis-ci.org/johannjacobsohn/Mensa-Hamburg-App.png?branch=master)](https://travis-ci.org/johannjacobsohn/Mensa-Hamburg-App)

Technical overview:
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
- write monitoring tests
