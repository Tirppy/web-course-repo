const toIsoDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const shiftDate = (days) => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)

  return toIsoDate(date)
}

export const seedPlants = [
  {
    id: 'nova-monstera',
    name: 'Nova',
    species: 'Monstera deliciosa',
    room: 'Living room',
    light: 'Bright indirect',
    wateringInterval: 7,
    lastWatered: shiftDate(-6),
    health: 'thriving',
    favorite: true,
    notes: 'Rotate the pot on Sundays and wipe the leaves after watering.',
    createdAt: shiftDate(-40),
    history: [shiftDate(-20), shiftDate(-13), shiftDate(-6)],
  },
  {
    id: 'sol-snake-plant',
    name: 'Sol',
    species: 'Snake plant',
    room: 'Bedroom',
    light: 'Low light',
    wateringInterval: 14,
    lastWatered: shiftDate(-10),
    health: 'steady',
    favorite: false,
    notes: 'Check soil before watering again. This one dries slowly.',
    createdAt: shiftDate(-31),
    history: [shiftDate(-38), shiftDate(-24), shiftDate(-10)],
  },
  {
    id: 'mira-calathea',
    name: 'Mira',
    species: 'Calathea orbifolia',
    room: 'Study corner',
    light: 'Partial shade',
    wateringInterval: 5,
    lastWatered: shiftDate(-6),
    health: 'watch',
    favorite: true,
    notes: 'Leaves curl if the air gets too dry. Mist lightly after lunch.',
    createdAt: shiftDate(-24),
    history: [shiftDate(-16), shiftDate(-11), shiftDate(-6)],
  },
  {
    id: 'piper-pilea',
    name: 'Piper',
    species: 'Pilea peperomioides',
    room: 'Studio shelf',
    light: 'Filtered sun',
    wateringInterval: 6,
    lastWatered: shiftDate(-2),
    health: 'thriving',
    favorite: false,
    notes: 'Turn the pot midweek so the stem grows evenly.',
    createdAt: shiftDate(-18),
    history: [shiftDate(-14), shiftDate(-8), shiftDate(-2)],
  },
  {
    id: 'fern-ivy',
    name: 'Ivy',
    species: 'Boston fern',
    room: 'Bathroom',
    light: 'Bright indirect',
    wateringInterval: 4,
    lastWatered: shiftDate(-3),
    health: 'steady',
    favorite: false,
    notes: 'Humidity helps a lot here; trim dry tips during the weekend reset.',
    createdAt: shiftDate(-12),
    history: [shiftDate(-11), shiftDate(-7), shiftDate(-3)],
  },
]
