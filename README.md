# 📗 curso alura
projeto do curso de desenvolvimento de api rest utilizando lambda e dynamodb da aws

## preparando o ambiente:
  instalar o AWS CLI
  criar ou logar na conta da AWS
  criar um usuário na AWS para utilização no processo (IAM)
  executar aws configure e informar as credenciais do usuário
  instalar o npm
  instalar o serverless

## para logar na conta teste 
  aws configure 
  rochasoft
  curso-sls-alura
  key: <<INFORMAR_KEY_AWS>>
  secret: <<INFORMAR_SECRET_AWS>>

## para criar a estrutura inicial do projeto node.js
  npm init -y

## instalando a biblioteca utilizadas no projeto
  npm install moment
  npm install uuid

## deploy de lambda sem utilização do serverless
  para fazer o deploy, gerar um zip com os arquivos gerando o deploy.zip e carregar no painel da aws
  
  para fazer o deploy do código do lambda utilizando o aws-cli
  aws lambda update-function-code --function-name curso-alura-1-3 --zip-file fileb://deploy.zip

## criar um novo projeto utilizando o serverless
  serverless create --template aws-nodejs --path cadastro-pacientes
  
  para executar a função criada como exemplo (local)
  serverless invoke local -f hello

  executando a nova função criada passando payload
  serverless invoke local -f listarPacientes -d '{"teste":"anderson"}'

## fazendo deploy do código na aws
  serverless deploy

## fazendo deploy para o ambiente de 'qa'
  serverless deploy --stage qa

## para executar o endpoint gerado pela api configurada
  curl <<endpoint>>/dev/pacientes/2

## para visualizar os logs gerados nas chamadas da api
  serverless logs -f obterPaciente --tail

## fazer deploy de apenas uma função do arquivo handler.js
  serverless deploy -f obterPaciente

## para obter informações das funções e endpoints criados
  serverless info

## para rodar a aplicação local para não ter que ficar fazendo deploy na aws a todo momento
  instalar o plugin offline (https://github.com/dherault/serverless-offline)
  npm install serverless-offline --save-dev
  habilitar o plugin no serverless.yml
    plugins:
    - serverless-offline
  para rodar o projeto localmente
    serverless offline

## instalando o client da aws
  npm instal aws-sdk 

## comando para cadastrar os registros contidos no arquivo 'pacientes.json' na tabela dynamo da AWS
  aws dynamodb batch-write-item -- request-items file://pacientes.json

## instalando o plugin para armazenamento de dados do dynamo localmente
  npm i serverless-dynamodb-local --save-dev
  serverless dynamodb install
  habilitar o plugin no serverless.yml
    plugins:
    - serverless-dynamodb-local
  
## iniciando a aplicação e também o dynamodb local
  serverless offline start

## para fazer o deploy criando um novo ambiente para testes na aws
  o nome passado como parâmetro "qa" será utilizado na variável de ambiente para criação da tabela do dynamodb
  serverless deploy --stage qa

## endereço para conhecer plugins do serverless framework
  https://www.serverless.com/plugins/





