# tetris-fumen

`tetris-fumen` is a parser library to encode/decode tetris game state. Data compatible with [fumen](https://harddrop.com/fumen/), [連続テト譜エディタ](http://fumen.zui.jp/) can be created and manipulated.


## Features

* Tetris game state can be packed into a string and easily unpacked
* Provide simple manipulation for game field
* Decoder supports v115 and v110
* Encoder supports v115 only


## Installation

`npm install tetris-fumen`


## Specifications

### Field

Field have 10x23 play area and 1 garbage line.

```
    |__________|          22 // Top
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
    |XXXXXXXXX_|  <-  y = -1 // Garbage Line
     ^        ^
 x = 0 ...... 9
```


### Mino

The type of mino is represented by below strings:

  * 'T', 'I', 'O', 'L', 'J', 'S', 'Z'
  * Gray => 'X' or 'Gray' 
  * Empty => '_' or 'Empty'

The rotation states of mino is represented by below strings:

  * No rotate => 'Spawn'
  * Clockwise => 'Right'
  * Counter Clockwise => 'Left'
  * 180 rotation => 'Reverse'

The position of mino is represented by (x, y); See [harddrop's article SRS/How Guideline SRS Really Works](https://harddrop.com/wiki/SRS#How_Guideline_SRS_Really_Works) for details


## Getting started

### 1. Decode 

[Data used in the code below](http://harddrop.com/fumen/?v115@vhGRQYHAvItJEJmhCAUmBKpBvsBTtBGhBFqQPAUEzP?EJG98AQmqhECDdCA)

**Javascript**

```js
const { decoder } = require('tetris-fumen');

const data = "v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA";
const pages = decoder.decode(data);

console.log(pages.length);  // 7

console.log(pages[0].comment);  // 'Opening'
console.log(pages[0].operation);  // { type: 'I', rotation: 'Spawn', x: 4, y: 0 }
```

**Typescript**

```ts
import { decoder, Page } from 'tetris-fumen';

const data = 'v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
const pages: Page[] = decoder.decode(data);

console.log(pages.length);  // 7

console.log(pages[0].comment);  // 'Opening'
console.log(pages[0].operation);  // { type: 'I', rotation: 'Spawn', x: 4, y: 0 }
```


### 2.1. Update decoded fumen 

[Loading data in the code below](https://harddrop.com/fumen/?v115@9gI8AeI8AeI8AeI8KeAgH)
[Generated data by the code below]()

**Javascript**

```js
const { decoder, encoder } = require('tetris-fumen');

let pages = decoder.decode('v115@9gI8AeI8AeI8AeI8KeAgH');
pages[0].comment = '4 Lines';
pages[0].operation = { type: 'I', rotation: 'Left', x: 9, y: 1 };

console.log(encoder.encode(pages));  // v115@
```

### 2.2. Create from scratch

[Data generated by the code below](http://harddrop.com/fumen/?v115@9gilGeglRpGeg0RpGei0GeI8AeAgWYAQIKvDll2TAS?IvBElCyTASIqPEFGNXEvhE9tB0sBXjBAwSYATwgkDlt0TAz?B88AQx2vAx178AwngHBAAPMAFbuYCJciNEyoAVB)

**Javascript**

```js
const { encoder } = require('tetris-fumen');

const pages = [];
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

console.log(encoder.encode(pages));  // v115@9gilGeglRpGeg...../~/.....ciNEyoAVB
```

**Typescript**

```ts
import { encoder, EncodePage } from 'tetris-fumen';

const pages: EncodePage[] = [];
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

console.log(encoder.encode(pages));  // v115@9gilGeglRpGeg...../~/.....ciNEyoAVB
```


### 3. Page details

```js
const { decoder } = require('tetris-fumen');
const pages = decoder.decode('v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA');
const page = pages[0];

/* index: Page number, begin from 0 */
console.log(page.index);  // 0

/* comment: Comment on the page */
console.log(page.comment);  // 'Opening'

/* operation: Placed mino states */
console.log(page.operation);  // { type: 'I', rotation: 'Spawn', x: 4, y: 0 }

/* flags: Fumen options on the page
     - colorize: If true, apply guideline color to block
     - lock: If true, lock mino after placement
     - mirror: If true, flip field horizontally after placement
     - quiz: If true, comment is in quiz format
     - rise: If true, rise garbage after placement */  
console.log(page.flags);// {  colorize: true, lock: true, mirror: false, quiz: false, rise: false }

/* field: Field object on the page before applying operation and flags */
const field = page.field;
console.log(field.at(4, 0));  // '_'  // empty

field.put(page.operation);  // field object is mutable
console.log(field.at(4, 0));  // 'I'
```


### 4. Field details

```js
/* Create field */
const field = Field.create(
    'LLL_______' +
    'LOO_______' +
    'JOO_______' +
    'JJJ_______',  // field
    'XXXXXXXXX_',  // garbage (optional)
);

/* Get block type */
field.at(9, 0);  // 'O'

/* Set block */
field.set(9, 2, 'O');
field.set(9, 3, 'Gray');
field.set(9, 4, 'Empty');

field.set(0, -1, 'X');  // same as 'Gray'
field.set(9, -1, '_');  // same as 'Empty'

/* Check if can fill piece */
field.canFill({ type: 'T', rotation: 'Left', x: 9, y: 1 });  // true

/* Fill piece even if not on the ground */
field.fill({ type: 'O', rotation: 'Spawn', x: 8, y: 0 });


/* Check if can fill and lock piece on the ground */
field.canLock({ type: 'T', rotation: 'Left', x: 9, y: 1 });  // true
field.canLock({ type: 'T', rotation: 'Left', x: 9, y: 2 });  // false

/* Harddrop and fill piece to the ground */
field.put({ type: 'T', rotation: 'Left', x: 9, y: 10 });


/* Convert to string 
                        default
     @param `reduced`   true    If true, empty line is not parsed
     @param `separator` '\n'    Specify characters between lines 
     @param `garbage`   true    If true, garbage is parsed */
console.log(field.str());


// Copy field
const copied = field.copy();
console.log(copied.str() === field.str());  // true
copied.set(0, 0, 'I');
console.log(copied.str() === field.str());  // false
```