// server/api/chat.post.ts

import { defineEventHandler, readBody, createError, setResponseHeader, sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  const { model, params } = await readBody(event)

  if (!model || !params) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing chat model or params",
    })
  }

  const config = {
    max_tokens: params.maxTokens,
    temperature: params.temperature,
    top_p: params.topP,
    top_k: params.topK,
    frequency_penalty: params.frequencyPenalty,
    presence_penalty: params.presencePenalty,
    repetition_penalty: params.repetitionPenalty,
    stream: params.stream,
  }

  // ✅ مسار خاص لـ DeepSeek
  if (model === 'deepseek-chat') {
    const apiKey = process.env.DEEPSEEK_API_KEY
    const endpoint = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com'

    const response = await fetch(`${endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: params.systemPrompt
          ? [{ role: 'system', content: params.systemPrompt }, ...params.messages]
          : params.messages,
        ...config,
      }),
    })

    if (!params.stream) {
      const result = await response.json()
      return result.choices?.[0]?.message?.content || ''
    }

    // دعم الرد المتدفق
    const reader = response.body?.getReader()
    const encoder = new TextEncoder()

    setResponseHeader(event, 'Content-Type', 'text/event-stream')
    const send = (data: string) => {
      event.node.res.write(encoder.encode(`data: ${data}\n\n`))
    }

    if (reader) {
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += new TextDecoder().decode(value)
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const json = line.slice(6).trim()
            if (json === '[DONE]') {
              send('[DONE]')
              event.node.res.end()
              return
            }

            try {
              const parsed = JSON.parse(json)
              const text = parsed.choices?.[0]?.delta?.content
              if (text) send(JSON.stringify({ response: text }))
            } catch (err) {
              console.error('Parse error:', err)
            }
          }
        }
      }
    }

    event.node.res.end()
    return
  }

  // ✅ Default path for non-DeepSeek models via hubAI
  try {
    const ai = hubAI()
    // Check if the AI client is properly initialized
    if (!ai || typeof ai !== 'object' || !('run' in ai)) {
      throw new Error('Failed to initialize AI client')
    }
    
    const result = await (ai as any).run(model, {
      messages: params.systemPrompt
        ? [{ role: 'system', content: params.systemPrompt }, ...params.messages]
        : params.messages,
      ...config,
    })

    if (params.stream && result instanceof ReadableStream) {
      setResponseHeader(event, 'Content-Type', 'text/event-stream')
      setResponseHeader(event, 'Cache-Control', 'no-cache')
      setResponseHeader(event, 'Connection', 'keep-alive')

      const reader = result.getReader()
      const encoder = new TextEncoder()

      // Create a ReadableStream for the response
      const stream = new ReadableStream({
        async pull(controller) {
          try {
            const { done, value } = await reader.read()
            if (done) {
              controller.close()
              return
            }
            const chunk = new TextDecoder().decode(value)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: chunk })}\n\n`))
          } catch (error) {
            console.error('Stream error:', error)
            controller.error(error)
          }
        }
      })

      return sendStream(event, stream)
    }
    

    return (result as { response: string })?.response || result
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error processing request',
    })
  }
})
