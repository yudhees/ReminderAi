import {TippyPlugin} from 'tippy.vue';
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import vLimit from '~/directive/v-limit';
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(TippyPlugin, {
        tippyDefaults: {
            theme: "light"
        },
    })
    nuxtApp.vueApp.directive("limit", vLimit);
})
