require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
    .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

const VendaSchema = new mongoose.Schema({
    numero: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    endereco: { type: String, required: true },
    data: { type: Date, default: Date.now }
});

const Venda = mongoose.model('Venda', VendaSchema);

app.get('/api/rifa', async (req, res) => {
    try {
        const vendas = await Venda.find({}, 'numero');
        const numerosVendidos = vendas.map(venda => venda.numero);
        res.json(numerosVendidos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar os números.' });
    }
});

app.post('/api/comprar', async (req, res) => {
    const { numero, nome, telefone, endereco } = req.body;

    if (!numero || !nome || !telefone || !endereco) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    try {
        const numeroJaVendido = await Venda.findOne({ numero: numero });
        if (numeroJaVendido) {
            return res.status(409).json({ message: 'Ops! Este número já foi comprado por outra pessoa.' });
        }
        const novaVenda = new Venda({ numero, nome, telefone, endereco });
        await novaVenda.save();
        res.status(201).json({ message: 'Compra registrada com sucesso!', venda: novaVenda });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao registrar a compra.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor da Rifa rodando na porta ${PORT}`);
});