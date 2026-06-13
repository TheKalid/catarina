"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

const STORAGE_KEY = "catarina.locale";

/* -------------------------------------------------------------------------- */
/*  Dictionaries                                                              */
/*                                                                            */
/*  `en` is the source of truth for the shape; `es` must match it exactly.    */
/*  Parameterized strings are functions so interpolation stays in one place.  */
/* -------------------------------------------------------------------------- */

const en = {
  language: {
    label: "Language",
    english: "English",
    spanish: "Spanish",
  },

  common: {
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    close: "Close",
    done: "Done",
    edit: "Edit",
    add: "Add",
    copy: "Copy",
    copied: "Copied",
  },

  nav: {
    product: "Product",
    howItWorks: "How it works",
    service: "Service",
    whoFor: "Who it's for",
    openApp: "Open app",
    logIn: "Log in",
    getStarted: "Get started",
  },

  footer: {
    tagline:
      "Indoor food-growing within reach — from a kitchen herb shelf to industrial systems.",
    productTitle: "Product",
    overview: "Overview",
    service: "Service",
    whoFor: "Who it's for",
    accountTitle: "Account",
    logIn: "Log in",
    getStarted: "Get started",
    rights: (year: number) => `© ${year} Catarina. All rights reserved.`,
  },

  auth: {
    loginTitle: "Welcome back",
    loginCta: "Log in",
    loginAltText: "New to Catarina?",
    loginAltLabel: "Create an account",
    registerTitle: "Create your account",
    registerCta: "Get started",
    registerAltText: "Already have an account?",
    registerAltLabel: "Log in",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordHint: "8–72 characters.",
    pleaseWait: "Please wait…",
    genericError: "Something went wrong",
  },

  marketing: {
    heroBadge: "Hydroponics, made approachable",
    heroTitle: "Grow food, not expertise.",
    heroBody:
      "Catarina is smart growing hardware that runs on its own, plus a cloud service that turns sensor data into insight — monitoring, alerts, and AI-assisted care that tells you what to do, and why.",
    heroGetStarted: "Get started",
    heroSeeHow: "See how it works",

    productEyebrow: "Why Catarina",
    productTitle: "Caring for plants, not operating equipment.",
    productDescription:
      "Most hydroponic systems force a choice between simple-but-manual and powerful-but-complex. Catarina closes that gap.",
    gapCards: [
      {
        title: "Too simple",
        body: "Basic kits leave you guessing — constant manual checks and a lot of trial and error.",
      },
      {
        title: "Too complex",
        body: "Pro rigs are powerful but demand real expertise just to keep them running.",
      },
      {
        title: "Catarina",
        body: "A living system that communicates its needs — approachable for beginners, deep enough for pros.",
      },
    ],

    howEyebrow: "How it works",
    howTitle: "The hardware gathers data. The software makes it make sense.",
    steps: [
      {
        title: "The hardware senses",
        body: "Temperature, humidity, light, water and nutrient levels — captured continuously, on device.",
      },
      {
        title: "Data syncs",
        body: "Stored locally and synced over Bluetooth or the cloud — late, batched, or out of order is fine.",
      },
      {
        title: "Software explains",
        body: "Readings become plain-language insight, trends, and recommendations you can act on.",
      },
    ],

    serviceEyebrow: "The service",
    serviceTitle:
      "A cloud layer that helps you grow healthier plants with less effort.",
    serviceDescription:
      "An optional subscription on top of the hardware — additive, never a paywall for basic functionality.",
    serviceFeatures: [
      {
        title: "Visibility",
        body: "Real-time and historical data from anywhere — multi-device, with remote access.",
      },
      {
        title: "Awareness",
        body: "Alerts when conditions need attention: low water, anomalies, equipment, maintenance.",
      },
      {
        title: "Understanding",
        body: "Plant-health analysis and trend identification that turn data into meaning.",
      },
      {
        title: "Guidance",
        body: "Recommendations for watering, nutrients, and environment that improve outcomes.",
      },
      {
        title: "Collaboration",
        body: "Share devices, give household access, and invite read-only followers.",
      },
    ],

    explainEyebrow: "A principle",
    explainTitle: "Explain, don't just alert.",
    explainDescription:
      "Every notification tells you what happened, why it matters, and what to do — so you can act with confidence, no expertise required.",
    explainPoints: [
      { label: "What happened", body: "The reservoir is down to about a day of water." },
      { label: "Why it matters", body: "Fruiting basil drinks faster; low water stresses roots." },
      { label: "What to do", body: "Top up to 2L now to keep growth on track." },
    ],

    twoSidesEyebrow: "Two sides, one platform",
    twoSidesTitle: "The hardware stays valuable on its own.",
    twoSidesDescription:
      "Buy the device once and it grows plants and records data with no subscription. The cloud service is there to enhance the experience — not to unlock it.",
    hardwareTitle: "Hardware",
    hardwareBody:
      "Smart growing devices — from a single pot to industrial racks. A one-time purchase that works fully offline.",
    hardwareFeatures: [
      "Local monitoring & on-device storage",
      "Bluetooth sync, works without the cloud",
      "Use it indefinitely",
    ],
    serviceCardTitle: "Service",
    serviceCardBody:
      "An optional subscription that turns device data into monitoring, alerts, AI guidance, and remote access across every device you own.",
    serviceCardFeatures: [
      "Cloud sync & historical analytics",
      "Smart alerts and plant-health insight",
      "Sharing, followers & remote access",
    ],

    scalesEyebrow: "Who it's for",
    scalesTitle:
      "From one plant to one greenhouse — without changing platforms.",
    segments: [
      { title: "Home", example: "Kitchen herbs", detail: "One device, a few plants." },
      { title: "Household", example: "Family food", detail: "Multiple devices or larger systems." },
      { title: "Commercial", example: "Restaurants & markets", detail: "Many devices, operational monitoring." },
      { title: "Industrial", example: "Large-scale", detail: "Hundreds of plants, high-volume telemetry." },
    ],
    scalesNote:
      "Hardware-first: every device keeps working even when the cloud is away.",

    aiEyebrow: "Where it's going",
    aiTitle: "From monitoring platform to growing assistant.",
    aiDescription:
      "Catarina is built to evolve — collecting data today, and increasingly helping you make decisions over time.",
    aiPhases: ["Observe", "Detect", "Recommend", "Predict", "Assist"],
    aiPhaseLabel: (n: number) => `Phase ${n}`,

    ctaTitle: "Start growing with less guesswork.",
    ctaBody:
      "Create an account, register your device, and let Catarina help you grow more food with less expertise.",
    ctaGetStarted: "Get started",
    ctaLogIn: "Log in",
  },

  mocks: {
    deviceName: "Kitchen pot",
    deviceActive: "Active",
    tempLabel: "Temp",
    humidityLabel: "Humidity",
    waterLabel: "Water",
    notifTitle: "Water reservoir low",
    notifBody:
      "Down to ~1 day left. Basil drinks faster while fruiting — top up to 2L to avoid stressed roots.",
    notifAction: "Refill reservoir →",
  },

  appNav: {
    dashboard: "Dashboard",
    account: "Account",
    signOut: "Sign out",
    loading: "Loading…",
  },

  dashboard: {
    title: "Devices",
    subtitle: "Monitor and manage your growing hardware.",
    addDevice: "Add device",
    emptyTitle: "No devices yet",
    emptyBody:
      "Register your first Catarina device to start monitoring your plants.",
    emptyCta: "Add your first device",
  },

  deviceStatus: {
    active: "Active",
    provisioned: "Provisioned",
    offline: "Offline",
    retired: "Retired",
  },

  deviceCard: {
    lastSeen: "Last seen",
    never: "Never",
    justNow: "Just now",
    minsAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
  },

  addDevice: {
    titleRegistered: "Device registered",
    titleAdd: "Add a device",
    loadingAccounts: "Loading your accounts…",
    account: "Account",
    model: "Model",
    serial: "Serial",
    serialHint: "Printed on the device.",
    nameOptional: "Name (optional)",
    namePlaceholder: "Kitchen pot",
    firmwareOptional: "Firmware version (optional)",
    registerError: "Could not register device",
    registering: "Registering…",
    registerCta: "Register device",
    noAccountBody:
      "You don't have an account to register a device under. Devices belong to an account, and your sign-in isn't an owner or admin of one yet.",
    noAccountManagePre: "Accounts you can manage appear on the ",
    noAccountManageLink: "Account",
    noAccountManagePost:
      " page. If it's empty, you'll need an account created for you before you can add devices.",
    secretIntroPre: "Store this device secret now — it's shown ",
    secretIntroEmphasis: "only once",
    secretIntroPost: " and can't be retrieved again.",
    secretSafe:
      "Keep it somewhere safe (a password manager). You'll need it to authenticate the device.",
  },

  account: {
    title: "Account",
    subtitle: "Manage your accounts, names, and members.",
    profile: "Profile",
    email: "Email",
    yourAccounts: "Your accounts",
    noAccounts: "No accounts found.",
    renameError: "Could not rename",
    edit: "Edit",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    hideMembers: "Hide members",
    viewMembers: "View members",
    loadingMembers: "Loading members…",
    noMembers: "No members.",
  },

  device: {
    back: "← Devices",
    fallbackName: "Device",
    loading: "Loading device…",
    tabsAria: "Device sections",
    tabTelemetry: "Telemetry",
    tabGrow: "Grow",
    tabActivity: "Activity",
    compareTo: "Compare to",
    noCrop: "No crop",
    bandNote:
      "Shaded band shows the ideal range for the selected crop. Out-of-range readings are flagged per metric.",
    limitedNote: "Limited history — showing all readings available so far.",
    noReadingsTitle: "No readings in this range",
    noReadingsBody:
      "This device hasn't reported sensor data for the selected window yet.",
  },

  metrics: {
    temp: "Temperature",
    humidity: "Humidity",
    ec: "Nutrients (EC)",
    lux: "Light",
    vpd: "VPD (vapour pressure deficit)",
  },

  chart: {
    range: "range",
    inRange: "in range",
    outOfRange: (n: number) => `${n} out of range`,
    ariaLatest: (v: string) => `Latest ${v}.`,
    ariaStats: (low: string, avg: string, high: string) =>
      `Low ${low}, average ${avg}, high ${high}.`,
    ariaOutOfRange: (out: number, total: number) =>
      `${out} of ${total} readings outside the ideal range.`,
    ariaAllInRange: "All readings within the ideal range.",
  },

  insights: {
    title: "Insights",
    subtitle: "Derived signals — computed on top of the raw sensor data.",
    lastWindow: (label: string) => `Last ${label}`,
    rangeLabels: { "24h": "24 hours", "7d": "7 days", "30d": "30 days" },
    dailyPattern: "Daily pattern · hour of day",
    dliTitle: "Daily Light Integral",
    dliUnit: "mol/m²/day",
    dliValue: (v: string) => `${v} mol`,
    dliAria: (days: number, today: string | null) =>
      `Daily light integral over ${days} days.${today ? ` Today ${today} mol per square metre.` : ""}`,
  },

  heatmap: {
    aria: (label: string, days: number, min: string, max: string) =>
      `${label} pattern over ${days} days, by hour of day. Values range ${min} to ${max}.`,
    noData: (hour: number) => `${hour}:00 — no data`,
    cell: (hour: number, value: string) => `${hour}:00 — ${value}`,
  },

  grow: {
    title: "Grow sites",
    addGrowSite: "Add grow site",
    loadError: "Could not load grow sites",
    emptyBody:
      "No grow sites yet. Add a slot to start tracking what's growing.",
    slot: (n: number) => `Slot ${n}`,
    empty: "Empty",
    since: (date: string) => `since ${date}`,
    startPlanting: "Start planting",
    ending: "Ending…",
    end: "End",
    addModalTitle: "Add grow site",
    position: "Position",
    positionHint: "Slot number on the device.",
    nameOptional: "Name (optional)",
    namePlaceholder: "Top tray",
    addError: "Could not add grow site",
    adding: "Adding…",
    add: "Add",
    startModalTitle: "Start planting",
    crop: "Crop",
    notesOptional: "Notes (optional)",
    notesPlaceholder: "Seedlings from tray B",
    startError: "Could not start planting",
    starting: "Starting…",
    start: "Start",
  },

  activity: {
    title: "Activity",
    loadError: "Could not load activity",
    emptyBody:
      "No events yet. Device activity — sync, pump cycles, alerts — will appear here.",
  },
};

export type Dictionary = typeof en;

const es: Dictionary = {
  language: {
    label: "Idioma",
    english: "Inglés",
    spanish: "Español",
  },

  common: {
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando…",
    close: "Cerrar",
    done: "Listo",
    edit: "Editar",
    add: "Añadir",
    copy: "Copiar",
    copied: "Copiado",
  },

  nav: {
    product: "Producto",
    howItWorks: "Cómo funciona",
    service: "Servicio",
    whoFor: "Para quién es",
    openApp: "Abrir app",
    logIn: "Iniciar sesión",
    getStarted: "Empezar",
  },

  footer: {
    tagline:
      "Cultivo de alimentos en interiores al alcance de todos — desde una repisa de hierbas en la cocina hasta sistemas industriales.",
    productTitle: "Producto",
    overview: "Resumen",
    service: "Servicio",
    whoFor: "Para quién es",
    accountTitle: "Cuenta",
    logIn: "Iniciar sesión",
    getStarted: "Empezar",
    rights: (year: number) => `© ${year} Catarina. Todos los derechos reservados.`,
  },

  auth: {
    loginTitle: "Bienvenido de nuevo",
    loginCta: "Iniciar sesión",
    loginAltText: "¿Nuevo en Catarina?",
    loginAltLabel: "Crea una cuenta",
    registerTitle: "Crea tu cuenta",
    registerCta: "Empezar",
    registerAltText: "¿Ya tienes una cuenta?",
    registerAltLabel: "Iniciar sesión",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    passwordHint: "8–72 caracteres.",
    pleaseWait: "Espera…",
    genericError: "Algo salió mal",
  },

  marketing: {
    heroBadge: "Hidroponía, hecha accesible",
    heroTitle: "Cultiva alimentos, no conocimientos.",
    heroBody:
      "Catarina es hardware de cultivo inteligente que funciona por sí solo, más un servicio en la nube que convierte los datos de los sensores en información útil — monitoreo, alertas y cuidado asistido por IA que te dice qué hacer y por qué.",
    heroGetStarted: "Empezar",
    heroSeeHow: "Mira cómo funciona",

    productEyebrow: "Por qué Catarina",
    productTitle: "Cuidar plantas, no operar equipos.",
    productDescription:
      "La mayoría de los sistemas hidropónicos te obligan a elegir entre simple-pero-manual y potente-pero-complejo. Catarina cierra esa brecha.",
    gapCards: [
      {
        title: "Demasiado simple",
        body: "Los kits básicos te dejan adivinando — revisiones manuales constantes y mucho ensayo y error.",
      },
      {
        title: "Demasiado complejo",
        body: "Los equipos profesionales son potentes pero exigen verdadera experiencia solo para mantenerlos funcionando.",
      },
      {
        title: "Catarina",
        body: "Un sistema vivo que comunica sus necesidades — accesible para principiantes, profundo para profesionales.",
      },
    ],

    howEyebrow: "Cómo funciona",
    howTitle: "El hardware recoge datos. El software les da sentido.",
    steps: [
      {
        title: "El hardware detecta",
        body: "Temperatura, humedad, luz, niveles de agua y nutrientes — capturados de forma continua, en el dispositivo.",
      },
      {
        title: "Los datos se sincronizan",
        body: "Se almacenan localmente y se sincronizan por Bluetooth o la nube — tardíos, por lotes o desordenados, no hay problema.",
      },
      {
        title: "El software explica",
        body: "Las lecturas se convierten en información clara, tendencias y recomendaciones sobre las que puedes actuar.",
      },
    ],

    serviceEyebrow: "El servicio",
    serviceTitle:
      "Una capa en la nube que te ayuda a cultivar plantas más sanas con menos esfuerzo.",
    serviceDescription:
      "Una suscripción opcional sobre el hardware — siempre aditiva, nunca un muro de pago para las funciones básicas.",
    serviceFeatures: [
      {
        title: "Visibilidad",
        body: "Datos en tiempo real e históricos desde cualquier lugar — multidispositivo, con acceso remoto.",
      },
      {
        title: "Conciencia",
        body: "Alertas cuando las condiciones requieren atención: poca agua, anomalías, equipos, mantenimiento.",
      },
      {
        title: "Comprensión",
        body: "Análisis de salud de las plantas e identificación de tendencias que dan sentido a los datos.",
      },
      {
        title: "Orientación",
        body: "Recomendaciones de riego, nutrientes y ambiente que mejoran los resultados.",
      },
      {
        title: "Colaboración",
        body: "Comparte dispositivos, da acceso al hogar e invita a seguidores de solo lectura.",
      },
    ],

    explainEyebrow: "Un principio",
    explainTitle: "Explicar, no solo alertar.",
    explainDescription:
      "Cada notificación te dice qué pasó, por qué importa y qué hacer — para que actúes con confianza, sin necesidad de experiencia.",
    explainPoints: [
      { label: "Qué pasó", body: "El depósito tiene agua para alrededor de un día." },
      { label: "Por qué importa", body: "La albahaca en fructificación bebe más rápido; el agua baja estresa las raíces." },
      { label: "Qué hacer", body: "Rellena a 2L ahora para mantener el crecimiento en marcha." },
    ],

    twoSidesEyebrow: "Dos caras, una plataforma",
    twoSidesTitle: "El hardware sigue siendo valioso por sí solo.",
    twoSidesDescription:
      "Compra el dispositivo una vez y cultiva plantas y registra datos sin suscripción. El servicio en la nube está para mejorar la experiencia — no para desbloquearla.",
    hardwareTitle: "Hardware",
    hardwareBody:
      "Dispositivos de cultivo inteligentes — desde una sola maceta hasta racks industriales. Una compra única que funciona totalmente sin conexión.",
    hardwareFeatures: [
      "Monitoreo local y almacenamiento en el dispositivo",
      "Sincronización Bluetooth, funciona sin la nube",
      "Úsalo indefinidamente",
    ],
    serviceCardTitle: "Servicio",
    serviceCardBody:
      "Una suscripción opcional que convierte los datos del dispositivo en monitoreo, alertas, orientación con IA y acceso remoto a todos tus dispositivos.",
    serviceCardFeatures: [
      "Sincronización en la nube y analítica histórica",
      "Alertas inteligentes e información de salud de las plantas",
      "Compartir, seguidores y acceso remoto",
    ],

    scalesEyebrow: "Para quién es",
    scalesTitle:
      "De una sola planta a un invernadero — sin cambiar de plataforma.",
    segments: [
      { title: "Hogar", example: "Hierbas de cocina", detail: "Un dispositivo, unas pocas plantas." },
      { title: "Familiar", example: "Comida en familia", detail: "Varios dispositivos o sistemas más grandes." },
      { title: "Comercial", example: "Restaurantes y mercados", detail: "Muchos dispositivos, monitoreo operativo." },
      { title: "Industrial", example: "Gran escala", detail: "Cientos de plantas, telemetría de alto volumen." },
    ],
    scalesNote:
      "Primero el hardware: cada dispositivo sigue funcionando aunque la nube no esté disponible.",

    aiEyebrow: "Hacia dónde va",
    aiTitle: "De plataforma de monitoreo a asistente de cultivo.",
    aiDescription:
      "Catarina está hecha para evolucionar — recopilando datos hoy y ayudándote cada vez más a tomar decisiones con el tiempo.",
    aiPhases: ["Observar", "Detectar", "Recomendar", "Predecir", "Asistir"],
    aiPhaseLabel: (n: number) => `Fase ${n}`,

    ctaTitle: "Empieza a cultivar con menos conjeturas.",
    ctaBody:
      "Crea una cuenta, registra tu dispositivo y deja que Catarina te ayude a cultivar más alimentos con menos experiencia.",
    ctaGetStarted: "Empezar",
    ctaLogIn: "Iniciar sesión",
  },

  mocks: {
    deviceName: "Maceta de cocina",
    deviceActive: "Activo",
    tempLabel: "Temp",
    humidityLabel: "Humedad",
    waterLabel: "Agua",
    notifTitle: "Depósito de agua bajo",
    notifBody:
      "Queda ~1 día. La albahaca bebe más rápido mientras fructifica — rellena a 2L para evitar raíces estresadas.",
    notifAction: "Rellenar depósito →",
  },

  appNav: {
    dashboard: "Panel",
    account: "Cuenta",
    signOut: "Cerrar sesión",
    loading: "Cargando…",
  },

  dashboard: {
    title: "Dispositivos",
    subtitle: "Monitorea y administra tu hardware de cultivo.",
    addDevice: "Añadir dispositivo",
    emptyTitle: "Aún no hay dispositivos",
    emptyBody:
      "Registra tu primer dispositivo Catarina para empezar a monitorear tus plantas.",
    emptyCta: "Añade tu primer dispositivo",
  },

  deviceStatus: {
    active: "Activo",
    provisioned: "Aprovisionado",
    offline: "Sin conexión",
    retired: "Retirado",
  },

  deviceCard: {
    lastSeen: "Visto por última vez",
    never: "Nunca",
    justNow: "Justo ahora",
    minsAgo: (n: number) => `hace ${n} min`,
    hoursAgo: (n: number) => `hace ${n} h`,
    daysAgo: (n: number) => `hace ${n} d`,
  },

  addDevice: {
    titleRegistered: "Dispositivo registrado",
    titleAdd: "Añadir un dispositivo",
    loadingAccounts: "Cargando tus cuentas…",
    account: "Cuenta",
    model: "Modelo",
    serial: "Número de serie",
    serialHint: "Impreso en el dispositivo.",
    nameOptional: "Nombre (opcional)",
    namePlaceholder: "Maceta de cocina",
    firmwareOptional: "Versión de firmware (opcional)",
    registerError: "No se pudo registrar el dispositivo",
    registering: "Registrando…",
    registerCta: "Registrar dispositivo",
    noAccountBody:
      "No tienes una cuenta bajo la cual registrar un dispositivo. Los dispositivos pertenecen a una cuenta, y tu sesión aún no es propietaria ni administradora de ninguna.",
    noAccountManagePre: "Las cuentas que puedes administrar aparecen en la página ",
    noAccountManageLink: "Cuenta",
    noAccountManagePost:
      ". Si está vacía, necesitarás que te creen una cuenta antes de poder añadir dispositivos.",
    secretIntroPre: "Guarda este secreto del dispositivo ahora — se muestra ",
    secretIntroEmphasis: "solo una vez",
    secretIntroPost: " y no se puede recuperar de nuevo.",
    secretSafe:
      "Guárdalo en un lugar seguro (un gestor de contraseñas). Lo necesitarás para autenticar el dispositivo.",
  },

  account: {
    title: "Cuenta",
    subtitle: "Administra tus cuentas, nombres y miembros.",
    profile: "Perfil",
    email: "Correo electrónico",
    yourAccounts: "Tus cuentas",
    noAccounts: "No se encontraron cuentas.",
    renameError: "No se pudo cambiar el nombre",
    edit: "Editar",
    save: "Guardar",
    saving: "Guardando…",
    cancel: "Cancelar",
    hideMembers: "Ocultar miembros",
    viewMembers: "Ver miembros",
    loadingMembers: "Cargando miembros…",
    noMembers: "Sin miembros.",
  },

  device: {
    back: "← Dispositivos",
    fallbackName: "Dispositivo",
    loading: "Cargando dispositivo…",
    tabsAria: "Secciones del dispositivo",
    tabTelemetry: "Telemetría",
    tabGrow: "Cultivo",
    tabActivity: "Actividad",
    compareTo: "Comparar con",
    noCrop: "Sin cultivo",
    bandNote:
      "La banda sombreada muestra el rango ideal para el cultivo seleccionado. Las lecturas fuera de rango se marcan por métrica.",
    limitedNote:
      "Historial limitado — mostrando todas las lecturas disponibles hasta ahora.",
    noReadingsTitle: "Sin lecturas en este rango",
    noReadingsBody:
      "Este dispositivo aún no ha reportado datos de sensores para el periodo seleccionado.",
  },

  metrics: {
    temp: "Temperatura",
    humidity: "Humedad",
    ec: "Nutrientes (EC)",
    lux: "Luz",
    vpd: "VPD (déficit de presión de vapor)",
  },

  chart: {
    range: "rango",
    inRange: "en rango",
    outOfRange: (n: number) => `${n} fuera de rango`,
    ariaLatest: (v: string) => `Último ${v}.`,
    ariaStats: (low: string, avg: string, high: string) =>
      `Mín ${low}, promedio ${avg}, máx ${high}.`,
    ariaOutOfRange: (out: number, total: number) =>
      `${out} de ${total} lecturas fuera del rango ideal.`,
    ariaAllInRange: "Todas las lecturas dentro del rango ideal.",
  },

  insights: {
    title: "Análisis",
    subtitle:
      "Señales derivadas — calculadas a partir de los datos brutos del sensor.",
    lastWindow: (label: string) => `Últimos ${label}`,
    rangeLabels: { "24h": "24 horas", "7d": "7 días", "30d": "30 días" },
    dailyPattern: "Patrón diario · hora del día",
    dliTitle: "Integral de luz diaria",
    dliUnit: "mol/m²/día",
    dliValue: (v: string) => `${v} mol`,
    dliAria: (days: number, today: string | null) =>
      `Integral de luz diaria durante ${days} días.${today ? ` Hoy ${today} mol por metro cuadrado.` : ""}`,
  },

  heatmap: {
    aria: (label: string, days: number, min: string, max: string) =>
      `Patrón de ${label} durante ${days} días, por hora del día. Los valores van de ${min} a ${max}.`,
    noData: (hour: number) => `${hour}:00 — sin datos`,
    cell: (hour: number, value: string) => `${hour}:00 — ${value}`,
  },

  grow: {
    title: "Sitios de cultivo",
    addGrowSite: "Añadir sitio de cultivo",
    loadError: "No se pudieron cargar los sitios de cultivo",
    emptyBody:
      "Aún no hay sitios de cultivo. Añade un espacio para empezar a registrar lo que crece.",
    slot: (n: number) => `Espacio ${n}`,
    empty: "Vacío",
    since: (date: string) => `desde ${date}`,
    startPlanting: "Iniciar siembra",
    ending: "Finalizando…",
    end: "Finalizar",
    addModalTitle: "Añadir sitio de cultivo",
    position: "Posición",
    positionHint: "Número de espacio en el dispositivo.",
    nameOptional: "Nombre (opcional)",
    namePlaceholder: "Bandeja superior",
    addError: "No se pudo añadir el sitio de cultivo",
    adding: "Añadiendo…",
    add: "Añadir",
    startModalTitle: "Iniciar siembra",
    crop: "Cultivo",
    notesOptional: "Notas (opcional)",
    notesPlaceholder: "Plántulas de la bandeja B",
    startError: "No se pudo iniciar la siembra",
    starting: "Iniciando…",
    start: "Iniciar",
  },

  activity: {
    title: "Actividad",
    loadError: "No se pudo cargar la actividad",
    emptyBody:
      "Aún no hay eventos. La actividad del dispositivo — sincronización, ciclos de bomba, alertas — aparecerá aquí.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, es };

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(stored)) return stored;

  const browserLanguage = window.navigator.language.toLowerCase();
  return browserLanguage.startsWith("es") ? "es" : "en";
}

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "es";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Resolve the real locale (localStorage / browser) only after mount. SSR and
  // the first client render must agree on "en" to avoid a hydration mismatch,
  // so this setState-in-effect is intentional, not a cascading-render bug.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(getInitialLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: dictionaries[locale],
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
