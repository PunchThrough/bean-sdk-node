# Bean FW Updater

Stand alone tool for updating Bean FW on desktop platforms

## Development Environment

Install and use Node 0.12.7

```bash
$ nvm install 0.12.7
$ nvm use 0.12.7
```

Build app dependencies:

```bash
$ npm install
```

Build native dependencies against Electrons headers:

```bash
./node_modules/.bin/electron-rebuild
```

__Note:__ This step should be done each time you run `npm install` for _certain_ dependencies...like `noble`...i think?  Not too sure.


## Running

```bash
$ npm run dev
```


## Knowledge Base

* https://github.com/atom/electron/issues/1611
* Electron __Main Procs__ and __Render Procs__ communicate through electrons `ipc` module.
* Reliability issues:
    * Over time the scan results return fewer and fewer devices
    * Can't connect to any device
