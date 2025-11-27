/**
 * Calcula a próxima data de manutenção
 * A próxima manutenção é agendada para 180 dias após a data de conclusão
 * 
 * @param {Date|string} dataConclusao - Data de conclusão (pode ser Date ou string)
 * @returns {Date} - Data da próxima manutenção (180 dias depois)
 */
export function calcularProximaManutencao(dataConclusao) {
  // Converte para Date se for string
  const data = dataConclusao instanceof Date 
    ? dataConclusao 
    : new Date(dataConclusao);
  
  // Cria uma nova data para não modificar o objeto original
  const proximaData = new Date(data);
  
  // Adiciona 180 dias
  proximaData.setDate(proximaData.getDate() + 180);
  
  return proximaData;
}
