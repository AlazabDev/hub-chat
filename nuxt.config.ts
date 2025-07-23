// https://nuxt.com/docs/api/configuration/nuxt-config
  /**
   * The default export is a function that returns an object.
   * The returned object is the Nuxt configuration.
   *
   * @returns {import('@nuxt/schema').NuxtConfig} Nuxt configuration
   */
export default defineNuxtConfig({
  compatibilityDate: "2025-03-01",

  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },

  // https://nuxt.com/modules
  modules: ["@nuxthub/core", "@nuxt/eslint", "@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    ai: true,
    cache: true,
    workers: true,
  },

  // Runtime configuration
  runtimeConfig: {
    public: {
      deepseekApiUrl: process.env.DEEPSEEK_API_URL,
    },
    deepseekApiKey: process.env.DEEPSEEK_API_KEY
  },

  // https://devtools.nuxt.com
  devtools: { enabled: true }
});