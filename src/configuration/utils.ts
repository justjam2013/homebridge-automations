import { Automation } from './automatiom.js';
import { VirtualLogger } from '../utils/virtualLogger.js';

import { deserialize } from 'typeserializer';
import 'reflect-metadata';

/**
 * 
 */
export class ConfigurationUtils {

  private log: VirtualLogger;

  constructor(
    log: VirtualLogger,
  ) {
    this.log = log;
  }

  deserializeAutomationConfig(config: string | object): Automation | undefined {
    let automation: Automation | undefined;

    const json: string = (typeof config === 'object') ? JSON.stringify(config) : <string>config;
    try {
      automation = deserialize(json, Automation);
    } catch (error) {
      this.log.error(`[Configuration] Error: ${JSON.stringify(error)}`);
    }

    return automation;
  }
}
