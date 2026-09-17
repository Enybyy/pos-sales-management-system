# 🍗 MolleVentas — Sistema Web POS & Analítica Comercial para Gastronomía y Retail
> **Digitalización de ventas diarias, control de turnos y analítica en tiempo real para negocios gastronómicos y comercios.**

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20TailwindCSS%20%7C%20ES6+-orange.svg)](#-stack-tecnológico)
[![Analytics](https://img.shields.io/badge/Analytics-Chart.js-yellow.svg)](#-funcionalidades-principales)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](#)

---

## 📌 El Desafío de Negocio

Muchos negocios de comida rápida, puestos de venta y pequeños comercios minoristas operan con anotaciones en cuadernos o memorias de cálculo manuales al cierre de cada jornada. Esta práctica común genera serios problemas:
- **Descuadres de caja diarios** y falta de conciliación de turnos entre diferentes vendedores.
- **Cero visibilidad analítica** sobre qué días de la semana y qué franjas horarias generan el mayor retorno real.
- **Pérdida de insumos** por compras mal calculadas al desconocer la velocidad real de rotación de productos.
- **Barrera de costos**: Los softwares POS del mercado exigen pagos mensuales elevados, terminales caras y configuraciones complejas que no se ajustan a la realidad de negocios dinámicos.

---

## 💡 La Solución Implementada

**MolleVentas** fue diseñado desde cero como una **solución de punto de venta (POS) ligera, responsive y sin costes de suscripción**, operable directamente desde cualquier smartphone o tablet en el mostrador del negocio.

Combina un módulo ultra rápido de cobro y registro diario con un **dashboard ejecutivo de Business Intelligence integrado**, permitiendo:
1. Registrar ventas al instante con fecha, vendedor, turno y notas de operación.
2. Supervisar métricas financieras consolidadas (ventas del día, acumulado mensual, ticket promedio).
3. Analizar mediante gráficos interactivos (`Chart.js`) la productividad por hora, la distribución por días de la semana y la velocidad de venta.

---

## 📈 Impacto y Mejoras Conseguidas

| Métrica / Área | Antes de la Solución | Con MolleVentas | Impacto de Negocio |
|---|---|---|---|
| **Cierre de Caja y Cuadre** | 30 a 45 min diarios en cuadernos con tachaduras | Instantáneo (en 1 clic) | **Ahorro de ~20 horas al mes** para el dueño del negocio |
| **Trazabilidad por Vendedor** | Sin registro formal de turnos ni responsables | Registro de vendedor, hora inicio y fin por jornada | **100% de transparencia** en la administración de personal |
| **Aprovisionamiento de Insumos** | Estimaciones por intuición | Decisiones basadas en días pico y velocidad de venta | **Reducción de mermas de insumos perecibles** |
| **Costo de Software** | Planes mensuales de $30 - $70 USD/mes | Solución propia sin suscripciones | **Ahorro recurrente garantizado** |

---

## ✨ Funcionalidades Principales

- **Registro de Ventas en Punto de Venta**: Ingreso ágil de monto en soles (S/), selección de fecha, asignación de vendedor, horarios de turno y observaciones de caja.
- **Historial Interactivo con Filtros Temporales**: Visualización cronológica con filtros rápidos por: *Todos*, *Esta Semana*, *Este Mes*.
- **Gestión Completa de Registros (CRUD)**: Edición rápida de registros existentes o eliminación segura con confirmación.
- **Dashboard Analítico Avanzado**:
  - **Distribución de Ventas por Día de la Semana**: Gráfico de barras comparativo para identificar los días de mayor rentabilidad.
  - **Análisis de Franjas Horarias (Horas Pico)**: Mapa de impacto para optimizar la preparación de pedidos en los momentos de mayor demanda.
  - **Velocidad de Venta y Duración de Turnos**: Métricas para medir la eficiencia del servicio.
- **Diseño 100% Responsive & Touch-Friendly**: Adaptado para trabajar cómodamente en pantallas móviles, tablets o laptops de caja.

---

## 🛠️ Stack Tecnológico

- **HTML5 Semántico**: Estructura limpia y accesible.
- **Tailwind CSS & Custom CSS**: Interfaz moderna, cálida, con feedback visual y animaciones sutiles optimizadas para pantallas táctiles.
- **JavaScript Moderno (ES6+)**: Lógica reactiva en el cliente, validaciones y manipulación eficiente del DOM.
- **Chart.js**: Renderizado dinámico de gráficos estadísticos y métricas de rendimiento.
- **Font Awesome & Google Fonts (Poppins)**: Iconografía clara y tipografía moderna para legibilidad en mostrador.

---

## 🗂️ Estructura del Proyecto

```text
├── index.html          # Punto de entrada de la aplicación POS y modales
├── css/
│   └── style.css       # Estilos personalizados y utilidades de diseño
├── js/
│   ├── app.js          # Lógica de la aplicación, control de turnos y eventos
│   └── analytics.js    # Motor de cálculo estadístico, KPIs y gráficos Chart.js
└── README.md           # Documentación del proyecto
```

---

## 🚀 Instalación y Uso Rápido

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Enybyy/pos-sales-management-system.git
   cd pos-sales-management-system
   ```

2. **Ejecutar localmente:**
   - Puedes abrir `index.html` directamente en tu navegador web favorito (Chrome, Edge, Safari, Firefox).
   - O iniciar un servidor estático local:
     ```bash
     # Usando Python
     python -m http.server 8000
     # O usando Node.js (npx)
     npx serve .
     ```

---

## 📬 ¿Necesitas una solución similar para tu negocio?

Soy desarrollador freelance especializado en crear **soluciones web a medida, sistemas de gestión interna (POS/ERP), automatizaciones y dashboards analíticos**. Si buscas digitalizar las operaciones de tu negocio, optimizar tiempos y tomar el control total de tus datos:

- **GitHub**: [@Enybyy](https://github.com/Enybyy)
- **Perfil Profesional**: Eliud RM — Data Science & Software Solutions
- *Disponible para proyectos freelance y consultoría tecnológica personalizada.*
