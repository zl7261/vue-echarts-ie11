<template>
    <main>
        <aside class="renderer">
            <button :class="{active: initOptions.renderer === 'canvas'}"
                    @click="initOptions.renderer = 'canvas'">
                Canvas
            </button>
            <button :class="{active: initOptions.renderer === 'svg'}"
                    @click="initOptions.renderer = 'svg'">
                SVG
            </button>
        </aside>
        <h1>
            <a href="https://github.com/zl7261/vue-echarts-ie11">
                Vue-ECharts-ie11
            </a>
        </h1>
        <p class="desc">
            ECharts component for Vue.js.
            <br>
            No need webpack config setting for ie11 support.
        </p>

        <h2 id="bar">
            <a href="#bar">
                Bar chart
                <small>
                    (with async data &amp; custom theme)
                </small>
            </a>
            <button :class="{round: true,expand: expand.bar}"
                    @click="expand.bar = !expand.bar"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.bar">
            <figure>
                <chart :options="bar"
                       :init-options="initOptions"
                       ref="bar"
                       theme="ovilia-green"
                       @zr:click="handleZrClick"
                       @click="handleClick"
                />
            </figure>
            <p v-if="seconds <= 0">
                <small>
                    Loaded.
                </small>
            </p>
            <p v-else>
                <small>
                    Data coming in
                    <b>
                        {{ seconds }}
                    </b>
                    second{{seconds > 1 ? 's' : ''}}...
                </small>
            </p>
            <p>
                <button @click="refresh"
                        :disabled="seconds > 0">
                    Refresh
                </button>
            </p>
        </section>

        <h2 id="pie">
            <a href="#pie">
                Pie chart
                <small>
                    (with action dispatch)
                </small>
            </a>
            <button :class="{round: true,expand: expand.pie}"
                    @click="expand.pie = !expand.pie"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.pie">
            <figure>
                <chart ref="pie"
                       :options="pie"
                       :init-options="initOptions"
                       auto-resize
                />
            </figure>
        </section>

        <h2 id="polar">
            <a href="#polar">
                Polar plot
                <small>
                    (with built-in theme)
                </small>
            </a>
            <button :class="{round: true,expand: expand.polar}"
                    @click="expand.polar = !expand.polar"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.polar">
            <figure :style="polarTheme === 'dark' ? 'background-color: #333' : ''">
                <chart :options="polar"
                       :init-options="initOptions"
                       :theme="polarTheme"
                />
            </figure>
            <p>
                Theme
                <label>
                    <select v-model="polarTheme">
                        <option :value="null">Default</option>
                        <option value="dark">Dark</option>
                    </select>
                </label>
            </p>
        </section>

        <h2 id="scatter">
            <a href="#scatter">
                Scatter plot
                <small>
                    (with gradient)
                </small>
            </a>
            <button :class="{round: true,expand: expand.scatter}"
                    @click="expand.scatter = !expand.scatter"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.scatter">
            <figure>
                <chart :options="scatter"
                       :init-options="initOptions"
                />
            </figure>
        </section>

        <h2 id="map">
            <a href="#map">
                Map
                <small>
                    (with GeoJSON &amp; image converter)
                </small>
            </a>
            <button :class="{round: true,expand: expand.map}"
                    @click="expand.map = !expand.map"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.map">
            <figure style="background-color: #404a59;">
                <chart :options="map"
                       :init-options="initOptions"
                       ref="map"
                />
            </figure>
            <p>
                <button @click="convert">
                    Convert to image
                </button>
            </p>
        </section>

        <h2 id="radar">
            <a href="#radar">
                Radar chart
                <small>
                    (with Vuex integration)
                </small>
            </a>
            <button :class="{round: true,expand: expand.radar}"
                    @click="expand.radar = !expand.radar"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.radar">
            <figure>
                <chart :options="scoreRadar"
                       :init-options="initOptions"
                />
            </figure>
            <p>
                <label>
                    <select v-model="metricIndex">
                        <option v-for="(metric, index) in metrics"
                                :key="index"
                                :value="index">
                            {{ metric }}
                        </option>
                    </select>
                </label>
                <button @click="increase(1)"
                        :disabled="isMax">
                    Increase
                </button>
                <button @click="increase(-1)"
                        :disabled="isMin">
                    Decrease
                </button>
                <input id="async" type="checkbox" v-model="asyncCount"/>
                <label for="async">Async</label>
            </p>
        </section>

        <h2 id="connect">
            <a href="#connect">
                Connectable charts
            </a>
            <button :class="{round: true,expand: expand.connect}"
                    @click="expand.connect = !expand.connect"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.connect">
            <figure class="half">
                <chart :options="c1"
                       :init-options="initOptions"
                       group="radiance"
                       ref="c1"
                />
            </figure>
            <figure class="half">
                <chart :options="c2"
                       :init-options="initOptions"
                       group="radiance"
                       ref="c2"
                />
            </figure>
            <p>
                <label>
                    <input type="checkbox"
                           v-model="connected"/>
                    Connected
                </label>
            </p>
        </section>

        <h2 id="flight">
            <a href="#flight">
                Manual updates
            </a>
            <button :class="{round: true,expand: expand.flight}"
                    @click="expand.flight = !expand.flight"
                    aria-label="toggle"
            />
        </h2>
        <section v-if="expand.flight">
            <p>
                <small>
                    You may use <code>manual-update</code> prop for performance critical use cases.
                </small>
            </p>
            <p>
                <button :disabled="flightLoaded"
                        @click="loadFlights">
                    Load
                </button>
            </p>
            <figure style="background-color: #003;">
                <chart ref="flight"
                       :init-options="initOptions"
                       :options="flightOptions"
                />
            </figure>
        </section>

        <footer>
            <a href="https://github.com/zl7261"
               target="_blank">
                @zl7261
            </a>
            <a href="https://github.com/zl7261/vue-echarts-ie11/blob/master/LICENSE"
               target="_blank">
                MIT License
            </a>
            <a href="https://github.com/zl7261/vue-echarts-ie11"
               target="_blank">
                View on GitHub
            </a>
        </footer>

        <aside :class="{ modal: true, open }"
               @click="open = false">
            <img v-if="img.src"
                 :src="img.src"
                 :width="img.width"
            />
        </aside>

    </main>
</template>

<script>
import qs from 'qs'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/map'
import 'echarts/lib/chart/radar'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/chart/effectScatter'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/polar'
import 'echarts/lib/component/geo'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/title'
import 'echarts/lib/component/visualMap'
import 'echarts/lib/component/dataset'
import 'echarts/map/js/world'
import 'zrender/lib/svg/svg'
import 'echarts-liquidfill'
import ECharts from '@/components/ECharts.tsx'
import ChartFunction from '@/components/util'

import getBar from '@/demo/data/bar'
import pie from '@/demo/data/pie'
import polar from '@/demo/data/polar'
import scatter from '@/demo/data/scatter'
import map from '@/demo/data/map'
import { c1, c2 } from '@/demo/data/connect'
import store from '@/demo/store'

import 'echarts/theme/dark'
import theme from '@/demo/theme.json'

ChartFunction.registerTheme('ovilia-green', theme)

import chinaMap from '@/demo/map/china.json'
// registering map data
ChartFunction.registerMap('china', chinaMap)

// registering custom theme

export default {
  name: 'Demo',
  components: {
    chart: ECharts
  },
  store,
  data () {
    const options = qs.parse(location.search, { ignoreQueryPrefix: true })
    return {
      options,
      bar: getBar(),
      pie,
      polar,
      scatter,
      map,
      c1,
      c2,
      expand: {
        bar: true,
        pie: true,
        polar: true,
        scatter: true,
        map: true,
        radar: true,
        connect: true,
        flight: true
      },
      initOptions: {
        renderer: options.renderer || 'canvas'
      },
      polarTheme: 'dark',
      seconds: -1,
      asyncCount: false,
      connected: true,
      metricIndex: 0,
      open: false,
      img: {},
      flightLoaded: false,
      flightOptions: null
    }
  },
  computed: {
    scoreRadar () {
      return this.$store.getters.scoreRadar
    },
    metrics () {
      return this.$store.state.scores.map(({ name }) => name)
    },
    isMax () {
      const { value, max } = this.$store.state.scores[this.metricIndex]
      return value === max
    },
    isMin () {
      return this.$store.state.scores[this.metricIndex].value === 0
    }
  },
  methods: {
    handleClick () {
      console.log('click from echarts')
    },
    handleZrClick () {
      console.log('click from zrender')
    },
    refresh () {
      // simulating async data from server
      this.seconds = 3
      const bar = this.$refs.bar
      bar.showLoading({
        text: 'Loading…',
        color: '#4ea397',
        maskColor: 'rgba(255, 255, 255, 0.4)'
      })
      const timer = setInterval(() => {
        this.seconds--
        if (this.seconds === 0) {
          clearTimeout(timer)
          bar.hideLoading()
          this.bar = getBar()
        }
      }, 1000)
    },
    convert () {
      const map = this.$refs.map
      const { width, height } = map
      this.img = {
        src: map.getDataURL({
          pixelRatio: window.devicePixelRatio || 1
        }),
        width,
        height
      }
      this.open = true
    },
    increase (amount) {
      if (!this.asyncCount) {
        this.$store.commit('increment', {
          amount,
          index: this.metricIndex
        })
      } else {
        this.$store.dispatch('asyncIncrement', {
          amount,
          index: this.metricIndex,
          delay: 500
        })
      }
    },
    loadFlights () {
      this.flightLoaded = true

      const { flight } = this.$refs
      flight.showLoading({
        text: '',
        color: '#c23531',
        textColor: 'rgba(255, 255, 255, 0.5)',
        maskColor: '#003',
        zlevel: 0
      })
      import('./data/flight.json').then(({ default: data }) => {
        flight.hideLoading()

        function getAirportCoord (idx) {
          return [data.airports[idx][3], data.airports[idx][4]]
        }

        const routes = data.routes.map(function (airline) {
          return [getAirportCoord(airline[1]), getAirportCoord(airline[2])]
        })

        this.flightOptions = {
          title: {
            text: 'World Flights',
            left: 'center',
            textStyle: {
              color: '#eee'
            }
          },
          backgroundColor: '#003',
          tooltip: {
            formatter (param) {
              const route = data.routes[param.dataIndex]
              return (
              data.airports[route[1]][1] + ' > ' + data.airports[route[2]][1]
              )
            }
          },
          geo: {
            map: 'world',
            left: 0,
            right: 0,
            silent: true,
            itemStyle: {
              normal: {
                borderColor: '#003',
                color: '#005'
              }
            }
          },
          series: [
            {
              type: 'lines',
              coordinateSystem: 'geo',
              data: routes,
              large: true,
              largeThreshold: 100,
              lineStyle: {
                normal: {
                  opacity: 0.05,
                  width: 0.5,
                  curveness: 0.3
                }
              },
              // 设置混合模式为叠加
              blendMode: 'lighter'
            }
          ]
        }
      })
    }
  },
  watch: {
    connected: {
      handler (value) {
        ChartFunction[value ? 'connect' : 'disconnect']('radiance')
      },
      immediate: true
    },
    'initOptions.renderer' (value) {
      this.options.renderer = value === 'svg' ? value : undefined
      let query = qs.stringify(this.options)
      query = query ? '?' + query : ''
      history.pushState(
      {},
      document.title,
      `${location.origin}${location.pathname}${query}${location.hash}`
      )
    }
  },
  mounted () {
    let dataIndex = -1
    const pie = this.$refs.pie
    const dataLen = pie.options.series[0].data.length

    setInterval(() => {
      pie.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex
      })
      dataIndex = (dataIndex + 1) % dataLen
      pie.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex
      })
      // 显示 tooltip
      pie.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex
      })
    }, 1000)
  }
}
</script>

<style lang="scss">
* {
    box-sizing: border-box;

    &::before {
        box-sizing: border-box;
    }

    &::after {
        box-sizing: border-box;
    }
}

html {
    scroll-behavior: smooth;
    overflow: hidden;
    height: 100%;
}

body {
    margin: 0;
    padding: 3em 0 0;
    font-family: "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    color: #666;
    text-align: center;
    overflow: auto;
    height: 100%;
}

a {
    color: inherit;
    text-decoration: none;
}

h1 {
    margin-bottom: 1em;
    font-family: Dosis, "Source Sans Pro", "Helvetica Neue", Arial, sans-serif;
    color: #2c3e50;
    font-weight: 300;
}

h2 {
    color: #2c3e50;
    font-weight: 300;
    margin-top: 2em;
    padding-top: 1em;
    font-size: 1.2em;

    button {
        margin-left: 1em;
        vertical-align: middle;
    }

    small {
        opacity: 0.7;
    }
}

.desc {
    margin-bottom: 3em;
    color: #7f8c8d;
}

p {
    small {
        font-size: 0.8em;
        color: #7f8c8d;
    }

    line-height: 1.5;
}

pre {
    display: inline-block;
    padding: 0.8em;
    background-color: #f9f9f9;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.125);
    line-height: 1.1;
    color: #2973b7;
    font-family: "Roboto Mono", Monaco, courier, monospace;

    code {
        font-size: 0.8em;
    }
}

code {
    font-family: "Roboto Mono", Monaco, courier, monospace;
}

.attr {
    color: #e96900;
}

.val {
    color: #42b983;
}

footer {
    margin: 5em 0 3em;
    font-size: 0.5em;
    vertical-align: middle;

    a {
        display: inline-block;
        margin: 0 5px;
        padding: 3px 0 6px;
        color: #7f8c8d;
        font-size: 2em;
        text-decoration: none;
    }

    a:hover {
        color: deepskyblue;
        text-decoration: underline;
    }

    a:not(:last-child):after {
        content: '|';
        color: #000033;

    }
}

button {
    border: 1px solid #4fc08d;
    border-radius: 2em;
    background-color: #fff;
    color: #42b983;
    cursor: pointer;
    font: inherit;
    transition: opacity 0.3s;
    font-size: 0.75em;

    &:focus {
        outline: none;
        box-shadow: 0 0 1px #4fc08d;
    }

    &:active {
        background: rgba(79, 192, 141, 0.2);
    }
}

button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
}

button.round {
    width: 1.6em;
    height: 1.6em;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 1px;
        background-color: #42b983;
    }

    &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 1px;
        background-color: #42b983;
    }
}

button.round.expand {
    &::after {
        display: none;
    }
}

label {
    font-size: 0.75em;
}

figure {
    display: inline-block;
    position: relative;
    margin: 2em auto;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    box-shadow: 0 0 45px rgba(0, 0, 0, 0.2);
    padding: 1.5em 2em;
    min-width: calc(40vw + 4em);

    .echarts {
        width: 100%;
        min-width: 400px;
        height: 300px;
    }
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 1;

    img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #404a59;
        max-width: 80vw;
        border: 2px solid #fff;
        border-radius: 3px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
    }
}

.modal.open {
    display: block;
}

.renderer {
    position: fixed;
    top: 10px;
    left: 15%;
    font-size: 12px;
    text-align: center;

    button {
        float: left;
        position: relative;
        width: 75px;
        height: 55px;
        border-radius: 4px;
        margin-right: 16px;
        margin-bottom: 16px;

        &:first-child {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }

        &:last-child {
            left: -1px;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
    }

    button.active {
        z-index: 1;
        background-color: #4fc08d;
        color: #fff;
    }
}

@media (min-width: 980px) {
    figure.half {
        padding: 1em 1.5em;
        min-width: calc(240px + 3em);

        .echarts {
            width: 28vw;
            min-width: 240px;
            height: 180px;
        }

        &:not(:last-child) {
            margin-right: 15px;
        }
    }
}

@media (max-width: 980px) {
    p {
        display: flex;
        justify-content: center;

        select {
            text-indent: calc(50% - 1em);
            border: 1px solid #4fc08d;
            border-radius: 2em;
            background-color: #fff;
            color: #42b983;
            cursor: pointer;
            transition: opacity 0.3s;
            flex: 1 0;
            margin: 0 0.5em;
            padding: 0;
            line-height: 2.4em;
            max-width: 40vw;
            font-size: 0.8em;
            -webkit-appearance: none;
        }

        label {
            border: 1px solid #4fc08d;
            background-color: #fff;
            color: #42b983;
            cursor: pointer;
            transition: opacity 0.3s;
            flex: 1 0;
            margin: 0 0.5em;
            padding: 0;
            line-height: 2.4em;
            max-width: 40vw;
            border-radius: 2px;
            font-size: 0.8em;
        }

        button {
            flex: 1 0;
            margin: 0 0.5em;
            padding: 0;
            line-height: 2.4em;
            max-width: 40vw;
            border-radius: 2px;
            font-size: 0.8em;
        }

        input {
            flex: 1 0;
            margin: 0 0.5em;
            padding: 0;
            line-height: 2.4em;
            max-width: 40vw;
            border-radius: 2px;
            font-size: 0.8em;
        }

        input[type="checkbox"] {
            display: none;

            &:checked {
                + {
                    label {
                        background: #42b983;
                        color: #fff;
                    }
                }
            }
        }
    }
    figure {
        width: 100vw;
        margin: 1em auto;
        padding: 0 1em;
        border: none;
        border-radius: 0;
        box-shadow: none;

        .echarts {
            width: 100%;
            min-width: 0;
            height: 75vw;
        }
    }
}

</style>
