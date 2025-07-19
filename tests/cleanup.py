import requests
import json
import os


API_URL = "https://gerencia-patrimonial-api.onrender.com/api" 
DATA_FILE = "created_data.json"

def cleanup():
    """
    Limpa os dados criados pelo teste de Selenium fazendo chamadas diretas à API.
    """
    print("\n--- INICIANDO SCRIPT DE LIMPEZA ---")
    
    try:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Arquivo '{DATA_FILE}' não encontrado. Nada a limpar.")
        return

    gestor_email = data.get("gestor_email")
    gestor_senha = data.get("gestor_senha")

    if not gestor_email or not gestor_senha:
        print("Dados do gestor não encontrados no arquivo. Limpeza abortada.")
        return

    try:
        print(f"Fazendo login como '{gestor_email}' para obter permissões...")
        login_data = {"email": gestor_email, "senha": gestor_senha}
        login_response = requests.post(f"{API_URL}/token/", json=login_data)
        
        if login_response.status_code != 200:
            print(f"Não foi possível logar como '{gestor_email}'. O usuário provavelmente já foi removido. Limpeza concluída.")
            return
            
        token = login_response.json()['access']
        user_id = login_response.json()['usuario']['id']
        headers = {'Authorization': f'Bearer {token}'}
        print("Login bem-sucedido.")

        print("Buscando a empresa criada pelo gestor...")
        empresas_response = requests.get(f"{API_URL}/usuarios/{user_id}/empresas/", headers=headers)
        empresas_response.raise_for_status()
        
        empresas_do_gestor = empresas_response.json()
        
        if not empresas_do_gestor:
            print("Nenhuma empresa encontrada para este gestor.")
        else:
            for empresa in empresas_do_gestor:
                empresa_id_a_deletar = empresa['id']
                print(f"Deletando a empresa '{empresa['nome']}' (ID: {empresa_id_a_deletar})...")
                delete_empresa_response = requests.delete(f"{API_URL}/empresas/{empresa_id_a_deletar}/", headers=headers)
                delete_empresa_response.raise_for_status()
                print(f"✅ Empresa ID {empresa_id_a_deletar} deletada com sucesso.")

        print(f"Deletando o usuário gestor '{gestor_email}' (ID: {user_id})...")
        delete_user_response = requests.delete(f"{API_URL}/usuarios/{user_id}/", headers=headers)
        delete_user_response.raise_for_status()
        print(f"✅ Usuário gestor ID {user_id} deletado com sucesso.")

        print("\n--- LIMPEZA CONCLUÍDA COM SUCESSO! ---")

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print(f"Recurso não encontrado (404). Provavelmente já foi deletado. Continuando...")
        else:
            print(f"\nERRO DE API DURANTE A LIMPEZA: {e}")
            print(f"URL: {e.request.url}")
            print(f"Resposta: {e.response.text}")
    except Exception as e:
        print(f"\nERRO INESPERADO DURANTE A LIMPEZA: {e}")
    finally:
        if os.path.exists(DATA_FILE):
            os.remove(DATA_FILE)
            print(f"Arquivo '{DATA_FILE}' removido.")

if __name__ == "__main__":
    cleanup()