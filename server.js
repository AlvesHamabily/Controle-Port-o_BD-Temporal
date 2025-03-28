require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { error } = require("console");

const app = express();
app.use(express.json());
app.use(cors());

 
mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true
}).then(() => console.log("Conectado ao MongoDB"))
  .catch(error => console.error("Erro ao conectar ao MongoDB:", error));

const PortaoSchema = new mongoose.Schema({
   timestamp: { type: Date, default: Date.now },
   acao: { type: String, enum: { values: ["abrir", "fechar"], required: true }
}});

const Portao = mongoose.model("historico_portao", PortaoSchema);

app.post("/abrir", async (req, res) => {
   try {
      const novoRegistro = new Portao({ acao: "abrir" });
      await novoRegistro.save();
      console.log("Registro salvo:", novoRegistro);
      res.json({ message: "Portão aberto!" });
   } catch (error) {
      console.error("Erro ao salvar abertura:", error);
      res.status(500).json({ error: "Erro ao registrar abertura do portão" });
   }
});

app.post("/fechar", async (req, res) => {
   try {
      const novoRegistro = new Portao({ acao: "fechar" });
      await novoRegistro.save();
      console.log("Registro salvo:", novoRegistro);
      res.json({ message: "Portão fechado!" });
   } catch (error) {
      console.error("Erro ao salvar fechamento:", error);
      res.status(500).json({ error: "Erro ao registrar fechamento do portão" });
   }
});

app.get("/historico", async (req, res) => {
   try {
      const historico = await Portao.find().sort({ timestamp: -1 });
      console.log("Histórico recuperado:", historico);

      const historicoFormatado = historico.map(entry => ({
         data_hora: entry.timestamp ? entry.timestamp.toLocaleString('pt-BR') : 'Data não disponível',
         estado: entry.acao == "abrir" ? "Aberto" : "Fechado"
         
      }));
      

      res.json(historicoFormatado);
   } catch (error) {
      console.error("Erro ao recuperar histórico:", error);
      res.status(500).json({ error: "Erro ao recuperar o histórico" });
   }
});



app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
