import ECharts from '../components/ECharts'
import eCharts from 'echarts'


export declare class VueECharts extends ECharts {
    /**
     * {EChartsOptionConfig} [opts] Options about how to setOption
     */
    options: eCharts.EChartOption
    /**
     * initial eCharts options
     */
    initOptions: eCharts.EChartOption
    /**
     * Group name to be used in chart connection
     */
    group: string

    watchShallow: boolean

    manualUpdate: boolean

    autoResize: boolean

    mergeOptions: (options: eCharts.EChartOption | eCharts.EChartsResponsiveOption, notMerge?: boolean, lazyUpdate?: boolean) => any
}
