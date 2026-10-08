/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: (removido)    Database: (removido)
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agendamentos`
--

DROP TABLE IF EXISTS `agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `data_auditoria` date NOT NULL,
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamentos`
--

/*!40000 ALTER TABLE `agendamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `agendamentos` ENABLE KEYS */;

--
-- Table structure for table `arquivos`
--

DROP TABLE IF EXISTS `arquivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `arquivos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_resposta` int(11) NOT NULL,
  `tipo` enum('Foto','Video','Arquivo') NOT NULL,
  `caminho` text NOT NULL,
  `dt_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_resposta` (`id_resposta`),
  CONSTRAINT `arquivos_ibfk_1` FOREIGN KEY (`id_resposta`) REFERENCES `respostas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arquivos`
--

/*!40000 ALTER TABLE `arquivos` DISABLE KEYS */;
/*!40000 ALTER TABLE `arquivos` ENABLE KEYS */;

--
-- Table structure for table `auditorias`
--

DROP TABLE IF EXISTS `auditorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `observacao` text DEFAULT NULL,
  `dt_auditoria` date NOT NULL,
  `dt_registro` datetime DEFAULT current_timestamp(),
  `st_auditoria` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `auditorias_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `auditorias_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditorias`
--

/*!40000 ALTER TABLE `auditorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditorias` ENABLE KEYS */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `razao_social` varchar(150) NOT NULL,
  `cnpj` varchar(18) NOT NULL,
  `responsavel` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `dt_registro` datetime DEFAULT current_timestamp(),
  `dt_atualizacao` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;

--
-- Table structure for table `perguntas`
--

DROP TABLE IF EXISTS `perguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `perguntas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_topico` int(11) NOT NULL,
  `descricao_pergunta` varchar(255) NOT NULL,
  `ordem_pergunta` int(11) NOT NULL,
  `dt_registro` datetime DEFAULT current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pergunta_unica_topico` (`id_topico`,`descricao_pergunta`),
  UNIQUE KEY `ordem_unica_por_topico` (`id_topico`,`ordem_pergunta`),
  KEY `id_topico` (`id_topico`),
  CONSTRAINT `perguntas_ibfk_1` FOREIGN KEY (`id_topico`) REFERENCES `topicos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perguntas`
--

/*!40000 ALTER TABLE `perguntas` DISABLE KEYS */;
INSERT INTO `perguntas` VALUES
(1,1,'A planilha de controle de recebimento está sendo preenchida ?',1,'2025-09-06 18:27:43',1),
(2,1,'A data de validade é conferida no recebimento?',2,'2025-09-06 18:27:43',1),
(3,1,'É verificada a integridade das embalagens?',3,'2025-09-06 18:27:43',1),
(4,1,'As planilhas de recebimento de hortifruti, padaria e embalagens estão sendo preenchidas no ato do recebimento, por item?',4,'2025-09-06 18:27:43',1),
(5,1,'Os alimentos perecíveis estão sendo rotulados e armazenados em local e temperatura adequada?',5,'2025-09-06 18:27:43',1),
(6,1,'Os materiais estão sendo armazenados em local apropriado e organizados?',6,'2025-09-06 18:27:43',1),
(7,1,'As entregas de carne e gelados estão sendo conferidas em local e temperatura adequada?',7,'2025-09-06 18:27:43',1),
(8,1,'Há um responsável para o recebimento dos alimentos por planilha?',8,'2025-09-06 18:27:43',1),
(15,3,'O processo de higienização de hortifruti é realizado em 3 etapas (lavagem, sanitização e enxágue)?',1,'2025-09-06 18:27:43',1),
(16,3,'São utilizados produtos saneantes (cloro, hipoclorito, entre outros) nas concentrações e tempos de contato adequados para higienização de hortifruti?',2,'2025-09-06 18:27:43',1),
(17,3,'O enxágue é realizado em água corrente?',3,'2025-09-06 18:27:43',1),
(18,3,'Existe local e utensílios exclusivos para higienização?',4,'2025-09-06 18:27:43',1),
(19,3,'O responsável pelo setor utiliza os EPIs adequados para o processo?',5,'2025-09-06 18:27:43',0),
(20,4,'Os alimentos são armazenados em local apropriado e com temperatura ambiente adequada?',1,'2025-09-06 18:27:43',1),
(21,4,'O local de armazenamento está limpo e organizado?',2,'2025-09-06 18:27:43',1),
(22,4,'Os alimentos estão separados do chão e da parede?',3,'2025-09-06 18:27:43',1),
(23,4,'A validade é verificada diariamente?',4,'2025-09-06 18:27:43',1),
(24,5,'A temperatura do congelador está adequada (abaixo de -18ºC)?',1,'2025-09-06 18:27:43',1),
(25,5,'O armazenamento está limpo e organizado?',2,'2025-09-06 18:27:43',1),
(26,5,'São utilizados termômetros calibrados para monitorar a temperatura?',3,'2025-09-06 18:27:43',1),
(27,5,'As embalagens estão em perfeito estado e corretamente rotuladas?',4,'2025-09-06 18:27:43',1),
(28,5,'Existe a separação de alimentos por tipo?',5,'2025-09-06 18:27:43',1),
(29,6,'A temperatura da geladeira está adequada (abaixo de 5ºC)?',1,'2025-09-06 18:27:43',1),
(30,6,'O armazenamento está limpo e organizado?',2,'2025-09-06 18:27:43',1),
(31,6,'São utilizados termômetros calibrados para monitorar a temperatura?',3,'2025-09-06 18:27:43',1),
(32,6,'As embalagens estão em perfeito estado e corretamente rotuladas?',4,'2025-09-06 18:27:43',1),
(33,6,'Existe a separação de alimentos por tipo?',5,'2025-09-06 18:27:43',1),
(34,7,'Os equipamentos e utensílios estão limpos e conservados?',1,'2025-09-06 18:27:43',1),
(35,7,'São utilizados produtos de limpeza adequados?',2,'2025-09-06 18:27:43',1),
(36,7,'Os utensílios estão identificados por área de uso?',3,'2025-09-06 18:27:43',1),
(37,7,'A higienização é realizada regularmente?',4,'2025-09-06 18:27:43',1),
(38,8,'O salão e as mesas estão limpos e organizados?',1,'2025-09-06 18:27:43',1),
(39,8,'As lixeiras estão em bom estado e com tampas?',2,'2025-09-06 18:27:43',1),
(40,8,'As áreas de circulação estão desimpedidas?',3,'2025-09-06 18:27:43',1),
(41,8,'O local está livre de pragas e vetores?',4,'2025-09-06 18:27:43',1),
(42,9,'A área de pré-preparo é exclusiva e limpa?',1,'2025-09-06 18:27:43',1),
(43,9,'Os utensílios são higienizados antes e depois do uso?',2,'2025-09-06 18:27:43',1),
(44,9,'O pré-preparo de alimentos crus e cozidos é feito em áreas diferentes?',3,'2025-09-06 18:27:43',1),
(45,9,'São utilizadas tábuas de corte de cores diferentes para cada tipo de alimento?',4,'2025-09-06 18:27:43',1),
(46,10,'A temperatura dos alimentos quentes é mantida acima de 60ºC?',1,'2025-09-06 18:27:43',1),
(47,10,'A temperatura dos alimentos frios é mantida abaixo de 5ºC?',2,'2025-09-06 18:27:43',1),
(48,10,'São utilizados equipamentos adequados para a distribuição?',3,'2025-09-06 18:27:43',1),
(49,10,'O responsável pelo setor utiliza os EPIs adequados?',4,'2025-09-06 18:27:43',1),
(50,11,'O lixo é armazenado em local exclusivo e fechado?',1,'2025-09-06 18:27:43',1),
(51,11,'As lixeiras são limpas e desinfetadas regularmente?',2,'2025-09-06 18:27:43',1),
(52,11,'O lixo é retirado diariamente?',3,'2025-09-06 18:27:43',1),
(53,12,'Existe um contrato com uma empresa de controle de pragas?',1,'2025-09-06 18:27:43',1),
(54,12,'São realizadas vistorias regulares?',2,'2025-09-06 18:27:43',1),
(55,12,'As áreas internas e externas estão livres de pragas?',3,'2025-09-06 18:27:43',1),
(56,13,'As embalagens são adequadas para o transporte?',1,'2025-09-06 18:27:43',1),
(57,13,'A temperatura das refeições é monitorada?',2,'2025-09-06 18:27:43',1),
(58,13,'As refeições são transportadas em veículos limpos?',3,'2025-09-06 18:27:43',1),
(59,13,'As refeições são entregues no prazo correto?',4,'2025-09-06 18:27:43',1),
(60,14,'Todos os profissionais estão com as unhas aparadas, limpas e sem esmalte?',1,'2025-09-06 18:27:43',1),
(61,14,'Não usam adornos (aliança, anéis, brincos, cílios postiços, piercing em local aparente)?',2,'2025-09-06 18:27:43',1),
(62,14,'Não usam barba e bigode?',3,'2025-09-06 18:27:43',1),
(63,14,'Profissionais e visitantes usam proteção para os cabelos (touca) cobrindo as orelhas?',4,'2025-09-06 18:27:43',1),
(64,14,'Existe pia exclusiva para higienização das mãos?',5,'2025-09-06 18:27:43',1),
(65,14,'A pia de higiene das mãos não é utilizada para outros fins?',6,'2025-09-06 18:27:43',1),
(66,14,'Quando não há pia exclusiva é determinado um local para higiene das mãos?',7,'2025-09-06 18:27:43',1),
(67,14,'Higienizam as mãos seguindo os procedimentos?',8,'2025-09-06 18:27:43',1),
(68,14,'Há na pia de higienização das mãos sabonete bactericida e papel toalha branco?',9,'2025-09-06 18:27:43',1),
(69,14,'Todos os profissionais estão uniformizados e limpos?',10,'2025-09-06 18:27:43',1),
(253,29,'O descongelamento de carnes é feito em ambiente refrigerado?',1,'2025-09-27 21:34:30',0),
(254,29,'O preparo de carnes é feito em área isolada dos demais alimentos?',2,'2025-09-27 21:34:30',0),
(255,29,'As carnes são embaladas e rotuladas?',3,'2025-09-27 21:34:30',0),
(256,29,'São utilizadas embalagens próprias?',4,'2025-09-27 21:34:30',0),
(257,29,'A refrigeração está adequada?',5,'2025-09-27 21:34:30',0),
(258,29,'É feita a higienização das embalagens de carnes recebidas no local?',6,'2025-09-27 21:34:30',0),
(304,11,'Quando há cruzamento da saída de lixo e entrada de insumos são determinados horários diferentes?',4,'2025-09-27 21:34:30',1),
(305,11,'Os coletores de lixo tem pedal e estão funcionando?',5,'2025-09-27 21:34:30',1),
(306,9,'A temperatura dos alimentos é monitorada dentro de pistas frias e quentes?',5,'2025-09-27 21:34:30',1),
(307,9,'A área de devolução dos alimentos está organizada e limpa?',6,'2025-09-27 21:34:30',1),
(308,9,'Não há cruzamento de restos de alimentos e pratos prontos?',7,'2025-09-27 21:34:30',1),
(309,13,'Alimentos que aguardam distribuição estão em HotBox limpas ?',5,'2025-09-27 21:34:30',1),
(310,13,'A temperatura dos alimentos foi anotada em planilha própria?',6,'2025-09-27 21:34:30',1),
(311,13,'A área de expedição e devolução está limpa?',7,'2025-09-27 21:34:30',1),
(312,13,'A área de expedição e devolução possui paletes ou mesas de apoio?',8,'2025-09-27 21:34:30',1),
(313,13,'É realizada a coleta, identificação e armazenamento das amostras conforme legislação?',9,'2025-09-27 21:34:30',1),
(314,13,'O veículo está limpo?',10,'2025-09-27 21:34:30',1),
(315,13,'A licença sanitária do veículo está dentro do prazo?',11,'2025-09-27 21:34:30',1),
(316,13,'O motorista possui habilitação para este serviço?',12,'2025-09-27 21:34:30',1),
(317,11,'Não há cruzamento de lixo e insumos se estes usam o mesmo local de entrada e saída?',6,'2025-09-27 21:34:30',1),
(318,15,'Os equipamentos de manutenção de temperatura e ventilação estão funcionando e em bom estado de conservação?',1,'2025-10-30 00:57:35',1),
(319,15,'Há correto escoamento de água após as etapas de higienização?',2,'2025-10-30 00:57:35',1),
(320,15,'É feita a troca ou a higienização constante (a cada 2h) das facas, chairas e tábuas?',3,'2025-10-30 00:57:35',1),
(321,15,'Há diferenciação dos utensílios por espécie de carne a ser manipulada? ',4,'2025-10-30 00:57:35',1),
(322,15,'Há luva de malha de aço?',5,'2025-10-30 00:57:35',1),
(323,15,'A luva de malha de aço está limpa e armazenada corretamente?',6,'2025-10-30 00:57:35',1),
(450,56,'Os equipamentos de manutenção de temperatura e ventilação estão funcionando e em bom estado de conservação?',1,'2025-11-03 21:26:51',1),
(451,56,'Há correto escoamento de água após as etapas de higienização?',2,'2025-11-03 21:26:51',1),
(452,56,'É feita a troca ou a higienização constante (a cada 2h) das facas, chairas e tábuas?',3,'2025-11-03 21:26:51',1),
(453,56,'Há diferenciação dos utensílios por espécie de carne a ser manipulada? ',4,'2025-11-03 21:26:51',1),
(454,56,'Há luva de malha de aço?',5,'2025-11-03 21:26:51',1),
(455,56,'A luva de malha de aço está limpa e armazenada corretamente?',6,'2025-11-03 21:26:51',1),
(456,57,'Existe um contrato com uma empresa de controle de pragas?',1,'2025-11-03 21:31:14',1),
(457,57,'São realizadas vistorias regulares?',2,'2025-11-03 21:31:14',1),
(458,57,'As áreas internas e externas estão livres de pragas?',3,'2025-11-03 21:31:14',1),
(459,57,'As armadilhas de mosca estão limpas e com o refil trocado?',4,'2025-11-03 21:31:14',1),
(460,58,'O descongelamento de carnes é feito em ambiente refrigerado?',1,'2025-11-23 23:47:24',1),
(461,58,'O preparo de carnes é feito em área isolada dos demais alimentos?',2,'2025-11-23 23:47:24',1),
(462,58,'As carnes são embaladas e rotuladas?',3,'2025-11-23 23:47:24',1),
(463,58,'São utilizadas embalagens próprias?',4,'2025-11-23 23:47:24',1),
(464,58,'A refrigeração das carnes está adequada?',5,'2025-11-23 23:47:24',1),
(465,58,'É feita a higienização das embalagens de carnes recebidas no local?',6,'2025-11-23 23:47:24',1),
(466,59,'O descongelamento de carnes é feito em ambiente refrigerado?',1,'2025-11-23 23:47:25',0),
(467,59,'O preparo de carnes é feito em área isolada dos demais alimentos?',2,'2025-11-23 23:47:25',0),
(468,59,'As carnes são embaladas e rotuladas?',3,'2025-11-23 23:47:25',0),
(469,59,'São utilizadas embalagens próprias?',4,'2025-11-23 23:47:25',0),
(470,59,'A refrigeração das carnes está adequada?',5,'2025-11-23 23:47:25',0),
(471,59,'É feita a higienização das embalagens de carnes recebidas no local?',6,'2025-11-23 23:47:25',0),
(472,60,'Os equipamentos e utensílios estão limpos e conservados?',1,'2025-12-02 23:28:51',1),
(473,60,'São utilizados produtos de limpeza adequados?',2,'2025-12-02 23:28:51',1),
(474,60,'Os utensílios estão identificados por área de uso?',3,'2025-12-02 23:28:51',1),
(475,60,'A higienização é realizada regularmente?',4,'2025-12-02 23:28:51',1),
(476,60,'São utilizados panos multi uso corretamente?',5,'2025-12-02 23:28:51',1),
(477,61,'O salão e as mesas estão limpos e organizados?',1,'2025-12-02 23:48:27',1),
(478,61,'As lixeiras estão em bom estado e com tampas?',2,'2025-12-02 23:48:27',1),
(479,61,'As áreas de circulação estão desimpedidas?',3,'2025-12-02 23:48:27',1),
(480,61,'O local está livre de pragas e vetores?',4,'2025-12-02 23:48:27',1),
(481,61,'As planilhas internas estão sendo preenchidas?',5,'2025-12-02 23:48:27',1),
(482,62,'A temperatura dos alimentos quentes é mantida acima de 60ºC?',1,'2025-12-08 20:26:42',1),
(483,62,'A temperatura dos alimentos frios é mantida abaixo de 5ºC?',2,'2025-12-08 20:26:42',1),
(484,62,'São utilizados equipamentos adequados para a distribuição?',3,'2025-12-08 20:26:42',1),
(485,62,'O responsável pelo setor utiliza os EPIs adequados?',4,'2025-12-08 20:26:42',1),
(486,63,'As embalagens são adequadas para o transporte?',1,'2025-12-08 20:27:19',1),
(487,63,'A temperatura das refeições é monitorada?',2,'2025-12-08 20:27:19',1),
(488,63,'As refeições são transportadas em veículos limpos?',3,'2025-12-08 20:27:19',1),
(489,63,'As refeições são entregues no prazo correto?',4,'2025-12-08 20:27:19',1),
(490,63,'Alimentos que aguardam distribuição estão em HotBox limpas ?',5,'2025-12-08 20:27:19',1),
(491,63,'A temperatura dos alimentos foi anotada em planilha própria?',6,'2025-12-08 20:27:19',1),
(492,63,'A área de expedição e devolução está limpa?',7,'2025-12-08 20:27:19',1),
(493,63,'A área de expedição e devolução possui paletes ou mesas de apoio?',8,'2025-12-08 20:27:19',1),
(494,63,'É realizada a coleta, identificação e armazenamento das amostras conforme legislação?',9,'2025-12-08 20:27:19',1),
(495,63,'O veículo está limpo?',10,'2025-12-08 20:27:19',1),
(496,63,'A licença sanitária do veículo está dentro do prazo?',11,'2025-12-08 20:27:19',1),
(497,63,'O motorista possui habilitação para este serviço?',12,'2025-12-08 20:27:19',1),
(498,64,'Os equipamentos de manutenção de temperatura e ventilação estão funcionando e em bom estado de conservação?',1,'2025-12-08 20:27:55',1),
(499,64,'Há correto escoamento de água após as etapas de higienização?',2,'2025-12-08 20:27:55',1),
(500,64,'É feita a troca ou a higienização constante (a cada 2h) das facas, chairas e tábuas?',3,'2025-12-08 20:27:55',1),
(501,64,'Há diferenciação dos utensílios por espécie de carne a ser manipulada? ',4,'2025-12-08 20:27:55',1),
(502,64,'Há luva de malha de aço?',5,'2025-12-08 20:27:55',1),
(503,64,'A luva de malha de aço está limpa e armazenada corretamente?',6,'2025-12-08 20:27:55',1),
(504,65,'A temperatura do congelador está adequada (abaixo de -18ºC)?',1,'2025-12-08 20:30:27',1),
(505,65,'O armazenamento está limpo e organizado?',2,'2025-12-08 20:30:27',1),
(506,65,'São utilizados termômetros calibrados para monitorar a temperatura?',3,'2025-12-08 20:30:27',1),
(507,65,'As embalagens estão em perfeito estado e corretamente rotuladas?',4,'2025-12-08 20:30:27',1),
(508,65,'Existe a separação de alimentos por tipo?',5,'2025-12-08 20:30:27',1),
(509,66,'A temperatura do congelador está adequada (abaixo de -18ºC)?',1,'2025-12-08 20:31:07',1),
(510,66,'O armazenamento está limpo e organizado?',2,'2025-12-08 20:31:07',1),
(511,66,'São utilizados termômetros calibrados para monitorar a temperatura?',3,'2025-12-08 20:31:07',1),
(512,66,'As embalagens estão em perfeito estado e corretamente rotuladas?',4,'2025-12-08 20:31:07',1),
(513,66,'Existe a separação de alimentos por tipo?',5,'2025-12-08 20:31:07',1),
(514,67,'A temperatura dos equipamentos está adequada?',1,'2025-12-08 20:32:21',1),
(515,67,'O armazenamento está limpo e organizado?',2,'2025-12-08 20:32:21',1),
(516,67,'São utilizados termômetros calibrados para monitorar a temperatura?',3,'2025-12-08 20:32:21',1),
(517,67,'As embalagens estão em perfeito estado e corretamente rotuladas?',4,'2025-12-08 20:32:21',1),
(518,67,'Existe a separação de alimentos por tipo?',5,'2025-12-08 20:32:21',1),
(519,68,'Os equipamentos e utensílios estão limpos e conservados?',1,'2025-12-09 09:59:51',1),
(520,68,'São utilizados produtos de limpeza adequados?',2,'2025-12-09 09:59:51',1),
(521,68,'Os utensílios estão identificados por área de uso?',3,'2025-12-09 09:59:51',1),
(522,68,'A higienização é realizada regularmente?',4,'2025-12-09 09:59:51',1),
(523,68,'São utilizados panos multi uso corretamente?',5,'2025-12-09 09:59:51',1),
(524,69,'Os equipamentos e utensílios estão limpos e conservados?',1,'2025-12-09 09:59:53',1),
(525,69,'São utilizados produtos de limpeza adequados?',2,'2025-12-09 09:59:53',1),
(526,69,'Os utensílios estão identificados por área de uso?',3,'2025-12-09 09:59:53',1),
(527,69,'A higienização é realizada regularmente?',4,'2025-12-09 09:59:53',1),
(528,69,'São utilizados panos multi uso corretamente?',5,'2025-12-09 09:59:53',1),
(529,70,'O salão e as mesas estão limpos e organizados?',1,'2025-12-09 10:00:05',1),
(530,70,'As lixeiras estão em bom estado e com tampas?',2,'2025-12-09 10:00:05',1),
(531,70,'As áreas de circulação estão desimpedidas?',3,'2025-12-09 10:00:05',1),
(532,70,'O local está livre de pragas e vetores?',4,'2025-12-09 10:00:05',1),
(533,70,'As planilhas internas estão sendo preenchidas?',5,'2025-12-09 10:00:05',1);
/*!40000 ALTER TABLE `perguntas` ENABLE KEYS */;

--
-- Table structure for table `perguntas_snapshot`
--

DROP TABLE IF EXISTS `perguntas_snapshot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `perguntas_snapshot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_auditoria` int(11) NOT NULL,
  `id_pergunta_original` int(11) NOT NULL,
  `id_topico_snapshot` int(11) NOT NULL,
  `descricao_pergunta` varchar(255) NOT NULL,
  `ordem_pergunta` int(11) NOT NULL,
  `dt_snapshot` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ps_auditoria` (`id_auditoria`),
  KEY `fk_ps_pergunta_original` (`id_pergunta_original`),
  KEY `fk_ps_topico_snapshot` (`id_topico_snapshot`),
  CONSTRAINT `fk_ps_auditoria` FOREIGN KEY (`id_auditoria`) REFERENCES `auditorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ps_pergunta_original` FOREIGN KEY (`id_pergunta_original`) REFERENCES `perguntas` (`id`),
  CONSTRAINT `fk_ps_topico_snapshot` FOREIGN KEY (`id_topico_snapshot`) REFERENCES `topicos_snapshot` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perguntas_snapshot`
--

/*!40000 ALTER TABLE `perguntas_snapshot` DISABLE KEYS */;
/*!40000 ALTER TABLE `perguntas_snapshot` ENABLE KEYS */;

--
-- Table structure for table `respostas`
--

DROP TABLE IF EXISTS `respostas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `respostas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_auditoria` int(11) NOT NULL,
  `id_pergunta` int(11) NOT NULL,
  `st_pergunta` enum('CF','NC','PC','NE') NOT NULL,
  `comentario` text DEFAULT NULL,
  `dt_resposta` datetime DEFAULT current_timestamp(),
  `dt_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_auditoria_pergunta` (`id_auditoria`,`id_pergunta`),
  KEY `id_auditoria` (`id_auditoria`),
  KEY `id_pergunta` (`id_pergunta`),
  CONSTRAINT `respostas_ibfk_1` FOREIGN KEY (`id_auditoria`) REFERENCES `auditorias` (`id`),
  CONSTRAINT `respostas_ibfk_2` FOREIGN KEY (`id_pergunta`) REFERENCES `perguntas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respostas`
--

/*!40000 ALTER TABLE `respostas` DISABLE KEYS */;
/*!40000 ALTER TABLE `respostas` ENABLE KEYS */;

--
-- Table structure for table `topicos`
--

DROP TABLE IF EXISTS `topicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `topicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_tema` varchar(100) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `requisitos` text DEFAULT NULL,
  `dt_registro` datetime DEFAULT current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `ordem_topico` int(11) DEFAULT NULL,
  `versao_anterior_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_usuario_id` (`usuario_id`),
  KEY `fk_versao_anterior` (`versao_anterior_id`),
  CONSTRAINT `fk_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_versao_anterior` FOREIGN KEY (`versao_anterior_id`) REFERENCES `topicos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topicos`
--

/*!40000 ALTER TABLE `topicos` DISABLE KEYS */;
INSERT INTO `topicos` VALUES
(1,'RECEBIMENTO DE MERCADORIAS',1,'(Requisito 7.4.3 Verificação do Produto Adquirido)','2025-08-05 13:58:03',1,12,NULL),
(3,'HIGIENIZAÇÃO DE HORTIFRUTI',1,'(Requisito 7.5.3 Manipulação)','2025-08-05 13:58:03',1,10,NULL),
(4,'ARMAZENAMENTO (ESTOQUE SECO) ',1,'(Requisito 7.4.3 Armazenamento)','2025-08-05 14:45:27',1,3,NULL),
(5,'ARMAZENAMENTO (FREEZER / CÂMARA CONGELADOS)',1,'(Requisito 7.4.3 Armazenamento)','2025-08-05 14:45:39',0,NULL,NULL),
(6,'ARMAZENAMENTO (GELADEIRA/ CÂMARA REFRIGERADA) ',1,'(Requisito 8.1.3 Ponto de Controle)','2025-09-06 13:05:00',0,NULL,NULL),
(7,'EQUIPAMENTOS E UTENSÍLIOS (LIMPEZA E CONSERVAÇÃO)',1,'(Requisito 7.5.3 Exposição)','2025-09-06 13:05:00',0,NULL,NULL),
(8,'LIMPEZA E ORGANIZAÇÃO -  GERAL',1,'(Requisito 7.5.3 Pós-Preparo)','2025-09-06 13:05:00',0,NULL,NULL),
(9,'PRÉ-PREPARO/PREPARO DE ALIMENTOS',1,'(Requisito 7.4.3 Armazenamento)','2025-09-06 13:05:00',1,6,NULL),
(10,'DISTRIBUIÇÃO - UAN',1,'(Requisito 8.5.2 Manutenção)','2025-09-06 13:05:00',0,NULL,NULL),
(11,'LIXO',1,'(Requisito 7.5.3 Manipuladores)','2025-09-06 13:05:00',1,8,NULL),
(12,'CONTROLE DE VETORES E PRAGAS/ANÁLISE DA ÁGUA E LICENÇAS',1,'(Requisitos 6.4 Ambiente de Trabalho/ 8.2.3 Monitoramento e Medição de Processos/ 4.2.4 Controle de Registros/ 7.5. Controle de Produção e Prestação de Serviços e 7.5.3 Identificação e Rastreabilidade)','2025-09-06 17:22:08',0,NULL,NULL),
(13,'REFEIÇÕES TRANSPORTADA  - UAN',1,'(Requisitos 6.2.2 Competência, treinamento e Conscientização/ 6.3 infraestrutura/ 6.4 Ambiente de Trabalho/ 7.5.1 Controle de Produção e Prestação de Serviços 7.5.5 Preservação do Produto)','2025-09-06 17:24:18',0,NULL,NULL),
(14,'MANIPULADORES/HÁBITOS HIGIÊNICOS',1,'(Requisitos 6.4 Ambiente de Trabalho/ 6.3 Infraestrutura/ 8.2.3 Monitoramento e Medição de Processos)','2025-09-06 17:25:03',1,9,NULL),
(15,'AÇOUGUES/MANIPULAÇÃO DE POA',1,'(Requisito 7.5.3 Manipulação)','2025-10-30 00:46:47',0,NULL,NULL),
(29,'MANIPULAÇÃO DE CARNES/PEIXES/FRUTO DO MAR',1,'(Requisito 7.5.3 Manipulação)','2025-09-27 21:34:30',0,NULL,NULL),
(56,'AÇOUGUES/MANIPULAÇÃO DE POA',1,'(Requisito 7.5.3 Manipulação)','2025-11-03 21:26:50',0,NULL,NULL),
(57,'CONTROLE DE VETORES E PRAGAS/ANÁLISE DA ÁGUA E LICENÇAS',1,'(Requisitos 6.4 Ambiente de Trabalho/ 8.2.3 Monitoramento e Medição de Processos/ 4.2.4 Controle de Registros/ 7.5. Controle de Produção e Prestação de Serviços e 7.5.3 Identificação e Rastreabilidade)','2025-11-03 21:31:14',1,7,NULL),
(58,'MANIPULAÇÃO DE CARNES/PEIXES/FRUTO DO MAR',23,'(Requisito 7.5.3 Manipulação)','2025-11-23 23:47:24',1,2,NULL),
(59,'MANIPULAÇÃO DE CARNES/PEIXES/FRUTO DO MAR',23,'(Requisito 7.5.3 Manipulação)','2025-11-23 23:47:25',0,NULL,NULL),
(60,'EQUIPAMENTOS E UTENSÍLIOS (LIMPEZA E CONSERVAÇÃO)',1,'(Requisito 7.5.3 Exposição)','2025-12-02 23:28:51',0,NULL,NULL),
(61,'LIMPEZA E ORGANIZAÇÃO -  GERAL',1,'(Requisito 7.5.3 Pós-Preparo)','2025-12-02 23:48:27',0,NULL,NULL),
(62,'DISTRIBUIÇÃO - UAN',1,'(Requisito 8.5.2 Manutenção)','2025-12-08 20:26:42',1,15,NULL),
(63,'REFEIÇÕES TRANSPORTADA  - UAN',1,'(Requisitos 6.2.2 Competência, treinamento e Conscientização/ 6.3 infraestrutura/ 6.4 Ambiente de Trabalho/ 7.5.1 Controle de Produção e Prestação de Serviços 7.5.5 Preservação do Produto)','2025-12-08 20:27:19',1,14,NULL),
(64,'AÇOUGUES/MANIPULAÇÃO DE POA',1,'(Requisito 7.5.3 Manipulação)','2025-12-08 20:27:55',1,13,NULL),
(65,'ARMAZENAMENTO (CÂMARA CONGELADOS E REFRIGELADOS)',1,'(Requisito 7.4.3 Armazenamento)','2025-12-08 20:30:27',0,NULL,NULL),
(66,'ARMAZENAMENTO (CÂMARA CONGELADOS E REFRIGERADOS)',1,'(Requisito 7.4.3 Armazenamento)','2025-12-08 20:31:07',0,NULL,NULL),
(67,'ARMAZENAMENTO (CÂMARA CONGELADOS E REFRIGERADOS)',1,'(Requisito 7.4.3 Armazenamento)','2025-12-08 20:32:21',1,11,NULL),
(68,'EQUIPAMENTOS E UTENSÍLIOS (LIMPEZA E CONSERVAÇÃO)',23,'(Requisito 7.5.3 Exposição)','2025-12-09 09:59:51',1,1,NULL),
(69,'EQUIPAMENTOS E UTENSÍLIOS (LIMPEZA E CONSERVAÇÃO)',23,'(Requisito 7.5.3 Exposição)','2025-12-09 09:59:53',1,5,NULL),
(70,'LIMPEZA E ORGANIZAÇÃO -  GERAL',23,'(Requisito 7.5.3 Pós-Preparo)','2025-12-09 10:00:05',1,4,NULL);
/*!40000 ALTER TABLE `topicos` ENABLE KEYS */;

--
-- Table structure for table `topicos_snapshot`
--

DROP TABLE IF EXISTS `topicos_snapshot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `topicos_snapshot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_auditoria` int(11) NOT NULL,
  `id_topico_original` int(11) NOT NULL,
  `nome_tema` varchar(100) NOT NULL,
  `requisitos` text DEFAULT NULL,
  `ordem_topico` int(11) DEFAULT NULL,
  `dt_snapshot` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ts_auditoria` (`id_auditoria`),
  KEY `fk_ts_topico_original` (`id_topico_original`),
  CONSTRAINT `fk_ts_auditoria` FOREIGN KEY (`id_auditoria`) REFERENCES `auditorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ts_topico_original` FOREIGN KEY (`id_topico_original`) REFERENCES `topicos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topicos_snapshot`
--

/*!40000 ALTER TABLE `topicos_snapshot` DISABLE KEYS */;
/*!40000 ALTER TABLE `topicos_snapshot` ENABLE KEYS */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `dt_registro` datetime DEFAULT current_timestamp(),
  `tipo_usuario` enum('ADM','AUD') NOT NULL DEFAULT 'AUD',
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;

--
-- Dumping routines for database 'u372081436_const_teste'
--

--
-- DADOS FICTÍCIOS DE EXEMPLO (ambiente de desenvolvimento)
-- Nenhum dado real de clientes, usuários ou evidências é mantido neste arquivo.
-- Os tópicos e perguntas do questionário foram preservados.
--
-- Usuários de teste (senha de todos: dev123456):
--   admin@exemplo.com   (ADM)
--   auditor1@exemplo.com (AUD)
--   auditor2@exemplo.com (AUD)
--

INSERT INTO `usuarios` (id, nome, email, cpf, tipo_usuario, senha) VALUES
(1,'Administrador Exemplo','admin@exemplo.com','000.000.000-00','ADM','$2b$10$lxS45XYBtWOON7yq7vCkLOFtPQB4WglcGhKCs6PGJxkqXchMUm7j.'),
(2,'Auditor Exemplo Um','auditor1@exemplo.com','111.111.111-11','AUD','$2b$10$lxS45XYBtWOON7yq7vCkLOFtPQB4WglcGhKCs6PGJxkqXchMUm7j.'),
(3,'Auditor Exemplo Dois','auditor2@exemplo.com','222.222.222-22','AUD','$2b$10$lxS45XYBtWOON7yq7vCkLOFtPQB4WglcGhKCs6PGJxkqXchMUm7j.');

UPDATE `topicos` SET usuario_id = 1;

INSERT INTO `clientes` (id, razao_social, cnpj, responsavel, email, telefone, endereco) VALUES
(1,'Restaurante Sabor da Casa','11.111.111/0001-11','Maria Exemplo','contato@saborexemplo.test','(11) 90000-0001','Rua das Flores, 100 - Centro'),
(2,'Padaria Pão Quente','22.222.222/0001-22','João Exemplo','contato@paoquente.test','(11) 90000-0002','Av. Principal, 200 - Centro'),
(3,'Mercado Bom Preço','33.333.333/0001-33','Ana Exemplo','contato@bompreco.test','(11) 90000-0003','Rua do Comércio, 300 - Centro');

INSERT INTO `auditorias` (id, id_usuario, id_cliente, observacao, dt_auditoria, st_auditoria) VALUES
(1,2,1,'Auditoria de exemplo finalizada.','2026-08-12','F'),
(2,3,2,'Auditoria de exemplo finalizada.','2026-09-10','F'),
(3,2,1,'Auditoria de exemplo em andamento.','2026-10-05','A');

INSERT INTO `agendamentos` (cliente_id, usuario_id, data_auditoria, observacoes) VALUES
(3,2,'2026-11-10','Agendamento de exemplo.');

-- Snapshots do questionário ativo para cada auditoria de exemplo
INSERT INTO `topicos_snapshot` (id_auditoria, id_topico_original, nome_tema, requisitos, ordem_topico)
SELECT a.id, t.id, t.nome_tema, t.requisitos, t.ordem_topico
FROM `auditorias` a JOIN `topicos` t ON t.is_active = 1
ORDER BY a.id, t.ordem_topico;

INSERT INTO `perguntas_snapshot` (id_auditoria, id_pergunta_original, id_topico_snapshot, descricao_pergunta, ordem_pergunta)
SELECT ts.id_auditoria, p.id, ts.id, p.descricao_pergunta, p.ordem_pergunta
FROM `topicos_snapshot` ts
JOIN `perguntas` p ON p.id_topico = ts.id_topico_original AND p.is_active = 1
ORDER BY ts.id, p.ordem_pergunta;

-- Respostas: auditorias 1 e 2 completas; auditoria 3 apenas no primeiro tópico
INSERT INTO `respostas` (id_auditoria, id_pergunta, st_pergunta, comentario)
SELECT x.id_auditoria, x.id_pergunta, x.st,
       IF(x.st = 'NC', 'Exemplo: não conformidade identificada, ação corretiva a definir.', NULL)
FROM (
  SELECT ps.id_auditoria, ps.id_pergunta_original AS id_pergunta,
         ELT(1 + ((ps.id_pergunta_original + ps.id_auditoria) MOD 7), 'CF','CF','CF','CF','PC','NC','NE') AS st
  FROM `perguntas_snapshot` ps
  WHERE ps.id_auditoria IN (1, 2)
     OR (ps.id_auditoria = 3 AND ps.id_topico_snapshot = (
          SELECT MIN(ts3.id) FROM `topicos_snapshot` ts3 WHERE ts3.id_auditoria = 3))
) x;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

