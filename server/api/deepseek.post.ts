// server/api/deepseek.post.ts
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { messages, model = "deepseek-chat", temperature = 0.7 } = body
  
    const response = await $fetch(process.env.DEEPSEEK_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      })
    })
  
    return response
  })