# Japon Bot Dashboard - PRD

## Problem Statement
Crea un panel de control web completo para un bot de Discord llamado "Japon Bot". La API está en https://japon-bot-production.up.railway.app y todas las peticiones deben llevar el header x-api-key con valor japonbot2024secreto. Usa React con Tailwind. Tema oscuro estilo Discord. Una sola aplicación con varias vistas: INICIO, PANEL, TICKETS, TRANSCRIPT, CONFIGURACIÓN.

## User Choices
- Design: Moderno con glass-morphism y acentos neón
- Auth: Login simple con contraseña
- API access: Proxy via backend FastAPI (esconde la x-api-key)
- Tickets: Filtro por estado + búsqueda por usuario/razón
- Close ticket: Modal de confirmación

## Architecture
- **Backend (FastAPI)**: Proxy seguro hacia la Japon Bot API añadiendo el header `x-api-key`. Login en memoria con tokens. Todos los endpoints expuestos bajo `/api`.
- **Frontend (React + Tailwind + shadcn/ui)**: SPA con rutas protegidas, glassmorphism oscuro, fuentes Outfit + Manrope, sonner para toasts, lucide-react para iconos.

## Implemented (Feb 2026)
- Login con contraseña (`ADMIN_PASSWORD` en .env)
- Vista Inicio: grid de servidores (icono, nombre, miembros, botón "Ver panel")
- Panel del servidor: 4 estadísticas (Total / Abiertos / Cerrados / Reclamados) + botones a Tickets/Configuración
- Tickets: tabla con ID/Usuario/Razón/Estado/Fecha, filtro por estado, búsqueda, modal de confirmación al cerrar, botón ver transcript
- Transcript: lista chat-style con avatar generado, fecha, nombre y mensaje
- Configuración: formulario (categoriaTickets, rolStaff, canalLogs, nombreServidor) con loading state
- Manejo de errores en todas las peticiones (toasts + ErrorState component) y spinners de carga

## Backlog / Next
- P1: Editar/asignar tickets, refrescar manual, exportar transcript
- P2: Auditoría de cambios de configuración, multi-admin con roles
