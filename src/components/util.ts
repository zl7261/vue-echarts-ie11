import eCharts from 'echarts'

const EChartFunction = {
  connect(group: any) {
    if (typeof group !== 'string') {
      group = group.map((chart: any) => chart.chart)
    }
    eCharts.connect(group)
  },
  disconnect(group: string) {
    eCharts.disConnect(group)
  },
  getMap(mapName: string) {
    return eCharts.getMap(mapName)
  },
  registerMap(mapName: string, geoJson: object, specialAreas?: object) {
    eCharts.registerMap(mapName, geoJson, specialAreas)
  },
  registerTheme(themeName: string, theme: object) {
    eCharts.registerTheme(themeName, theme)
  },
  graphic: eCharts.graphic
}
export const INIT_TRIGGERS = ['theme', 'initOptions']
export const REWATCH_TRIGGERS = ['manualUpdate', 'watchShallow']

export type EChartsFunction =
'setOption'
| 'appendData'
| 'resize'
| 'dispatchAction'
| 'convertToPixel'
| 'convertFromPixel'
| 'containPixel'
| 'showLoading'
| 'hideLoading'
| 'getDataURL'
| 'getConnectedDataURL'
| 'clear'
| 'dispose'

export default EChartFunction
