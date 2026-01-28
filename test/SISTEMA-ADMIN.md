# 🔐 SmartBudget - Sistema de Login con Admin

## 👥 **USUARIOS DE PRUEBA**

### **🔑 Administrador**
- **Email:** `admin@smartbudget.com`
- **Contraseña:** `admin123`
- **Redirecciona a:** `admin.html`
- **Capacidades:** Ver todos los usuarios, agregar ingresos

### **👨‍💼 Usuarios Regulares**

| Email | Contraseña | Nombre | Balance | Transacciones |
|-------|------------|--------|---------|---------------|
| `maria.gonzalez@email.com` | `maria123` | María González | $2,850.75 | 2 |
| `carlos.rodriguez@email.com` | `carlos123` | Carlos Rodríguez | $1,250.30 | 2 |
| `ana.martinez@email.com` | `ana123` | Ana Martínez | $3,420.80 | 2 |
| `luis.garcia@email.com` | `luis123` | Luis García | $890.45 | 2 |
| `demo@smartbudget.com` | `demo123` | Usuario Demo | $1,500.00 | 1 |

## 🎯 **CÓMO PROBAR**

### **1. Probar Usuario Admin**
1. Ve a: `http://localhost:8080/views/login.html`
2. Email: `admin@smartbudget.com`
3. Contraseña: `admin123`
4. ✅ **Debe redirigir a `admin.html`**
5. ✅ **Panel completo con lista de usuarios**
6. ✅ **Puede agregar ingresos a cualquier usuario**

### **2. Probar Usuario Regular**
1. Ve a: `http://localhost:8080/views/login.html`
2. Email: `maria.gonzalez@email.com`
3. Contraseña: `maria123`
4. ✅ **Debe redirigir a `menu.html`**
5. ✅ **Mensaje personalizado de bienvenida**

### **3. Probar Funcionalidad Admin**
1. Login como admin
2. En el panel admin, click "Agregar Ingreso" en cualquier usuario
3. Agregar cantidad (ej: $500)
4. Descripción (ej: "Bono de rendimiento")
5. ✅ **Se actualiza el balance del usuario**

## 🛠️ **FLUJO COMPLETO**

```
index.html → login.html → [AUTENTICACIÓN] 
                             ↓
                    ┌─ admin.html (si es admin)
                    └─ menu.html (si es usuario)
```

## 📊 **CARACTERÍSTICAS IMPLEMENTADAS**

- ✅ **Base de datos JSON** con usuarios completos
- ✅ **Autenticación real** con validación de credenciales
- ✅ **Roles diferenciados** (admin vs user)
- ✅ **Panel de administración** completo
- ✅ **Gestión de usuarios** con estadísticas
- ✅ **Agregar ingresos** a usuarios por parte del admin
- ✅ **Interfaz responsive** y profesional
- ✅ **Datos persistentes** en localStorage

## 🗂️ **ARCHIVOS NUEVOS**

- `assets/data/users.json` - Base de datos de usuarios
- `views/admin.html` - Panel de administración
- `assets/js/pages/admin-init.js` - Lógica del admin
- `assets/js/utils/auth-guard.js` - Sistema de autenticación mejorado

---

**¡Sistema completo de administración funcional!** 🎉