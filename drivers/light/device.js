'use strict';

const Homey = require('homey');

// const CAPABILITIES_SET_DEBOUNCE = 100;

class MyDevice extends Homey.Device {

  async onInit() {
    this._tradfriInstanceId = this.getData().id;
    await this.homey.app.connect();
    const tradfriDevice = await this.homey.app.getLight(this._tradfriInstanceId);
    this.updateCapabilities(tradfriDevice);
    // this.registerMultipleCapabilityListener(this.getCapabilities(), this._onMultipleCapabilityListener.bind(this), CAPABILITIES_SET_DEBOUNCE);
    this.log(`Tradfri Light ${this.getName()} has been initialized`);

    this.registerCapabilityListener('onoff', async (value) => {
      this.log(`Setting light ${this.getName()} to ${value}`);
      await this.homey.app.setLightState(this._tradfriInstanceId, value);
    });
    this.registerCapabilityListener('dim', async (value) => {
      const lightLevel = Math.floor(value * 100);
      this.log(`Setting light ${this.getName()} to ${lightLevel}`);
      await this.homey.app.setLightLevel(this._tradfriInstanceId, lightLevel);
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

      if (this.hasCapability('dim')) {
        this.setCapabilityValue('dim', tradfriDevice.attributes.lightLevel / 100)
          .catch(this.error);
      }
    }
  }

  // _onMultipleCapabilityListener(valueObj) {
  //   const commands = {};
  //   for (const [key, value] of Object.entries(valueObj)) {
  //     if (key === 'dim') {
  //       commands['dimmer'] = value * 100;
  //     } else if (key === 'onoff') {
  //       commands['onOff'] = value;
  //     } else if (key === 'light_temperature') {
  //       commands['colorTemperature'] = value * 100;
  //     } else if (key === 'light_hue') {
  //       commands['hue'] = value * 360;
  //     } else if (key === 'light_saturation') {
  //       commands['saturation'] = value * 100;
  //     }
  //   }

  //   return this.homey.app.operateLight(this._tradfriInstanceId, commands);
  // }

}

module.exports = MyDevice;
