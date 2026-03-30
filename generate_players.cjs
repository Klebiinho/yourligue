const teams = [
    {id:"1169074f-e52e-4c39-a1a7-1c491ea507c2",name:"Brasil"},
    {id:"93ba8b13-abdf-459c-9b59-deb15d3b2c38",name:"França"},
    {id:"64021203-8162-47a5-9c3a-1e84a8f3763b",name:"Argentina"},
    {id:"25d99c48-2b36-4205-a76f-677e7774e809",name:"Portugal"},
    {id:"f84d5297-dd7f-42cf-b64d-82a2b7f131ae",name:"Inglaterra"},
    {id:"7f0c8015-59a5-4aac-a4ab-42477f14efd4",name:"Alemanha"},
    {id:"78328b7f-59c8-4a08-a9af-9d4891132b5d",name:"Estados Unidos"},
    {id:"ccb97038-be64-4f09-ab8b-421bbee62b70",name:"México"},
    {id:"74095cc0-d0e5-4936-9971-148b1a819449",name:"Canadá"},
    {id:"3f78f1e1-4e2c-48ad-8644-1495ea1f53f6",name:"Itália"},
    {id:"912bfa84-ba80-47bc-8a1c-cbd6aee7e8bf",name:"Bélgica"},
    {id:"65d4aed0-d547-4e4e-85ef-23079a839d71",name:"Holanda"},
    {id:"8ba239bc-724a-416c-a0ac-62eceb9a8ced",name:"Croácia"},
    {id:"a45da8e3-a729-4a84-8560-92f49feb7dff",name:"Dinamarca"},
    {id:"4464759e-158a-4ac1-b69b-48adb36a012b",name:"Suíça"},
    {id:"3579fef9-c1a1-48ee-aaec-14ac56b20da1",name:"Uruguai"},
    {id:"4c8e2416-9d48-44d1-83d4-8a1dec21b233",name:"Colômbia"},
    {id:"636d111c-aaa7-4987-b6b2-d8acd80e5198",name:"Chile"},
    {id:"6ac05222-9f1b-4bd2-98c4-7f8d65a813cb",name:"Peru"},
    {id:"1231e62d-f6f0-4ef4-9adc-e0094ed3ab11",name:"Equador"},
    {id:"86f90102-d3d2-4e39-93fc-7a581e069127",name:"Marrocos"},
    {id:"6313055c-74bf-4779-9a18-68d42de97953",name:"Senegal"},
    {id:"57535f49-66a0-450f-9cac-9960b6a2d34a",name:"Japão"},
    {id:"bd604b23-7177-4d06-bd50-bfe2c1f66539",name:"Coréia do Sul"},
    {id:"850265d0-608c-440d-bdd1-e2cbc8e1dbd5",name:"Austrália"},
    {id:"5b653d94-456c-444a-a001-29e30bea4bdc",name:"Irã"},
    {id:"6883b15a-e90b-4c1c-b91d-fe4eb22ed01c",name:"Arábia Saudita"},
    {id:"23537e0a-7659-4565-98c9-59b162a84678",name:"Camarões"},
    {id:"909f07ef-70c7-4750-8271-5a7e6298890e",name:"Gana"},
    {id:"06f5ab20-d729-4bff-b20f-c08d4c7f0446",name:"Nigéria"},
    {id:"9fc69ab4-eabe-4b11-a038-92c0dfa5bede",name:"Egito"},
    {id:"4e303de9-44d7-4da0-ba70-5a3fa1808693",name:"Polônia"},
    {id:"25f614b5-35d8-4664-9f30-1b34ba96a764",name:"Suécia"},
    {id:"5ff5b943-c44d-43ae-8781-467f97b29b22",name:"Noruega"},
    {id:"692ced12-4beb-40ff-8e77-29075cc2b82c",name:"Turquia"},
    {id:"d0ed3840-1134-4955-8c21-84d3ca88df0e",name:"Sérvia"},
    {id:"d3c399c3-203b-4559-9ce3-93bb9e99ffac",name:"Escócia"},
    {id:"0c7ffbb3-a1ad-40c7-9522-215def7f4d83",name:"País de Gales"},
    {id:"0229f4d6-0545-406e-8063-2a144d1b0844",name:"Tunísia"},
    {id:"8c179e21-20c0-44c3-b18f-c3fdcc1991b6",name:"Argélia"},
    {id:"92f8ef89-ece6-4df5-bc23-1a5ce09e3b5d",name:"Costa do Marfim"},
    {id:"3aea690e-5002-474b-95d2-01b158bd9b27",name:"Paraguai"},
    {id:"3b920318-317b-4983-9303-e83201735183",name:"Bolívia"},
    {id:"965b0258-1d03-4700-b9d8-06145f1481ed",name:"Venezuela"},
    {id:"a0755b46-2da2-4466-bed6-6297b149375e",name:"Qatar"},
    {id:"e9d29edd-21a1-4bb9-89d9-743f89651aaa",name:"Costa Rica"},
    {id:"2f8450ae-fe1a-419c-9168-15185bb0c18f",name:"Panamá"},
    {id:"e2d154c6-f2dc-47b8-ba02-889ef9b0f2a3",name:"Jamaica"}
];

const positions = [
  { type: "GOL", count: 3 },
  { type: "DEF", count: 8 },
  { type: "MEI", count: 6 },
  { type: "ATA", count: 6 }
];

const leagueId = "ea9b244c-0635-4728-85cf-1b303d63de95";
let entries = [];

teams.forEach(t => {
  let number = 1;
  positions.forEach(pos => {
    for (let i = 0; i < pos.count; i++) {
      const isReserve = number > 11;
      const isCaptain = number === 4;
      entries.push(`('${t.name}_${number}', '${t.id}', '${leagueId}', ${number}, '${pos.type}', ${isReserve}, ${isCaptain})`);
      number++;
    }
  });
});

const sql = `INSERT INTO public.players (name, team_id, league_id, number, position, is_reserve, is_captain) VALUES \n${entries.join(",\n")};`;

require("fs").writeFileSync("players_all.sql", sql);
console.log("Arquivo players_all.sql gerado com sucesso!");
