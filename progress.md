# Investment Dashboard — Progress Log

## Proyecto
Dashboard personal de inversiones. React + Vite. UI dark-mode, datos en CLP (pesos chilenos).
**Repo:** https://github.com/fsotomutoli/investment-dashboard

---

## Reglas de trabajo
- **Nunca pushear directo a `main`** — siempre crear rama por funcionalidad
- **Commits agrupados por funcionalidad** — no un commit por cada cambio pequeño
- **Skills activos:** frontend (código limpio/responsive), seguridad de código, calidad de código
- **Deploy:** Vercel (acceso desde computador y teléfono, portafolio público)

---

## Estado actual del código

### Arquitectura
- `src/App.jsx` — componente único (~350 líneas), todo inline
- `src/main.jsx` — entry point React
- `index.html`, `vite.config.js`, `package.json`
- Sin router, sin componentes separados, sin CSS externo
- Sin TypeScript, sin linting, sin tests

### Features implementados
- [x] Vista **Resumen**: portfolio total, desglose por tipo, lista de inversiones
- [x] Vista **Gestionar**: actualizar valor de mercado, registrar aportes, agregar/eliminar inversiones
- [x] Vista **Historial**: snapshots automáticos al actualizar datos
- [x] Persistencia vía **localStorage**
- [x] Toast de feedback al guardar
- [x] Modal bottom-sheet para acciones
- [x] Formateo CLP y porcentajes
- [x] Datos placeholder con comentario de seguridad

### Issues conocidos / deuda técnica
- Todo en un solo archivo gigante (`App.jsx`)
- Estilos 100% inline (no escalable)
- Sin manejo de errores en inputs (solo validación básica)
- Sin responsividad explícita para desktop (diseñado mobile-first)
- Sin tests
- Sin lint config
- `INITIAL_INVESTMENTS` hardcodeado en el código (debería ser solo en localStorage)

---

## Historial de sesiones

### Sesión 1 — 2026-06-03
- Descomprimido zip, `npm install`, primer commit, repo creado en GitHub
- Definidas reglas de colaboración
- Decisión: deployar en **Vercel** para acceso multi-dispositivo y portafolio

---

## Backlog (ideas a futuro)
- [ ] Separar en componentes (`InvestmentCard`, `Modal`, `Header`, `HistoryView`)
- [ ] Migrar estilos a CSS modules o Tailwind
- [ ] Agregar TypeScript
- [ ] Configurar ESLint + Prettier
- [ ] Deploy en Vercel
- [ ] Gráfico de torta / área para distribución
- [ ] Exportar datos (CSV/JSON)
- [ ] Modo demo con datos ficticios para portafolio público
- [ ] Dark/light theme toggle
- [ ] Tests unitarios básicos
