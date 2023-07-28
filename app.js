const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbPlayerTable = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertDbMatchTable = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
       player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDbPlayerTable(eachPlayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      player_details 
    WHERE 
      player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbPlayerTable(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      match_details 
    WHERE 
      match_id = ${matchId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbMatchTable(player));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
    SELECT
      * 
    FROM
    player_match_score 
        NATURAL JOIN match_details
    WHERE 
    player_id = ${playerID};`;
  const playerMatch = await db.all(getPlayerMatchQuery);
  response.send(playerMatch.map((eachMatch) => convertDbMatchTable(eachMatch)));
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const matchPlayersQuery = `
        SELECT
         * 
        FROM player_match_score
         NATURAL JOIN player_details
        WHERE 
        match_id = ${matchID};`;
  const match = await db.all(matchPlayersQuery);
  response.send(match.map((eachPlayer) => convertDbPlayerTable(eachPlayer)));
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerID } = request.params;
  const getPlayerScores = `
    SELECT 
    player_id as playerId,
    player_name as playerName,
    SUM(scores) as totalScore,
    SUM(fours) as totalFours,
    SUM(sixes) as totalSixes
    FROM 
    player_match_score
     NATURAL JOIN player_details
    WHERE 
    player_id = ${playerId};`;
  const player = await db.get(getPlayerScores);
  response.send(player);
});
module.exports = app;
