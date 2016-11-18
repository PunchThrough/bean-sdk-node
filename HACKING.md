# Developer Guide

This is a guide for developers of this project.


## Setup

Here is a brief overview of how to setup for this project:

* Use NVM to install correct Node.js version (currently 6.2.2)
* Use NPM to install dependencies
* Use WebStorm for development


### WebStorm

Make sure you do the following:

* Configure to use ECMAScript 6

    *Preferences > Languages & Frameworks > JavaScript > (Dropdown choose ECMA6)*

* Turn off unterminated line ending inspection

    *Preferences > Editor > Inspections > Code Style Issues > (Uncheck unterminated endings box)*

* Enable Node core libraries

    *Preferences > Languages & Frameworks > Node.js & NPM > (Enable node core libraries)*
     
* Configure the correct Node.js interpreter

    *Preferences > Languages & Frameworks > Node.js & NPM > (Dropdown choose NVM install)*


## Release Guide

*Before you begin:*

* Make sure you have an `npm` account.
* Make sure you have private and public remotes setup in git. Usually `origin` is private and `public` is public.

*Steps:*

1. Merge all feature branches to `master`
2. Update `CHANGELOG.md` for new version
3. Update version number in `package.json`
4. Make a new commit/PR containing changes from steps 2 and 3
5. Tag release: `git tag -a <version>`
6. Push to public and private repos: `git push origin master --tags && git push public master --tags`
6. Build app: `npm run build`
7. Login to npm: `npm login`
8. Publish: `npm publish`
