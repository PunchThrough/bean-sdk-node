# Bean FW Updater

Stand alone tool for updating Bean FW on desktop platforms

## Development Environment

Install and use Node 4.2.1:

```bash
$ nvm install 4.2.1
$ nvm use 4.2.1
```

App dependencies:

```
$ npm install -g electron-prebuilt
$ npm install
```


## Running

```
webpack src/frontend/webpack-entry.js src/frontend/bundle.js
electron .
```
