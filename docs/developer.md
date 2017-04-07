[<< Back](../README.md)

# Developer Guide

This is a guide for developers of this project.

* [Environment Setup](#setup)
* [Release Process](#release-process)

# Environment Setup

Here is a brief overview of how to setup for this project:

* Use `nvm` to install correct Node.js version (currently 6.2.2)

  ```
  nvm install x.x.x
  nvm use x.x.x
  ```

* Install platform dependencies. These are unique to each platform and are implicitly covered in the different [CLI install guides](../README.md#installation)
* Install app dependencies

  ```
  cd bean-sdk-node
  npm install
  ```

* Open project in WebStorm and begin developing!

### Setup WebStorm

* Configure to use ECMAScript 6

    *Preferences > Languages & Frameworks > JavaScript > (Dropdown choose ECMA6)*

* Turn off unterminated line ending inspection

    *Preferences > Editor > Inspections > Code Style Issues > (Uncheck unterminated endings box)*

* Enable Node core libraries

    *Preferences > Languages & Frameworks > Node.js & NPM > (Enable node core libraries)*

* Configure the correct Node.js interpreter

    *Preferences > Languages & Frameworks > Node.js & NPM > (Dropdown choose NVM install)*

# Release Process

**Before you begin:**

* Make sure you have an `npm` account.
* Make sure you have private and public remotes setup in git. Usually `origin` is private and `public` is public.

  ```
  git remote add public git@github.com:PunchThrough/bean-sdk-node.git
  ```

**Steps:**

1. Merge all feature branches to `master`
2. Update `CHANGELOG.md` for new version
3. Update version number in `package.json`
4. **Optional**: Update `bean-arduino-core` if there is a new version.

    * Check out [bean-arduino-core](https://github.com/punchthrough/bean-arduino-core) at a given tag.
    * Run the bundle script and copy it over to this project:

      ```
      python scripts/bundle.py
      cp bean-arduino-core/tmp/bean-arduino-core-x.x.x.tar.gz src/resources/
      ```

    * Delete the old bean-arduino-core tarball from src/resources

5. **Optional**: Update `bean-firmware` if there is a new version.

    * Find the latest release on [Confluence](https://punchthrough.atlassian.net/wiki/pages/viewpage.action?pageId=51366714)
    * Unzip the release
    * Copy the following files to `src/resources/firmware_bundles/bean/`

      * `*_a_BeanSmallImgAPadded.bin`
      * `*_b_Bean_imgB_large.bin`
      * `*_c_BeanSmallImgA.bin`
      * `*_a_BeanSmallImgB.bin`

    * Copy the following files to `src/resources/firmware_bundles/beanplus/`

      * `*_b_BeanPlus_imgB_large.bin`
      * `*_c_BeanPlusSmallImgA.bin`

6. Make a new commit/PR containing the following changes:

    * Updated CHANGELOG
    * Updated version in `package.json`
    * **Optional:** Updated bean-arduino-core
    * **Optional:** Updated bean-firmware

7. Review and merge to master
8. Checkout master and tag release: `git tag -a <version>`
9. Push to public and private repos

  ```
  git push origin master --tags
  git push public master --tags
  ```

10. Build app: `npm run build`
11. Login to npm: `npm login`
12. Publish: `npm publish`
