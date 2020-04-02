import _ from 'echarts'

const ChartFunction = {
    connect(group: any) {
        if (typeof group !== 'string') {
            group = group.map((chart: any) => chart.chart)
        }
        _.connect(group)
    },
    disconnect(group: string) {
        _.disConnect(group)
    },
    getMap(mapName: string) {
        return _.getMap(mapName)
    },
    registerMap(mapName: string, geoJson: object, specialAreas?: object) {
        _.registerMap(mapName, geoJson, specialAreas)
    },
    registerTheme(themeName: string, theme: object) {
        _.registerTheme(themeName, theme)
    },
    graphic: _.graphic
}
export const Init_Trigger = ['theme', 'initOptions']

export const Watch_Trigger = ['manualUpdate', 'watchShallow']

export default ChartFunction
