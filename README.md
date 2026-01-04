# 🍗 MolleVentas - Sistema de Ventas

Sistema de registro de ventas para negocio de mollejitas fritas y acompañamientos.

## 📋 Descripción del Proyecto

MolleVentas es un sistema de ventas diseñado para un puesto ambulante/legal que vende:
- Mollejitas fritas con papas, ensalada o yuca
- Cremas variadas
- Café y refrescos

El sistema está diseñado para ser **escalable**, permitiendo agregar funcionalidades progresivamente.

---

## ✅ Funcionalidades Implementadas (v1.0)

### Registro de Ventas Diarias
- ✅ Registrar venta del día con monto total en soles
- ✅ Especificar fecha de la venta
- ✅ Agregar nombre del vendedor (ej: Marta)
- ✅ Registrar horario de trabajo (hora inicio - hora fin)
- ✅ Agregar notas opcionales sobre el día

### Historial y Visualización
- ✅ Ver historial completo de ventas
- ✅ Filtrar por: Todos / Esta Semana / Este Mes
- ✅ Visualización ordenada por fecha (más reciente primero)
- ✅ Indicador visual del día de la semana

### Estadísticas en Tiempo Real
- ✅ Ventas de hoy (S/)
- ✅ Ventas del mes (S/)
- ✅ Total de registros

### Gestión de Datos
- ✅ Editar ventas existentes
- ✅ Eliminar ventas con confirmación
- ✅ Datos persistentes en base de datos

---

## 🗂️ Estructura del Proyecto

```
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos personalizados
├── js/
│   └── app.js          # Lógica de la aplicación
└── README.md           # Documentación
```

---

## 🔗 URIs y Endpoints

### Página Principal
- **`/index.html`** - Interfaz principal del sistema

### API de Datos (RESTful)
- **`GET /tables/ventas_diarias`** - Listar ventas
- **`POST /tables/ventas_diarias`** - Crear nueva venta
- **`PUT /tables/ventas_diarias/{id}`** - Actualizar venta
- **`DELETE /tables/ventas_diarias/{id}`** - Eliminar venta

---

## 📊 Modelo de Datos

### Tabla: `ventas_diarias`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | text | Identificador único (UUID) |
| `fecha` | datetime | Fecha de la venta |
| `monto` | number | Monto vendido en soles |
| `vendedor` | text | Nombre del vendedor |
| `hora_inicio` | text | Hora de inicio del turno |
| `hora_fin` | text | Hora de fin del turno |
| `notas` | text | Notas adicionales |

---

## 🚀 Funcionalidades Futuras (Roadmap)

### Fase 2 - Control de Insumos
- [ ] Registro de consumo de gas (balón)
- [ ] Control de aceite utilizado
- [ ] Registro de cremas (tipos y cantidades)
- [ ] Control de refrescos y café

### Fase 3 - Análisis de Costos
- [ ] Calcular ganancia neta por día
- [ ] Costo de insumos por venta
- [ ] Margen de ganancia

### Fase 4 - Análisis de Datos
- [ ] Gráficos de ventas por período
- [ ] Identificar días/temporadas de mayor venta
- [ ] Análisis de consumo de cremas
- [ ] Preferencias de clientes por acompañamiento

### Fase 5 - Reportes
- [ ] Resumen semanal/mensual
- [ ] Exportar datos a Excel/PDF
- [ ] Proyecciones de ventas

---

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **Tailwind CSS** - Estilos utility-first
- **JavaScript ES6+** - Lógica del cliente
- **Font Awesome** - Iconografía
- **Google Fonts (Poppins)** - Tipografía
- **RESTful API** - Persistencia de datos

---

## 📱 Características de Diseño

- ✅ Diseño responsive (móvil, tablet, escritorio)
- ✅ Interfaz intuitiva y fácil de usar
- ✅ Colores cálidos inspirados en el negocio
- ✅ Animaciones suaves
- ✅ Notificaciones de feedback

---

## 📝 Cómo Usar

1. **Registrar una venta**: 
   - Selecciona la fecha
   - Ingresa el monto vendido en soles
   - Opcionalmente agrega: vendedor, horario y notas
   - Clic en "Guardar Venta"

2. **Ver historial**: 
   - Las ventas aparecen en el panel derecho
   - Usa los filtros para ver por período

3. **Editar venta**: 
   - Clic en el ícono de lápiz (✏️)
   - Modifica los datos y guarda

4. **Eliminar venta**: 
   - Clic en el ícono de basura (🗑️)
   - Confirma la eliminación

---

## 👨‍💻 Desarrollado para

Negocio de mollejitas fritas - Puesto ambulante legal

---

## 📌 Versión

**v1.0.0** - Registro básico de ventas diarias

---

*Sistema diseñado para crecer contigo 🚀*
