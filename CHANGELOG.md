# 0.6.2

### New `bean-arduino-core` 2.0.3

* Fix: incorrect version number when selecting board/programmer in Arduino
* Fix: acceleration range issue

### New Bean and Bean+ Firmware (201704060000)

* Fix: iBeacon issue

---

# 0.6.1

### New `bean-arduino-core` 2.0.2

* Fixes missing header files due to submodule issue.

---

# 0.6.0

### Features

* New CLI command `write_scratch`: Writes to a scratch characteristic.
* New CLI command `read_scratch`: Reads from a scratch characteristic.
* Update CLI command `scan`: Adds `--all` option to remove all filters from scan results (more than just Bean's will appear in scan results).
* New CLI command `list_gatt`: Lists all BLE services and characteristics.

### Improvements

* Detect the presence of a USB dongle, and provide better error message if missing.
* Handle Bean rotating advertisement packets. Improves stability/connectivity with Beans running certain sketches (HID, MIDI, ANCS).

### Fixes

* Don't stack-trace when reading from null characteristic, provide better error message.

### New Bean and Bean+ Firmware (201611070000)

* Fix: Eliminates even more cases of sketch upload failures.
* Fix: Fixes to make using the Bean/Bean+ with pairing more stable. Resolves certain connect/disconnect failures in OSX loader.
* Fix: Bean.getAdvertisingState() now returns correct state.
* Fix: Removes 16 byte limit for observer data

### New `bean-arduino-core` 2.0.1

* New macro `#IS_BEAN` - `0` for Bean+ and `1` for Bean
* Fixed typo `ObserverAdvertisementInfo`

---

# 0.5.3

### Fixes

* Fix typo in CLI when "Quitting gracefully"
* Fixed CLI command `log_serial`: No more erroneous newlines.
* Fixed CLI command `send_serial`: Fix race condition, now works on Windows/Linux.

---

# 0.5.2

### Features

* Updated CLI command `program_firmware`: Added `--force` option

### New Bean and Bean+ Firmware (201609290000)

* Fix: Sketch upload failures due to sketches sending a lot of serial data
* Fix: `Bean.setLed()` now works fr om `setup()`

---

# 0.5.0

**Note:** This version requires CLI users to re-run `install_bean_arduino_core` command!

### Features

* Updated CLI command `list_compiled_sketches`: Groups sketches by board variant (Bean/Bean+)
* Updated CLI command `list_compiled_sketches`: Added `--clean` argument to delete compiled sketches
* Updated CLI `program_sketch`: Uses hardware revision to pick correct sketch
* Updated CLI `program_sketch`: Allows direct hex file upload given a path
* All CLI commands now "quit gracefully"
* Ctrl+c now "quits gracefully"

---

# 0.4.0

### Features

* Arduino `post_compile` script now supports Python 2 and 3
* Updated CLI command `read_device_info`: Removed "Software Version" from output b/c it's not used by firmware.

### Bug Fixes

* Fixed CLI command: `blink_led` now works on Windows/Linux.
* Fixed CLI command: `rename` now works on Windows/Linux.
* Fixed CLI command `read_device_info`: Now shows correct sketch name.

---

# 0.3.1

### Bug Fixes

* Fix user input being printed to stdout twice when prompting for user input.

---

# 0.3.0

### Features

* New CLI Command `rename`: Allows Bean renaming.
* Updated CLI Command `read_device_info`: Now shows **battery voltage** and **current sketch**.
* Updated CLI Command `program_sketch`: New `--oops` option which prompts users before starting sketch upload process. This will aid users who have accidentally "bricked" their beans with a malicious sketch.

---

# 0.2.0

### Features

* New CLI Command `log_serial`: Logs any serial data from Bean.
* New CLI Command `send_serial`: Allows users to send ascii or binary data to the Bean.

---

# 0.1.0

Initial public release.
