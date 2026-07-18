// netlify/functions/attachments.js
//
// Guarda e devolve os ficheiros anexados (imagens/PDFs das receitas) usando
// o Netlify Blobs — um armazenamento persistente e gratuito (dentro dos
// limites do plano), acessível de qualquer computador que abra o site.
//
// Rotas:
//   POST   /api/attachments        { data, type, name }   -> { ok:true, id }
//   GET    /api/attachments?id=xxx                        -> { data, type, name }
//   DELETE /api/attachments?id=xxx                         -> { ok:true }

import { getStore } from '@netlify/blobs';

export default async (req) => {
  const store = getStore('anexos-receitas');
  const url = new URL(req.url);
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      if (!body.data) {
        return new Response(JSON.stringify({ error: 'campo "data" em falta' }), { status: 400, headers: cors });
      }
      const id = 'anexo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      await store.set(id, JSON.stringify({
        data: body.data,
        type: body.type || 'application/octet-stream',
        name: body.name || 'anexo'
      }));
      return new Response(JSON.stringify({ ok: true, id }), { headers: cors });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'pedido inválido' }), { status: 400, headers: cors });
    }
  }

  if (req.method === 'GET') {
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'parâmetro "id" em falta' }), { status: 400, headers: cors });
    const raw = await store.get(id);
    if (!raw) return new Response(JSON.stringify({ error: 'não encontrado' }), { status: 404, headers: cors });
    return new Response(raw, { headers: cors });
  }

  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (id) await store.delete(id);
    return new Response(JSON.stringify({ ok: true }), { headers: cors });
  }

  return new Response(JSON.stringify({ error: 'método não suportado' }), { status: 405, headers: cors });
};

export const config = { path: '/api/attachments' };
