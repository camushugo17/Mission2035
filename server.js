const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// In-memory game state
let gameState = {
  started: false,
  startedAt: null,
  event: null,
  zonesConfig: [],
};

let teams = new Map();
let connections = new Map();

// REST API endpoints
app.get('/api/game-state', (req, res) => {
  res.json({
    global: gameState,
    teams: Array.from(teams.values()).map(t => ({
      slug: t.slug,
      name: t.name,
      icon: t.icon,
      color: t.color,
      pathIndex: t.pathIndex,
      completed: t.completed,
      online: t.online,
    })),
  });
});

app.post('/api/team-join', express.json(), (req, res) => {
  const { name, slug, icon, color } = req.body;
  
  if (!slug || !name) {
    return res.status(400).json({ error: 'Invalid team data' });
  }

  let team = teams.get(slug);
  if (!team) {
    team = {
      slug,
      name,
      icon,
      color,
      pathIndex: 0,
      completed: [],
      inventory: [],
      joinedAt: Date.now(),
      lastHeartbeat: Date.now(),
      online: 0,
    };
    teams.set(slug, team);
  } else {
    team.lastHeartbeat = Date.now();
  }

  broadcast({ type: 'team-joined', team: sanitizeTeam(team) });
  res.json(sanitizeTeam(team));
});

app.post('/api/team-update', express.json(), (req, res) => {
  const { slug, pathIndex, completed, inventory } = req.body;
  
  let team = teams.get(slug);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  team.pathIndex = pathIndex;
  team.completed = completed;
  team.inventory = inventory;
  team.lastHeartbeat = Date.now();

  broadcast({ type: 'team-updated', team: sanitizeTeam(team) });
  res.json(sanitizeTeam(team));
});

app.post('/api/admin/start', express.json(), (req, res) => {
  gameState.started = true;
  gameState.startedAt = Date.now();
  
  broadcast({ type: 'game-started', data: gameState });
  res.json(gameState);
});

app.post('/api/admin/event', express.json(), (req, res) => {
  const { title, message } = req.body;
  
  gameState.event = {
    id: Date.now(),
    title,
    message,
    ts: Date.now(),
  };

  broadcast({ type: 'event-broadcast', data: gameState.event });
  res.json(gameState.event);
});

app.post('/api/admin/zones', express.json(), (req, res) => {
  gameState.zonesConfig = req.body;
  
  broadcast({ type: 'zones-updated', data: gameState.zonesConfig });
  res.json(gameState.zonesConfig);
});

app.post('/api/admin/reset', (req, res) => {
  teams.clear();
  gameState = {
    started: false,
    startedAt: null,
    event: null,
    zonesConfig: [],
  };
  
  broadcast({ type: 'game-reset' });
  res.json({ success: true });
});

function sanitizeTeam(team) {
  return {
    slug: team.slug,
    name: team.name,
    icon: team.icon,
    color: team.color,
    pathIndex: team.pathIndex,
    completed: team.completed,
    inventory: team.inventory,
    online: team.online,
    joinedAt: team.joinedAt,
  };
}

// WebSocket connections
wss.on('connection', (ws) => {
  const connId = Date.now() + Math.random();
  let currentTeam = null;

  console.log(`Client connected: ${connId}`);

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);

      if (msg.type === 'join-room') {
        currentTeam = msg.slug;
        if (!connections.has(currentTeam)) {
          connections.set(currentTeam, []);
        }
        connections.get(currentTeam).push(ws);
        
        const team = teams.get(currentTeam);
        if (team) {
          team.online = (connections.get(currentTeam) || []).length;
        }
        
        broadcast({ type: 'team-online-update', team: sanitizeTeam(team) });
        ws.send(JSON.stringify({ type: 'join-success', team: sanitizeTeam(team) }));
      } 
      else if (msg.type === 'team-progress') {
        const team = teams.get(currentTeam);
        if (team) {
          team.pathIndex = msg.pathIndex;
          team.completed = msg.completed;
          team.inventory = msg.inventory;
          team.lastHeartbeat = Date.now();
        }
        broadcast({ type: 'team-updated', team: sanitizeTeam(team) });
      }
      else if (msg.type === 'heartbeat') {
        const team = teams.get(currentTeam);
        if (team) {
          team.lastHeartbeat = Date.now();
        }
      }
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  });

  ws.on('close', () => {
    if (currentTeam && connections.has(currentTeam)) {
      const list = connections.get(currentTeam);
      const idx = list.indexOf(ws);
      if (idx > -1) list.splice(idx, 1);
      
      const team = teams.get(currentTeam);
      if (team) {
        team.online = list.length;
      }
      
      if (list.length === 0) {
        connections.delete(currentTeam);
      }
      
      broadcast({ type: 'team-online-update', team: sanitizeTeam(team) });
    }
    console.log(`Client disconnected: ${connId}`);
  });
});

// Broadcast to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Cleanup heartbeat check
setInterval(() => {
  const now = Date.now();
  const timeout = 30000; // 30 seconds
  
  for (const [slug, team] of teams) {
    if (now - team.lastHeartbeat > timeout && team.online === 0) {
      teams.delete(slug);
    }
  }
}, 10000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
