exports.handler = async (event) => {
  /* Só aceita POST */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }
 
  /* Lê a chave do ambiente (configurada em Site Settings → Environment Variables) */
  const ASAAS_KEY = process.env.ASAAS_KEY;
  if (!ASAAS_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Chave Asaas não configurada no servidor. Adicione ASAAS_KEY nas Environment Variables do Netlify.' })
    };
  }
 
  /* Lê os parâmetros enviados pelo front-end */
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Body inválido' }) };
  }
 
  const { method, path, data } = payload;
 
  if (!method || !path) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Parâmetros method e path são obrigatórios' }) };
  }
 
  /* Monta e executa a requisição para a Asaas */
  const ASAAS_URL = 'https://api.asaas.com/api/v3';
 
  const options = {
    method,
    headers: {
      'access_token': ASAAS_KEY,
      'Content-Type': 'application/json'
    }
  };
 
  if (data) options.body = JSON.stringify(data);
 
  try {
    const response = await fetch(ASAAS_URL + path, options);
    const responseData = await response.json();
 
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(responseData)
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ message: 'Erro ao conectar com a Asaas: ' + err.message })
    };
  }
};
