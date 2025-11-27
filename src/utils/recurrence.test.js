import { describe, it, expect } from 'vitest';
import { calcularProximaManutencao } from './recurrence.js';

describe('calcularProximaManutencao', () => {
  it('deve retornar hoje + 180 dias quando a data de conclusão for hoje', () => {
    const hoje = new Date();
    const resultado = calcularProximaManutencao(hoje);
    
    // Calcula a data esperada (hoje + 180 dias)
    const esperado = new Date(hoje);
    esperado.setDate(esperado.getDate() + 180);
    
    // Compara ano, mês e dia
    expect(resultado.getFullYear()).toBe(esperado.getFullYear());
    expect(resultado.getMonth()).toBe(esperado.getMonth());
    expect(resultado.getDate()).toBe(esperado.getDate());
  });

  it('deve funcionar com entrada como string ISO', () => {
    const dataString = '2024-01-15T10:00:00.000Z';
    const resultado = calcularProximaManutencao(dataString);
    
    // Calcula a data esperada a partir da string
    const dataInicial = new Date(dataString);
    const esperado = new Date(dataInicial);
    esperado.setDate(esperado.getDate() + 180);
    
    expect(resultado.getFullYear()).toBe(esperado.getFullYear());
    expect(resultado.getMonth()).toBe(esperado.getMonth());
    expect(resultado.getDate()).toBe(esperado.getDate());
  });

  it('deve funcionar com entrada como objeto Date', () => {
    const dataObjeto = new Date(2024, 5, 20); // 20 de junho de 2024
    const resultado = calcularProximaManutencao(dataObjeto);
    
    // Calcula a data esperada
    const esperado = new Date(dataObjeto);
    esperado.setDate(esperado.getDate() + 180);
    
    expect(resultado.getFullYear()).toBe(esperado.getFullYear());
    expect(resultado.getMonth()).toBe(esperado.getMonth());
    expect(resultado.getDate()).toBe(esperado.getDate());
  });

  it('deve retornar um novo objeto Date sem modificar o original', () => {
    const dataOriginal = new Date(2024, 0, 1);
    const dataOriginalCopia = new Date(dataOriginal);
    
    calcularProximaManutencao(dataOriginal);
    
    // Verifica que a data original não foi modificada
    expect(dataOriginal.getTime()).toBe(dataOriginalCopia.getTime());
  });
});
