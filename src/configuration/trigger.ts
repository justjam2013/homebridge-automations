/* eslint-disable curly */

import { Validatable } from './Validatable.js';
import { Utils } from '../utils/utils.js';

export class Trigger implements Validatable {

  event!: string;
  when!: string;
  repeat!: string[];

  // ***************************************************************************

  private errorFields: string[] = [];

  readonly fieldNames = Utils.proxiedPropertiesOf(this);

  isValid(): [boolean, string[]] {
    const isValidEvent: boolean = (
      Utils.required(this.event)
    );
    const isValidWhen: boolean = (
      Utils.required(this.when)
    );
    const isValidRepeat: boolean = (
      Utils.required(this.repeat)
    );

    // Store fields failing validation
    if (!isValidEvent) this.errorFields.push(this.fieldNames.event!);
    if (!isValidWhen) this.errorFields.push(this.fieldNames.when!);
    if (!isValidRepeat) this.errorFields.push(this.fieldNames.repeat!);
    
    return [
      (isValidEvent &&
        isValidWhen &&
        isValidRepeat),
      this.errorFields,
    ];
  }
}
