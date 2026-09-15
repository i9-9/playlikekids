# Video Player Testing Guide

## 🚨 Critical Fixes Applied

Durante el análisis de código encontré y fixeé **3 bugs críticos** antes del testing manual:

### 1. ✅ "Try Again" Button - Estado Roto (CRÍTICO)
**Problema:** El botón "Try Again" no reiniciaba el player, solo intentaba usar el player roto
**Fix:** Ahora fuerza un reload completo del iframe (unmount → remount)
```typescript
// Antes: llamaba togglePlay() que reusaba el player roto
// Ahora: setStarted(false) → requestAnimationFrame → setStarted(true)
```

### 2. ✅ Autoplay Bloqueado - Falso Error
**Problema:** Si Safari/Chrome bloqueaba autoplay, mostraba error "Unable to play video"
**Fix:** Autoplay bloqueado NO es un error, solo deja el video pausado mostrando poster
```typescript
// Ahora: catch solo setPaused(true), NO setError()
```

### 3. ✅ Touch en Seek Bar - Scroll Interferencia
**Problema:** En iOS Safari, tocar la seek bar podía triggerear scroll del documento
**Fix:** Agregado `event.preventDefault()` en `onPointerDown`

---

## 📱 Plan de Testing Manual

### Escenario 1: Error Handling con ID Inválido

**Objetivo:** Verificar que "Try Again" recupera el player completamente

**Pasos:**
1. Editar `/src/lib/sanity/seed-data.ts`
2. Cambiar un videoId a `"999999999"` (línea ~65, Gabriela Ortega)
3. Abrir http://localhost:3000/directors/gabriela-ortega
4. Click en el video con ID inválido
5. **Verificar:**
   - ✅ Muestra spinner inicial
   - ✅ Después de ~3s muestra error "Unable to load video"
   - ✅ Botón "Try Again" visible y clickeable
6. Click en "Try Again"
7. **CRÍTICO - Verificar:**
   - ✅ Vuelve a mostrar spinner
   - ✅ Vuelve a intentar cargar (nueva request a Vimeo)
   - ✅ Vuelve a fallar con mensaje de error (porque el ID sigue inválido)
   - ✅ NO queda en estado zombie/freezado
8. Revertir el ID al valor real: `"1164762885"`
9. Refrescar página y click en el video
10. **Verificar:**
    - ✅ Video carga y reproduce correctamente

**Resultado Esperado:** El player se resetea completamente con cada retry, no queda en estado roto.

---

### Escenario 2: Mobile Touch - Seek Bar Precision

**Objetivo:** Verificar que tocar la seek bar funciona sin interferir con scroll

**Dispositivos recomendados:**
- iPhone (iOS Safari es el más estricto)
- Android Chrome/Samsung Internet

**Pasos:**
1. Abrir http://localhost:3000/directors/gabriela-ortega en celular real
2. Click en cualquier video para reproducir
3. Una vez cargado, tocar la seek bar (la barra de progreso)
4. **Verificar:**
   - ✅ El toque NO causa scroll del documento
   - ✅ El handle blanco aparece donde tocaste
   - ✅ Puedes arrastrar horizontalmente sin scroll vertical
   - ✅ Al soltar, el video salta al timestamp correcto
5. Repetir con taps rápidos en diferentes posiciones de la barra
6. **Verificar:**
   - ✅ Cada tap actualiza la posición inmediatamente
   - ✅ No hay lag ni "ghost touches"

**Chrome DevTools NO es suficiente:** La emulación de touch no replica bien:
- Eventos de scroll simultáneos
- Touch pressure detection
- Gesture recognition de iOS

---

### Escenario 3: Autoplay Bloqueado - Multi-Browser

**Objetivo:** Verificar que autoplay bloqueado NO muestra error, solo pausa

**Browsers a probar:**
- **Safari Desktop** (macOS) - El más agresivo bloqueando
- **Chrome Desktop** - Bloquea dependiendo de "Media Engagement Index"
- **Safari iOS** (si disponible)

**Pasos:**

#### Safari Desktop:
1. Abrir Safari > Preferencias > Websites > Auto-Play
2. Cambiar a "Stop Media with Sound" o "Never Auto-Play"
3. Abrir http://localhost:3000/directors/gabriela-ortega
4. Click en un video
5. **Verificar:**
   - ✅ Muestra spinner
   - ✅ Spinner desaparece
   - ✅ Muestra poster con overlay visible
   - ✅ NO muestra mensaje de error
   - ✅ Video está pausado (botón play visible)
6. Click en botón play (o spacebar)
7. **Verificar:**
   - ✅ Video reproduce normalmente
   - ✅ Controles funcionan

#### Chrome Desktop:
1. Abrir Chrome > Settings > Privacy and Security > Site Settings > Additional Permissions > Sound
2. Cambiar a "Don't allow sites to play sound"
3. Abrir http://localhost:3000/directors/gabriela-ortega
4. Repetir pasos 4-7 de Safari

**Resultado Esperado:**
- Autoplay bloqueado = poster visible + video pausado
- NO error message
- Click manual en play funciona perfectamente

---

## 🔍 Casos Edge Adicionales

### Red Lenta / Timeout
1. Chrome DevTools > Network > Throttling > Slow 3G
2. Cargar video y verificar que spinner permanece visible durante carga
3. Verificar que poster no desaparece hasta que video está ready

### Cambio Rápido de Video (DirectorProfile)
1. Abrir director con múltiples videos (Gabriela Ortega tiene 3)
2. Click en video 1 → esperar 2s → click en video 2
3. Verificar transición limpia sin errores en consola
4. Usar flechas izq/der para ciclar videos rápidamente
5. Verificar que cada video carga correctamente

### PiP + Error Recovery
1. Reproducir un video
2. Click en botón PiP (picture-in-picture)
3. En ventana PiP, pausar video
4. Modificar videoId a inválido y hacer hot-reload
5. Verificar que error se muestra correctamente en PiP

---

## ✅ Checklist Final

Antes de dar por aprobadas las mejoras:

- [ ] "Try Again" recupera player después de error (no estado zombie)
- [ ] Touch en seek bar funciona en iPhone/Android sin scroll
- [ ] Safari bloqueando autoplay NO muestra error
- [ ] Chrome bloqueando autoplay NO muestra error
- [ ] Spinner visible durante carga real (no solo flash)
- [ ] Keyboard navigation funciona (Tab, flechas, spacebar)
- [ ] Focus rings visibles en todos los controles
- [ ] Botones >= 44px fáciles de tocar en mobile
- [ ] Video Vimeo real carga y reproduce correctamente

---

## 🐛 Si Encontrás Bugs

Reportar con:
1. Browser + versión
2. Dispositivo (si mobile)
3. Pasos exactos para reproducir
4. Screenshot o video si es visual
5. Errores en console (F12 > Console)
