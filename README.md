# MJ 3D | Catálogo de Navidad 2026

Sitio estático (sin build): `index.html`, `core.js`, `tree.json` (árbol 3D) e `img/`.

## Para completar antes de publicar al cliente

- **WhatsApp:** `WA_NUMBER` en `core.js` (formato internacional sin `+`, por ejemplo `5493472XXXXXX`).
- **Google Analytics 4:** `window.GA_ID` en el `<head>` de `index.html` (`G-XXXXXXX`). Vacío = no se carga nada.
- Nombres, precios y colores de los productos: `PRODUCTS` en `index.html` (hoy son provisorios, precio `null` = "Consultar precio").

## Eventos que se miden

| Evento | Cuándo | Datos |
| --- | --- | --- |
| `view_item` | se abre la ficha de un producto | `item_id`, `item_name`, `item_category` |
| `select_color` | se elige un color (ficha o tarjeta) | `item_name`, `color`, `place` |
| `filter_category` | se filtra una categoría | `category` |
| `contact_whatsapp` | se toca un botón de WhatsApp | `place`; desde la ficha también `item_name` y `color` |

En GA4 conviene marcar `contact_whatsapp` como evento clave y registrar `item_name`, `color` y `place` como dimensiones personalizadas.

## Créditos

Árbol 3D basado en "XMas Tree" de anybody (Sketchfab), CC BY 4.0.
