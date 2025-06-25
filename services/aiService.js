const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateMessage(client) {
    try {
      const hasDelinquentDebts = client.debts && client.debts.length > 0;
      
      const conversationHistory = client.messages
        ?.map(msg => `${msg.role === 'client' ? 'Cliente' : 'Agente'}: ${msg.text}`)
        .join('\n') || 'Esta es la primera interacción con el cliente';

      const prompt = this._buildPrompt(client, hasDelinquentDebts, conversationHistory);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating AI message:', error);
      throw new Error('Error al generar mensaje con IA');
    }
  }

  _buildPrompt(client, hasDelinquentDebts, conversationHistory) {
    return `Eres Carlos Mendoza, un experimentado vendedor de autos de AutoMax Chile. Debes responder de manera natural y humana al cliente ${client.name}.

INFORMACIÓN DE LA EMPRESA:
- Nombre: AutoMax Chile
- Sucursales: Santiago Centro, Las Condes, Maipú, Ñuñoa
- Vendemos solo autos nuevos de las marcas: Toyota, Nissan, Hyundai, Kia, Chevrolet, Ford
- Modelos populares: Toyota Corolla, Nissan Sentra, Hyundai Accent, Kia Rio, Chevrolet Spark, Ford Fiesta
- Horario: Lunes a Viernes 9:00-19:00, Sábados 9:00-18:00
- Teléfono: +56 2 2555-0123

SITUACIÓN DEL CLIENTE:
- Nombre: ${client.name}
- RUT: ${client.rut}
- Estado crediticio: ${hasDelinquentDebts ? 'Tiene deudas morosas (NO PUEDE ACCEDER A FINANCIAMIENTO)' : 'Sin deudas morosas (PUEDE ACCEDER A FINANCIAMIENTO)'}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory}

INSTRUCCIONES:
1. Responde como Carlos Mendoza, de manera amigable y profesional
2. Si el cliente tiene deudas morosas, menciona que solo puede comprar al contado
3. Si no tiene deudas, menciona las opciones de financiamiento disponibles
4. Ofrece agendar una visita a alguna sucursal
5. Pregunta por sus preferencias de marca, modelo, presupuesto
6. Mantén un tono conversacional y natural
7. No menciones que eres una IA
8. Máximo 150 palabras

Genera una respuesta apropiada:`;
  }
}

module.exports = AIService;