# Fotos de Vendedores ELMEC

## Ubicación
Las fotos de los vendedores deben colocarse en esta carpeta: `assets/images/vendors/`

## Fuente de las Fotos
Las fotos están disponibles en Google Drive:
https://drive.google.com/drive/folders/1WOi5J9gcRSCnmIQoWVntFLR29HTwmcMX?usp=sharing

## Instrucciones para Agregar Fotos

### 1. Descargar las fotos del Google Drive
- Acceder al link compartido arriba
- Descargar todas las fotos de vendedores
- Las fotos deben estar en formato JPG o PNG

### 2. Nombrar las Fotos
Las fotos deben nombrarse según el email del vendedor (sin @elmec.com.mx):
```
Ejemplos:
- i.pineda.jpg          -> para i.pineda@elmec.com.mx
- j.gonzalez.jpg        -> para j.gonzalez@elmec.com.mx
- c.rosales.jpg         -> para c.rosales@elmec.com.mx
- r.martinez.jpg        -> para r.martinez@elmec.com.mx
```

### 3. Optimizar las Fotos
- Tamaño recomendado: 300x300 píxeles o 400x400 píxeles
- Formato: JPG (calidad 80-90%)
- Mantener peso del archivo bajo (< 100KB por foto)

### 4. Colocar en la Carpeta
Copiar todos los archivos a: `assets/images/vendors/`

## Lista de Vendedores Activos

Según los datos actuales, estos son los vendedores que necesitan foto:

1. Iván Pineda Ortega (i.pineda@elmec.com.mx)
2. Carlos Rosales (c.rosales@elmec.com.mx)
3. Alex Díaz Zimbrón (a.diaz@elmec.com.mx)
4. Coco Vázquez (coco.vazquez@elmec.com.mx)
5. Oswaldo Salazar (o.salazar@elmec.com.mx)
6. Gerardo Rosales Ríos (g.rosales@elmec.com.mx)
7. Erick Navarrete (e.navarrete@elmec.com.mx)
8. Oswaldo Peña (o.pena@elmec.com.mx)
9. Alberto Cano (a.cano@elmec.com.mx)
10. Raymundo Larrea (r.larrea@elmec.com.mx)
11. Alejandro Licona (a.licona@elmec.com.mx)
12. Rubén Martínez (r.martinez@elmec.com.mx)
13. Isabel Muñoz Amaya (i.munoz@elmec.com.mx)
14. Jocelyn González Molina (j.gonzalez@elmec.com.mx)

## Cómo Funciona en el Código

El sistema buscará automáticamente la foto del vendedor usando su email:

```typescript
const getVendorPhoto = (email: string) => {
  const username = email.split('@')[0]; // e.g., "i.pineda"
  try {
    return require(`@/assets/images/vendors/${username}.jpg`);
  } catch {
    // Si no existe la foto, usa un avatar con iniciales
    return null;
  }
};
```

## Foto por Defecto
Si no existe una foto para un vendedor, el sistema mostrará:
- Avatar con las iniciales del nombre
- Color de fondo basado en el rol (Agente, Vendedor, Soporte)

## Estado Actual
📝 **Pendiente**: Las fotos aún no han sido descargadas del Google Drive

## Próximos Pasos
1. ✅ Sistema preparado para recibir fotos
2. ⏳ Descargar fotos del Google Drive
3. ⏳ Optimizar y renombrar fotos
4. ⏳ Copiar a la carpeta assets/images/vendors/
5. ⏳ Verificar que se muestren correctamente en la app
