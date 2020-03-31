import {Component, Prop, Watch} from 'vue-property-decorator'
import Vue from 'vue'
// @ts-ignore
import eCharts from 'echarts'
// @ts-ignore
import {throttle} from 'lodash'
import ECharts = echarts.ECharts
import {EChartsFunction, INIT_TRIGGERS, REWATCH_TRIGGERS} from '@/components/index'

interface DataUrlParam {
  // Exporting format, can be either png, or jpeg
  type?: string;
  // Resolution ratio of exporting image, 1 by default.
  pixelRatio?: number;
  // Background color of exporting image, use backgroundColor in
  // option by default.
  backgroundColor?: string;
  // Excluded components list. e.g. ['toolbox']
  excludeComponents?: string[];
}

@Component
export default class VueEChart extends Vue {
  @Prop({
    default: () => {
    }
  }) private options!: object
  @Prop({default: ''}) private theme!: string | object
  @Prop({
    default: () => {
    }
  }) initOptions!: object
  @Prop({default: ''}) group!: string
  @Prop({default: false}) watchShallow!: boolean
  @Prop({default: false}) manualUpdate!: boolean
  @Prop({default: false}) autoResize!: boolean

  lastArea = 0
  chart!: ECharts
  manualOptions!: echarts.EChartOption | echarts.EChartsResponsiveOption
  private __unwatchOptions: any

  // do not write in methods,prevent init issue
  resizeHandler = throttle(() => {
    if (this.lastArea === 0) {
      // emulate initial render for initially hidden charts
      this.mergeOptions({}, true)
      this.resize()
      this.mergeOptions(this.options || {}, true)
    } else {
      this.resize()
    }
    this.lastArea = this.getArea()
  }, 1000)

  @Watch('group')
  onGroupChange(group: string) {
    this.chart.group = group
  }

  created() {
    this.initOptionsWatcher()
    INIT_TRIGGERS.forEach(prop => {
      this.$watch(
      prop,
      () => {
        this.refresh()
      },
      {deep: true}
      )
    })

    REWATCH_TRIGGERS.forEach(prop => {
      this.$watch(prop, () => {
        this.initOptionsWatcher()
        this.refresh()
      })
    })
  }

  mounted() {
    if (this.autoResize) {
      window.addEventListener('resize', this.resizeHandler)
    }

    // auto init if `options` is already provided
    if (!this.options) {
      return
    }
    this.init()
  }

  destroyed() {
    if (!this.chart) {
      return
    }
    this.destroy()
  }

  initOptionsWatcher() {
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
      {deep: !this.watchShallow}
      )
    }
  }

  // provide an explicit merge option method
  mergeOptions(options: eCharts.EChartOption | eCharts.EChartsResponsiveOption, notMerge?: boolean, lazyUpdate?: boolean) {
    if (this.manualUpdate) {
      this.manualOptions = options
    }

    if (!this.chart) {
      this.init(options)
    } else {
      this.delegateMethod('setOption', options, notMerge, lazyUpdate)
    }
  }

  // just delegates ECharts methods to Vue component
  // use explicit params to reduce transpiled size for now
  appendData(params: {
    // Specify which series the data will be appended to.
    seriesIndex?: string;
    // The data to be appended.
    data?: any[] | eCharts.TypedArray;
  }) {
    this.delegateMethod('appendData', params)
  }

  resize(options?: eCharts.EChartsResizeOption) {
    this.delegateMethod('resize', options)
  }

  dispatchAction(payload: object) {
    this.delegateMethod('dispatchAction', payload)
  }

  convertToPixel(finder: eCharts.EChartsConvertFinder, value: string | any[]) {
    return this.delegateMethod('convertToPixel', finder, value)
  }

  convertFromPixel(finder: eCharts.EChartsConvertFinder, value: string | any[]) {
    return this.delegateMethod('convertFromPixel', finder, value)
  }

  containPixel(finder: eCharts.EChartsConvertFinder, value: any[]) {
    return this.delegateMethod('containPixel', finder, value)
  }

  showLoading(type?: string, options?: eCharts.EChartsLoadingOption) {
    this.delegateMethod('showLoading', type, options)
  }

  hideLoading() {
    this.delegateMethod('hideLoading')
  }

  getDataURL(options: DataUrlParam) {
    return this.delegateMethod('getDataURL', options)
  }

  getConnectedDataURL(options: DataUrlParam) {
    return this.delegateMethod('getConnectedDataURL', options)
  }

  clear() {
    this.delegateMethod('clear')
  }

  dispose() {
    this.delegateMethod('dispose')
  }

  delegateMethod(name: EChartsFunction, ...args: any[]) {
    if (!this.chart) {
      this.init()
    }
    // @ts-ignore
    return this.chart[name](...args)
  }

  delegateGet(methodName: string) {
    if (!this.chart) {
      this.init()
    }
    // @ts-ignore
    return this.chart[methodName]()
  }

  getArea() {
    // @ts-ignore
    return this.$el.offsetWidth * this.$el.offsetHeight
  }

  init(options?: any) {
    if (this.chart) {
      return
    }

    // @ts-ignore
    const chart = eCharts.init(this.$el, this.theme, this.initOptions)

    if (this.group) {
      chart.group = this.group
    }

    chart.setOption(options || this.options || {}, true)

    Object.keys(this.$listeners).forEach(event => {
      const handler = this.$listeners[event]

      if (event.indexOf('zr:') === 0) {
        // @ts-ignore
        chart.getZr().on(event.slice(3), handler)
      } else {
        // @ts-ignore
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
  }

  destroy() {
    this.dispose()
    delete this.chart
  }

  refresh() {
    if (this.chart) {
      this.destroy()
      this.init()
    }
  }


  render() {
    return (
    <div class="echarts">
    </div>
    )
  }

}


