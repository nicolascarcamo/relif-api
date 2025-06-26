# Backend API - Automotora

Sistema backend emulador de Zeller para gestión de clientes de automotora con funcionalidades de seguimiento, análisis de deudas y generación automática de mensajes con IA.

## Características

- ✅ Base de datos PostgreSQL con Sequelize ORM
- ✅ Modelos relacionales (Client, Message, Debt)
- ✅ Generación automática de mensajes con OpenAI GPT
- ✅ Sistema de seguimiento de clientes
- ✅ Análisis de situación crediticia

## Modelos de Datos

### Client
- `id`: Integer (Primary Key)
- `name`: String (Nombre del cliente)  
- `rut`: String (RUT único)
- `email`: String (Email opcional)
- `phone`: String (Teléfono opcional)

### Message  
- `id`: Integer (Primary Key)
- `text`: Text (Contenido del mensaje)
- `role`: Enum ('client' | 'agent')
- `sentAt`: Date (Fecha de envío)
- `clientId`: Foreign Key

### Debt
- `id`: Integer (Primary Key)
- `institution`: String (Institución acreedora)
- `amount`: Integer (Monto de la deuda)
- `dueDate`: Date (Fecha de vencimiento)
- `clientId`: Foreign Key

## Endpoints

### GET /clients
Obtiene lista de todos los clientes
```bash
curl http://localhost:3000/clients
```

### GET /clients/:id  
Obtiene información completa de un cliente (con mensajes y deudas)
```bash
curl http://localhost:3000/clients/1
```

### GET /clients-to-do-follow-up
Obtiene clientes sin actividad en los últimos 7 días
```bash
curl http://localhost:3000/clients-to-do-follow-up
```

### POST /clients
Crea un nuevo cliente con mensajes y deudas
```bash
curl -X POST http://localhost:3000/clients \
-H "Content-Type: application/json" \
-d '{
  "name": "Juan Pérez",
  "rut": "11.111.111-1", 
  "email": "juan@email.com",
  "messages": [
    {
      "text": "Hola, quiero comprar un auto",
      "role": "client",
      "sentAt": "2023-12-24T10:00:00.000Z"
    }
  ],
  "debts": [
    {
      "institution": "Banco Estado",
      "amount": 500000,
      "dueDate": "2023-11-15T00:00:00.000Z"
    }
  ]
}'
```

### POST /clients/:id/message
Añade un mensaje a un cliente existente
```bash
curl -X POST http://localhost:3000/clients/1/message \
-H "Content-Type: application/json" \
-d '{
  "text": "Estoy interesado en un Toyota Corolla",
  "role": "client"
}'
```

### GET /clients/:id/generateMessage
Genera automáticamente un mensaje personalizado usando IA
```bash
curl http://localhost:3000/clients/1/generateMessage
```
## Servicio Cloud 

Para testear el servicio en la nube, puedes usar la siguiente URL para reemplazar `localhost` en los ejemplos anteriores:

```bash
https://automotora-backend-728608041686.us-central1.run.app/
```
Servicio deployeado en Google Cloud Run, con la misma funcionalidad que el local.

## Instalación

### Prerrequisitos
- Node.js 16+
- PostgreSQL 12+
- Docker 20+
- Cuenta OpenAI con API Key (se usa la proporcionada)

### Pasos

1. **Clonar e instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos
DB_NAME=automotora_db
DB_USER=postgres  
DB_PASSWORD=tu_password
DB_HOST=localhost
OPENAI_API_KEY=sk-tu-api-key-aqui
PORT=3000
```

3. **Ejecutar servidor**
```bash
# Iniciar el servidor
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Funcionalidades de IA

El endpoint `/clients/:id/generateMessage` utiliza GPT-3.5-turbo (como modelo simple y económico, para evitar un mal uso de la API Key) para generar respuestas personalizadas considerando:

- **Contexto del cliente**: Nombre, historial de conversación, situación crediticia
- **Información de la automotora**: Marcas disponibles (Toyota, Nissan, Hyundai, Kia, Chevrolet, Ford)
- **Sucursales**: Santiago Centro, Las Condes, Maipú, Ñuñoa  
- **Vendedor virtual**: Carlos Mendoza (personalidad amigable y profesional)
- **Situación crediticia**: Ajusta la oferta según deudas morosas

### Ejemplos de mensajes generados:

**Cliente sin deudas:**
> "¡Hola Juan! Soy Carlos de AutoMax Chile. Vi que estás interesado en comprar un auto. Tenemos excelentes opciones de Toyota y Nissan con financiamiento hasta 60 cuotas. ¿Te gustaría agendar una visita a nuestra sucursal de Las Condes?"

**Cliente con deudas morosas:**
> "Hola María, gracias por tu interés. Tenemos varios modelos disponibles para compra al contado. El Toyota Corolla 2024 está en promoción. ¿Cuál es tu presupuesto aproximado?"

Esto fue hecho tomando en consideración reglas de Prompt Engineering para asegurar que las respuestas sean relevantes y personalizadas. Se logró llegar a este prompt mediante un proceso de auto-refinación, pidiendole a un LLM que perfeccionara el prompt inicial:

"Necesito que, mediante reglas de prompt engineering, logres entregarme un prompt para emular un agente de ventas de la industria automotriz, que sirva para responder en un chat con clientes reales. La localidad especifica es Chile. Incluye en sus propiedades: Nombre, Sucursales (dentro de Santiago, Chile), Autos en catálogo (nuevos), Recomendación de modelos, Horario y Teléfono. A su vez, queremos considerar la situación del Cliente, por lo cual necesitaremos su Nombre, RUT, y Estado deudor (propiedades que serán entregadas mediante propiedades de objetos en JavaScript). Finalmente, incluir ademas el Historial de Conversación. Manten un discurso amable y profesional. Entregame a su vez recomendaciones e ideas para incluir dentro de las instrucciones de prompt, tales como restricciones."

Luego de varias iteraciones se llega al prompt final, el cual fue insertado en el código:


"Eres Carlos Mendoza, un experimentado vendedor de autos de AutoMax Chile. Debes responder de manera natural y humana al cliente ${client.name}.

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

Genera una respuesta apropiada. "

## Datos de Ejemplo

Al iniciar por primera vez, se crean automáticamente datos de ejemplo:
- 2 clientes con diferentes situaciones crediticias
- Mensajes de conversación 
- Una deuda morosa
- Cliente apto para follow-up (mensaje antiguo)

## Estructura del Proyecto

```
/
relif-api/
├── 📁 config/
│   └── database.js          # Configuración de base de datos
├── 📁 controllers/
│   └── clientController.js  # Controladores de negocio
├── 📁 middleware/
│   └── errorHandler.js      # Manejo de errores
├── 📁 models/
│   ├── index.js            # Exportación de modelos y relaciones
│   ├── Client.js           # Modelo Cliente
│   ├── Message.js          # Modelo Mensaje
│   └── Debt.js             # Modelo Deuda
├── 📁 routes/
│   └── clientRoutes.js     # Definición de rutas
├── 📁 scripts/
│   └── init-docker-postgres.js     # Inicialización de Docker para PostgreSQL
│   └── setup-database.js             # Creación de tablas y datos iniciales
├── 📁 services/
│   ├── clientService.js    # Lógica de negocio de clientes
│   └── aiService.js        # Servicio de IA
├── 📁 utils/
│   ├── databaseChecker.js    # Revisa conexión a la base de datos
│   └── seedData.js         # Datos de ejemplo
├── server.js               # Punto de entrada principal
├── package.json            # Dependencias y scripts
├── .env.example          # Ejemplo de archivo de variables de entorno
├── .env.production          # Variables de entorno para producción (Google Run)
├── .gitignore             # Archivos a ignorar por Git
├── .dockerignore          # Archivos a ignorar por Docker
├── Dockerfile              # Configuración de Docker
└── README.md               # Documentación

```

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: PostgreSQL, Sequelize ORM
- **IA**: OpenAI GPT-3.5-turbo
- **Otros**: CORS, dotenv 

## Supuestos

- En `GET /clients-to-do-follow-up`, se asume que un cliente necesita seguimiento si no se han enviado mensajes en los últimos 7 días, por parte tanto del cliente como del agente, dado que estimo que no queremos hostigar a los clientes con mensajes constantes.

## Testing

Puedes probar todos los endpoints usando los ejemplos de curl proporcionados 

Para verificar que todo funciona:

1. Obtener lista de clientes: `GET /clients`
2. Ver detalle de cliente: `GET /clients/1` 
3. Generar mensaje con IA: `GET /clients/1/generateMessage`
4. Crear nuevo cliente: `POST /clients`
5. Añadir mensaje a cliente: `POST /clients/1/message`
6. Buscar clientes para follow-up: `GET /clients-to-do-follow-up`

## Mejoras

El producto actual puede mejorarse de varias maneras. Primeramente, estableciendo una interfaz gráfica, un frontend amigable con el cliente. Por otro lado, desde el funcionamiento, se puede humanizar aún mas el robot entregandole datos de entrenamiento con casos reales, y realizando un RAG o Fine-Tuning de manera que pueda establecer criterios de negociación pertinentes y sepa derivar a un agente real en caso de necesitarlo. Ahondando mas, se puede a su vez generar un caché para consultas repetidas, de manera de no sobrecargar el uso del API de OpenAI y reducir costos para el funcionamiento de Zeller. Por último, creo que también puede ser pertinente el uso de Tablas, Mapas, e Histogramas para informar al usuario de mejor manera respecto al flujo de cambios en los precios, sucursales mas cercanas, y comparativa entre modelos de autos.
