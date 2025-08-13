export function cnpjValido(cnpj: string): boolean {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');

    // Verifica tamanho e sequências inválidas
    if (cnpj.length !== 14 ||
        /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }

    // Calcula primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = (peso === 2) ? 9 : peso - 1;
    }
    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;

    // Calcula segundo dígito verificador
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = (peso === 2) ? 9 : peso - 1;
    }
    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;

    // Verifica dígitos calculados
    return (parseInt(cnpj.charAt(12)) === digito1 &&
        (parseInt(cnpj.charAt(13))) === digito2);
}