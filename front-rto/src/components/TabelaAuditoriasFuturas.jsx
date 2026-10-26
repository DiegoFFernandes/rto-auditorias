import React from 'react';
import {
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, List, ListItem, Card, CardContent, Divider,
  IconButton, Tooltip
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { dataLocal } from '../utils/formatarData';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';
import api from '../api/api';

const TabelaAuditoriasFuturas = ({ auditorias, setAuditorias }) => {
  const EmptyState = () => (
    <Paper sx={{ textAlign: 'center', p: 4, mt: 2, backgroundColor: 'grey.100' }}>
      <Typography variant="h6" color="text.secondary">Nenhuma auditoria agendada</Typography>
      <Typography variant="body2" color="text.secondary">Utilize o formulário para criar um novo agendamento.</Typography>
    </Paper>
  );

  const handleExcluir = async (id) => {
    const confirmacao = window.confirm('Tem certeza que deseja excluir este agendamento? Esta ação é irreversível.');

    if (confirmacao) {
      try {
        const response = await api.delete(`/auditorias/agendamentos/${id}`);

        if (response.status === 200) {
          setAuditorias(auditorias.filter(auditoria => auditoria.id !== id));
          toast.success('Agendamento excluído com sucesso!');
        } else {
          const userMessage = `Não foi possível excluir o agendamento. Tente novamente.`;
          toast.error(userMessage);
          console.error('Erro ao excluir. Resposta inesperada do servidor:', response);
        }
      } catch (error) {
        console.error('Erro técnico ao excluir o agendamento:', error);

        let userMessage = 'Erro ao conectar com o servidor. Verifique sua conexão ou tente novamente mais tarde.';

        if (error.response) {
          userMessage = `Erro: ${error.response.data.mensagem || error.response.statusText}`;
        }

        toast.error(userMessage);
      }
    }
  };

  if (!auditorias || auditorias.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
        Próximas Auditorias
      </Typography>

      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, boxShadow: 3, borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de auditorias">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Empresa</TableCell>
              <TableCell sx={{ color: 'white' }}>Auditor</TableCell>
              <TableCell sx={{ color: 'white' }}>Data</TableCell>
              <TableCell sx={{ color: 'white' }}>Observações</TableCell>
              <TableCell sx={{ color: 'white' }} align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditorias.map((auditoria) => (
              <TableRow
                key={auditoria.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {auditoria.cliente_razao_social}
                </TableCell>
                <TableCell>{auditoria.auditor_nome || 'N/A'}</TableCell>
                <TableCell>
                  {auditoria.data_auditoria
                    ? format(dataLocal(auditoria.data_auditoria), 'dd/MM/yyyy', { locale: ptBR })
                    : 'N/A'}
                </TableCell>
                <TableCell>{auditoria.observacoes || 'Sem observações'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Excluir">
                    <IconButton
                      aria-label="excluir"
                      color="error"
                      onClick={() => handleExcluir(auditoria.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <List sx={{ display: { xs: 'block', md: 'none' }, p: 0 }}>
        {auditorias.map((auditoria) => (
          <ListItem key={auditoria.id} sx={{ p: 0, mb: 2 }}>
            <Card variant="outlined" sx={{ width: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <BusinessIcon color="action" sx={{ mr: 1.5 }} />
                  <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                    {auditoria.cliente_razao_social || 'N/A'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                    <CalendarMonthIcon color="action" sx={{ mr: 1.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      Data: {auditoria.data_auditoria
                        ? format(dataLocal(auditoria.data_auditoria), "dd 'de' MMMM, yyyy", { locale: ptBR })
                        : 'N/A'}
                    </Typography>
                  </Box>
                  <Tooltip title="Excluir">
                    <IconButton
                      aria-label="excluir"
                      color="error"
                      onClick={() => handleExcluir(auditoria.id)}
                      sx={{ mt: 1.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                  <PersonIcon color="action" sx={{ mr: 1.5 }} />
                  <Typography variant="body1" color="text.secondary">
                    Auditor: {auditoria.auditor_nome || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                  <DescriptionIcon color="action" sx={{ mr: 1.5 }} />
                  <Typography variant="body1" color="text.secondary">
                    Obs: {auditoria.observacoes || 'Sem observações'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TabelaAuditoriasFuturas;