# Cronotours

Agencia ficticia de viajes en el tiempo. Trabajo práctico de Organización Empresarial.

## Estructura

```
cronotours/
├── index.html      página completa
├── styles.css      estilos
├── script.js       chat e imágenes de reemplazo
├── api/chat.js     función de Vercel que conecta a Ramiro con la IA (Groq)
└── img/            tus 12 imágenes
```

## Imágenes

Guardalas en `img/` con estos nombres exactos (si falta alguna, la página muestra un recuadro en su lugar):

`hero.jpg`, `ramiro.jpg`, `paquete-jurasico.jpg`, `paquete-roma.jpg`, `paquete-egipto.jpg`, `paquete-futuro.jpg`, `book-1.jpg` a `book-6.jpg`

Tip: comprimilas antes de subirlas (por ejemplo en squoosh.app) para que la página cargue rápido.

## Publicar en Vercel

1. **Clave de la IA**: entrá a console.groq.com, creá una cuenta y generá una API key en "API Keys". Copiala, se muestra una sola vez.
2. **Subí el proyecto a GitHub**: creá un repositorio nuevo y subí esta carpeta tal cual (con la carpeta `api` adentro).
3. **Importalo en Vercel**: en vercel.com, "Add New → Project", elegí el repositorio. No hace falta tocar ninguna configuración de build.
4. **Cargá la clave**: antes de darle Deploy (o después, en Settings → Environment Variables), agregá:
   - Name: `GROQ_API_KEY`
   - Value: la clave de Groq
5. **Deploy**. Si cargaste la clave después del primer deploy, hacé "Redeploy" para que la tome.

Nunca pongas la clave dentro de `index.html` o `script.js`: cualquiera que abra la página podría verla.

## Probar en tu compu

Abriendo `index.html` con doble clic se ve todo menos el chat (la IA vive en el servidor). Para probar el chat localmente:

```
npm i -g vercel
vercel dev
```

## Cambiar la personalidad de Ramiro

Todo el comportamiento está en el texto `SYSTEM_PROMPT` al principio de `api/chat.js`. Editalo, guardá y volvé a subir.

Si Groq deja de ofrecer el modelo configurado, agregá en Vercel la variable `GROQ_MODEL` con el nombre de otro modelo de su lista.
