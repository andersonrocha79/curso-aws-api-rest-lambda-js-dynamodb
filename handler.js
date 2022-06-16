"use strict";
const pacientes = [];

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// parâmetros para conexao com o DynamoDB local
const dynamodbOfflineOptions = {
  region: "localhost",
  endpoint: "http://localhost:8000"
}

// variável de ambiente que define se estamos offline
const isOffline = () => process.env.IS_OFFLINE;

// se estiver offline conecta no dynamolocal, caso contrário conecta no banco da AWS
const dynamoDb = isOffline() 
  ? new AWS.DynamoDB.DocumentClient(dynamodbOfflineOptions) 
  : new AWS.DynamoDB.DocumentClient();

const params = {
  // TableName: "alura-pacientes" 
  TableName: process.env.PACIENTES_TABLE,
};

module.exports.listarPacientes = async (event) => 
{

  // MySQL
  // SELECT * FROM table LIMIT 10 OFFSET 21
  // DynamoDB
  // Limit = LIMIT, ExclusiveStartKey = OFFSET e LastEvaluatedKey = "Numero da Pagina"  

  try 
  {

    const queryString = {
      limit: 5,
      ...event.queryStringParameters
    }
    
    const { limit, next } = queryString
    
    let localParams = {
      ...params,
      Limit: limit
    }
    
    if (next) {
      localParams.ExclusiveStartKey = {
        paciente_id: next
      }
    }    
    
    let data = await dynamoDb.scan(localParams).promise();

    let nextToken = data.LastEvaluatedKey != undefined
      ? data.LastEvaluatedKey.paciente_id 
      : null;
    
    const result = {
      items: data.Items,
      next_token: nextToken
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };    

  } 
  catch (err) 
  {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.obterPaciente = async (event) => 
{

  try 
  {
  
    const { id } = event.pathParameters;

    // dymaboDb.get equivale a "select * from tabela where id = 1"
    const data = await dynamoDb
      .get( {...params, Key: {paciente_id: id} }).promise();

    if (!data.Item) 
    {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Paciente não existe" }, null, 2),
      };
    }

    const paciente = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(paciente, null, 2),
    };

  } 
  catch (err) 
  {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.cadastrarPaciente = async (event) => 
{

  try 
  {

    const timestamp  = new Date().getTime();
    const idPaciente = uuidv4();

    let dados = JSON.parse(event.body);

    const { nome, data_nascimento, email, telefone } = dados;
    
    const erros = [];

    if (!nome) erros.push("O nome deve ser informado.");
    if (!data_nascimento) erros.push("A data de nascimento deve ser informada.");
    if (!email) erros.push("O e-mail deve ser informado.");
    if (!telefone) erros.push("O telefone deve ser informado.");

    if (erros.length > 0)
    {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Validação de Dados",
          message: erros,
        }),
      };
    }

    const paciente = {
      paciente_id: idPaciente,
      nome,
      data_nascimento,
      email,
      telefone,
      status: true,
      criado_em: timestamp,
      atualizado_em: timestamp,
    };

    // cadastra o paciente na tabela
    await dynamoDb.put(
      {
        TableName: params.TableName,
        Item: paciente,
      })
    .promise();

    // retorna o paciente gravado para retornar ao client
    const data = await dynamoDb.get( 
      {
        ...params, 
        Key: {paciente_id: idPaciente} 
      }
    ).promise();

    const pacienteCadastrado = data.Item;

    return {
      statusCode: 201,
      body: JSON.stringify(pacienteCadastrado, null, 2)
    };

  } 
  catch (err) 
  {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error  : err.name    ? err.name    : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};


module.exports.atualizarPaciente = async (event) => 
{

  const { id } = event.pathParameters

  try 
  {

    const timestamp = new Date().getTime();

    let dados       = JSON.parse(event.body);

    const { nome, data_nascimento, email, telefone } = dados;

    const erros = [];

    if (!nome) erros.push("O nome deve ser informado.");
    if (!data_nascimento) erros.push("A data de nascimento deve ser informada.");
    if (!email) erros.push("O e-mail deve ser informado.");
    if (!telefone) erros.push("O telefone deve ser informado.");

    if (erros.length > 0)
    {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Validação de Dados",
          message: erros,
        }),
      };
    }    

    await dynamoDb.update(
      {
        ...params,
        Key: {
          paciente_id: id
        },
        UpdateExpression:
          'SET nome = :nome, data_nascimento = :dt, email = :email,' +
          ' telefone = :telefone, atualizado_em = :atualizado_em',
        ConditionExpression: 'attribute_exists(paciente_id)',
        ExpressionAttributeValues: {
          ':nome': nome,
          ':dt': data_nascimento,
          ':email': email,
          ':telefone': telefone,
          ':atualizado_em': timestamp
        }
      })
      .promise()

    return {
      statusCode: 204,
    };

  } 
  catch (err) 
  {

    console.log("Error", err);

    let error      = err.name       ? err.name       : "Exception";
    let message    = err.message    ? err.message    : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if (error == 'ConditionalCheckFailedException')
    {
      error = 'Paciente não existe';
      message = `Recurso com o ID ${pacienteId} não existe e não pode ser atualizado`;
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message
      }),
    };
  }

};

module.exports.excluirPaciente = async event => 
{
  
  const { id } = event.pathParameters

  try 
  {
    await dynamoDb.delete(
      {
        ...params,
        Key: {
          paciente_id: id
        },
        ConditionExpression: 'attribute_exists(paciente_id)'
      })
      .promise()
 
    return {
      statusCode: 204
    }

  } 
  catch (err) 
  {

    console.log("Error", err);

    let error      = err.name       ? err.name        : "Exception";
    let message    = err.message    ? err.message     : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode  : 500;

    if (error == 'ConditionalCheckFailedException') 
    {
      error = 'Paciente não existe';
      message = `Recurso com o ID ${id} não existe.`;
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message
      }),
    };

  }

}
