# tetris-fumen

## Defines

### Coordinate

10x23 field + 1 garbage line

```
    |__________|          23 (top)
    |__________|          22
    |__________|          21
    |__________|          20
    |__________|          19
   ~~~~~~~~~~~~~~~         .
    |__________|           .
    |___JJJ____|           .
    |L__ZZJS___|           2
    |L___ZZSSOO|           1
    |LL IIIISOO|  <-  y =  0
    ============
    |XXXXXXXXX_|  <-  y = -1 (garbage line)
     ^        ^
 x = 0 ...... 9
```

## Samples

### Load from fumen data

Javascript

```
let { decoder } = require('..');

const data = "v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA";
const pages = decoder.decode(data);

console.log(pages.length);  // 7
```

Typescript

```
import { decoder } from 'tetris-fumen';

const data = 'v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
const pages = decoder.decode(data);

console.log(pages.length);  // 7
```

### Access to page

This sample uses http://fumen.zui.jp/?v115@vhGRQYHAvItJEJmhCAUmBKpBvsBTtBGhBFqQPAUEzP?EJG98AQmqhECDdCA

Javascript & Typescript

```
const page = pages[0];  // Access to the first page

console.log(page.index);  // 0
console.log(page.comment);  // 'Opening'
console.log(page.operation);  // { type: 'I', rotation: 'Spawn', x: 4, y: 0 }
console.log(page.flags);
/**
{ 
    colorize: true,
    lock: true,
    mirror: false,
    quiz: false,
    rise: false,
}
*/

const field = page.field;  // field object
console.log(field.at(4, 0));  // '_'  // empty

field.put(page.operation);  // field object is mutable
console.log(field.at(4, 0));  // 'I'
```

* index: Page number. Start from 0
* comment: Comment on the page
* operation: Placed mino info
  - type: Mino type (I|L|O|Z|T|J|S) 
  - rotation: Mino rotation state (Spawn|Right|Reverse|Left) 
  - x, y: Mino position. See [harddrop's article SRS/How Guideline SRS Really Works](https://harddrop.com/wiki/SRS#How_Guideline_SRS_Really_Works) for details
* flags: Fumen options on the page
  - colorize: If true, apply guideline color to block
  - lock: If true, lock mino after placement
  - mirror: If true, flip field horizontally after placement
  - quiz: If true, comment is in quiz format
  - rise: If true, rise garbage after placement  
* field: Field object on the page before applying operation and flags


### Encode

Typescript

```
import { encoder, EncodePages } from 'tetris-fumen';

const pages: EncodePages = [];
pages.push({
    field: Field.create(
        'LLL_______' +
        'LOO_______' +
        'JOO_______' +
        'JJJ_______',
        'XXXXXXXXX_',
    ),
    comment: 'Perfect Clear Opener',
});

pages.push({
    operation: {
        type: 'T', rotation: 'Left', x: 9, y: 1,
    },
});

pages.push({
    operation: {
        type: 'Z', rotation: 'Spawn', x: 7, y: 0,
    },
});

pages.push({
    operation: {
        type: 'S', rotation: 'Spawn', x: 8, y: 2,
    },
});

pages.push({
    comment: 'Success: 61.19 %',
    flags: {
        mirror: true,
    },
});

pages.push({
    comment: '(Mirror)',
});

const encoded: string = encoder.encode(pages);
console.log(encoded);  // v115@9gilGeglRpGeg0RpGei0GeI8AeAgWYAQIKvDll2TAS?IvBElCyTASIqPEFGNXEvhE9tB0sBXjBAwSYATwgkDlt0TAz?B88AQx2vAx178AwngHBAAPMAFbuYCJciNEyoAVB
```