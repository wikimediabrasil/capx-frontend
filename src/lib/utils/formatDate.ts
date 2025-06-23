/**
 * Formata uma data ISO para exibição localizada no formato do usuário
 * @param dateString Data no formato ISO (por exemplo: "2023-08-15T14:30:00.000Z")
 * @returns Data formatada para exibição (por exemplo: "15/08/2023")
 */
export function formatDateToLocaleString(dateString: string): string {
  try {
    const date = new Date(dateString);

    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return '';
    }

    // Retorna a data formatada de acordo com a localidade do usuário
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

/**
 * Formata uma data ISO para exibição com data e hora localizada
 * @param dateString Data no formato ISO (por exemplo: "2023-08-15T14:30:00.000Z")
 * @returns Data e hora formatadas para exibição (por exemplo: "15/08/2023 14:30")
 */
export function formatDateTimeToLocaleString(dateString: string): string {
  try {
    const date = new Date(dateString);

    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return '';
    }

    // Retorna a data e hora formatada de acordo com a localidade do usuário
    return date.toLocaleString();
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return '';
  }
}
