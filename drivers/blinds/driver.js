'use strict';

const { Driver } = require('homey');

class Blind extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('Ikea Blinds Driver has been initialized');
  }

  updateCapabilities(tradfriDevice) {
    for (const device of this.getDevices()) {
      if (device.getData().id === tradfriDevice.instanceId) {
        device.updateCapabilities(tradfriDevice);
      }
    }
  }

  async onPairListDevices() {
    await this.homey.app.connect();
    const devices = [];
    const blinds = await this.homey.app.getBlinds();
    for (const blind of blinds) {
      const capabilities = [];
      if (blind.capabilities.canReceive.includes('blindsTargetLevel')) {
        capabilities.push('windowcoverings_set');
      }
      if (blind.attributes.batteryPercentage !== null) {
        capabilities.push('measure_battery');
      }
      devices.push({
        data: {
          id: blind.id,
        },
        capabilities,
        name: (blind['attributes'].customName !== '' ? blind['attributes'].customName : blind['attributes'].model),
      });
    }
    return devices.sort(Blind._compareHomeyDevice);
  }

  static _compareHomeyDevice(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

}

module.exports = Blind;
