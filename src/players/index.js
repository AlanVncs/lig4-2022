import MyScript from "./myScript/index.js";

const players = {
  data: [
    {
      name: "Marcos",
      script: async (a,b) => {
        return await MyScript(a,b);
      },
      photo: "./src/images/marcos.jpg",
    }
  ],

  getAll: () => {
    return [...players.data];
  },

  getByName: (name) => {
    const playerList = players.getAll();

    return playerList.find((player) => player.name === name);
  },
};

export default players;
