// server/api/deepseek-models.get.ts
export default defineEventHandler(() => {
    return {
      models: [
        { id: 'deepseek-chat', name: 'DeepSeek Chat' },
        { id: 'deepseek-coder', name: 'DeepSeek Coder' }
      ]
    }
  })