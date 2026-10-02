# SIGA Secult com Docker

## Prerequisites

- Docker
- Docker Compose

## Iniciar o projeto

```bash
docker-compose up -d
```

## Parar o projeto

```bash
docker-compose down
```

## Parar e remover volumes

```bash
docker-compose down -v
```

## Visualizar logs

```bash
docker-compose logs -f
```

## Específico para um serviço

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Acessar o banco de dados

```bash
docker exec -it siga_secult_db psql -U siga_user -d siga_secult
```

## Executar migrations

```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

## URLs

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432

## Credenciais padrão

- **Usuário DB**: siga_user
- **Senha DB**: siga_password
- **Database**: siga_secult
- **Login App**: admin@secult.com / admin123

## Troubleshooting

### Erro de port já em uso

```bash
# Encontrar processo usando a porta
lsof -i :3000
# Ou no Windows
netstat -ano | findstr :3000

# Parar o processo (Windows)
taskkill /PID <PID> /F

# Mudar porta no docker-compose.yml
```

### Banco de dados não conecta

```bash
# Verificar se o container postgres está rodando
docker ps

# Ver logs do postgres
docker-compose logs postgres
```

### Migrations falharam

```bash
# Resetar banco (cuidado!)
docker-compose down -v
docker-compose up -d
```
