'use strict';

const { Device } = require('homey');

const CAPABILITIES_SET_DEBOUNCE = 100;

class Blind extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this._blindInstanceId = this.getData().id;
    await this.homey.app.connect();
    const blindDevice = await this.homey.app.getBlind(this._blindInstanceId);
    this.updateCapabilities(blindDevice);
    this.registerMultipleCapabilityListener(this.getCapabilities(), this._onMultipleCapabilityListener.bind(this), CAPABILITIES_SET_DEBOUNCE);
    this.log(`Blind ${this.getName()} has been initialized`);
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
        this.setCapabilityValue('windowcoverings_set', blindDevice.attributes.blindsCurrentLevel / 100)
          .catch(this.error);
      }
    }
  }

  async onExternalUpdate(newstate) {
    if (newstate.blindsCurrentLevel) {
      this.log(`Setting blind to ${newstate.blindsCurrentLevel}`);
      this.setCapabilityValue('windowcoverings_set', parseFloat(newstate.blindsCurrentLevel / 100))
        .catch(this.error);
    }
  }

  _onMultipleCapabilityListener(valueObj, optsObj) {
    const commands = {};
    commands['id'] = this._blindInstanceId;
    for (const [key, value] of Object.entries(valueObj)) {
      if (key === 'windowcoverings_set') {
        this.log(`Setting blind to ${value * 100}`);
        commands['blindsTargetLevel'] = parseFloat(value * 100);
      }
    }
    return this.homey.app.operateBlind(commands);
  }

  async onAdded() {
    this.log(`Blind ${this.getName()} has been added`);
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
    this.log(`Blind ${this.getName()} settings where changed`);
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log(`Blind ${this.getName()} was renamed`);
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log(`Blind ${this.getName()} has been deleted`);
  }

}

module.exports = Blind;
