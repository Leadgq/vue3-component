import { inject } from 'vue';

// 全局配置的 Injection Key
export const YO_CONFIG_KEY = Symbol('YO_CONFIG');

/**
 * 获取全局配置的 Hook
 * @returns {Object} 全局配置对象
 */
export const useYoConfig = () => {
    return inject(YO_CONFIG_KEY, {
        attachApi: ''
    });
};
