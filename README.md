# Bean FW Updater

Stand alone tool for updating Bean FW on desktop platforms

![Bean Connected](./docs/img/screenshot-bean-connected.png)

## Development Environment

Install and use Node 0.12.7

```bash
nvm install 0.12.7
nvm use 0.12.7
```

Build app dependencies:

```bash
npm install
```

Build native dependencies against Electrons headers:

```bash
./node_modules/.bin/electron-rebuild
```

__Note:__ This step should be done each time you run `npm install` for _certain_ dependencies...like `noble`...i think?  Not too sure.

## Running the app

```bash
npm run dev
```

## Running examples

We will use `babel` directly to transpile (to es5) and run the example scripts directly.

Install `babel-cli` and the `es2015` preset.

```
npm install -g babel-cli
npm install babel-preset-es2015
```

Run an example:

```
babel-node examples/<my_example.js>
```

## Testing!

The unit test framework we are using is `Mocha` and all of the tests are under the default directory of `test/`.

Run the unit tests from command line:

```
npm run test
```

It is also possible to run the unit tests from WebStorm which can be very helpful as you can set breakpoints and walk through your code. To do this you need to setup a Mocha debug configuration, here is an example:

![alt text](./docs/img/mocha-webstorm-config.png)


## Build and Release

Currently we only focus on distributing the app as a binary to Windows. Linux and Mac can run from source for now. 

### Windows

On a Windows computer, do the following.

1. Install [MS Visual Studio 13 express](https://www.microsoft.com/en-gb/download/details.aspx?id=44914)
2. Install [Windows SDK for .NET Framework 4](https://www.microsoft.com/en-us/download/details.aspx?id=8279)
3. Run `npm config set msvs_version 2013 --global`
4. Run `gulp package-win` 

The built distribution can be found as a folder here `build/Bean-FW-Updater-win32-x64`.

TODO:

* Add a command line argument to the gulp task for versioning
* Zip the folder as final task OR wrap the entire dist in an installer

## Platform considerations and API

This projects main priority is building a FW updater that runs on Windows. However, there will be effort made to identify and implement pieces of the code that will be reusable for our long term goal of creating a X-Platform JS SDK. Ideally all of our GUI products (loader, LB explorer) will be consumers of the JS SDK and rewritten in Electron/React-Native.

### TODOs

* API to discover by device name or UUID

## Knowledge Base

* https://github.com/atom/electron/issues/1611
* Electron __Main Procs__ and __Render Procs__ communicate through electrons `ipc` module.
* Reliability issues:
    * Over time the scan results return fewer and fewer devices
    * Can't connect to any device
* Serializing everything over IPC is quite cumbersome ... we already have a really nice object model under `/lightblue` and it's a shame we can't use these objects directly in the frontend (React).  If we plan to use Electron long-term we should come up with a clever, generic way to serialize/de-serialze these objects automatically over the wire so that you can call methods directly and if the object is on the client then it knows to rpc over to the server if it needs to.
* It seems like `redux` is a superior solution to just `flux` ... let's use it in the future.


## Firmware Update Information

__Firmware update algorithm:__

1. Connect to Bean
2. Read firmware version
3. Infer latest firmware version from filename
4. If firmware version is up to date, disconnect and stop. Otherwise, continue
5. Load list of firmware files and sort alphabetically
6. Subscribe to notifications on OAD Identify and Block characteristics
7. Read first firmware file into memory and remove from list. If list of firmware is empty, the process has failed.
8. Skipping the first 4 bytes of the firmware file (crc0 and crc1), write 12 bytes of the firmware header to the OAD Identify characteristic
9. If a notification is received on the Identify characteristic, the firmware has been rejected. Return to step 7. If a notification is received on the Block characteristic, the device has accepted the firmware.
10. Transfer firmware (described later.)
11. Device will disconnect and reset. Return to step 1.

__Firmware transfer:__

* Firmware images are written to the OAD Block characteristic. The firmware sends a notification indicating the next block number it wants as 16-bit int. A notification for block number 0 indicates the firmware offered (via OAD Identify characteristic) has been accepted.
* Firmware is transferred in 16-byte blocks. Each block is preceded with a 2 byte block number.
* When the final block has been transferred, the device will verify the new image, disconnect, and reset.
