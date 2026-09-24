const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, '..', 'frontend');

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend kalkulator aktif' });
});

app.post('/api/calculate', (req, res) => {
    const { a, b, operator } = req.body;

    if (a === undefined || b === undefined || !operator) {
    return res.status(400).json({ error: 'Data tidak lengkap. Kirim a, b, dan operator.' });
    }

    const numA = Number(a);
    const numB = Number(b);

    if (Number.isNaN(numA) || Number.isNaN(numB)) {
    return res.status(400).json({ error: 'Nilai a dan b harus berupa angka.' });
    }

    let result;

    switch (operator) {
    case '+':
        result = numA + numB;
        break;
    case '-':
        result = numA - numB;
        break;
    case '*':
      result = numA * numB;
        break;
    case '/':
        if (numB === 0) {
        return res.status(400).json({ error: 'Pembagian dengan nol tidak diperbolehkan.' });
        }
        result = numA / numB;
        break;
    default:
      return res.status(400).json({ error: 'Operator tidak valid. Gunakan +, -, *, atau /.' });
    }

    res.json({
    result,
    expression: `${numA} ${operator} ${numB}`,
    status: 'success'
    });
});

app.use(express.static(frontendDir));

app.get('/', (_req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server kalkulator berjalan di http://localhost:${port}`);
});
