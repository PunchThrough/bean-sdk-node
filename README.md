# Bean SDK for Node.js

Official cross-platform Bean SDK for Node.js.

**Supported platforms:**

* Mac OS X
* Windows
* Linux (Intel/AMD - Desktop)
* Linux (ARM - Raspberry Pi)

## Installation

1. Install [Node.js LTS or Current](https://nodejs.org/en/download/)

2. Verify NPM version 3+

    ```
    npm --version
    ```

    If the version is less than 3, update it:
    
    ```
    npm install npm -g
    ```

    **Note:** We've seen this fail on Windows, if so, delete this file and retry:
    
    ```
    C:\Users\<user>\AppData\Roaming\npm\node_modules\npm
    ```

3. Follow [platform specific install instructions](###Platform specific instructions)

4. Install `bean-sdk`

    ```
    npm install bean-sdk
    ```

### Platform specific instructions

#### Windows

Install all the required tools and configurations using Microsoft's build tools from an elevated PowerShell or CMD.exe (run as Administrator).

```
npm install --global --production windows-build-tools
```
