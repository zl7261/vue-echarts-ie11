import {Component, Prop, Watch} from 'vue-property-decorator'
import Vue from 'vue'
import eCharts from 'echarts'
import {throttle} from 'lodash'
import {Init_Trigger, Watch_Trigger} from '@/components/util'
import ECharts = echarts.ECharts

interface DataUrlParam {
  // Exporting format, can be either png, or jpeg
  type: string;
  // Resolution ratio of exporting image, 1 by default.
  pixelRatio: number;
  // Background color of exporting image, use backgroundColor in
  // option by default.
  backgroundColor: string;
  // Excluded components list. e.g. ['toolbox']
  excludeComponents?: string[];
}

@Component
export default class VueEChart extends Vue {
  @Prop({
    default: () => {
    }
  }) options!: eCharts.EChartOption
  @Prop({default: ''}) private theme!: string | object
  @Prop({
    default: () => {
    }
  }) initOptions!: {
    devicePixelRatio?: number;
    renderer?: string;
    width?: number | string;
    height?: number | string;
  }
  @Prop({default: ''}) group!: string
  @Prop({default: false}) watchShallow!: boolean
  @Prop({default: false}) manualUpdate!: boolean
  @Prop({default: false}) autoResize!: boolean

  lastArea = 0
  chart!: ECharts
  manualOptions!: echarts.EChartOption | echarts.EChartsResponsiveOption
  __unwatchOptions!: Function | null

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
    Init_Trigger.forEach(prop => {
      this.$watch(
      prop,
      () => {
        this.refresh()
      },
      {deep: true}
      )
    })

    Watch_Trigger.forEach(prop => {
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
      this.initChart()
      this.chart.setOption(options, notMerge, lazyUpdate)
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
    this.initChart()
    this.chart.appendData(params)
  }

  resize(options?: eCharts.EChartsResizeOption) {
    this.initChart()
    this.chart.resize(options)
  }

  dispatchAction(payload: object) {
    this.initChart()
    this.chart.dispatchAction(payload)
  }

  convertToPixel(finder: eCharts.EChartsConvertFinder, value: string | any[]) {
    this.initChart()
    return this.chart.convertToPixel(finder, value)
  }

  convertFromPixel(finder: eCharts.EChartsConvertFinder, value: string | any[]) {
    this.initChart()
    return this.chart.convertFromPixel(finder, value)
  }

  containPixel(finder: eCharts.EChartsConvertFinder, value: any[]) {
    this.initChart()
    return this.chart.containPixel(finder, value)
  }

  showLoading(type?: string, options?: eCharts.EChartsLoadingOption) {
    this.initChart()
    this.chart.showLoading(type, options)
  }

  hideLoading() {
    this.initChart()
    this.chart.hideLoading()
  }

  getDataURL(options: DataUrlParam) {
    return this.chart.getDataURL(options)
  }

  getConnectedDataURL(options: DataUrlParam) {
    this.initChart()
    return this.chart.getConnectedDataURL(options)
  }

  clear() {
    this.initChart()
    this.chart.clear()
  }

  dispose() {
    this.initChart()
    this.chart.dispose()
  }

  initChart() {
    if (this.chart) {
      return
    }
    this.init()
  }

  getArea() {
    let el = this.$el as (HTMLDivElement | HTMLCanvasElement)
    return el.offsetWidth * el.offsetHeight
  }

  init(options?: eCharts.EChartOption | eCharts.EChartsResponsiveOption) {
    if (this.chart) {
      return
    }

    let el = this.$el as (HTMLDivElement | HTMLCanvasElement)
    const chart = eCharts.init(el, this.theme, this.initOptions)

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
          this.initChart()
          return this.chart.getWidth()
        }
      },
      height: {
        configurable: true,
        get: () => {
          this.initChart()
          return this.chart.getHeight()
        }
      },
      isDisposed: {
        configurable: true,
        get: () => {
          this.initChart()
          return this.chart.isDisposed()
        }
      },
      computedOptions: {
        configurable: true,
        get: () => {
          this.initChart()
          return this.chart.getOption()
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


