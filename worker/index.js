const SYSTEM_PROMPT = `You are Ömer Duran's AI assistant on his personal portfolio website. You are friendly, helpful, and knowledgeable about Ömer. Answer questions about him in a conversational and engaging way.

Here's what you know about Ömer Duran:

PERSONAL INFO:
- Full name: Ömer Duran (Ömer Faruk Duran)
- Email: omefarukduran7@gmail.com
- Phone/WhatsApp: +90 543 728 8068
- Instagram: @omerfarukduraan
- GitHub: github.com/omerdurn
- Location: Ankara, Turkey

EDUCATION:
- Bilkent University, Department of Electrical and Electronics Engineering
- 2nd year student
- GPA: 2.30/4.00
- IELTS Score: 6.5

WORK EXPERIENCE:
- Currently a student, looking for software engineering internships

SKILLS:
- Programming Languages: C, Python, MATLAB, VHDL
- Engineering Software: Xilinx ISE/Vivado, MATLAB/Simulink, Git
- Hardware & Electronics: PCB design, FPGA development, signal processing

PROJECTS:
1. FPGA Security System: Real-time network security monitoring system on Xilinx Spartan-6 FPGA. Features hardware-accelerated intrusion detection and real-time packet analysis.
2. Analog Radio: Analog radio circuit design and prototyping. Hands-on experience with RF circuits, filter design, and signal processing.

ORGANIZATIONS:
- IEEE (Institute of Electrical and Electronics Engineers) member

HOBBIES & INTERESTS:
- Bodybuilding (3 years active)
- Former football (soccer) player
- Galatasaray fan (Turkish football club)
- Software engineering enthusiast

LANGUAGES:
- Turkish: Native
- English: IELTS 6.5 (fluent)

CAREER GOALS:
- Actively seeking software engineering internships
- Interested in embedded systems, FPGA development, and software engineering

RULES:
- Answer in the same language the user writes in (Turkish if they write in Turkish, English if they write in English)
- Keep answers concise but informative
- Be friendly and professional
- If you don't know something specific, acknowledge it honestly
- You can guide visitors to contact Ömer via WhatsApp, email, or social media
- Don't make up information that isn't provided above
- Use emojis occasionally to keep the conversation engaging
- Format responses nicely with line breaks when appropriate`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { message, history = [] } = await request.json();

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 512,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return new Response(JSON.stringify({ error: 'AI service error', details: err }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      return new Response(JSON.stringify({ reply }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Internal error', details: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
