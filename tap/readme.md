# zora-tap-reporter

[Test Anything Protocol](https://testanything.org/) reporters for [zora](https://github.com/lorenzofox3/zora).

Two flavors of TAP protocol which work both on the browser and on Nodejs

## Install

``npm install zora-tap-reporter``

## TAP reporter

Basic TAP reporter which outputs a TAP stream compatible with any [tape](https://github.com/substack/tape) reporter

```javascript
import {createHarness} from 'zora';
import {tapReporter} from 'zora-tap-reporter';

const h = createHarness();

const {test} = h;

test(`hello world`, t => {
    t.ok(true);

    t.test('nested', t => {
        t.eq('foo', 'fob');
    });
});

test(`hello world`, t => {
    t.ok(true);

    t.test('nested', t => {
        t.eq('foo', 'fob');
    });
});

h.report(tapReporter());
```

will output 

```TAP
TAP version 13
# hello world
ok 1 - should be truthy
# nested
not ok 2 - should be equivalent
  ---
    actual: "foo"
    expected: "fob"
    operator: "equal"
    at: " file:///Volumes/data/code/zora-reporters/tap/example.mjs:12:11"
  ...
# hello world
ok 3 - should be truthy
# nested
not ok 4 - should be equivalent
  ---
    actual: "foo"
    expected: "fob"
    operator: "equal"
    at: " file:///Volumes/data/code/zora-reporters/tap/example.mjs:20:11"
  ...
1..4

# not ok
# success: 2
# skipped: 0
# failure: 2
```

## Indented TAP reporter

Richer structure which can be parsed by any TAP parser and will provide better information for parsers (or downstream reporters) which understand this specific structure. Example: [tap-mocha-reporter](https://www.npmjs.com/package/tap-mocha-reporter)

```javascript
import {createHarness} from 'zora';
import {indentedTapReporter} from 'zora-tap-reporter';

const h = createHarness();

const {test} = h;

test(`hello world`, t => {
    t.ok(true);

    t.test('nested', t => {
        t.eq('foo', 'fob');
    });
});

test(`hello world`, t => {
    t.ok(true);

    t.test('nested', t => {
        t.eq('foo', 'fob');
    });
});

h.report(indentedTapReporter());
```

will output

```TAP
TAP version 13
# Subtest: hello world
    ok 1 - should be truthy
    # Subtest: nested
        not ok 1 - should be equivalent
          ---
            wanted: "fob"
            found: "foo"
            at: " file:///Volumes/data/code/zora-reporters/tap/example.mjs:12:11"
            operator: "equal"
          ...
        1..1
    not ok 2 - nested # 5ms
    1..2
not ok 1 - hello world # 7ms
# Subtest: hello world
    ok 1 - should be truthy
    # Subtest: nested
        not ok 1 - should be equivalent
          ---
            wanted: "fob"
            found: "foo"
            at: " file:///Volumes/data/code/zora-reporters/tap/example.mjs:20:11"
            operator: "equal"
          ...
        1..1
    not ok 2 - nested # 3ms
    1..2
not ok 2 - hello world # 3ms
1..2

# not ok
# success: 2
# skipped: 0
# failure: 2
```
