export default {
  title: {
    text: 'Pie Chart High-Light Demo',
    x: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ['web page', 'mail ads', 'campaign', 'video', 'search engine']
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: '55%',
      center: ['50%', '60%'],
      data: [
        { value: 335, name: 'web page' },
        { value: 310, name: 'mail ads' },
        { value: 234, name: 'campaign' },
        { value: 135, name: 'video' },
        { value: 1548, name: 'search engine' }
      ],
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}
