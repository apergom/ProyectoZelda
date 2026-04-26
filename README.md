# Proyecto Zelda: Enciclopedia Web

## 1. Descripción del proyecto
He desarrollado esta aplicación web como una enciclopedia interactiva sobre el universo de The Legend of Zelda. Mi objetivo principal ha sido crear una herramienta donde los usuarios puedan buscar personajes y juegos utilizando una API externa, guardar sus elementos favoritos, organizarlos y cargar un catálogo local en formato XML para visualizarlo y exportarlo posteriormente a un archivo CSV.

## 2. Tecnologías y herramientas
Para construir este proyecto he utilizado:
- **HTML5 y CSS3**: Para la estructura y un diseño visual basado en la paleta de colores típica de la saga Zelda.
- **JavaScript Vanilla (ES6)**: Para toda la lógica, utilizando módulos (`import`/`export`) sin depender de frameworks externos.
- **DOMParser**: Lo he elegido para leer y convertir el archivo estático `juegos.xml` a un formato JSON nativo en el navegador. Como alternativa, si hubiera desarrollado un backend en Node.js, habría usado librerías como `xml2js`.
- **Blob API**: Para la generación y descarga automática del archivo CSV. Una alternativa más robusta que consideré fue usar la librería `PapaParse` (muy potente para CSV), pero dada la estructura plana y sencilla de mi catálogo, hacerlo manualmente era más eficiente.
- **Fetch API**: Para consumir la API REST. Descarté usar librerías de terceros como `Axios` porque `fetch` ya viene integrado de forma nativa en los navegadores modernos y cumplía perfectamente con los requisitos.

## 3. La Zelda API
He integrado la [Zelda API](https://zelda.fanapis.com/) externa para alimentar el buscador en tiempo real.
- **Endpoints utilizados**:
    - `/api/characters?name={termino}`: Para buscar personajes.
    - `/api/games?name={termino}`: Para buscar juegos de la saga.
- **Integración**: Uso `fetch` para hacer peticiones GET asíncronas (`async`/`await`). Durante el desarrollo me topé con un bloqueo de seguridad CORS del navegador al hacer peticiones desde `localhost`. Para solucionarlo, implementé un proxy libre (`corsproxy.io`) que añade las cabeceras necesarias para saltarse esta restricción de forma segura.
- **Ejemplo de respuesta real**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "name": "Link",
        "description": "The hero of Hyrule, chosen by the Master Sword.",
        "id": "5f6ce9d805615a85623cc2c5"
      }
    ]
  }
  ```
  De esta respuesta extraigo y utilizo el `id` (imprescindible para la lógica interna de guardar o borrar favoritos exactos), el `name` (para el título de la tarjeta) y la `description` (para mostrar la información al usuario).

## 4. Formatos de datos
Durante el desarrollo del proyecto he trabajado activamente con tres formatos distintos, cada uno con su propósito:
- **JSON**: Es el formato en el que me responde la Zelda API y con el que trabajo la memoria local. Lo prefiero para el intercambio de datos web porque es ligero, rápido de parsear y nativo para JavaScript.
- **XML**: Lo he utilizado para almacenar el catálogo estático de juegos (`juegos.xml`). Es más verboso que JSON, pero resulta excelente para estructurar documentos con validación estricta mediante etiquetas semánticas y esquemas (XSD).
- **CSV**: Lo uso como formato final para la función de exportación del catálogo. Es un formato de texto plano separado por comas, ideal para que el usuario final pueda abrir los datos cómodamente en aplicaciones como Microsoft Excel.

## 5. Esquemas y Validación
Para asegurar que los datos con los que trabajo tienen la estructura y los tipos de datos correctos, he creado dos mecanismos de validación:
- **`entidad_schema.json`**: Es un JSON Schema creado para validar los objetos que devuelve la Zelda API. He marcado explícitamente los campos `id` y `name` como **`required`** (obligatorios). El `id` es crítico porque sin él la aplicación no podría identificar unívocamente qué favorito borrar o añadir, y el `name` es indispensable para que la interfaz gráfica no muestre tarjetas en blanco. Sin embargo, el campo `description` no es obligatorio, ya que he programado la interfaz para mostrar un texto por defecto en caso de que la API devuelva una entidad sin descripción. He comprobado su validez usando herramientas online como JSONLint.
- **`juegos.xsd`**: Es un esquema XSD que valida la estructura exacta de mi `juegos.xml`. Asegura que exista una etiqueta raíz `<saga>` que contiene elementos `<juego>`. He definido explícitamente que los campos `anio` y `puntuacion` deben ser numéricos (`xs:integer`), mientras que el resto son cadenas de texto (`xs:string`). He enlazado este esquema al XML usando el atributo `xsi:noNamespaceSchemaLocation` y lo he validado con herramientas como FreeFormatter.

## 6. Almacenamiento (Por qué NO uso Firebase)
Originalmente, la arquitectura técnica de este proyecto contemplaba usar **localStorage** para la caché de búsquedas y **Firestore (Firebase)** para guardar de forma persistente la lista de favoritos.

Sin embargo, **tomé la decisión técnica de desechar la implementación de Firebase y utilizar exclusivamente `localStorage` para todo**.
¿El motivo? En un proyecto formativo anterior, cometí un error al programar un bucle que provocó miles de operaciones de escritura por segundo en mi base de datos de Firestore. Esto agotó mi cuota gratuita al instante, bloqueó mi cuenta y corrompió los datos. A raíz de este problema técnico, preferí diseñar esta entrega como una aplicación "Zero-Backend" (sin dependencias externas de bases de datos), garantizando así que funcionará al 100% de manera robusta y autónoma durante su evaluación.

**Análisis teórico de las alternativas de almacenamiento:**
- **localStorage**: Es la tecnología que finalmente he implementado. Es síncrona, muy rápida y guarda datos en el navegador del usuario de forma persistente incluso si se cierra la ventana.
    - *Limitaciones para favoritos*: Si el usuario usa otro navegador, entra en modo incógnito o borra el historial, pierde sus favoritos. No permite sincronizar datos entre un móvil y un PC.
- **Firestore (Firebase)**: Habría sido la solución ideal para los favoritos, al ser una base de datos NoSQL alojada en la nube y sincronizada en tiempo real.
    - *Reglas de seguridad*: En fase de pruebas, las reglas de Firestore permiten acceso global. Si lo subiera a producción, implementaría *Firebase Authentication* y aplicaría reglas de seguridad estrictas (ej. `allow read, write: if request.auth != null && request.auth.uid == userId;`), asegurando que cada usuario solo pudiera leer y modificar sus propios favoritos.
- **sessionStorage**: Similar a localStorage, pero los datos se destruyen automáticamente al cerrar la pestaña. Me parecía inútil para guardar favoritos, ya que el objetivo es que perduren.
- **Cookies**: Tienen un límite de peso muy pequeño (unos 4KB), comparado con los 5MB de localStorage. Las usaría para enviar pequeños *tokens* de sesión al servidor, pero son totalmente inadecuadas para guardar arrays de objetos JSON complejos como mi lista de favoritos.

## 7. Decisiones técnicas destacadas
1. **Implementación de un 'Debounce'**: He programado un temporizador (500ms) en la entrada de texto del buscador. De este modo, evito lanzar una petición a la API de Zelda por cada letra que el usuario teclea. Esto mejora drásticamente el rendimiento web y evita que el servidor me bloquee por saturarlo a peticiones.
2. **Caché en LocalStorage con clave compuesta**: Antes de pedir datos a internet, mi código comprueba si ya hemos buscado ese término exacto antes. Lo hago guardando la respuesta de la API en `localStorage` usando una clave que combina la categoría y el nombre (ej. `zelda_characters_link`). Esto ahorra ancho de banda y hace que búsquedas repetidas carguen instantáneamente.

## 8. Instrucciones de uso
1. Clona este repositorio o descárgalo en tu equipo.
2. Abre la carpeta del proyecto en tu editor de código (como Visual Studio Code).
3. Debido al uso de módulos nativos de JavaScript (`type="module"`) y a las peticiones `fetch` para acceder al archivo local `juegos.xml`, **el navegador bloqueará la ejecución por seguridad si abres el archivo HTML haciendo doble clic**.
4. **Es obligatorio ejecutar el proyecto a través de un servidor local.** Te recomiendo instalar la extensión **Live Server** en VS Code. Haz clic derecho sobre el archivo `index.html` y selecciona *"Open with Live Server"*.
5. *Nota sobre la configuración de Firebase (Teórica)*: Si en el futuro decidiera restaurar la base de datos en la nube, los pasos requeridos serían: crear un proyecto en la consola web de Firebase, obtener el objeto `firebaseConfig`, añadir el SDK al `index.html` mediante un `<script type="module">`, e inicializar la aplicación llamando a las funciones `getFirestore()`, `collection()` y `addDoc()`.