// netlify/functions/pedidos.js
//
// Guarda e devolve a lista completa de pedidos, usando o Netlify Blobs.
// Substitui a necessidade de guardar os dados na folha do Google Sheets —
// agora tudo (pedidos + imagens) fica guardado no mesmo sítio (Netlify),
// acessível de qualquer computador que abra o site.
//
// Rotas:
//   GET  /api/pedidos          -> devolve o array completo de pedidos
//   POST /api/pedidos  {pedidos:[...]}  -> substitui o array guardado

import { getStore } from '@netlify/blobs';

const KEY = 'lista-pedidos';

export default async (req) => {
  const store = getStore('pedidos-manipulados');
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method === 'GET') {
    const raw = await store.get(KEY);
    return new Response(raw || '[]', { headers: cors });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const pedidos = Array.isArray(body.pedidos) ? body.pedidos : [];
      await store.set(KEY, JSON.stringify(pedidos));
      return new Response(JSON.stringify({ ok: true, total: pedidos.length }), { headers: cors });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'pedido inválido' }), { status: 400, headers: cors });
    }
  }

  return new Response(JSON.stringify({ error: 'método não suportado' }), { status: 405, headers: cors });
};

export const config = { path: '/api/pedidos' };
