# tetris-fumen

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