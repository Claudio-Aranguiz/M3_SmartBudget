# 💰 SmartBudget - Gestor de Presupuesto Personal

**SmartBudget** es una aplicación web moderna para la gestión de presupuesto personal, desarrollada con HTML5, CSS3, JavaScript ES6 y Bootstrap 4.

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
SmartBudget/
│
├── 📄 index.html                 # Página principal de bienvenida
├── 📂 views/                     # Páginas de la aplicación
│   ├── login.html               # Página de autenticación
│   ├── dashboard.html           # Panel principal (protegida)
│   ├── menu.html                # Menú de navegación (protegida)  
│   └── historial.html           # Historial de transacciones (protegida)
│
├── 📂 assets/                    # Recursos estáticos
│   ├── 📂 js/                   # JavaScript modular
│   │   ├── 📂 modules/          # Módulos principales
│   │   ├── 📂 components/       # Componentes reutilizables
│   │   ├── 📂 pages/            # Inicializadores de página
│   │   ├── 📂 utils/            # Utilidades y helpers
│   │   └── 📂 data/             # Gestión de datos
│   │
│   ├── 📂 sass/                 # Estilos SCSS
│   │   ├── 📂 components/       # Componentes de UI
│   │   ├── 📂 layout/           # Estructura y layout
│   │   ├── 📂 pages/            # Estilos específicos de página
│   │   └── 📂 vendor/           # Bootstrap personalizado
│   │
│   ├── 📂 data/                 # Base de datos JSON
│   │   ├── users.json           # Usuarios del sistema
│   │   └── transactions.json    # Transacciones financieras
│   │
│   └── 📂 vendor/               # Librerías externas
│
├── 📂 test/                      # 🧪 Tests y Documentación
│   ├── README.md                # Índice completo de tests
│   ├── run-tests.ps1            # Script para ejecutar tests
│   ├── test-*.html              # Tests interactivos
│   ├── *.md                     # Documentación técnica
│   └── *.css                    # Estilos de test
│
└── 📂 documentation/             # Documentación del proyecto
    ├── Análisis y planificación
    ├── Capturas de Figma/
    └── Instrucciones de uso
```

---

## 🚀 **CARACTERÍSTICAS PRINCIPALES**

### ✅ **Sistema de Autenticación**
- Login seguro contra base de datos JSON
- Gestión de sesiones con localStorage
- Páginas protegidas con verificación automática
- Logout completo con limpieza de datos

### 💰 **Gestión Financiera**
- Registro de ingresos y gastos
- Categorización automática
- Visualización con gráficos dinámicos
- Historial completo de transacciones

### 📊 **Dashboard Interactivo**
- Resumen de presupuesto mensual
- Gráficos de ingresos vs gastos
- Estadísticas por categoría
- Indicadores de estado financiero

### 📱 **Diseño Responsivo**
- Compatible con móviles y escritorio
- Interfaz moderna con Bootstrap 4
- Iconografía con Lucide Icons
- Animaciones y transiciones suaves

---

## 🛠️ **TECNOLOGÍAS UTILIZADAS**

| Tecnología | Uso | Estado |
|------------|-----|--------|
| **HTML5** | Estructura semántica | ✅ |
| **CSS3 + SCSS** | Estilos modernos y responsivos | ✅ |
| **JavaScript ES6** | Lógica de aplicación modular | ✅ |
| **Bootstrap 4** | Framework CSS responsivo | ✅ |
| **Chart.js** | Gráficos interactivos | ✅ |
| **Lucide Icons** | Iconografía moderna | ✅ |
| **JSON Database** | Almacenamiento de datos | ✅ |

### 🎨 **Paleta de Colores del Sistema**
```scss
$primary: #3b82f6;        // Azul principal del proyecto
$secondary: #6c757d;      // Gris secundario  
$success: #10b981;        // Verde para ingresos
$danger: #ef4444;         // Rojo para gastos
$warning: #f59e0b;        // Naranja para alertas
$info: #06b6d4;          // Cyan para información
```

---

## 🧪 **TESTING Y CALIDAD**

### **Tests Disponibles:**
La carpeta [test/](test/) contiene una suite completa de tests interactivos:

- **🔐 Test de Autenticación:** Verificación completa del sistema de login/logout
- **💾 Test de Persistencia:** Validación de almacenamiento de datos  
- **🧭 Test de Navegación:** Comprobación de páginas protegidas
- **💰 Test de Transacciones:** Verificación del flujo de datos financieros

**Ver:** [test/README.md](test/README.md) para documentación completa.

### **Estado del Sistema:**
- ✅ Arquitectura de datos corregida y validada
- ✅ Sistema de sesiones robusto y seguro  
- ✅ Persistencia entre localStorage y JSON funcionando
- ✅ Todas las páginas protegidas verificadas
- ✅ Logout completo con limpieza total de datos

---

## 🚀 **INSTALACIÓN Y USO**

### **1. Clonar el Proyecto**
```bash
git clone [URL_DEL_REPOSITORIO]
cd SmartBudget
```

### **2. Ejecutar la Aplicación**
```bash
# Opción 1: Servidor HTTP simple con Python
python -m http.server 8000

# Opción 2: Con Node.js (si tienes live-server)
npx live-server

# Opción 3: Abrir index.html directamente en el navegador
```

### **🧪 Ejecutar Tests**
```bash
# Navegar a la carpeta de tests
cd test

# Ejecutar el script interactivo de tests
.\run-tests.ps1
```

### **3. Acceder a la Aplicación**
- Abrir navegador en `http://localhost:8000`
- Usar las credenciales de prueba (ver users.json)
- Explorar las diferentes funcionalidades

---

## 👥 **USUARIOS DE PRUEBA**

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| **María González** | maria.gonzalez@email.com | maria123 | user |
| **Administrador** | admin@smartbudget.com | admin123 | admin |
| **Carlos Rodríguez** | carlos.rodriguez@email.com | carlos123 | user |

---

## 📖 **DOCUMENTACIÓN ADICIONAL**

- **[Documentación Técnica](documentation/):** Análisis detallado y planificación
- **[Tests y Verificaciones](test/):** Suite completa de pruebas
- **[JavaScript Modules](assets/js/):** Documentación de módulos
- **[Changelog](CHANGELOG.md):** Historial de cambios del proyecto

---

## 🤝 **CONTRIBUCIÓN**

El proyecto está completamente funcional y ha sido extensamente testado. Para contribuir:

1. Ejecutar los tests en [test/](test/) para verificar el estado actual
2. Revisar la documentación técnica 
3. Seguir la arquitectura modular establecida
4. Mantener la cobertura de tests actualizada

---

## 📄 **LICENCIA**

Proyecto desarrollado con fines educativos como parte del módulo de desarrollo frontend.

---

*Última actualización: 25 de enero de 2026*  
*Estado: ✅ Proyecto completamente funcional y testado*