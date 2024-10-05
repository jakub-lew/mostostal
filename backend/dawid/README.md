# INSTALATION

python -m pip install pipenv
pipenv install


# RUN 

pipenv run fastapi dev server.py --port 8888


# USAGE

GET http://localhost:8888/get_bbox/
    body -> {path:str} # ścieżka do modelu.... :P
    returns json 

> nie mam pojęcia jak to zapisać :D


