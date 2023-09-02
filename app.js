'use strict';

const Homey = require('homey');
const nodeDirigeraClient = require('dirigera');

class IkeaDirigeraGatewayApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('Ikea Dirigera App has been initialized');

    this._gatewayConnected = false;

    this._lights = {};
    this._groups = {};
    await this.connect();
  }

  async establishConnection() {
    if (this._dirigera != null) {
      this._dirigera.destroy();
    }

    this._dirigera = await nodeDirigeraClient.createDirigeraClient({
      accessToken: this.homey.settings.get('accessToken'),
    });

    this._dirigera.startListeningForUpdates(async (updateEvent) => {
      // this.log(JSON.stringify(updateEvent));
      if (updateEvent.type === 'deviceStateChanged') {
        if (updateEvent.data.deviceType === 'blinds') {
          await this.updateBlindState(updateEvent.data.id, updateEvent.data.attributes);
        }
        if (updateEvent.data.deviceType === 'light') {
          await this.updateLightState(updateEvent.data.id, updateEvent.data.attributes);
        }
      }
    });

    this._gatewayConnected = true;
    this.log('Connected to DIRIGERA gateway');
  }

  async connect() {
    if (!this._gatewayConnected) {
      if (this._connectionPromise) {
        // If connection is already being established, wait for it to complete
        await this._connectionPromise;
        return;
      }

      this._connectionPromise = this.establishConnection();

      try {
        await this._connectionPromise;
        this._connectionPromise = null;
      } catch (error) {
        this.log.error('Error connecting to DIRIGERA gateway:', error);
        this._connectionPromise = null;
        throw error;
      }
    }
  }

  async getLights() {
    this._lights = await this._dirigera.lights.list();
    return this._lights;
  }

  async getLight(id) {
    this._light = await this._dirigera.lights.get({ id: `${id}` });
    return this._light;
  }

  async getBlinds() {
    this._blinds = await this._dirigera.blinds.list();
    return this._blinds;
  }

  async operateBlind(details) {
    let response;
    if (Object.keys(details).includes('blindsTargetLevel')) {
      response = this.homey.app.setTargetLevel(details);
    }
    return response;
  }

  async getBlind(id) {
    this._blind = await this._dirigera.blinds.get({ id: `${id}` });
    return this._blind;
  }

  async updateBlindState(id, state) {
    const device = this.homey.drivers.getDriver('blind').getDevice({ id: `${id}` });
    if (device) {
      device.onExternalUpdate(state);
    }
  }

  async setTargetLevel(details) {
    this._blind = await this._dirigera.blinds.setTargetLevel(details);
    return this._blind;
  }

  async operateLight(details) {
    let response;
    if (Object.keys(details).includes('colorHue') && Object.keys(details).includes('colorSaturation')) {
      response = this.homey.app.setLightColour(details);
    } if (Object.keys(details).includes('colorSaturation')) {
      response = this.homey.app.setLightTemperature(details);
    } if (Object.keys(details).includes('lightLevel')) {
      response = this.homey.app.setLightLevel(details);
    } if (Object.keys(details).includes('isOn')) {
      response = this.homey.app.setLightState(details);
    } if (Object.keys(details).includes('transition')) {
      response = this.homey.app.setLightState(details);
    }
    return response;
  }

  async updateLightState(id, state) {
    const device = this.homey.drivers.getDriver('light').getDevice({ id: `${id}` });
    if (device) {
      device.onExternalUpdate(state);
    }
  }

  async setLightState(details) {
    this.log(details);
    this._light = await this._dirigera.lights.setIsOn(details);
    return this._light;
  }

  async setLightLevel(details) {
    this.log(details);
    this._light = await this._dirigera.lights.setLightLevel(details);
    return this._light;
  }

  async setLightColour(details) {
    this.log(details);
    this._light = await this._dirigera.lights.setLightColor(details);
    return this._light;
  }

  async setLightTemperature(details) {
    this.log(details);
    this._light = await this._dirigera.lights.setLightColor(details);
    return this._light;
  }

  async getOutlets() {
    this._outlets = await this._dirigera.outlets.list();
    return this._outlets;
  }

  async getOutlet(id) {
    this._outlet = await this._dirigera.outlets.get({ id: `${id}` });
    return this._outlet;
  }

  async setOutletState(id, state) {
    this._outlet = await this._dirigera.outlets.setIsOn({ id: `${id}`, isOn: state });
    return this._outlet;
  }

  async getDeviceList() {
    this._devices = await this._dirigera.devices.list();
    return this._devices;
  }

}
module.exports = IkeaDirigeraGatewayApp;
