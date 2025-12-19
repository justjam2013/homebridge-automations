/* eslint-disable curly */

import { Action } from './action.js';
import { Condition } from './condition.js';
import { Trigger } from './trigger.js';

import { Validatable } from './Validatable.js';
import { Utils } from '../utils/utils.js';

import { Type } from 'typeserializer';

export class Automation implements Validatable {

  automationName!: string;

  @Type(Trigger)
    trigger!: Trigger;

  @Type(Action)
    actions!: Action;

  @Type(Condition)
    conditions!: Condition;

  // ***************************************************************************

  private errorFields: string[] = [];

  readonly fieldNames = Utils.proxiedPropertiesOf(this);

  isValid(): [boolean, string[]] {
    const isValidAutomationName: boolean = (
      Utils.required(this.automationName)
    );

    const isValidTrigger: boolean = (this.isErrorless(this.trigger, this.fieldNames.trigger!));
    const isValidAction: boolean = (this.isErrorless(this.actions, this.fieldNames.actions!));
    const isValidCondition: boolean = (this.isErrorless(this.conditions, this.fieldNames.conditions!));

    // Store fields failing validation
    if (!isValidAutomationName) this.errorFields.push(this.fieldNames.automationName!);

    return [
      (isValidAutomationName &&
        isValidTrigger &&
        isValidAction &&
        isValidCondition),
      this.errorFields,
    ];
  }

  /**
   * Accessory validation
   */

  private isErrorless(accessory: Validatable, prefix: string): boolean {
    let isValid: boolean = false;
    let errorFields: string[] = [ prefix ];

    if (accessory !== undefined) {
      [isValid, errorFields] = accessory.isValid(prefix);
    }

    this.errorFields.push(...errorFields);

    return (
      isValid
    );
  };
}
