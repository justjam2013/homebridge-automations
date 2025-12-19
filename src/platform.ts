/* eslint-disable @typescript-eslint/no-explicit-any */

import { APIEvent } from 'homebridge';
import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { HapClient, HapInstance, ServiceType } from '@homebridge/hap-client';
import { HapMonitor } from '@homebridge/hap-client/dist/monitor.js';

import { Automation } from './configuration/automatiom.js';
import { VirtualLogger, VirtualLogLevel } from './utils/virtualLogger.js';
import { ConfigurationUtils } from './configuration/utils.js';

import fs from 'fs';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class AutomationsPlatform implements DynamicPlatformPlugin {

  static platformName: string = 'Automations Platform';

  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  public readonly log: VirtualLogger;

  public hapClient: HapClient;
  public monitor!: HapMonitor;

  private discoveryTimer: ReturnType<typeof setTimeout> | undefined;
  private discoveryTimeoutMillis: number = 5000;

  private services: ServiceType[] = [];

  constructor(
    log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    this.log = new VirtualLogger(log, VirtualLogLevel.DEBUG);

    this.log.info(`Initializing platform: ${this.config.name}`);

    const contents = fs.readFileSync(this.api.user.configPath(), 'utf8');
    const homebridgeConfig = JSON.parse(contents);

    this.hapClient = new HapClient({
      config: { debug: true },
      pin: homebridgeConfig.bridge.pin,
      logger: new VirtualLogger(log, VirtualLogLevel.ERROR),
    });
     
    // Emitted during discovery for each HB instance discovered
    this.hapClient.on('instance-discovered', (instance: HapInstance) => {
      this.instanceDiscovered(instance);
    });
    this.hapClient.on('discovery-ended', async () => {
      this.discoveryEnded();
    });

    this.log.info(`Finished initializing platform: ${this.config.name}`);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on(APIEvent.DID_FINISH_LAUNCHING, async () => {
      log.debug('Executing didFinishLaunching callback');

      // run the method to discover / register your devices as accessories
      // this.discoverDevices();

      this.loadAutomations();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to set up event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info(`Loading accessory from cache: ${accessory.displayName}`);
  }

  // HapClient callbacks

  private instanceDiscovered(instance: HapInstance) {
    this.log.info(`Discovered instance: ${JSON.stringify(instance)}`);

    if (this.discoveryTimer === undefined) {
      this.discoveryTimer = setTimeout(
        async () => {
          await this.loadAccessories();
          await this.monitorCharacterisitics();
        },
        this.discoveryTimeoutMillis);
    }
  }

  private discoveryEnded() {
    this.log.debug('Discovery ended - refreshing HAP client');

    this.hapClient.refreshInstances();
  }

  // HapMonitor callbacks

  private serviceUpdate(services: any) {
    this.log.info(`Data: ${JSON.stringify(services)}`);
  }

  private async monitorCharacterisitics() {
    this.log.info('Creating monitor');

    this.monitor = await this.hapClient.monitorCharacteristics();

    // Emitted when a characteristic change is received from a homebridge service
     
    this.monitor.on('service-update', (services: any) => {
      this.serviceUpdate(services);
    });
  }

  private async loadAccessories() {
    this.services.push(... (await this.hapClient.getAllServices())
      .filter((service) => service.type !== 'ProtocolInformation'));
    // this.services.forEach((serviceType) => {
    //   this.log.info(`Service type: ${serviceType.serviceName} (${serviceType.humanType})`);
    // }); 
  }

  private loadAutomations() {
    //this.config.automations
  }

  private deserializeAccessoryConfigurations(
    configAutomations,
  ): Automation[] {
    const automations: Automation[] = [];
    const automationNames: string[] = [];

    for (const configAutomation of configAutomations) {
      // Deserialize accessory configuration
      const configurationUtils: ConfigurationUtils = new ConfigurationUtils(this.log);
      const automationConfiguration: Automation | undefined = configurationUtils.deserializeAutomationConfig(configAutomation);

      // Skip automation if the configuration is invalid
      if (automationConfiguration === undefined) {
        this.log.error(`Error deserializing: ${JSON.stringify(configAutomation)}`);
        this.log.info('Skipping automation until configuration is fixed');
      } else if (automationNames.includes(automationConfiguration.automationName)) {
        this.log.error(`Found automation with duplicate name: ${JSON.stringify(configAutomation)}`);
        this.log.info('Skipping automation until configuration is fixed');
      } else {
        this.log.debug(`Deserialized automation: ${JSON.stringify(configAutomation)}`);

        let isValidAutomationConfiguration: boolean = false;
        let errorFields: string[] = [];
        [isValidAutomationConfiguration, errorFields] = automationConfiguration.isValid();
        if (!isValidAutomationConfiguration) {
          this.log.error(`Skipping automation. Configuration is invalid: ${JSON.stringify(automationConfiguration)}`);
          this.log.error(`Invalid fields: ${errorFields.toString()}`);
        } else {
          this.log.debug(`Configuration is valid: ${JSON.stringify(automationConfiguration)}`);
          automations.push(automationConfiguration);

          automationNames.push(automationConfiguration.automationName);
        }
      }
    }

    return automations;
  }
}
