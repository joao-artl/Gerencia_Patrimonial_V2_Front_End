import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random
import json

URL_FRONTEND = "https://gerencia-patrimonial.vercel.app/"
RUN_ID = random.randint(10000, 99999)
DATA_FILE = "created_data.json"

print(f"Iniciando fluxo de teste com ID de execução: {RUN_ID}")

@pytest.fixture(scope="module")
def driver():
    print("\n(Setup: Iniciando o navegador Chrome...)")
    service = ChromeService(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    browser = webdriver.Chrome(service=service, options=options)
    browser.implicitly_wait(5) 
    yield browser 
    print("\n(Teardown: Fechando o navegador...)")
    browser.quit()

def test_fluxo_completo_do_gestor(driver):
    """
    Simula o fluxo completo de um gestor:
    1. Cadastro
    2. Login
    3. Criação de Empresa
    4. Acesso à Empresa e Criação de Filial
    """
    gestor_email = f"gestor.demo.{RUN_ID}@empresa.com"
    gestor_senha = "senha1"
    empresa_cnpj = f"112223330001{str(RUN_ID)[-2:]}"
    empresa_nome = f"Empresa Demo {RUN_ID}"
    filial_nome = f"Filial Principal {RUN_ID}"
    
    created_data = {"gestor_email": gestor_email, "gestor_senha": gestor_senha}

    try:
        print("\n[FLUXO] Etapa 1: Cadastrando novo Gestor...")
        driver.get(URL_FRONTEND)
        time.sleep(3)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Criar Conta']"))
        ).click()
        time.sleep(5)
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "cadastro-cpf"))).send_keys(f"111222333{str(RUN_ID)[-2:]}")
        driver.find_element(By.ID, "cadastro-nome").send_keys("Gestor da Apresentação")
        driver.find_element(By.ID, "cadastro-email").send_keys(gestor_email)
        driver.find_element(By.ID, "cadastro-senha").send_keys(gestor_senha)
        driver.find_element(By.ID, "cadastro-confirmar-senha").send_keys(gestor_senha)
        driver.find_element(By.ID, "cadastro-submit-button").click()
        
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "login-email")))
        print("✅ Gestor cadastrado com sucesso.")
        time.sleep(3)

        print("\n[FLUXO] Etapa 2: Fazendo login...")
        driver.find_element(By.ID, "login-email").send_keys(gestor_email)
        driver.find_element(By.ID, "login-senha").send_keys(gestor_senha)
        driver.find_element(By.ID, "login-submit-button").click()
        
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, "//h1[text()='Suas Empresas']")))
        print("✅ Login realizado com sucesso.")
        time.sleep(1)
                
        print("\n[FLUXO] Etapa 3: Criando uma nova Empresa...")
        driver.find_element(By.ID, "nova-empresa-button").click()

        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "nome"))).send_keys(empresa_nome)
        driver.find_element(By.ID, "cnpj").send_keys(empresa_cnpj)
        driver.find_element(By.ID, "email").send_keys(f"contato.demo.{RUN_ID}@empresa.com")
        driver.find_element(By.ID, "telefone").send_keys(f"119{RUN_ID}")
        driver.find_element(By.ID, "senha").send_keys("senhaDaEmpresaDemo")
        driver.find_element(By.ID, "logradouro").send_keys("Rua da Demo")
        driver.find_element(By.ID, "numero").send_keys("123")
        driver.find_element(By.ID, "bairro").send_keys("Bairro Demo")
        driver.find_element(By.ID, "cidade").send_keys("Cidade Demo")
        driver.find_element(By.ID, "cep").send_keys("12345000")

        combobox_trigger = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//button[@role='combobox']")))
        combobox_trigger.click()
        
        estado = "AL"
        estado_option = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, f"//div[@role='option' and .='{estado}']")))
        driver.execute_script("arguments[0].scrollIntoView(true);", estado_option)
        estado_option.click()
        print("✅ Estado selecionado.")

        try:
            save_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "salvar-empresa-button")))
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", save_button)
            time.sleep(0.5) 
            driver.execute_script("arguments[0].click();", save_button)
            print("✅ Clique no botão 'Salvar Empresa' executado.")
        except Exception as e:
            driver.save_screenshot("erro_click_salvar.png")
            pytest.fail(f"Falha crítica ao clicar em 'Salvar Empresa': {e}")

        WebDriverWait(driver, 10).until(
            EC.invisibility_of_element_located((By.ID, "nome"))
        )
        print("✅ Formulário de criação fechado.")

        try:

            acessar_link_xpath = f"//div[.//div[text()='{empresa_nome}']]//a[contains(., 'Acessar Empresa')]"

            link_acessar = WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable((By.XPATH, acessar_link_xpath))
            )
            link_acessar.click()
            print("✅ Clique no link 'Acessar' executado com sucesso.")

        except TimeoutException:
            driver.save_screenshot("erro_inesperado_timeout.png")
            pytest.fail(f"Timeout mesmo com o seletor corrigido para a empresa '{empresa_nome}'. Verifique se há overlays ou problemas de carregamento.")
        except Exception as e:
            driver.save_screenshot("erro_inesperado_exception.png")
            pytest.fail(f"Falha inesperada ao clicar no link. Erro: {e}")

        print("\n[FLUXO] Etapa 5: Navegando para a seção de Filiais...")
        try:
            # Tenta clicar diretamente no link "Filiais" (visão desktop)
            print("[AÇÃO] Tentando acessar 'Filiais' diretamente (visão desktop)...")
            filiais_link_xpath = "//a[contains(., 'Filiais')]"
            WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, filiais_link_xpath))
            ).click()
            time.sleep(5)
        except TimeoutException:
            # Se falhar, assume que a sidebar está fechada (visão mobile)
            print("[AÇÃO] Link não visível. Abrindo o menu da sidebar (visão mobile)...")
            
            # 1. Clica no botão de Menu para abrir a sidebar
            menu_button_xpath = "//div[contains(@class, 'lg:hidden')]//button"
            WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, menu_button_xpath))
            ).click()
            
            # 2. PAUSA para a animação da sidebar terminar
            time.sleep(4) 

            filiais_link_xpath = "//a[contains(., 'Filiais')]"
            
            filiais_link_element = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, filiais_link_xpath))
            )
            driver.execute_script("arguments[0].click();", filiais_link_element)

        print("\n[FLUXO] Etapa 6: Criando uma nova Filial...")
        time.sleep(6)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "nova-filial-button"))
        ).click()
        
        print("[AÇÃO] Preenchendo os dados da nova filial...")
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "nome"))).send_keys(filial_nome)
        driver.find_element(By.ID, "cnpj").send_keys(f"223334440001{str(RUN_ID)[-2:]}")
        driver.find_element(By.ID, "email").send_keys(f"filial.demo.{RUN_ID}@empresa.com")
        driver.find_element(By.ID, "telefone").send_keys(f"219{RUN_ID}")
        driver.find_element(By.ID, "senha").send_keys("senhaDaFilialDemo")
        
        driver.find_element(By.ID, "logradouro").send_keys("Avenida da Filial")
        driver.find_element(By.ID, "numero").send_keys("456")
        driver.find_element(By.ID, "bairro").send_keys("Bairro Secundário")
        driver.find_element(By.ID, "cidade").send_keys("Cidade Filial")
        driver.find_element(By.ID, "cep").send_keys("54321000")
        
        combobox_trigger_filial = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@role='combobox']"))
        )
        combobox_trigger_filial.click()
        
        estado_filial = "DF"
        estado_option_filial = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//div[@role='option' and .='{estado_filial}']"))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", estado_option_filial)
        estado_option_filial.click()
        print(f"✅ Estado '{estado_filial}' selecionado para a filial.")
        time.sleep(6)
        salvar_filial_button = driver.find_element(By.ID, "salvar-filial-button")
        driver.execute_script("arguments[0].click();", salvar_filial_button)
        print("✅ Filial criada com sucesso!")
        time.sleep(11)

    finally:
        with open(DATA_FILE, "w") as f:
            json.dump(created_data, f)
        print(f"\nDados da demonstração salvos em '{DATA_FILE}' para limpeza posterior.")