/**
 * 微信云函数 — 登录
 *
 * 小程序调用 wx.cloud.callFunction({ name: 'wxLogin' })
 * 云函数原生获取 OPENID，无需 jscode2session
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};
