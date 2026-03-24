
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'plux_master_secure_v1_2025';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

const auth = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Sessão inválida' });
  }
};

// LOGIN REAL-ish
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // Aqui você buscaria no banco 'users' real. 
  // Para o MVP, validamos e geramos o token com o tenant_id fixo por enquanto.
  const token = jwt.sign({ email, tenantId: 'tenant_primary', role: 'ADMIN' }, JWT_SECRET);
  res.json({ token, user: { name: 'Admin Plux', email, role: 'ADMIN', tenantId: 'tenant_primary', status: 'PAID' } });
});

// SALVAR PRODUTO COM ENGENHARIA FISCAL
app.post('/api/products', auth, async (req: any, res) => {
  const { name, category, sale_price, tax_profile, ingredients } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Inserir Produto
    const productRes = await client.query(
      `INSERT INTO products (tenant_id, name, category, sale_price, ncm, fiscal_profile) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user.tenantId, name, category, sale_price, tax_profile.ncm, tax_profile.fiscal_profile]
    );
    const productId = productRes.rows[0].id;

    // 2. Inserir Ingredientes (Ficha Técnica)
    for (const ing of ingredients) {
      await client.query(
        `INSERT INTO product_ingredients (product_id, ingredient_id, qty_used) VALUES ($1, $2, $3)`,
        [productId, ing.ingredient_id, ing.qty_used]
      );
    }

    // 3. Inserir Breakdown Fiscal (Macete Tributário)
    if (tax_profile.price_breakdown) {
      for (const item of tax_profile.price_breakdown) {
        await client.query(
          `INSERT INTO product_tax_breakdown (product_id, name, ncm, allocated_price, is_tax_free) 
           VALUES ($1, $2, $3, $4, $5)`,
          [productId, item.name, item.ncm, item.allocated_price, item.is_tax_free]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ id: productId, message: 'Produto e Engenharia salvos na Cloud.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Falha na persistência' });
  } finally {
    client.release();
  }
});

// LISTAR PRODUTOS CLOUD
app.get('/api/products', auth, async (req: any, res) => {
  const result = await pool.query('SELECT * FROM products WHERE tenant_id = $1', [req.user.tenantId]);
  res.json(result.rows);
});

// PROCESSAR VENDA REAL
app.post('/api/sales', auth, async (req: any, res) => {
  const { items, total_revenue, total_cost, payment_method, sectorId, sessionId, tableName } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saleRes = await client.query(
      `INSERT INTO sales (tenant_id, session_id, total_revenue, total_cost, payment_method, sector_id, table_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [req.user.tenantId, sessionId, total_revenue, total_cost, payment_method, sectorId, tableName]
    );
    const saleId = saleRes.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, name, qty, price_at_sale, cost_at_sale) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [saleId, item.product_id, item.name, item.qty, item.price_at_sale, item.cost_at_sale]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ id: saleId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erro ao processar venda' });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => console.log(`PluxSales Backend em execução na porta ${PORT}`));
