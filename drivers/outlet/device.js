'use strict';

const { Device } = require('homey');

class Outlet extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this._tradfriInstanceId = this.getData().id;
    await this.homey.app.connect();
    const tradfriDevice = await this.homey.app.getOutlet(this._tradfriInstanceId);
    this.updateCapabilities(tradfriDevice);
    // this.registerMultipleCapabilityListener(this.getCapabilities(), this._onMultipleCapabilityListener.bind(this), CAPABILITIES_SET_DEBOUNCE);
    this.log(`Tradfri Outlet ${this.getName()} has been initialized`);

    this.registerCapabilityListener('onoff', async (value) => {
      this.log(`Setting outlet ${this.getName()} to ${value}`);
      await this.homey.app.setOutletState(this._tradfriInstanceId, value);
    });
  }

  updateCapabilities(tradfriDevice) {
    if (typeof tradfriDevice !== 'undefined') {
      if (tradfriDevice.isReachable) {
        this.setAvailable()
          .catch(this.error);
      } else {
        this.setUnavailable('(temporary) unavailable')
          .catch(this.error);
      }

      if (this.hasCapability('onoff')) {
        this.setCapabilityValue('onoff', tradfriDevice.attributes.isOn)
          .catch(this.error);
      }
    }
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = Outlet;
