### Installation

```
npm install baybulatov-util-js
```

Bundle, that's suitable for usage in browser (dependencies, Lodash.js and Moment.js, aren't bundled along, so explicitly required):

```
<script src='https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.3/lodash.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment.js'></script>

<script src='https://unpkg.com/baybulatov-util-js@latest/dist/baybulatov-util.js'></script>
```

### Development

Globally installed Webpack required

```
npm install
webpack
```

### Publishing

```
npm version <update_type>
webpack
npm publish
```

where `update_type` is one of the semantic versioning release types, `patch`, `minor`, or `major`
