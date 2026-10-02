#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script: Conceder Permissões Automaticamente
Projeto: SIGA Secult
Descrição: Conecta ao banco PostgreSQL e concede todas as permissões ao admin
"""

import psycopg2
import sys
from datetime import datetime

# Configurações de conexão
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'siga_secult',
    'user': 'siga_user',
    'password': 'siga_password'
}

# Definir os módulos e ações
PERMISSOES = {
    'Usuarios': ['listar', 'criar', 'editar', 'deletar', 'visualizar'],
    'Documentos': ['listar', 'criar', 'editar', 'deletar', 'visualizar'],
    'Compras': ['listar', 'criar', 'editar', 'deletar', 'visualizar'],
    'Estoque': ['listar', 'criar', 'editar', 'deletar', 'visualizar'],
    'Ocorrencias': ['listar', 'criar', 'editar', 'deletar', 'visualizar'],
    'Agenda': ['listar', 'criar', 'editar', 'deletar', 'visualizar'],
    'Comunicacao': ['listar', 'criar', 'editar', 'deletar', 'visualizar']
}

def conectar_banco():
    """Conectar ao banco PostgreSQL"""
    try:
        print("🔌 Conectando ao banco de dados...")
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Conexão estabelecida!")
        return conn
    except psycopg2.Error as e:
        print(f"❌ Erro de conexão: {e}")
        sys.exit(1)

def obter_id_admin(conn):
    """Obter ID do usuário admin"""
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, nome, email, perfil 
            FROM "Usuario" 
            WHERE email = %s
        ''', ('admin@secult.com',))
        
        resultado = cursor.fetchone()
        cursor.close()
        
        if resultado:
            admin_id, nome, email, perfil = resultado
            print(f"✅ Admin encontrado:")
            print(f"   • ID: {admin_id}")
            print(f"   • Nome: {nome}")
            print(f"   • Email: {email}")
            print(f"   • Perfil: {perfil}")
            return admin_id
        else:
            print("❌ Admin não encontrado no banco!")
            return None
    except psycopg2.Error as e:
        print(f"❌ Erro ao buscar admin: {e}")
        return None

def conceder_permissoes(conn, admin_id):
    """Conceder todas as permissões ao admin"""
    try:
        cursor = conn.cursor()
        total_concedidas = 0
        total_duplicatas = 0
        
        print(f"\n🔐 Concedendo permissões para admin (ID: {admin_id})...\n")
        
        for modulo, acoes in PERMISSOES.items():
            print(f"📦 Módulo: {modulo}")
            
            for acao in acoes:
                try:
                    # Verificar se já existe
                    cursor.execute('''
                        SELECT id FROM "Permissao"
                        WHERE usuario_id = %s
                        AND modulo = %s
                        AND acao = %s
                    ''', (admin_id, modulo, acao))
                    
                    if cursor.fetchone():
                        print(f"   ⏭️  {acao:15} (Já existe)")
                        total_duplicatas += 1
                    else:
                        # Inserir nova permissão
                        cursor.execute('''
                            INSERT INTO "Permissao" (usuario_id, modulo, acao, criado_em)
                            VALUES (%s, %s, %s, %s)
                        ''', (admin_id, modulo, acao, datetime.now()))
                        
                        print(f"   ✅ {acao:15} (Concedida)")
                        total_concedidas += 1
                        
                except psycopg2.Error as e:
                    print(f"   ❌ {acao:15} (Erro: {e})")
            
            print()
        
        conn.commit()
        
        print(f"\n{'='*60}")
        print(f"📊 RESULTADO:")
        print(f"   • Permissões novas: {total_concedidas}")
        print(f"   • Duplicatas (já existiam): {total_duplicatas}")
        print(f"   • Total de permissões do admin: {total_concedidas + total_duplicatas}")
        print(f"{'='*60}\n")
        
        cursor.close()
        return total_concedidas
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao conceder permissões: {e}")
        conn.rollback()
        return 0

def listar_permissoes(conn, admin_id):
    """Listar todas as permissões do admin"""
    try:
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) FROM "Permissao"
            WHERE usuario_id = %s
        ''', (admin_id,))
        
        total = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT modulo, COUNT(*) 
            FROM "Permissao"
            WHERE usuario_id = %s
            GROUP BY modulo
            ORDER BY modulo
        ''', (admin_id,))
        
        print(f"\n✅ PERMISSÕES DO ADMIN:\n")
        print(f"Total: {total} permissões\n")
        print(f"{'Módulo':<20} {'Ações':<10}")
        print(f"{'-'*30}")
        
        for modulo, quantidade in cursor.fetchall():
            print(f"{modulo:<20} {quantidade:<10}")
        
        print()
        cursor.close()
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao listar permissões: {e}")

def main():
    """Função principal"""
    print("\n" + "="*60)
    print("🔐 CONCEDER PERMISSÕES - SIGA SECULT")
    print("="*60 + "\n")
    
    # Conectar ao banco
    conn = conectar_banco()
    
    # Obter ID do admin
    admin_id = obter_id_admin(conn)
    if not admin_id:
        conn.close()
        return
    
    # Conceder permissões
    print()
    conceder_permissoes(conn, admin_id)
    
    # Listar permissões
    listar_permissoes(conn, admin_id)
    
    # Fechar conexão
    conn.close()
    
    print("✅ Processo concluído com sucesso!")
    print("\n🚀 Próximo passo:")
    print("   1. Faça novo login em http://localhost")
    print("   2. Tente acessar os módulos")
    print("   3. Erro 403 deve desaparecer!")
    print()

if __name__ == '__main__':
    main()
