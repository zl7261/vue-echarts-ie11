import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scores: [
      { name: 'AP', max: 20, value: 19 },
      { name: 'Armor', max: 20, value: 9 },
      { name: 'Haste', max: 20, value: 18 },
      { name: 'Strength', max: 20, value: 16 },
      { name: 'Constitution', max: 20, value: 16 },
      { name: 'Dexterity', max: 20, value: 20 }
    ]
  },
  getters: {
    scoreRadar ({ scores }) {
      return {
        title: {
          text: 'Ability Radar Chart'
        },
        tooltip: {},
        radar: {
          indicator: scores.map(({ name, max }) => {
            return { name, max }
          })
        },
        series: [
          {
            name: 'ability',
            type: 'radar',
            data: [{ value: scores.map(({ value }) => value) }]
          }
        ]
      }
    }
  },
  mutations: {
    increment ({ scores }, { amount = 1, index = 0 }) {
      const metric = scores[index]
      metric.value = Math.max(Math.min(metric.value + amount, metric.max), 0)
    }
  },
  actions: {
    asyncIncrement ({ commit }, { amount = 1, index, delay }) {
      setTimeout(() => {
        commit('increment', { amount, index })
      }, delay)
    }
  }
})
