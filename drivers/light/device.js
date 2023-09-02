'use strict';

const Homey = require('homey');

const CAPABILITIES_SET_DEBOUNCE = 100;

class Light extends Homey.Device {

  async onInit() {
    this._tradfriInstanceId = this.getData().id;
    await this.homey.app.connect();
    const tradfriDevice = await this.homey.app.getLight(this._tradfriInstanceId);
    this.updateCapabilities(tradfriDevice);
    this.registerMultipleCapabilityListener(this.getCapabilities(), this._onMultipleCapabilityListener.bind(this), CAPABILITIES_SET_DEBOUNCE);
    this.log(`Tradfri Light ${this.getName()} has been initialized`);
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

      if (this.hasCapability('dim')) {
        this.setCapabilityValue('dim', tradfriDevice.attributes.lightLevel / 100)
          .catch(this.error);
      }

      if (this.hasCapability('light_saturation')) {
        this.setCapabilityValue('light_saturation', tradfriDevice.capabilities.colorSaturation / 100)
          .catch(this.error);
      }

      if (this.hasCapability('light_hue')) {
        this.setCapabilityValue('light_hue', tradfriDevice.capabilities.colorHue / 360)
          .catch(this.error);
      }
    }
  }

  async onExternalUpdate(newstate) {
    if (newstate.isOn === true || newstate.isOn === false) {
      this.setCapabilityValue('onoff', newstate.isOn)
        .catch(this.error);
    }
    if (newstate.lightLevel) {
      this.setCapabilityValue('dim', newstate.lightLevel / 100)
        .catch(this.error);
    }
    if (newstate.colorTemperature) {
      this.setCapabilityValue('light_temperature', newstate.colorTemperature / 100)
        .catch(this.error);
    }
    if (newstate.colorHue && newstate.colorSaturation) {
      this.setCapabilityValue('light_hue', newstate.colorHue / 360)
        .catch(this.error);
      this.setCapabilityValue('light_saturation', newstate.colorSaturation / 100)
        .catch(this.error);
    }
  }

  async _onMultipleCapabilityListener(valueObj, optsObj) {
    const commands = {};
    commands['id'] = this._tradfriInstanceId;
    for (const [key, value] of Object.entries(valueObj)) {
      if (key === 'dim') {
        if (optsObj.dim.duration !== null) {
          commands['transitionTime'] = optsObj.dim.duration;
        }
        commands['lightLevel'] = value * 100;
      } else if (key === 'onoff') {
        commands['isOn'] = value;
      } else if (key === 'light_temperature') {
        commands['colorTemperature'] = value * 100;
      } else if (key === 'light_hue') {
        commands['colorHue'] = value * 360;
      } else if (key === 'light_saturation') {
        commands['colorSaturation'] = value;
      } 
    }
    return this.homey.app.operateLight(commands);
  }

}

module.exports = Light;
