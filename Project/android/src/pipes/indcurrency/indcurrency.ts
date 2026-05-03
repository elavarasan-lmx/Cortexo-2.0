import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the IndcurrencyPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'indcurrency',
})
export class IndcurrencyPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: number):string {
    value = (value);
    console.log(value)
    var result = value.toString().split('.');
    var lastThree = result[0].substring(result[0].length - 3);
    var otherNumbers = result[0].substring(0, result[0].length - 3);
    if (otherNumbers != '' && otherNumbers != '-')
        lastThree = ',' + lastThree;
    var output = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    console.log(output)
    if (result.length > 1) {
        output += "." + result[1];
    }

    return output;
  }
}
