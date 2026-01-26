# 🧪 Tests y Documentación - SmartBudget

Esta carpeta contiene todos los archivos de testing, verificación y documentación técnica del proyecto SmartBudget.

---

## 📋 **ÍNDICE DE CONTENIDOS**

### 🧪 **Tests Interactivos (HTML)**
| Archivo | Descripción | Propósito |
|---------|-------------|-----------|
| [test-correct-architecture.html](test-correct-architecture.html) | Test de arquitectura de transacciones corregida | Verifica flujo temp → JSON → cleanup |
| [test-user-architecture.html](test-user-architecture.html) | Test de arquitectura de usuarios | Verifica sistema de autenticación contra users.json |
| [test-session-persistence.html](test-session-persistence.html) | Test completo de persistencia de sesión | Verifica login, navegación y logout |
| [test-transaction-persistence.html](test-transaction-persistence.html) | Test de persistencia de transacciones | Verifica guardado correcto en transactions.json |
| [test-transactions.html](test-transactions.html) | Test general de transacciones | Pruebas de funcionalidad de transacciones |
| [verify-transactions.html](verify-transactions.html) | Verificador de transacciones | Inspecciona el estado de la base de datos |
| [run-test.html](run-test.html) | Ejecutor de tests | Plataforma general para ejecutar tests |

### 📜 **Scripts de Test**
| Archivo | Descripción | Uso |
|---------|-------------|-----|
| [test-persistence-script.js](test-persistence-script.js) | Script de persistencia | Utilidades para tests de persistencia |

### 📚 **Documentación Técnica**
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| [ANALISIS_SESION_COMPLETO.md](ANALISIS_SESION_COMPLETO.md) | Análisis completo del sistema de sesiones | ✅ Sistema funcional |
| [ARCHITECTURE_CORRECTED.md](ARCHITECTURE_CORRECTED.md) | Corrección de arquitectura de transacciones | ✅ Corregido |
| [USER_ARCHITECTURE_CORRECTED.md](USER_ARCHITECTURE_CORRECTED.md) | Corrección de arquitectura de usuarios | ✅ Corregido |
| [TEST_RESULTS.md](TEST_RESULTS.md) | Resultados de pruebas realizadas | ✅ Tests pasados |
| [PAGINAS-PROTEGIDAS.md](PAGINAS-PROTEGIDAS.md) | Documentación de páginas protegidas | ✅ Configurado |
| [SISTEMA-ADMIN.md](SISTEMA-ADMIN.md) | Documentación del sistema administrativo | ✅ Documentado |

### 🎨 **Estilos de Test (CSS)**
| Archivo | Descripción |
|---------|-------------|
| [test-styles.html](test-styles.html) | Página de pruebas de estilos |
| [test.css](test.css) | Estilos de test principal |
| [test.css.map](test.css.map) | Mapa de estilos de test |
| [main-bootstrap-1550.css](main-bootstrap-1550.css) | Bootstrap personalizado para tests |
| `*.css.map` | Mapas de archivos CSS para debugging |

### 🔧 **Scripts de Utilidad**
| Archivo | Descripción |
|---------|-------------|
| [run-tests.ps1](run-tests.ps1) | Script interactivo para ejecutar todos los tests |
| [fix-scss-imports.ps1](fix-scss-imports.ps1) | Script para corregir imports SCSS |

---

## 🚀 **CÓMO EJECUTAR LOS TESTS**

### **Opción 1: Script Interactivo (Recomendado)**
```bash
# Desde la carpeta test
.\run-tests.ps1
```

### **Opción 2: Tests Individuales**
1. Abrir cualquier archivo `.html` en el navegador
2. Seguir las instrucciones en pantalla
3. Verificar los resultados mostrados

### **Tests de Sistema:**
1. Usar [test-session-persistence.html](test-session-persistence.html) para verificación completa
2. Comprobar login, navegación entre páginas y logout
3. Validar limpieza completa de datos

### **Verificación de Datos:**
1. Usar [verify-transactions.html](verify-transactions.html) 
2. Inspeccionar estado de [transactions.json](../assets/data/transactions.json)
3. Confirmar persistencia correcta

---

## 📊 **ESTADO GENERAL DE TESTS**

| Componente | Estado | Resultado |
|------------|---------|-----------|
| **Arquitectura de Transacciones** | ✅ | Flujo corregido: temp → JSON → cleanup |
| **Arquitectura de Usuarios** | ✅ | Auth contra users.json funcionando |
| **Persistencia de Sesión** | ✅ | Login, navegación y logout correctos |
| **Base de Datos JSON** | ✅ | transactions.json y users.json operativos |
| **Páginas Protegidas** | ✅ | Verificación de autenticación en todas |
| **Sistema de Logout** | ✅ | Limpieza completa implementada |

---

## 🔍 **ARCHIVOS PRINCIPALES DEL PROYECTO**

Para referencia rápida, los archivos principales están en:

- **Frontend:** [../views/](../views/) (dashboard.html, menu.html, etc.)
- **JavaScript:** [../assets/js/](../assets/js/) (módulos principales)
- **Datos:** [../assets/data/](../assets/data/) (users.json, transactions.json)
- **Estilos:** [../assets/sass/](../assets/sass/) (SCSS principales)
- **Documentación:** [../documentation/](../documentation/) (análisis y documentos)

---

## 📝 **NOTAS IMPORTANTES**

1. **Todos los tests están actualizados** con las correcciones más recientes
2. **La arquitectura ha sido validada** y funciona correctamente
3. **Los datos persisten correctamente** entre localStorage y JSON
4. **El sistema de sesiones es robusto** y seguro
5. **La documentación está sincronizada** con el código actual

---

*Última actualización: 25 de enero de 2026*  
*Estado: ✅ Todos los tests funcionando correctamente*