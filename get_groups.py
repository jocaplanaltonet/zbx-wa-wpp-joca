import requests
import json

URL = 'http://127.0.0.1:21465/api/plnt/all-groups'
TOKEN = '$2b$10$sMn3zJy1NFPgQMmOSIoSGealQBi8MOxaEy_xojujhmoeXdOyl5qlm'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

try:
    response = requests.get(URL, headers=headers)
    grupos = response.json()

    print(f"{'NOME DO GRUPO':<30} | {'ID DO GRUPO'}")
    print("-" * 60)

    for grupo in grupos.get('response', []):
        nome = grupo.get('name', 'Sem Nome')
        id_grupo = grupo.get('id', {}).get('_serialized', grupo.get('id'))
        print(f"{nome:<30} | {id_grupo}")

except Exception as e:
    print(f"Erro ao buscar grupos: {e}")
