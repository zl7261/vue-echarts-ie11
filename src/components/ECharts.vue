<template>
  <div class="echarts">
  </div>
</template>

<style>
  .echarts {
    width: 600px;
    height: 400px;
  }
</style>

<script>
import eCharts from 'echarts/lib/echarts'
import { throttle } from 'lodash'

const INIT_TRIGGERS = ['theme', 'initOptions']
const REWATCH_TRIGGERS = ['manualUpdate', 'watchShallow']

export default {
  name: 'Vue-ECharts',
  props: {
    options: {
      type: Object,
      default: () => {
      }
    },
    theme: {
      type: [String, Object],
      default: ''
    },
    initOptions: {
      type: Object,
      default: () => {
      }
    },
    group: {
      type: String,
      default: () => {
      }
    },
    watchShallow: {
      type: Boolean,
      default: false
    },
    manualUpdate: {
      type: Boolean,
      default: false
    },
    autoResize: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      lastArea: 0,
      screenWidth: document.body.clientWidth,
      screenHeight: document.body.clientHeight,
      // do not write in methods,prevent init issue
      resizeHandler: throttle(() => {
        if (this.lastArea === 0) {
          // emulate initial render for initially hidden charts
          this.mergeOptions({}, true)
          this.resize()
          this.mergeOptions(this.options || this.manualOptions || {}, true)
        } else {
          this.resize()
        }
        this.lastArea = this.getArea()
      }, 1000)
    }
  },
  watch: {
    group (group) {
      this.chart.group = group
    }
  },
  created () {
    this.initOptionsWatcher()

    INIT_TRIGGERS.forEach(prop => {
      this.$watch(
        prop,
        () => {
          this.refresh()
        },
        { deep: true }
      )
    })

    REWATCH_TRIGGERS.forEach(prop => {
      this.$watch(prop, () => {
        this.initOptionsWatcher()
        this.refresh()
      })
    })
  },
  mounted () {
    if(this.autoResize){
      window.addEventListener('resize', this.resizeHandler)
    }

    // auto init if `options` is already provided
    if (!this.options) {
      return
    }
    this.init()
  },
  destroyed () {
    if (!this.chart) {
      return
    }
    this.destroy()
  },
  methods: {

    // provide an explicit merge option method
    mergeOptions (options, notMerge, lazyUpdate) {
      if (this.manualUpdate) {
        this.manualOptions = options
      }

      if (!this.chart) {
        this.init(options)
      } else {
        this.delegateMethod('setOption', options, notMerge, lazyUpdate)
      }
    },
    // just delegates ECharts methods to Vue component
    // use explicit params to reduce transpiled size for now
    appendData (params) {
      this.delegateMethod('appendData', params)
    },
    resize (options) {
      this.delegateMethod('resize', options)
    },
    dispatchAction (payload) {
      this.delegateMethod('dispatchAction', payload)
    },
    convertToPixel (finder, value) {
      return this.delegateMethod('convertToPixel', finder, value)
    },
    convertFromPixel (finder, value) {
      return this.delegateMethod('convertFromPixel', finder, value)
    },
    containPixel (finder, value) {
      return this.delegateMethod('containPixel', finder, value)
    },
    showLoading (type, options) {
      this.delegateMethod('showLoading', type, options)
    },
    hideLoading () {
      this.delegateMethod('hideLoading')
    },
    getDataURL (options) {
      return this.delegateMethod('getDataURL', options)
    },
    getConnectedDataURL (options) {
      return this.delegateMethod('getConnectedDataURL', options)
    },
    clear () {
      this.delegateMethod('clear')
    },
    dispose () {
      this.delegateMethod('dispose')
    },
    delegateMethod (name, ...args) {
      if (!this.chart) {
        this.init()
      }
      return this.chart[name](...args)
    },
    delegateGet (methodName) {
      if (!this.chart) {
        this.init()
      }
      return this.chart[methodName]()
    },
    getArea () {
      return this.$el.offsetWidth * this.$el.offsetHeight
    },
    init (options) {
      if (this.chart) {
        return
      }

      const chart = eCharts.init(this.$el, this.theme, this.initOptions)

      if (this.group) {
        chart.group = this.group
      }

      chart.setOption(options || this.manualOptions || this.options || {}, true)

      Object.keys(this.$listeners).forEach(event => {
        const handler = this.$listeners[event]

        if (event.indexOf('zr:') === 0) {
          chart.getZr().on(event.slice(3), handler)
        } else {
          chart.on(event, handler)
        }
      })

      Object.defineProperties(this, {
        // Only recalculated when accessed from JavaScript.
        // Won't update DOM on value change because getters
        // don't depend on reactive values
        width: {
          configurable: true,
          get: () => {
            return this.delegateGet('getWidth')
          }
        },
        height: {
          configurable: true,
          get: () => {
            return this.delegateGet('getHeight')
          }
        },
        isDisposed: {
          configurable: true,
          get: () => {
            return !!this.delegateGet('isDisposed')
          }
        },
        computedOptions: {
          configurable: true,
          get: () => {
            return this.delegateGet('getOption')
          }
        }
      })

      this.chart = chart
    },
    initOptionsWatcher () {
      if (this.__unwatchOptions) {
        this.__unwatchOptions()
        this.__unwatchOptions = null
      }

      if (!this.manualUpdate) {
        this.__unwatchOptions = this.$watch(
          'options',
          (val, oldVal) => {
            if (!this.chart && val) {
              this.init()
            } else {
              // mutating `options` will lead to merging
              // replacing it with new reference will lead to not merging
              // eg.
              // `this.options = Object.assign({}, this.options, { ... })`
              // will trigger `this.chart.setOption(val, true)
              // `this.options.title.text = 'Trends'`
              // will trigger `this.chart.setOption(val, false)`
              this.chart.setOption(val, val !== oldVal)
            }
          },
          { deep: !this.watchShallow }
        )
      }
    },
    destroy () {
      this.dispose()
      this.chart = null
    },
    refresh () {
      if (this.chart) {
        this.destroy()
        this.init()
      }
    }
  },
  connect (group) {
    if (typeof group !== 'string') {
      group = group.map(chart => chart.chart)
    }
    eCharts.connect(group)
  },
  disconnect (group) {
    eCharts.disConnect(group)
  },
  getMap (mapName) {
    return eCharts.getMap(mapName)
  },
  registerMap (mapName, geoJSON, specialAreas) {
    eCharts.registerMap(mapName, geoJSON, specialAreas)
  },
  registerTheme (name, theme) {
    eCharts.registerTheme(name, theme)
  },
  graphic: eCharts.graphic
}
</script>
