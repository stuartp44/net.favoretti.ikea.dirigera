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
      this.log(JSON.stringify(updateEvent));
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

  async getBlind(id) {
    this._blind = await this._dirigera.blinds.get({ id: `${id}` });
    return this._blind;
  }

  async setTargetLevel(id, target) {
    this._blind = await this._dirigera.blinds.setTargetLevel({ id: `${id}`, blindsTargetLevel: target });
    return this._blind;
  }

  async setLightState(id, state) {
    this._light = await this._dirigera.lights.setIsOn({ id: `${id}`, isOn: state });
    return this._light;
  }

  async setLightLevel(id, level, duration) {
    this._light = await this._dirigera.lights.setLightLevel({ id: `${id}`, lightLevel: level, duration });
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

}
module.exports = IkeaDirigeraGatewayApp;
