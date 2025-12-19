/**
 * Utils
 */
export class Utils {

  /**
   * Get the field name 
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static proxiedPropertiesOf<TObj>(obj?: TObj) {
    return new Proxy({}, {
      get: (_, prop) => prop,
      set: () => {
        throw Error('Set not supported');
      },
    }) as {
        [P in keyof TObj]?: P;
    };
  }

  static required(field: number | string | string[]): boolean {
    return (field !== undefined);
  }

}
