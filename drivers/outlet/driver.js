'use strict';

const { Driver } = require('homey');

class OutletDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('Outlet has been initialized');
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
    const outlets = await this.homey.app.getOutlets();
    for (const outlet of outlets) {
      const capabilities = [];
      if (outlet.capabilities.canReceive.includes('isOn')) {
        capabilities.push('onoff');
      }
      devices.push({
        data: {
          id: outlet.id,
        },
        capabilities,
        name: (outlet['attributes'].customName !== '' ? outlet['attributes'].customName : outlet['attributes'].model),
      });
    }
    return devices.sort(OutletDriver._compareHomeyDevice);
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

module.exports = OutletDriver;
