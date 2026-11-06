
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });

    const url = new URL(request.url);

    if (url.pathname !== "/chat") {
      return json({ error: "ZENEZ AI API is running." });
    }

    if (request.method !== "POST") {
      return json({ error: "POST method required." }, 405);
    }

    if (!env.GROQ_API_KEY) {
      return json({ error: "AI API key is not configured." }, 500);
    }

    try {
      const body = await request.json();

      const message = String(body.message || "").trim();
      const mode = String(body.mode || "chat");

      if (!message) {
        return json({ error: "Please enter a message." }, 400);
      }

      if (message.length > 12000) {
        return json({ error: "Message is too long. Please shorten it." }, 400);
      }

      const instructions = {
        chat: "You are ZENEZ AI, a helpful all-in-one AI assistant. Give clear and useful answers.",
        code: "You are an expert coding assistant. Explain code clearly and provide working examples.",
        image: "You are an image prompt expert. Create detailed prompts for AI image generators. You generate prompts, not images.",
        translate: "You are a professional translator. Translate the supplied text into the language requested by the user. If no target language is given, ask which language they want.",
        summarize: "You are an expert summarizer. Summarize the supplied content clearly using key points.",
        pdf: "You are a document assistant. Answer questions using the document text supplied by the user. If no document text is supplied, ask the user to paste it."
      };

      const systemPrompt =
        instructions[mode] || instructions.chat;

      const aiResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        }
      );

      const result = await aiResponse.json();

      if (!aiResponse.ok) {
        return json({
          error: result.error?.message || "AI provider request failed."
        }, aiResponse.status);
      }

      const reply =
        result.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      return json({ reply });

    } catch (error) {
      return json({
        error: "Server error: " + error.message
      }, 500);
    }
  }
};
