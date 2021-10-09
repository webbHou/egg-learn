/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    weChat: {
      appId: 'wx98d92796b3fdc994',
      appSecret: '162feb5f5251e66f307f90ffbf1c7eff',
      users: [ 'oZkcS6b9DXqW4P7o4Sdd8SgWixF4', 'oZkcS6VeMxwGa05G2trzVCfohR3A' ],
      birthday: '4fpqk9Y4z9pu8suu4XzbBLPTSnhiHW9Q7cUD7YlVREU',
      lover: 'OYtT4GJhpqYo_XIgaPAKkrmNTE4CO7rDomU2M3689Fs',
      normal: 'nmonl7HqZ_10TrIeL_2UaQ1J939pfZCedfpzS0HnDMU',
      reset: 'i3NApRFT9Unf2zw5NW5eBvQDNmwYBmXX-FiqYu4Yxm4',
      NICKNAME: '木木',
      NAME: '木木',
    },
    weather: {
      appId: '68198625',
      appSecret: 'OmvUTs10',
    },
    time: {
      love: '2020-9-17',
      birthday: '1994-3-10',
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1632711863815_5231';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
