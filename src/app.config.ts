export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/assessment/index',
    'pages/roi/index',
    'pages/profile/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#eef0f4',
    navigationBarTitleText: 'OPC创业罗盘',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#9298a8',
    selectedColor: '#C5A059',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    custom: true,
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/assessment/index', text: '测评' },
      { pagePath: 'pages/roi/index', text: 'ROI' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
});
