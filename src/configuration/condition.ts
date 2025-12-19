/* eslint-disable curly */

import { Validatable } from './Validatable.js';
import { Utils } from '../utils/utils.js';

export class Condition implements Validatable {

  type!: string;

  // ***************************************************************************

  private errorFields: string[] = [];

  readonly fieldNames = Utils.proxiedPropertiesOf(this);

  isValid(): [boolean, string[]] {
    const isValidType: boolean = (
      Utils.required(this.type)
    );

    // Store fields failing validation
    if (!isValidType) this.errorFields.push(this.fieldNames.type!);
    
    return [
      (isValidType),
      this.errorFields,
    ];
  }
}
