// ==========================================
// DATA.JS — Mock data for the social app
// ==========================================

const AppData = {

  // Current user
  currentUser: {
    id: 'u1',
    name: 'Alexis Hernandez',
    handle: 'alexis',
    avatar: null,
    initials: 'AH',
    bio: 'Tratando de conseguir el verificado 🔥',
    joinDate: '2026',
    following: 1,
    followers: 3,
    likes: 0,
  },

  // Posts feed
  posts: [
    {
      id: 'p1',
      user: { id: 'u2', name: 'gam3r564231', handle: 'gam3r564231', initials: 'G', color: '#f97316' },
      content: '¡La partida más rápida que he tenido! 🎮 #ClashRoyale #fyp #contenido',
      time: '4m',
      type: 'video',
      mediaThumb: null,
      likes: 12,
      reposts: 2,
      comments: 1,
      views: 175,
      saves: 0,
      liked: false,
    },
    {
      id: 'p2',
      user: { id: 'u1', name: 'Alexis Hernandez', handle: 'alexis', initials: 'AH', color: '#3b82f6' },
      content: 'Ya tiene pagina web la app? 🌐',
      time: '4m',
      type: 'text',
      likes: 0,
      reposts: 0,
      comments: 0,
      views: 0,
      saves: 0,
      liked: false,
    },
    {
      id: 'p3',
      user: { id: 'u3', name: 'angel.caleb.gt', handle: 'angel.caleb.gt', initials: 'AC', color: '#8b5cf6' },
      content: 'Nuevo día, nueva oportunidad 💪 #fyp #contenido',
      time: '1d',
      type: 'text',
      likes: 8,
      reposts: 1,
      comments: 3,
      views: 92,
      saves: 2,
      liked: false,
    },
    {
      id: 'p4',
      user: { id: 'u4', name: 'scottystiles335', handle: 'scottystiles335', initials: 'SS', color: '#ef4444' },
      content: '🌩️',
      time: '1d',
      type: 'image',
      mediaThumb: null,
      likes: 24,
      reposts: 5,
      comments: 7,
      views: 340,
      saves: 3,
      liked: false,
    },
    {
      id: 'p5',
      user: { id: 'u5', name: 'franklinantonioruiz3', handle: 'franklinantonioruiz3', initials: 'FR', color: '#22c55e' },
      content: '¿Qué opinan de la nueva actualización? #sugerencia #memerengue',
      time: '2h',
      type: 'text',
      likes: 15,
      reposts: 3,
      comments: 8,
      views: 210,
      saves: 1,
      liked: false,
    },
    {
      id: 'p6',
      user: { id: 'u6', name: 'esauesparza39', handle: 'esauesparza39', initials: 'EA', color: '#f59e0b' },
      content: 'Primera semana en la app y ya me encanta la comunidad 🔥🔥 #fpy #x2f',
      time: '3h',
      type: 'text',
      likes: 31,
      reposts: 7,
      comments: 12,
      views: 458,
      saves: 5,
      liked: false,
    },
  ],

  // Trending tags
  trends: [
    { rank: 1, tag: '#fyp', mentions: 33, hot: true },
    { rank: 2, tag: '#sugerencia', mentions: 22, hot: true },
    { rank: 3, tag: '#memerengue', mentions: 12, hot: true },
    { rank: 4, tag: '#fpy', mentions: 12, hot: true },
    { rank: 5, tag: '#contenido', mentions: 12, hot: true },
    { rank: 6, tag: '#x2f', mentions: 9, hot: true },
  ],

  // Suggested users
  suggestedUsers: [
    { id: 'u7', name: 'luisfernandomoralesgarcia405', handle: 'luisfernandomoralesgarcia405', initials: 'LF', color: '#60a5fa' },
    { id: 'u8', name: 'bonillaariel777', handle: 'bonillaariel777', initials: 'BA', color: '#a78bfa' },
    { id: 'u9', name: 'cristoferrobin1901', handle: 'cristoferrobin1901', initials: 'CR', color: '#fb923c' },
  ],

  // Communities
  communities: [
    {
      id: 'c1',
      name: 'Arcade',
      category: 'humanidades',
      members: 124,
      joined: true,
      color: '#3b82f6',
      banner: 'gradient-blue',
    },
    {
      id: 'c2',
      name: 'GGs',
      category: 'general',
      members: 1,
      joined: true,
      color: '#8b5cf6',
      banner: 'gradient-dark',
    },
  ],

  // Explore communities
  exploreCommunities: [
    { id: 'c3', name: 'Cambio físico y consejos', category: 'salud', members: 419, initials: '💪' },
    { id: 'c4', name: 'No te rindas nunca 💯', category: 'general', members: 12, initials: '🔥' },
    { id: 'c5', name: 'Apex Crew', category: 'general', members: 12, initials: '⚡' },
  ],

  // Activity
  activity: [
    { id: 'a1', type: 'like', user: 'luisfernandomoralesgarcia405', time: '1h' },
    { id: 'a2', type: 'like', user: 'esauesparza39', time: '1h' },
    { id: 'a3', type: 'like', user: 'bonillaariel777', time: '1h' },
    { id: 'a4', type: 'like', user: 'scottystiles335', time: '1h' },
    { id: 'a5', type: 'like', user: 'franklinantonioruiz3', time: '1h' },
    { id: 'a6', type: 'like', user: 'cristoferrobin1901', time: '1h' },
    { id: 'a7', type: 'save', user: 'angel.caleb.gt', time: '1h' },
    { id: 'a8', type: 'like', user: 'angel.caleb.gt', time: '1h' },
  ],

  // DM groups
  groups: [
    { id: 'g1', name: 'GGs', category: 'general', members: 1, icon: '🪐' },
    { id: 'g2', name: 'Arcade', category: 'humanidades', members: 64, icon: 'A' },
  ],
};