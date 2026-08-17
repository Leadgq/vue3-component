# yo-pc-ui-theme

Framework-agnostic theme tokens and runtime theme utilities shared by Vue 2 and Vue 3 applications.

## Usage

```js
import { getTheme, setTheme } from 'yo-pc-ui-theme'
import 'yo-pc-ui-theme/style.css'

setTheme('defaultBlue')
```

The package has no Vue or Element Plus runtime dependency. `setTheme` updates CSS custom properties on `document.documentElement` by default. A custom target can be supplied for scoped themes:

```js
setTheme('businessGreen', { target: document.querySelector('#app') })
```
