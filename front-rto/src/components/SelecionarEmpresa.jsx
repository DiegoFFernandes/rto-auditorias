import { useMemo } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import '../styles/SelecionarEmpresa/index.css';

const apenasDigitos = (valor) => String(valor || '').replace(/\D/g, '');

// A busca ignora maiúsculas e acentos e aceita parte do nome ou do CNPJ (com ou sem pontuação).
const filtrarEmpresas = createFilterOptions({
  stringify: (empresa) => `${empresa.razao_social} ${empresa.cnpj || ''} ${apenasDigitos(empresa.cnpj)}`,
});

const COR_MARCA = '#660c39';

// Lista suspensa de empresas com busca digitada (substitui o <select>, que obrigava a rolar a lista inteira).
//  - value: id da empresa selecionada ("" ou null quando não há)
//  - onChange: recebe o objeto da empresa escolhida, ou null quando o campo é limpo
const SelecionarEmpresa = ({
  empresas,
  value,
  onChange,
  id,
  ariaLabel = 'Empresa',
  placeholder = 'Digite o nome ou CNPJ para buscar...',
  disabled = false,
  size = 'medium',
}) => {
  const selecionada = useMemo(
    () => empresas.find((empresa) => String(empresa.id) === String(value)) || null,
    [empresas, value]
  );

  return (
    <Autocomplete
      id={id}
      className="selecionar-empresa"
      options={empresas}
      value={selecionada}
      onChange={(_evento, empresa) => onChange(empresa)}
      getOptionLabel={(empresa) => empresa.razao_social || ''}
      isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
      filterOptions={filtrarEmpresas}
      disabled={disabled}
      size={size}
      openOnFocus
      autoHighlight
      selectOnFocus
      blurOnSelect
      handleHomeEndKeys
      noOptionsText="Nenhuma empresa encontrada"
      clearText="Limpar"
      openText="Abrir lista"
      closeText="Fechar lista"
      renderOption={(props, empresa) => {
        const { key, ...demais } = props;
        return (
          <li key={key} {...demais}>
            <span className="selecionar-empresa-opcao">
              <strong>{empresa.razao_social}</strong>
              {empresa.cnpj && <small>{empresa.cnpj}</small>}
            </span>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.inputProps, 'aria-label': ariaLabel },
          }}
        />
      )}
      slotProps={{
        listbox: { sx: { maxHeight: 280 } },
      }}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#fff',
          borderRadius: '8px',
          fontFamily: 'inherit',
          fontSize: { xs: '1rem', md: '0.95rem' },
          '& fieldset': { borderColor: '#ced4da' },
          '&:hover fieldset': { borderColor: COR_MARCA },
          '&.Mui-focused fieldset': { borderColor: COR_MARCA, borderWidth: '2px' },
        },
        '& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator': { color: COR_MARCA },
      }}
    />
  );
};

export default SelecionarEmpresa;
