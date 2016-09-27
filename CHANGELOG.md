# v0.5.0

**Note:** This version requires CLI users to re-run `install_bean_arduino_core` command!

### Features

* Updated CLI command `list_compiled_sketches`: Groups sketches by board variant (Bean/Bean+)
* Updated CLI command `list_compiled_sketches`: Added `--clean` argument to delete compiled sketches
* Updated CLI `program_sketch`: Uses hardware revision to pick correct sketch
* Updated CLI `program_sketch`: Allows direct hex file upload given a path
* All CLI commands now "quit gracefully"
* Ctrl+c now "quits gracefully"

# v0.4.0

### Features

* Arduino `post_compile` script now supports Python 2 and 3
* Updated CLI command `read_device_info`: Removed "Software Version" from output b/c it's not used by firmware.

### Bug Fixes

* Fixed CLI command: `blink_led` now works on Windows/Linux.
* Fixed CLI command: `rename` now works on Windows/Linux.
* Fixed CLI command `read_device_info`: Now shows correct sketch name.


# v0.3.1

### Bug Fixes

* Fix user input being printed to stdout twice when prompting for user input.


# v0.3.0

### Features

* New CLI Command `rename`: Allows Bean renaming.
* Updated CLI Command `read_device_info`: Now shows **battery voltage** and **current sketch**.
* Updated CLI Command `program_sketch`: New `--oops` option which prompts users before starting sketch upload process. This will aid users who have accidentally "bricked" their beans with a malicious sketch.


# v0.2.0

### Features

* New CLI Command `log_serial`: Logs any serial data from Bean.
* New CLI Command `send_serial`: Allows users to send ascii or binary data to the Bean.

# v0.1.0

Initial public release.
