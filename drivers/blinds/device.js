'use strict';

const { Device } = require('homey');

// const CAPABILITIES_SET_DEBOUNCE = 100;

class Blind extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this._blindInstanceId = this.getData().id;
    await this.homey.app.connect();
    const blindDevice = await this.homey.app.getBlind(this._blindInstanceId);
    this.updateCapabilities(blindDevice);
    // this.registerMultipleCapabilityListener(this.getCapabilities(), this._onMultipleCapabilityListener.bind(this), CAPABILITIES_SET_DEBOUNCE);
    this.log(`Blind ${this.getName()} has been initialized`);

    this.registerCapabilityListener('windowcoverings_set', async (value) => {
      const blindPosition = Math.floor(value * 100);
      this.log(`Setting blind ${this.getName()} to ${blindPosition}`);
      await this.homey.app.setTargetLevel(this._blindInstanceId, blindPosition);
    });
  }

  updateCapabilities(blindDevice) {
    if (typeof blindDevice !== 'undefined') {
      if (blindDevice.isReachable) {
        this.setAvailable()
          .catch(this.error);
      } else {
        this.setUnavailable('(temporary) unavailable')
          .catch(this.error);
      }
      if (this.hasCapability('measure_battery')) {
        this.setCapabilityValue('measure_battery', blindDevice.attributes.batteryPercentage)
          .catch(this.error);
      }
      if (this.hasCapability('windowcoverings_set')) {
        this.setCapabilityValue('windowcoverings_set', blindDevice.attributes.blindsCurrentLevel)
          .catch(this.error);
      }
      if (this.hasCapability('windowcoverings_set')) {
        this.setCapabilityValue('windowcoverings_set', blindDevice.attributes.blindsCurrentLevel)
          .catch(this.error);
      }
    }
  }

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

module.exports = Blind;
