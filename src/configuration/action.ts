/* eslint-disable curly */

import { Validatable } from './Validatable.js';
import { Utils } from '../utils/utils.js';

export class Action implements Validatable {

  accessoryName!: string;
  accessoryType!: string;
  property!: string;
  value!: string;

  // ***************************************************************************

  private errorFields: string[] = [];

  readonly fieldNames = Utils.proxiedPropertiesOf(this);

  isValid(): [boolean, string[]] {
    const isValidAccessoryName: boolean = (
      Utils.required(this.accessoryName)
    );
    const isValidAccessoryType: boolean = (
      Utils.required(this.accessoryType)
    );
    const isValidProperty: boolean = (
      Utils.required(this.property)
    );
    const isValidValue: boolean = (
      Utils.required(this.value)
    );

    // Store fields failing validation
    if (!isValidAccessoryName) this.errorFields.push(this.fieldNames.accessoryName!);
    if (!isValidAccessoryType) this.errorFields.push(this.fieldNames.accessoryType!);
    if (!isValidProperty) this.errorFields.push(this.fieldNames.property!);
    if (!isValidValue) this.errorFields.push(this.fieldNames.value!);
    
    return [
      (isValidAccessoryName &&
        isValidAccessoryType &&
        isValidProperty &&
        isValidValue),
      this.errorFields,
    ];
  }
}
