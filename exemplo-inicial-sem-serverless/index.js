const pacientes = 
[
    {id: 1, nome: "Jesus", idade: 33},
    {id: 2, nome: "José" , idade: 56},
    {id: 3, nome: "Maria", idade: 75},
    {id: 4, nome: "Anderson", idade: 43},
    {id: 5, nome: "Hiriane", idade: 33},
]

function buscarPaciente(campo, valor) 
{
    return pacientes.find(paciente => paciente[campo] == valor);
}

exports.handler = async (event) => 
{
    
    console.log("executou lambda curso alura 1-3...");
    console.log(event);
    
    console.log("Paciente informado: " + event.pacienteId);
    
    let pacienteEncontrado = pacientes
    
    if (event.filtros.pacienteId) 
        pacienteEncontrado = buscarPaciente('id', event.filtros.pacienteId)
    else if (event.filtros.idade)
        pacienteEncontrado = buscarPaciente('idade', event.filtros.idade)
    
    // formata a resposta com body em formato json
    const response = 
    {
        statusCode: 200,
        body: JSON.stringify(pacienteEncontrado),
    };
    
    return response;
    
};
